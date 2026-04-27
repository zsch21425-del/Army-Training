// Electron main process — spawns a Playwright-driven Chromium window
// to play blackjack autonomously. The Electron window is the control panel.

const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");
const fs = require("node:fs");
const { spawn } = require("node:child_process");
const { pathToFileURL } = require("node:url");

let controlWindow = null;
let driverSession = null; // active Playwright session, if any

// Store downloaded Chromium in the user-data dir so it persists across
// uninstalls and stays out of Program Files (which needs admin rights).
function browsersPath() {
  return path.join(app.getPath("userData"), "playwright-browsers");
}

// Locate playwright-core/cli.js on disk, accounting for ASAR packaging.
// In dev: app.getAppPath() is the project root; cli.js sits under node_modules.
// In packaged builds: app.getAppPath() ends in /app.asar — but cli.js needs to
// be on real disk for `spawn` to read it, so we redirect to app.asar.unpacked
// (electron-builder's `asarUnpack` config puts playwright-core there).
function playwrightCliPath() {
  const appPath = app.getAppPath();
  const root = appPath.endsWith("app.asar")
    ? appPath.replace(/app\.asar$/, "app.asar.unpacked")
    : appPath;
  return path.join(root, "node_modules", "playwright-core", "cli.js");
}

// Ensure Playwright's Chromium exists. If not, spawn the playwright CLI
// using Electron-as-Node to download it. First run only; subsequent runs
// skip immediately.
async function ensureChromium(emitLog) {
  process.env.PLAYWRIGHT_BROWSERS_PATH = browsersPath();
  let chromium;
  try {
    chromium = require("playwright").chromium;
    const exe = chromium.executablePath();
    if (exe && fs.existsSync(exe)) return exe;
  } catch { /* fall through to install */ }

  emitLog?.({ msg: "First-run setup: downloading Chromium (~170 MB, one-time)...", level: "dim" });
  const cliPath = playwrightCliPath();
  if (!fs.existsSync(cliPath)) {
    throw new Error(`playwright-core CLI not found at ${cliPath}`);
  }
  await new Promise((resolve, reject) => {
    const proc = spawn(process.execPath, [cliPath, "install", "chromium"], {
      env: {
        ...process.env,
        ELECTRON_RUN_AS_NODE: "1",
        PLAYWRIGHT_BROWSERS_PATH: browsersPath(),
      },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stderr = "";
    proc.stdout.on("data", (d) => {
      const s = d.toString().trim();
      if (s) emitLog?.({ msg: s, level: "dim" });
    });
    proc.stderr.on("data", (d) => { stderr += d.toString(); });
    proc.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Chromium install exited ${code}: ${stderr.slice(0, 400)}`));
    });
    proc.on("error", reject);
  });
  emitLog?.({ msg: "Chromium ready.", level: "ok" });
  return require("playwright").chromium.executablePath();
}

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

function bundledGameUrl() {
  const p = path.join(__dirname, "..", "bundled-game", "index.html");
  return pathToFileURL(p).href;
}

ipcMain.handle("bot:start", async (_evt, opts) => {
  if (driverSession) return { ok: false, error: "Session already running" };
  try {
    const emitLog = (line) => broadcast("bot:log", line);
    // Ensure Playwright's Chromium is available (first-run downloads it).
    const chromiumPath =
      process.env.PLAYWRIGHT_CHROMIUM_PATH || (await ensureChromium(emitLog));

    const { startSession } = await loadDriver();
    const resolvedUrl =
      (opts && opts.url) ||
      (opts && opts.site === "bundled" ? bundledGameUrl() : undefined);
    driverSession = await startSession({
      ...opts,
      url: resolvedUrl,
      chromiumExecutablePath: chromiumPath,
      onLog: emitLog,
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
