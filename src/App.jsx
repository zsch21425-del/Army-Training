import React, { useEffect, useState, useCallback, useRef } from 'react'
import Sidebar from './components/Sidebar'
import CoverView from './components/CoverView'
import ArticlesView from './components/ArticlesView'
import FrontMatterView from './components/FrontMatterView'
import PreviewView from './components/PreviewView'
import ExportView from './components/ExportView'
import SettingsView from './components/SettingsView'
import { newMagazine } from './lib/magazine'

export default function App() {
  const [view, setView] = useState('cover')
  const [magazine, setMagazine] = useState(null)
  const [apiKeyState, setApiKeyState] = useState({ hasKey: false, preview: '' })
  const savingRef = useRef(null)

  const refreshApiKey = useCallback(async () => {
    const state = await window.atelier.settings.getApiKey()
    setApiKeyState(state)
  }, [])

  useEffect(() => {
    async function boot() {
      await refreshApiKey()
      const stored = await window.atelier.magazines.load()
      setMagazine(stored?.[0] || newMagazine())
    }
    boot()
  }, [refreshApiKey])

  useEffect(() => {
    if (!magazine) return
    clearTimeout(savingRef.current)
    savingRef.current = setTimeout(() => {
      window.atelier.magazines.save([{ ...magazine, updatedAt: Date.now() }])
    }, 500)
  }, [magazine])

  if (!magazine) {
    return <div className="boot">Preparing the studio…</div>
  }

  return (
    <div className="app">
      <Sidebar view={view} onView={setView} magazine={magazine} apiKeyState={apiKeyState} />
      <main className="app__main">
        {!apiKeyState.hasKey && view !== 'settings' && (
          <div className="banner">
            Atelier needs an Anthropic API key to polish articles.{' '}
            <button className="banner__link" onClick={() => setView('settings')}>
              Open Settings →
            </button>
          </div>
        )}
        {view === 'cover' && <CoverView magazine={magazine} onChange={setMagazine} />}
        {view === 'articles' && <ArticlesView magazine={magazine} onChange={setMagazine} />}
        {view === 'front' && <FrontMatterView magazine={magazine} onChange={setMagazine} />}
        {view === 'preview' && <PreviewView magazine={magazine} />}
        {view === 'export' && <ExportView magazine={magazine} />}
        {view === 'settings' && (
          <SettingsView apiKeyState={apiKeyState} onApiKeyChange={refreshApiKey} />
        )}
      </main>
    </div>
  )
}
