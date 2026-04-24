// Playwright driver: launches Chromium, loads the target game, and runs
// the perception -> decide -> act loop using the strategy brain.
//
// The driver is site-agnostic — it delegates all DOM access to an adapter.

import { chromium } from "playwright";
import { LiveAgent } from "../blackjack/live-agent.js";
import { wizardofodds } from "./adapters/wizardofodds.js";
import { bundled } from "./adapters/bundled.js";

const ADAPTERS = { bundled, wizardofodds };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function startSession(opts) {
  const {
    site = "bundled",
    url,
    unit = 25,
    bankroll = 10000,
    mode = "spread",
    actionDelayMs = 600,
    maxRounds = 0,
    chromiumExecutablePath,
    onLog = () => {},
    onStats = () => {},
    onEnd = () => {},
  } = opts;

  const adapter = ADAPTERS[site];
  if (!adapter) throw new Error(`Unknown site adapter: ${site}`);

  const agent = new LiveAgent({ bankroll, unit, mode });
  let stop = false;

  const log = (msg, level = "") => onLog({ msg, level });
  const emitStats = () => onStats(agent.snapshot());

  log(`Launching Chromium...`, "dim");
  const browser = await chromium.launch({
    headless: false,
    executablePath: chromiumExecutablePath || undefined,
    args: ["--window-size=1280,860"],
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 860 } });
  const page = await context.newPage();

  const cleanup = async () => {
    try { await context.close(); } catch {}
    try { await browser.close(); } catch {}
  };

  (async () => {
    try {
      const target = url || adapter.defaultUrl;
      log(`Navigating to ${target}`);
      await page.goto(target, { waitUntil: "domcontentloaded", timeout: 30000 });
      await sleep(1500);
      await adapter.onLoaded(page, log);

      // Main play loop.
      while (!stop) {
        if (maxRounds > 0 && agent.stats.rounds >= maxRounds) {
          log(`Reached round limit (${maxRounds})`, "ok");
          break;
        }

        // Sit out if Wong conditions say so. The shoe still advances, but we
        // can't observe cards we don't see; approximate by re-dealing.
        if (agent.shouldSitOut()) {
          log(`Wong out at TC=${agent.trueCount().toFixed(2)}; skipping round`, "dim");
        }

        const bet = agent.betForNextRound();
        if (bet > agent.bankroll) {
          log(`Bankroll ($${agent.bankroll.toFixed(2)}) below next bet ($${bet}); stopping`, "err");
          break;
        }

        log(`Placing bet $${bet} (TC=${agent.trueCount().toFixed(2)})`);
        const dealt = await adapter.placeBet(page, bet, log);
        if (!dealt) {
          log(`Could not place bet or click Deal — check selectors in automation/adapters/${site}.js`, "err");
          break;
        }

        await sleep(actionDelayMs);
        await playHand(page, adapter, agent, actionDelayMs, log);

        // Wait for the round to finish (dealer plays + settle shown).
        const endState = await waitForSettle(page, adapter);
        agent.observeCards(endState.player);
        agent.observeCards(endState.dealer);
        const pTotal = agent.handTotal(endState.player.map((c) => c.rank)).total;
        const dTotal = agent.handTotal(endState.dealer.map((c) => c.rank)).total;
        const outcome = adapter.classifyOutcome(endState.message, pTotal, dTotal, pTotal > 21);
        const net = settlementNet(outcome, bet, endState);
        agent.settleRound({ net, outcome, bet });

        log(`Round ${agent.stats.rounds}: P=${pTotal} D=${dTotal} ${outcome.toUpperCase()} ${fmtSigned(net)} | bank $${agent.bankroll.toFixed(2)} | RC=${agent.runningCount} TC=${agent.trueCount().toFixed(2)}`,
            net > 0 ? "ok" : net < 0 ? "err" : "dim");
        emitStats();

        // Wait for phase to return to betting (round fully reset) before next round.
        await waitForBettingPhase(page);
        await sleep(Math.max(120, actionDelayMs / 2));
      }
    } catch (err) {
      log("Driver error: " + (err && err.stack ? err.stack : err), "err");
    } finally {
      await cleanup();
      onEnd(stop ? "stopped by user" : "finished");
    }
  })();

  return {
    stop: async () => {
      stop = true;
      await cleanup();
    },
  };
}

