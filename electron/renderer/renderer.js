const $ = (id) => document.getElementById(id);
const log = $("log");
const status = $("status");

function appendLog(line, cls = "") {
  const div = document.createElement("div");
  div.className = "line " + cls;
  const ts = new Date().toLocaleTimeString();
  div.textContent = `[${ts}] ${line}`;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

function setRunning(running) {
  $("start").disabled = running;
  $("stop").disabled = !running;
  status.textContent = running ? "running" : "idle";
  status.classList.toggle("running", running);
}

window.bot.onLog((entry) => {
  if (typeof entry === "string") appendLog(entry);
  else appendLog(entry.msg, entry.level || "");
});

window.bot.onStats((s) => {
  $("s-rounds").textContent = s.rounds;
  $("s-bank").textContent   = "$" + Number(s.bankroll).toFixed(2);
  const pnl = s.bankroll - s.startBankroll;
  $("s-pnl").textContent    = (pnl >= 0 ? "+$" : "-$") + Math.abs(pnl).toFixed(2);
  $("s-wlp").textContent    = `${s.won} / ${s.lost} / ${s.pushes}`;
  $("s-count").textContent  = `${s.rc} / ${s.tc.toFixed(2)}`;
});

window.bot.onEnded((reason) => {
  setRunning(false);
  appendLog("Session ended: " + (reason || "stopped"), "dim");
});

$("start").addEventListener("click", async () => {
  const opts = {
    site:      $("site").value,
    url:       $("url").value.trim(),
    unit:      Number($("unit").value),
    bankroll:  Number($("bankroll").value),
    mode:      $("mode").value,
    actionDelayMs: Number($("speed").value),
    maxRounds: Number($("rounds").value) || 0,
  };
  appendLog("Starting session...", "dim");
  setRunning(true);
  const res = await window.bot.start(opts);
  if (!res.ok) {
    appendLog("Failed to start: " + res.error, "err");
    setRunning(false);
  } else {
    appendLog("Session started", "ok");
  }
});

$("stop").addEventListener("click", async () => {
  appendLog("Stopping...", "dim");
  const res = await window.bot.stop();
  if (!res.ok) appendLog("Stop failed: " + res.error, "err");
});
