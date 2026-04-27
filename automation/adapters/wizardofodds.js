// Site adapter for Wizard of Odds free blackjack (wizardofodds.com/play/blackjack/).
//
// The adapter is the ONLY place that touches site-specific DOM. If the site's
// markup changes (or if the selectors below don't match on first run), tune
// the SELECTORS map and the card-reading helpers here — nothing else needs
// to change.
//
// The adapter is designed defensively: each selector is a list of candidates
// tried in order, and the card reader extracts rank from common attribute
// patterns (data-rank / class names / alt text).

const SELECTORS = {
  // Buttons. First match wins.
  hit:       ["button#hit",       "[data-action='hit']",       "button:has-text('Hit')"],
  stand:     ["button#stand",     "[data-action='stand']",     "button:has-text('Stand')"],
  double:    ["button#double",    "[data-action='double']",    "button:has-text('Double')"],
  split:     ["button#split",     "[data-action='split']",     "button:has-text('Split')"],
  surrender: ["button#surrender", "[data-action='surrender']", "button:has-text('Surrender')"],
  deal:      ["button#deal",      "[data-action='deal']",      "button:has-text('Deal')", "button:has-text('Bet')"],
  insuranceYes: ["button#insurance-yes", "button:has-text('Yes')"],
  insuranceNo:  ["button#insurance-no",  "button:has-text('No')"],
  // Chip controls for bet sizing. Values keyed by dollar amount.
  chip: (amount) => [
    `[data-chip='${amount}']`,
    `.chip[data-value='${amount}']`,
    `button.chip-${amount}`,
    `button:has-text('$${amount}')`,
  ],
  clearBet:  ["button#clear-bet", "[data-action='clear-bet']", "button:has-text('Clear')"],
  // Card containers.
  playerCards: [".player-hand .card", "[data-role='player'] .card", ".player .card"],
  dealerCards: [".dealer-hand .card", "[data-role='dealer'] .card", ".dealer .card"],
  // Round-state / message area (used to detect end of round).
  message: [".message", ".result", "[data-role='message']", ".status-text"],
};

// Try a list of selectors and return the first one that exists, or null.
async function firstSelector(page, candidates) {
  for (const sel of candidates) {
    const count = await page.locator(sel).count().catch(() => 0);
    if (count > 0) return sel;
  }
  return null;
}

async function clickAny(page, candidates) {
  const sel = await firstSelector(page, candidates);
  if (!sel) return false;
  await page.locator(sel).first().click({ timeout: 2000 }).catch(() => {});
  return true;
}

async function isButtonEnabled(page, candidates) {
  const sel = await firstSelector(page, candidates);
  if (!sel) return false;
  const loc = page.locator(sel).first();
  const disabled = await loc.isDisabled().catch(() => true);
  return !disabled;
}

// Extract rank from a card element by probing common attributes.
async function readCardRank(handle) {
  return handle.evaluate((el) => {
    const attrs = ["data-rank", "data-value", "data-card", "aria-label", "alt", "title"];
    for (const a of attrs) {
      const v = el.getAttribute && el.getAttribute(a);
      if (v) {
        const m = String(v).match(/\b(A|K|Q|J|T|10|[2-9]|Ace|King|Queen|Jack)\b/i);
        if (m) return m[1];
      }
    }
    // Try classes like "card-A" / "rank-10" / "c-js"
    const cls = el.className || "";
    const mc = String(cls).match(/(?:card|rank|c)-(A|K|Q|J|T|10|[2-9])/i);
    if (mc) return mc[1];
    // Fall back to text content (e.g. inside an img alt or <span>).
    const text = (el.innerText || el.textContent || "").trim();
    const mt = text.match(/^(A|K|Q|J|T|10|[2-9])/);
    if (mt) return mt[1];
    return null;
  });
}

async function readHand(page, candidates) {
  const sel = await firstSelector(page, candidates);
  if (!sel) return [];
  const handles = await page.locator(sel).elementHandles();
  const cards = [];
  for (let i = 0; i < handles.length; i++) {
    const rank = await readCardRank(handles[i]);
    if (rank) cards.push({ id: `${sel}#${i}:${rank}`, rank });
  }
  return cards;
}

