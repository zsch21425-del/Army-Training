const { app, BrowserWindow, ipcMain, Menu } = require('electron')
const path = require('path')
const store = require('./store')
const claude = require('./claude')
const pdf = require('./pdf')

const isDev = process.env.ATELIER_DEV === '1'

let mainWindow = null
const activeJobs = new Map()

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 720,
    backgroundColor: '#F5F1E8',
    title: 'Atelier Magazine',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }

  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      {
        label: 'File',
        submenu: [
          { role: 'quit' },
        ],
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'selectAll' },
        ],
      },
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' },
        ],
      },
    ])
  )
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.handle('settings:get-api-key', () => {
  const key = store.loadApiKey()
  if (!key) return { hasKey: false, preview: '' }
  return { hasKey: true, preview: key.slice(0, 7) + '…' + key.slice(-4) }
})

ipcMain.handle('settings:set-api-key', (_e, key) => {
  store.saveApiKey((key || '').trim())
  return { ok: true }
})

ipcMain.handle('settings:validate-api-key', async (_e, key) => {
  return claude.validateApiKey((key || '').trim())
})

ipcMain.handle('magazines:load', () => store.loadMagazines())
ipcMain.handle('magazines:save', (_e, magazines) => {
  store.saveMagazines(magazines)
  return { ok: true }
})

ipcMain.handle('claude:polish', async (event, { article, jobId }) => {
  const controller = new AbortController()
  activeJobs.set(jobId, controller)
  const send = (channel, payload) => {
    if (!event.sender.isDestroyed()) event.sender.send(channel, payload)
  }
  try {
    const result = await claude.polishArticle({
      article,
      signal: controller.signal,
      onChunk: (chunk) => send('claude:chunk', { jobId, chunk }),
      onThinking: (chunk) => send('claude:thinking', { jobId, chunk }),
    })
    return { ok: true, ...result }
  } catch (err) {
    if (err && err.name === 'AbortError') return { ok: false, canceled: true }
    return { ok: false, error: err.message || String(err) }
  } finally {
    activeJobs.delete(jobId)
  }
})

ipcMain.handle('claude:cancel', (_e, jobId) => {
  const controller = activeJobs.get(jobId)
  if (controller) controller.abort()
  return { ok: true }
})

ipcMain.handle('claude:front-matter', async (_e, payload) => {
  try {
    const text = await claude.writeFrontMatter(payload)
    return { ok: true, text }
  } catch (err) {
    return { ok: false, error: err.message || String(err) }
  }
})

ipcMain.handle('files:import-articles', async () => {
  return pdf.importArticleFiles({ parent: mainWindow })
})

ipcMain.handle('files:export-pdf', async (_e, payload) => {
  return pdf.exportMagazinePDF({ ...payload, parent: mainWindow })
})

ipcMain.handle('files:export-html', async (_e, payload) => {
  return pdf.exportMagazineHTML({ ...payload, parent: mainWindow })
})
