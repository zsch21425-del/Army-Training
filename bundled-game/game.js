// Bundled local blackjack game — 6-deck S17 DAS LS, BJ 3:2, dealer peek.
// Rendered with plain DOM so the adapter can perceive it trivially.

(function () {
  const RANKS = ["2","3","4","5","6","7","8","9","T","J","Q","K","A"];
  const SUITS = ["S","H","D","C"]; // Spades, Hearts, Diamonds, Clubs
  const RED = new Set(["H","D"]);

  const state = {
    decks: 6,
    penetration: 0.75,
    shoe: [],
    cutIndex: 0,
    idx: 0,
    bankroll: 10000,
    bet: 0,
    pendingBet: 0,
    player: [], // array of { cards: [{rank,suit}], bet, done, stood, doubled, surrendered, splitAces }
    active: 0,
    dealer: { cards: [] },
    phase: "betting", // betting | dealing | playerTurn | dealerTurn | settle
    message: "",
  };

  // --- Shoe ---
  function buildShoe() {
    state.shoe = [];
    for (let d = 0; d < state.decks; d++) {
      for (const s of SUITS) for (const r of RANKS) state.shoe.push({ rank: r, suit: s });
    }
    // Fisher-Yates
    for (let i = state.shoe.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [state.shoe[i], state.shoe[j]] = [state.shoe[j], state.shoe[i]];
    }
    state.idx = 0;
    state.cutIndex = Math.floor(state.shoe.length * state.penetration);
  }
  function drawCard() {
    if (state.idx >= state.shoe.length) buildShoe();
    return state.shoe[state.idx++];
  }
  function decksLeft() {
    return Math.max(0, (state.shoe.length - state.idx) / 52);
  }

  // --- Hand math ---
  const cardValue = (r) => (r === "A" ? 11 : "TJQK".includes(r) ? 10 : Number(r));
  function handTotal(cards) {
    let total = 0, aces = 0;
    for (const c of cards) { total += cardValue(c.rank); if (c.rank === "A") aces++; }
    while (total > 21 && aces > 0) { total -= 10; aces--; }
    return { total, soft: aces > 0 && total <= 21 };
  }
  const isBust = (c) => handTotal(c).total > 21;
  const isBJ   = (c) => c.length === 2 && handTotal(c).total === 21;
  const isPair = (c) => c.length === 2 && cardValue(c[0].rank) === cardValue(c[1].rank);

  // --- DOM refs ---
  const el = {
    bankroll: document.getElementById("bankroll"),
    bet:      document.getElementById("current-bet"),
    shoe:     document.getElementById("shoe-left"),
    message:  document.getElementById("message"),
    dealer:   document.querySelector("[data-role='dealer']"),
    player:   document.querySelector("[data-role='player']"),
    deal:     document.getElementById("deal"),
    hit:      document.getElementById("hit"),
    stand:    document.getElementById("stand"),
    double:   document.getElementById("double"),
    split:    document.getElementById("split"),
    surrender: document.getElementById("surrender"),
    clear:    document.getElementById("clear-bet"),
    insurance: document.getElementById("insurance"),
    insYes:   document.getElementById("insurance-yes"),
    insNo:    document.getElementById("insurance-no"),
  };

  // --- Rendering ---
  function render() {
    el.bankroll.textContent = "$" + state.bankroll.toLocaleString();
    el.bet.textContent      = "$" + (state.phase === "betting" ? state.pendingBet : state.bet);
    el.shoe.textContent     = decksLeft().toFixed(1);
    el.message.textContent  = state.message || "—";

    renderHand(el.dealer, state.dealer.cards, state.phase === "playerTurn" || state.phase === "dealing");
    renderPlayerBranches();

    const canAct = state.phase === "playerTurn";
    const branch = state.player[state.active];
    el.hit.disabled       = !canAct || !branch || branch.done;
    el.stand.disabled     = !canAct || !branch || branch.done;
    el.double.disabled    = !canAct || !branch || branch.done || branch.cards.length !== 2 || branch.splitAces;
    el.split.disabled     = !canAct || !branch || branch.done || !isPair(branch.cards) || state.player.length >= 4;
    el.surrender.disabled = !canAct || !branch || branch.done || branch.cards.length !== 2 || branch.wasSplit;
    el.deal.disabled      = state.phase !== "betting" || state.pendingBet <= 0;
    el.clear.disabled     = state.phase !== "betting" || state.pendingBet <= 0;
  }

  function renderHand(container, cards, hideSecond) {
    container.innerHTML = "";
    cards.forEach((c, i) => {
      const div = document.createElement("div");
      const hidden = hideSecond && i === 1;
      div.className = "card" + (!hidden && RED.has(c.suit) ? " red" : "") + (hidden ? " hidden" : "");
      if (!hidden) div.setAttribute("data-rank", c.rank);
      div.setAttribute("data-suit", c.suit);
      div.setAttribute("data-index", String(i));
      container.appendChild(div);
    });
  }

  function renderPlayerBranches() {
    el.player.innerHTML = "";
    state.player.forEach((b, i) => {
      const wrap = document.createElement("div");
      const isActive = i === state.active && state.phase === "playerTurn";
      wrap.className = "branch" + (isActive ? " active" : "");
      wrap.setAttribute("data-branch", String(i));
      if (isActive) wrap.style.outline = "2px solid #e6c069";
      wrap.style.display = "flex";
      wrap.style.gap = "10px";
      wrap.style.alignItems = "center";
      const label = document.createElement("span");
      label.style.color = "#f6efd9"; label.style.fontSize = "12px"; label.style.minWidth = "80px";
      const t = handTotal(b.cards).total;
      label.textContent = (state.player.length > 1 ? `#${i+1} ` : "") + `$${b.bet} · ${t}${b.done ? " ✓" : ""}`;
      wrap.appendChild(label);
      b.cards.forEach((c, ci) => {
        const div = document.createElement("div");
        div.className = "card" + (RED.has(c.suit) ? " red" : "");
        div.setAttribute("data-rank", c.rank);
        div.setAttribute("data-suit", c.suit);
        div.setAttribute("data-index", String(ci));
        wrap.appendChild(div);
      });
      el.player.appendChild(wrap);
    });
  }

  // --- Betting ---
  function addChip(amount) {
    if (state.phase !== "betting") return;
    if (state.bankroll < state.pendingBet + amount) return;
    state.pendingBet += amount;
    render();
  }
  function clearBet() {
    if (state.phase !== "betting") return;
    state.pendingBet = 0;
    render();
  }

  // --- Round lifecycle ---
  function startRound() {
    if (state.phase !== "betting" || state.pendingBet <= 0) return;
    if (state.idx >= state.cutIndex || state.shoe.length === 0) buildShoe();
    state.bet = state.pendingBet;
    state.bankroll -= state.bet;
    state.pendingBet = 0;
    state.message = "";
    state.phase = "dealing";
    state.player = [{ cards: [drawCard(), drawCard()], bet: state.bet, done: false, wasSplit: false }];
    state.dealer = { cards: [drawCard(), drawCard()] };
    state.active = 0;

    const up = state.dealer.cards[0].rank;
    const dBJ = isBJ(state.dealer.cards);

    // Ace up: offer insurance before revealing the hole card.
    if (up === "A") {
      state.phase = "insurance";
      showInsurance(true);
      render();
      return;
    }
    // 10 up: dealer peeks silently; reveal immediately if BJ.
    if (dBJ) { finishDealerAndSettle(); return; }
    // Player natural: settle immediately.
    if (isBJ(state.player[0].cards)) { finishDealerAndSettle(); return; }

    state.phase = "playerTurn";
    render();
  }

  function showInsurance(show) {
    el.insurance.hidden = !show;
  }
  function resolveInsurance(take) {
    if (state.phase !== "insurance") return;
    const insBet = state.bet / 2;
    const dBJ = isBJ(state.dealer.cards);
    if (take) {
      if (state.bankroll < insBet) {
        // Can't afford — decline.
      } else {
        state.bankroll -= insBet;
        if (dBJ) state.bankroll += insBet * 3; // 2:1 payout returns bet + 2x
      }
    }
    showInsurance(false);
    if (dBJ || isBJ(state.player[0].cards)) { finishDealerAndSettle(); return; }
    state.phase = "playerTurn";
    render();
  }

  // --- Player actions ---
  function current() { return state.player[state.active]; }
  function advanceOrDealer() {
    const next = state.player.findIndex((b, i) => i > state.active && !b.done);
    if (next === -1) {
      // All player branches done.
      const anyAlive = state.player.some((b) => !b.surrendered && !isBust(b.cards));
      if (!anyAlive) { settleNoDealer(); return; }
      dealerPlay();
    } else {
      state.active = next;
      // If we just jumped to a split-branch with one card, deal a second.
      const b = state.player[state.active];
      if (b.cards.length === 1) b.cards.push(drawCard());
      if (b.splitAces) {
        // Split aces get one card only.
        b.done = true;
        render();
        setTimeout(advanceOrDealer, 300);
        return;
      }
      render();
    }
  }
  function hit() {
    if (state.phase !== "playerTurn") return;
    const b = current(); if (!b || b.done) return;
    b.cards.push(drawCard());
    if (isBust(b.cards)) b.done = true;
    if (handTotal(b.cards).total === 21) b.done = true;
    render();
    if (b.done) setTimeout(advanceOrDealer, 280);
  }
  function stand() {
    if (state.phase !== "playerTurn") return;
    const b = current(); if (!b || b.done) return;
    b.done = true; b.stood = true;
    render();
    setTimeout(advanceOrDealer, 200);
  }
  function doubleDown() {
    if (state.phase !== "playerTurn") return;
    const b = current(); if (!b || b.done || b.cards.length !== 2) return;
    if (state.bankroll < b.bet) return;
    state.bankroll -= b.bet; b.bet *= 2; b.doubled = true;
    b.cards.push(drawCard());
    b.done = true;
    render();
    setTimeout(advanceOrDealer, 300);
  }
  function splitHand() {
    if (state.phase !== "playerTurn") return;
    const b = current(); if (!b || b.done || !isPair(b.cards)) return;
    if (state.bankroll < b.bet) return;
    state.bankroll -= b.bet;
    const splittingAces = b.cards[0].rank === "A";
    const c1 = b.cards[0], c2 = b.cards[1];
    const newB = {
      cards: [c2, drawCard()], bet: b.bet, done: false, wasSplit: true,
      splitAces: splittingAces,
    };
    b.cards = [c1, drawCard()];
    b.wasSplit = true; b.splitAces = splittingAces;
    // Insert split branch immediately after current.
    state.player.splice(state.active + 1, 0, newB);
    if (splittingAces) {
      b.done = true; newB.done = true;
      render();
      setTimeout(() => { state.active++; advanceOrDealer(); }, 260);
    } else {
      render();
    }
  }
  function surrenderHand() {
    if (state.phase !== "playerTurn") return;
    const b = current(); if (!b || b.done || b.cards.length !== 2 || b.wasSplit) return;
    b.surrendered = true; b.done = true;
    state.bankroll += b.bet / 2; // refund half
    render();
    setTimeout(advanceOrDealer, 200);
  }

  // --- Dealer + settle ---
  function dealerPlay() {
    state.phase = "dealerTurn";
    render();
    const tick = () => {
      const { total, soft } = handTotal(state.dealer.cards);
      // S17: stand on soft 17.
      if (total < 17) {
        state.dealer.cards.push(drawCard());
        render();
        setTimeout(tick, 420);
      } else {
        settle();
      }
    };
    setTimeout(tick, 420);
  }
  function settleNoDealer() {
    // All branches busted or surrendered; dealer does not play.
    settle(true);
  }
  function settle(skipDealer = false) {
    const dTotal = handTotal(state.dealer.cards).total;
    const dBust = dTotal > 21;
    let pnl = 0;
    const lines = [];
    state.player.forEach((b, i) => {
      const pTotal = handTotal(b.cards).total;
      if (b.surrendered) { lines.push(`#${i+1} Surrender`); return; }
      if (isBust(b.cards)) { lines.push(`#${i+1} Bust (${pTotal})`); return; }
      if (isBJ(b.cards) && !isBJ(state.dealer.cards)) {
        state.bankroll += b.bet + b.bet * 1.5; pnl += b.bet * 1.5;
        lines.push(`#${i+1} BJ +$${(b.bet * 1.5).toFixed(0)}`);
        return;
      }
      if (skipDealer) return;
      if (dBust || pTotal > dTotal) { state.bankroll += b.bet * 2; pnl += b.bet; lines.push(`#${i+1} Win (${pTotal})`); }
      else if (pTotal < dTotal)     { lines.push(`#${i+1} Lose (${pTotal} vs ${dTotal})`); }
      else                          { state.bankroll += b.bet; lines.push(`#${i+1} Push (${pTotal})`); }
    });
    state.message = lines.join(" · ");
    state.phase = "settle";
    state.bet = 0;
    render();
    setTimeout(() => {
      state.phase = "betting";
      // Clear hands so the adapter sees the round ended.
      state.player = [];
      state.dealer = { cards: [] };
      render();
    }, 1400);
  }
  function finishDealerAndSettle() {
    // Reveal hole card + settle immediately for BJ short-circuit.
    state.phase = "settle";
    render();
    setTimeout(() => settle(), 500);
  }

  // --- Wiring ---
  document.querySelectorAll(".chip[data-chip]").forEach((btn) => {
    btn.addEventListener("click", () => addChip(Number(btn.dataset.chip)));
  });
  el.clear.addEventListener("click", clearBet);
  el.deal.addEventListener("click", startRound);
  el.hit.addEventListener("click", hit);
  el.stand.addEventListener("click", stand);
  el.double.addEventListener("click", doubleDown);
  el.split.addEventListener("click", splitHand);
  el.surrender.addEventListener("click", surrenderHand);
  el.insYes.addEventListener("click", () => resolveInsurance(true));
  el.insNo.addEventListener("click", () => resolveInsurance(false));

  // Expose small API for the adapter to cross-check state when useful.
  window.__bj = {
    getState: () => ({
      phase: state.phase,
      bankroll: state.bankroll,
      bet: state.bet,
      pendingBet: state.pendingBet,
      decksLeft: decksLeft(),
      player: state.player.map((b) => ({
        cards: b.cards.map((c) => c.rank),
        bet: b.bet,
        done: b.done,
        surrendered: !!b.surrendered,
      })),
      dealer: state.dealer.cards.map((c) => c.rank),
      activeBranch: state.active,
      message: state.message,
    }),
  };

  buildShoe();
  render();
})();