export const wizardofodds = {
  name: "wizardofodds",
  defaultUrl: "https://wizardofodds.com/play/blackjack/",

  async onLoaded(page, log) {
    // Dismiss cookie banner / intro overlay if present.
    const dismissers = [
      "button:has-text('Accept')",
      "button:has-text('Agree')",
      "button:has-text('I agree')",
      "button:has-text('Got it')",
      "[aria-label='close']",
      ".modal-close",
    ];
    for (const sel of dismissers) {
      const c = await page.locator(sel).count().catch(() => 0);
      if (c > 0) {
        await page.locator(sel).first().click({ timeout: 1000 }).catch(() => {});
        log?.(`Dismissed overlay: ${sel}`);
      }
    }
  },

  // Attempt to place `amount` by clicking chips that sum to it, largest first.
  async placeBet(page, amount, log) {
    // Clear existing bet if the control exists.
    await clickAny(page, SELECTORS.clearBet);
    const denoms = [500, 100, 25, 10, 5, 1];
    let remaining = amount;
    for (const d of denoms) {
      while (remaining >= d) {
        const ok = await clickAny(page, SELECTORS.chip(d));
        if (!ok) break;
        remaining -= d;
      }
    }
    if (remaining > 0) log?.(`Bet short by $${remaining} — chips unavailable`);
    // Confirm by clicking Deal.
    const dealt = await clickAny(page, SELECTORS.deal);
    return dealt;
  },

  async readState(page) {
    const [player, dealer] = await Promise.all([
      readHand(page, SELECTORS.playerCards),
      readHand(page, SELECTORS.dealerCards),
    ]);
    const [canHit, canStand, canDouble, canSplit, canSurrender] = await Promise.all([
      isButtonEnabled(page, SELECTORS.hit),
      isButtonEnabled(page, SELECTORS.stand),
      isButtonEnabled(page, SELECTORS.double),
      isButtonEnabled(page, SELECTORS.split),
      isButtonEnabled(page, SELECTORS.surrender),
    ]);
    const msgSel = await firstSelector(page, SELECTORS.message);
    const message = msgSel ? (await page.locator(msgSel).first().innerText().catch(() => "")).trim() : "";
    const insuranceOffered = !!(await firstSelector(page, SELECTORS.insuranceYes));
    return {
      player, dealer,
      canHit, canStand, canDouble, canSplit, canSurrender,
      insuranceOffered,
      message,
      // "playerTurn" heuristic: at least one action button is enabled.
      playerTurn: canHit || canStand || canDouble || canSplit || canSurrender,
    };
  },

  async act(page, action) {
    switch (action) {
      case "H": return clickAny(page, SELECTORS.hit);
      case "S": return clickAny(page, SELECTORS.stand);
      case "D": return clickAny(page, SELECTORS.double);
      case "P": return clickAny(page, SELECTORS.split);
      case "R": return clickAny(page, SELECTORS.surrender);
    }
    return false;
  },

  async respondInsurance(page, take) {
    return clickAny(page, take ? SELECTORS.insuranceYes : SELECTORS.insuranceNo);
  },

  // Outcome classifier from the message text. Conservative; falls back to
  // comparing totals if the message is empty.
  classifyOutcome(message, playerTotal, dealerTotal, playerBusted) {
    const m = (message || "").toLowerCase();
    if (m.includes("blackjack") && m.includes("win")) return "blackjack";
    if (m.includes("surrender")) return "surrender";
    if (m.includes("push") || m.includes("tie")) return "push";
    if (m.includes("lose") || m.includes("loss") || m.includes("bust")) return "loss";
    if (m.includes("win")) return "win";
    if (playerBusted) return "loss";
    if (dealerTotal > 21) return "win";
    if (playerTotal > dealerTotal) return "win";
    if (playerTotal < dealerTotal) return "loss";
    return "push";
  },
};
