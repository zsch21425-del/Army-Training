const { BrowserWindow, dialog } = require('electron')
const fs = require('fs')
const path = require('path')

async function exportMagazinePDF({ html, defaultName, parent }) {
  const result = await dialog.showSaveDialog(parent, {
    title: 'Export Magazine',
    defaultPath: defaultName || 'magazine.pdf',
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  })
  if (result.canceled || !result.filePath) return { ok: false, canceled: true }

  const win = new BrowserWindow({
    show: false,
    width: 816,
    height: 1056,
    webPreferences: { offscreen: false, javascript: true },
  })

  try {
    await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html))
    await new Promise(r => setTimeout(r, 400))
    const buffer = await win.webContents.printToPDF({
      printBackground: true,
      pageSize: 'Letter',
      margins: { marginType: 'none' },
      preferCSSPageSize: true,
    })
    fs.writeFileSync(result.filePath, buffer)
    return { ok: true, filePath: result.filePath }
  } finally {
    win.destroy()
  }
}

async function exportMagazineHTML({ html, defaultName, parent }) {
  const result = await dialog.showSaveDialog(parent, {
    title: 'Export Magazine (HTML)',
    defaultPath: defaultName || 'magazine.html',
    filters: [{ name: 'HTML', extensions: ['html'] }],
  })
  if (result.canceled || !result.filePath) return { ok: false, canceled: true }
  fs.writeFileSync(result.filePath, html)
  return { ok: true, filePath: result.filePath }
}

async function importArticleFiles({ parent }) {
  const result = await dialog.showOpenDialog(parent, {
    title: 'Add articles',
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Text documents', extensions: ['txt', 'md', 'markdown', 'rtf'] },
      { name: 'All files', extensions: ['*'] },
    ],
  })
  if (result.canceled) return []
  return result.filePaths.map(p => {
    const body = fs.readFileSync(p, 'utf-8')
    const base = path.basename(p).replace(/\.[^.]+$/, '')
    return { title: base, body }
  })
}

module.exports = { exportMagazinePDF, exportMagazineHTML, importArticleFiles }
