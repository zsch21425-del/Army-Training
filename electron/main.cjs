// Electron main process — spawns a Playwright-driven Chromium window
// to play blackjack autonomously. The Electron window is the control panel.

const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

let controlWindow = null;
let driverSession = null; // active Playwright session, if any

async function createControlWindow() {
  controlWindow = new BrowserWindow({
    width: 920,
    height: 640,
    title: "Blackjack Bot",
    backgroundColor: "#0b1020",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  await controlWindow.loadFile(path.join(__dirname, "renderer", "index.html"));
}

function broadcast(channel, payload) {
  if (controlWindow && !controlWindow.isDestroyed()) {
    controlWindow.webContents.send(channel, payload);
  }
}

async function loadDriver() {
  // ESM dynamic import from a CJS file.
  const url = pathToFileURL(path.join(__dirname, "..", "automation", "driver.js")).href;
  return import(url);
}

ipcMain.handle("bot:start", async (_evt, opts) => {
  if (driverSession) return { ok: false, error: "Session already running" };
  try {
    const { startSession } = await loadDriver();
    driverSession = await startSession({
      ...opts,
      onLog: (line) => broadcast("bot:log", line),
      onStats: (stats) => broadcast("bot:stats", stats),
      onEnd: (reason) => {
        driverSession = null;
        broadcast("bot:ended", reason);
      },
    });
    return { ok: true };
  } catch (err) {
    driverSession = null;
    return { ok: false, error: String(err && err.stack ? err.stack : err) };
  }
});

ipcMain.handle("bot:stop", async () => {
  if (!driverSession) return { ok: false, error: "No active session" };
  try {
    await driverSession.stop();
  } catch (err) {
    return { ok: false, error: String(err) };
  }
  driverSession = null;
  return { ok: true };
});

app.whenReady().then(createControlWindow);

app.on("window-all-closed", async () => {
  if (driverSession) {
    try { await driverSession.stop(); } catch {}
    driverSession = null;
  }
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createControlWindow();
});
