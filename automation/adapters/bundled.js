// Adapter for the bundled local blackjack game (bundled-game/index.html).
// Selectors are deterministic because we own the markup.

const SEL = {
  hit:       "button#hit",
  stand:     "button#stand",
  double:    "button#double",
  split:     "button#split",
  surrender: "button#surrender",
  deal:      "button#deal",
  clear:     "button#clear-bet",
  insuranceYes: "button#insurance-yes",
  insuranceNo:  "button#insurance-no",
  insuranceWrap: "#insurance",
  message:   "#message",
  player:    "[data-role='player']",
  dealer:    "[data-role='dealer']",
  bankroll:  "#bankroll",
  shoeLeft:  "#shoe-left",
};

const chipSel = (amount) => `button.chip[data-chip='${amount}']`;

async function isEnabled(page, sel) {
  const loc = page.locator(sel);
  if ((await loc.count()) === 0) return false;
  return !(await loc.first().isDisabled().catch(() => true));
}

async function isVisible(page, sel) {
  const loc = page.locator(sel);
  if ((await loc.count()) === 0) return false;
  return await loc.first().isVisible().catch(() => false);
}

async function readCards(page, wrapperSel, activeOnly = false) {
  // For the player container, restrict to the active branch during playerTurn
  // so split hands are read one branch at a time.
  const sel = activeOnly
    ? `${wrapperSel} .branch.active .card, ${wrapperSel} > .card`
    : `${wrapperSel} .card`;
  const cards = await page.locator(sel).evaluateAll((nodes) =>
    nodes
      .filter((n) => !n.classList.contains("hidden"))
      .map((n, i) => {
        const branchEl = n.closest(".branch");
        const branch = branchEl ? branchEl.getAttribute("data-branch") || "0" : "0";
        return {
          id: `${n.getAttribute("data-suit") || ""}${n.getAttribute("data-rank") || ""}@${branch}-${i}`,
          rank: n.getAttribute("data-rank"),
        };
      })
      .filter((c) => c.rank)
  );
  return cards;
}

export const bundled = {
  name: "bundled",
  defaultUrl: null, // Electron supplies file:// URL at launch

  async onLoaded(_page, _log) {
    // Nothing to dismiss.
  },

  async placeBet(page, amount, log) {
    await page.locator(SEL.clear).click({ timeout: 1000 }).catch(() => {});
    // Chip denominations available in the bundled game.
    const denoms = [500, 100, 25, 10, 5, 1];
    let remaining = amount;
    for (const d of denoms) {
      while (remaining >= d) {
        const sel = chipSel(d);
        if ((await page.locator(sel).count()) === 0) break;
        const disabled = await page.locator(sel).first().isDisabled().catch(() => true);
        if (disabled) break;
        await page.locator(sel).first().click({ timeout: 1000 }).catch(() => {});
        remaining -= d;
      }
    }
    if (remaining > 0) log?.(`Bet short by $${remaining}`);
    await page.waitForTimeout(120);
    // Click Deal.
    const dealEnabled = await isEnabled(page, SEL.deal);
    if (!dealEnabled) { log?.("Deal button not enabled"); return false; }
    await page.locator(SEL.deal).click();
    return true;
  },

  async readState(page) {
    // Prefer the active-branch cards during player's turn; otherwise read all.
    const inTurn = await isEnabled(page, SEL.hit);
    const [player, dealer, allPlayer] = await Promise.all([
      readCards(page, SEL.player, inTurn),
      readCards(page, SEL.dealer),
      inTurn ? readCards(page, SEL.player, false) : Promise.resolve(null),
    ]);
    // Pass every exposed card to the count — but decision-making uses only
    // the active branch. This matters for observing siblings we've already
    // observed on earlier branches.
    const observed = allPlayer || player;
    const [canHit, canStand, canDouble, canSplit, canSurrender, insuranceOffered] =
      await Promise.all([
        isEnabled(page, SEL.hit),
        isEnabled(page, SEL.stand),
        isEnabled(page, SEL.double),
        isEnabled(page, SEL.split),
        isEnabled(page, SEL.surrender),
        isVisible(page, SEL.insuranceWrap),
      ]);
    const message = await page.locator(SEL.message).innerText().catch(() => "");
    return {
      player, dealer,
      observedPlayerCards: observed,
      canHit, canStand, canDouble, canSplit, canSurrender,
      insuranceOffered,
      message: message.trim(),
      playerTurn: canHit || canStand || canDouble || canSplit || canSurrender,
    };
  },

  async act(page, action) {
    const map = { H: SEL.hit, S: SEL.stand, D: SEL.double, P: SEL.split, R: SEL.surrender };
    const sel = map[action];
    if (!sel) return false;
    if (!(await isEnabled(page, sel))) return false;
    await page.locator(sel).click({ timeout: 1500 });
    return true;
  },

  async respondInsurance(page, take) {
    const sel = take ? SEL.insuranceYes : SEL.insuranceNo;
    if (!(await isVisible(page, sel))) return false;
    await page.locator(sel).click({ timeout: 1500 });
    return true;
  },

  classifyOutcome(message, playerTotal, dealerTotal, playerBusted) {
    const m = (message || "").toLowerCase();
    if (m.includes("bj") || m.includes("blackjack")) return "blackjack";
    if (m.includes("surrender")) return "surrender";
    if (m.includes("push")) return "push";
    if (m.includes("bust") || m.includes("lose")) return "loss";
    if (m.includes("win")) return "win";
    if (playerBusted) return "loss";
    if (dealerTotal > 21) return "win";
    if (playerTotal > dealerTotal) return "win";
    if (playerTotal < dealerTotal) return "loss";
    return "push";
  },
};
