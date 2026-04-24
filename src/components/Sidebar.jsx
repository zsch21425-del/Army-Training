import React from 'react'

const VIEWS = [
  { id: 'cover', label: 'Cover & Masthead', glyph: '❦' },
  { id: 'articles', label: 'Articles', glyph: '§' },
  { id: 'front', label: 'Editor’s Letter', glyph: '✎' },
  { id: 'preview', label: 'Preview', glyph: '◉' },
  { id: 'export', label: 'Export', glyph: '⇲' },
  { id: 'settings', label: 'Settings', glyph: '⚙' },
]

export default function Sidebar({ view, onView, magazine, apiKeyState }) {
  const articleCount = magazine?.articles?.length || 0
  const polishedCount = magazine?.articles?.filter(a => a.polished).length || 0
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__mark">A</div>
        <div>
          <div className="sidebar__title">Atelier</div>
          <div className="sidebar__subtitle">Magazine Studio</div>
        </div>
      </div>

      <nav className="sidebar__nav">
        {VIEWS.map(v => (
          <button
            key={v.id}
            className={'sidebar__nav-item' + (view === v.id ? ' is-active' : '')}
            onClick={() => onView(v.id)}
          >
            <span className="sidebar__nav-glyph">{v.glyph}</span>
            <span className="sidebar__nav-label">{v.label}</span>
            {v.id === 'articles' && articleCount > 0 && (
              <span className="sidebar__nav-badge">
                {polishedCount}/{articleCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__mag-title">{magazine?.title || 'Untitled'}</div>
        <div className="sidebar__mag-meta">
          Issue {magazine?.issue || '—'} · {magazine?.coverDate || ''}
        </div>
        <div className={'sidebar__apikey ' + (apiKeyState.hasKey ? 'is-ok' : 'is-warn')}>
          {apiKeyState.hasKey ? `API key: ${apiKeyState.preview}` : 'No API key set'}
        </div>
      </div>
    </aside>
  )
}
