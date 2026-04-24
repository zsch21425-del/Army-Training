const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('atelier', {
  settings: {
    getApiKey: () => ipcRenderer.invoke('settings:get-api-key'),
    setApiKey: (key) => ipcRenderer.invoke('settings:set-api-key', key),
    validateApiKey: (key) => ipcRenderer.invoke('settings:validate-api-key', key),
  },
  magazines: {
    load: () => ipcRenderer.invoke('magazines:load'),
    save: (magazines) => ipcRenderer.invoke('magazines:save', magazines),
  },
  claude: {
    polish: (article, jobId) => ipcRenderer.invoke('claude:polish', { article, jobId }),
    cancel: (jobId) => ipcRenderer.invoke('claude:cancel', jobId),
    writeFrontMatter: (payload) => ipcRenderer.invoke('claude:front-matter', payload),
    onChunk: (handler) => {
      const listener = (_e, payload) => handler(payload)
      ipcRenderer.on('claude:chunk', listener)
      return () => ipcRenderer.removeListener('claude:chunk', listener)
    },
    onThinking: (handler) => {
      const listener = (_e, payload) => handler(payload)
      ipcRenderer.on('claude:thinking', listener)
      return () => ipcRenderer.removeListener('claude:thinking', listener)
    },
  },
  files: {
    importArticles: () => ipcRenderer.invoke('files:import-articles'),
    exportPDF: (payload) => ipcRenderer.invoke('files:export-pdf', payload),
    exportHTML: (payload) => ipcRenderer.invoke('files:export-html', payload),
  },
})
