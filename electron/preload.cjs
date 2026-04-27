const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("bot", {
  start: (opts) => ipcRenderer.invoke("bot:start", opts),
  stop: () => ipcRenderer.invoke("bot:stop"),
  onLog: (cb) => ipcRenderer.on("bot:log", (_e, v) => cb(v)),
  onStats: (cb) => ipcRenderer.on("bot:stats", (_e, v) => cb(v)),
  onEnded: (cb) => ipcRenderer.on("bot:ended", (_e, v) => cb(v)),
});
