import React, { useState } from 'react'

export default function SettingsView({ apiKeyState, onApiKeyChange }) {
  const [input, setInput] = useState('')
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  const save = async () => {
    setBusy(true)
    setStatus('Validating…')
    const trimmed = input.trim()
    if (trimmed) {
      const result = await window.atelier.settings.validateApiKey(trimmed)
      if (!result.ok) {
        setStatus(result.error || 'Key rejected.')
        setBusy(false)
        return
      }
    }
    await window.atelier.settings.setApiKey(trimmed)
    setStatus(trimmed ? 'Saved. Your key is stored with OS-level encryption.' : 'Key cleared.')
    setInput('')
    await onApiKeyChange()
    setBusy(false)
  }

  return (
    <div className="view view--pad settings-view">
      <header className="view__head">
        <h1 className="view__title">Settings</h1>
        <p className="view__sub">
          Atelier uses the Anthropic Claude API to polish your articles into literary prose.
        </p>
      </header>

      <section className="panel">
        <h2>Anthropic API Key</h2>
        <p>
          Paste your API key from{' '}
          <code>console.anthropic.com</code>. The key is encrypted with your operating system's
          credential store (DPAPI on Windows) and never leaves this machine except to call
          Anthropic directly.
        </p>
        <div className="settings-current">
          <span>Current:</span>
          <code>{apiKeyState.hasKey ? apiKeyState.preview : '— not set —'}</code>
        </div>
        <div className="settings-form">
          <input
            type="password"
            className="input input--mono"
            placeholder="sk-ant-api03-..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoComplete="off"
          />
          <button className="btn btn--primary" onClick={save} disabled={busy}>
            {busy ? 'Validating…' : 'Save'}
          </button>
        </div>
        {status && <div className="settings-status">{status}</div>}
      </section>

      <section className="panel">
        <h2>Model</h2>
        <p>
          All polishing and drafting runs on <b>Claude Opus 4.7</b> with adaptive thinking at
          high effort — optimized for literary quality over cost. Expect each article to take
          thirty seconds to a minute depending on length.
        </p>
      </section>

      <section className="panel">
        <h2>About</h2>
        <p>
          Atelier is a small desktop studio for assembling magazines and books. It is built
          on Electron, React, and the Anthropic SDK. It stores nothing in the cloud; your
          drafts live in this application's user-data folder on this computer.
        </p>
      </section>
    </div>
  )
}
