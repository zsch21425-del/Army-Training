// Playwright driver: launches Chromium, loads the target game, and runs
// the perception -> decide -> act loop using the strategy brain.
//
// The driver is site-agnostic — it delegates all DOM access to an adapter.

import { chromium } from "playwright";
import { LiveAgent } from "../blackjack/live-agent.js";
import { wizardofodds } from "./adapters/wizardofodds.js";

const ADAPTERS = { wizardofodds };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function startSession(opts) {
  const {
    site = "wizardofodds",
    url,
    unit = 25,
    bankroll = 10000,
    mode = "spread",
    actionDelayMs = 600,
    maxRounds = 0,
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

        // End-of-round: settle by comparing totals (best-effort).
        await sleep(actionDelayMs);
        const state = await adapter.readState(page);
        agent.observeCards(state.player);
        agent.observeCards(state.dealer);
        const pTotal = agent.handTotal(state.player.map((c) => c.rank)).total;
        const dTotal = agent.handTotal(state.dealer.map((c) => c.rank)).total;
        const outcome = adapter.classifyOutcome(state.message, pTotal, dTotal, pTotal > 21);
        const net = settlementNet(outcome, bet, state);
        agent.settleRound({ net, outcome, bet });

        log(`Round ${agent.stats.rounds}: P=${pTotal} D=${dTotal} ${outcome.toUpperCase()} ${fmtSigned(net)} | bank $${agent.bankroll.toFixed(2)} | RC=${agent.runningCount} TC=${agent.trueCount().toFixed(2)}`,
            net > 0 ? "ok" : net < 0 ? "err" : "dim");
        emitStats();

        await sleep(actionDelayMs);
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
  // Up to 20 decisions per hand — more than enough for any blackjack hand
  // including splits. Defensive bound against infinite loops if state parsing
  // breaks down.
  for (let step = 0; step < 20; step++) {
    const state = await adapter.readState(page);
    agent.observeCards(state.player);
    agent.observeCards(state.dealer);

    if (state.insuranceOffered) {
      const take = agent.decideInsurance();
      log(`Insurance offered → ${take ? "TAKE" : "decline"} (TC=${agent.trueCount().toFixed(2)})`);
      await adapter.respondInsurance(page, take);
      await sleep(delay);
      continue;
    }

    if (!state.playerTurn) return; // round over (dealer acting or settled)

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

    // If we doubled or stood, the hand is done on this branch.
    if (action === "D" || action === "S" || action === "R") return;
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
