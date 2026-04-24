import React, { useState } from 'react'
import { renderMagazineHTML } from '../lib/render'

export default function ExportView({ magazine }) {
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  const defaultName = (ext) => {
    const slug = (magazine.title || 'magazine').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const issue = magazine.issue ? `-issue-${magazine.issue}` : ''
    return `${slug}${issue}.${ext}`
  }

  const exportPDF = async () => {
    setBusy(true)
    setStatus('Rendering to PDF…')
    try {
      const html = renderMagazineHTML(magazine)
      const result = await window.atelier.files.exportPDF({
        html,
        defaultName: defaultName('pdf'),
      })
      if (result.canceled) setStatus('')
      else if (result.ok) setStatus(`Saved to ${result.filePath}`)
      else setStatus(result.error || 'Export failed.')
    } finally {
      setBusy(false)
    }
  }

  const exportHTML = async () => {
    setBusy(true)
    setStatus('Writing HTML…')
    try {
      const html = renderMagazineHTML(magazine)
      const result = await window.atelier.files.exportHTML({
        html,
        defaultName: defaultName('html'),
      })
      if (result.canceled) setStatus('')
      else if (result.ok) setStatus(`Saved to ${result.filePath}`)
      else setStatus(result.error || 'Export failed.')
    } finally {
      setBusy(false)
    }
  }

  const wordTotal = magazine.articles.reduce((n, a) => n + ((a.polished || a.body || '').trim().split(/\s+/).filter(Boolean).length), 0)
  const polishedCount = magazine.articles.filter(a => a.polished).length

  return (
    <div className="view view--pad">
      <header className="view__head">
        <h1 className="view__title">Export</h1>
        <p className="view__sub">Save the magazine as a PDF ready to print, or as a self-contained HTML file.</p>
      </header>

      <div className="export">
        <div className="export__stats">
          <div>
            <div className="stat__num">{magazine.articles.length}</div>
            <div className="stat__label">Articles</div>
          </div>
          <div>
            <div className="stat__num">{polishedCount}</div>
            <div className="stat__label">Polished</div>
          </div>
          <div>
            <div className="stat__num">{wordTotal.toLocaleString()}</div>
            <div className="stat__label">Words</div>
          </div>
          <div>
            <div className="stat__num">{magazine.articles.length + (magazine.editorsLetter ? 4 : 3)}</div>
            <div className="stat__label">Pages (approx)</div>
          </div>
        </div>

        <div className="export__actions">
          <button className="btn btn--primary btn--large" onClick={exportPDF} disabled={busy || magazine.articles.length === 0}>
            Export PDF
          </button>
          <button className="btn btn--ghost btn--large" onClick={exportHTML} disabled={busy || magazine.articles.length === 0}>
            Export HTML
          </button>
        </div>

        {status && <div className="export__status">{status}</div>}

        {magazine.articles.length === 0 && (
          <p className="muted">Add at least one article to enable export.</p>
        )}

        <aside className="export__notes">
          <h3>A note on typography</h3>
          <p>
            The magazine prints at US Letter, one article per page, two-column body
            with a drop cap on the opening paragraph. The cover uses{' '}
            <em>Playfair Display</em> for the nameplate and <em>Cormorant Garamond</em>{' '}
            for the tagline; the body is set in <em>EB Garamond</em>.
          </p>
        </aside>
      </div>
    </div>
  )
}