async function playHand(page, adapter, agent, delay, log) {
  // Up to 40 decisions per hand — generous enough for 4-way splits that
  // may each spawn multiple hits. Defensive bound against infinite loops.
  for (let step = 0; step < 40; step++) {
    const state = await adapter.readState(page);
    agent.observeCards(state.observedPlayerCards || state.player);
    agent.observeCards(state.dealer);

    if (state.insuranceOffered) {
      const take = agent.decideInsurance();
      log(`Insurance offered → ${take ? "TAKE" : "decline"} (TC=${agent.trueCount().toFixed(2)})`);
      await adapter.respondInsurance(page, take);
      await sleep(delay);
      continue;
    }

    // Trust the bundled game's phase reporter if present — the DOM action
    // buttons briefly disable between split branches, which would otherwise
    // look like "round over" to a pure DOM probe.
    const phase = await page.evaluate(() => (window.__bj ? window.__bj.getState().phase : null)).catch(() => null);
    if (phase && (phase === "dealerTurn" || phase === "settle" || phase === "betting")) return;

    if (!state.playerTurn) {
      if (phase === "playerTurn") {
        // Transient disabled state between branches; wait and retry.
        await sleep(delay);
        continue;
      }
      return; // round over (dealer acting or settled)
    }

    if (state.player.length === 0 || !state.dealer[0]) {
      await sleep(delay);
      continue;
    }

    const action = agent.decideAction({
      playerCards: state.player.map((c) => c.rank),
      dealerUp:    state.dealer[0].rank,
      canDouble:   state.canDouble,
      canSplit:    state.canSplit,
      canSurrender: state.canSurrender,
    });

    log(`  ${handDesc(state.player)} vs ${state.dealer[0].rank} → ${actionLabel(action)}`);
    if (action === "D") agent.stats.doubles++;
    if (action === "P") agent.stats.splits++;

    const ok = await adapter.act(page, action);
    if (!ok) {
      log(`  Action ${action} not clickable — falling back to Stand`, "err");
      await adapter.act(page, "S");
      return;
    }
    await sleep(delay);
    // For D/S/R on the CURRENT branch, continue looping — there may be more
    // split branches waiting. The phase check at the top will exit when the
    // whole hand is truly done.
  }
}

function handDesc(cards) {
  return cards.map((c) => c.rank).join("") || "-";
}

function actionLabel(a) {
  return { H: "Hit", S: "Stand", D: "Double", P: "Split", R: "Surrender" }[a] || a;
}

function fmtSigned(n) {
  return (n >= 0 ? "+$" : "-$") + Math.abs(n).toFixed(2);
}

// Poll the page until it's clear the round has ended: prefer the bundled
// game's __bj API if present; otherwise settle for a non-empty message or
// a completed dealer hand.
async function waitForSettle(page, adapter, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  let last = null;
  while (Date.now() < deadline) {
    // Bundled-game fast path.
    const bj = await page.evaluate(() => (window.__bj ? window.__bj.getState() : null)).catch(() => null);
    if (bj && (bj.phase === "settle" || bj.phase === "betting")) {
      last = await adapter.readState(page);
      if (bj.phase === "settle") return last;
    }
    // External-site fallback: look for a message or completed hand.
    last = await adapter.readState(page);
    if (!last.playerTurn && last.dealer.length >= 2 && (last.message || last.player.length > 0)) {
      return last;
    }
    await new Promise((r) => setTimeout(r, 150));
  }
  return last || { player: [], dealer: [], message: "" };
}

async function waitForBettingPhase(page, timeoutMs = 5000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const bj = await page.evaluate(() => (window.__bj ? window.__bj.getState() : null)).catch(() => null);
    if (!bj) return; // external site — caller already slept
    if (bj.phase === "betting") return;
    await new Promise((r) => setTimeout(r, 100));
  }
}

function settlementNet(outcome, bet, _state) {
  switch (outcome) {
    case "blackjack": return bet * 1.5;
    case "win":       return bet;
    case "push":      return 0;
    case "surrender": return -bet / 2;
    case "loss":      return -bet;
    default:          return 0;
  }
}
