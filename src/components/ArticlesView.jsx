import React, { useState, useEffect, useRef } from 'react'
import { newArticle, uid } from '../lib/magazine'

export default function ArticlesView({ magazine, onChange }) {
  const [selectedId, setSelectedId] = useState(magazine.articles[0]?.id || null)
  const [jobId, setJobId] = useState(null)
  const [streamBuffer, setStreamBuffer] = useState('')
  const [thinkBuffer, setThinkBuffer] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!selectedId && magazine.articles.length > 0) setSelectedId(magazine.articles[0].id)
  }, [magazine.articles, selectedId])

  const off = useRef({ chunk: null, think: null })
  useEffect(() => {
    off.current.chunk = window.atelier.claude.onChunk((payload) => {
      if (payload.jobId !== jobIdRef.current) return
      setStreamBuffer(prev => prev + payload.chunk)
    })
    off.current.think = window.atelier.claude.onThinking((payload) => {
      if (payload.jobId !== jobIdRef.current) return
      setThinkBuffer(prev => prev + payload.chunk)
    })
    return () => {
      off.current.chunk?.()
      off.current.think?.()
    }
  }, [])

  const jobIdRef = useRef(null)
  useEffect(() => { jobIdRef.current = jobId }, [jobId])

  const selected = magazine.articles.find(a => a.id === selectedId)

  const updateArticle = (id, patch) => {
    onChange({
      ...magazine,
      articles: magazine.articles.map(a =>
        a.id === id ? { ...a, ...patch, updatedAt: Date.now() } : a
      ),
    })
  }

  const addBlank = () => {
    const a = newArticle({ title: 'New Article' })
    onChange({ ...magazine, articles: [...magazine.articles, a] })
    setSelectedId(a.id)
  }

  const importFiles = async () => {
    const files = await window.atelier.files.importArticles()
    if (!files.length) return
    const articles = files.map(f => newArticle({ title: f.title, body: f.body }))
    onChange({ ...magazine, articles: [...magazine.articles, ...articles] })
    setSelectedId(articles[0].id)
  }

  const removeArticle = (id) => {
    const next = magazine.articles.filter(a => a.id !== id)
    onChange({ ...magazine, articles: next })
    if (selectedId === id) setSelectedId(next[0]?.id || null)
  }

  const moveArticle = (id, delta) => {
    const idx = magazine.articles.findIndex(a => a.id === id)
    const newIdx = idx + delta
    if (newIdx < 0 || newIdx >= magazine.articles.length) return
    const copy = [...magazine.articles]
    const [item] = copy.splice(idx, 1)
    copy.splice(newIdx, 0, item)
    onChange({ ...magazine, articles: copy })
  }

  const polish = async () => {
    if (!selected) return
    setError('')
    setStreamBuffer('')
    setThinkBuffer('')
    const id = uid('job')
    setJobId(id)
    updateArticle(selected.id, { status: 'polishing', polished: '' })
    try {
      const result = await window.atelier.claude.polish(
        { title: selected.title, author: selected.author, body: selected.body },
        id
      )
      if (!result.ok) {
        if (!result.canceled) setError(result.error || 'Polishing failed.')
        updateArticle(selected.id, { status: 'draft' })
      } else {
        updateArticle(selected.id, {
          polished: result.polished,
          status: 'polished',
        })
      }
    } finally {
      setJobId(null)
    }
  }

  const cancel = async () => {
    if (jobId) await window.atelier.claude.cancel(jobId)
    if (selected) updateArticle(selected.id, { status: 'draft' })
    setJobId(null)
  }

  return (
    <div className="view articles-view">
      <div className="articles-list">
        <header className="articles-list__head">
          <h2>Articles</h2>
          <div className="articles-list__actions">
            <button className="btn btn--ghost" onClick={importFiles}>Import files</button>
            <button className="btn btn--primary" onClick={addBlank}>+ New</button>
          </div>
        </header>
        {magazine.articles.length === 0 && (
          <div className="articles-list__empty">
            <p>No articles yet.</p>
            <p className="muted">
              Import <code>.txt</code> or <code>.md</code> files, or start a new one.
            </p>
          </div>
        )}
        <ul>
          {magazine.articles.map((a, i) => (
            <li
              key={a.id}
              className={'articles-list__item' + (a.id === selectedId ? ' is-active' : '')}
              onClick={() => setSelectedId(a.id)}
            >
              <div className="articles-list__row">
                <span className="articles-list__num">{String(i + 1).padStart(2, '0')}</span>
                <div className="articles-list__meta">
                  <div className="articles-list__title">{a.title || 'Untitled'}</div>
                  <div className="articles-list__by">
                    {a.author || '—'}
                    <span className={'pill pill--' + a.status}>{a.status}</span>
                  </div>
                </div>
              </div>
              <div className="articles-list__controls">
                <button onClick={(e) => { e.stopPropagation(); moveArticle(a.id, -1) }}>↑</button>
                <button onClick={(e) => { e.stopPropagation(); moveArticle(a.id, 1) }}>↓</button>
                <button onClick={(e) => { e.stopPropagation(); removeArticle(a.id) }}>✕</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="articles-editor">
        {!selected && (
          <div className="articles-editor__empty">
            <h2>Select or add an article</h2>
            <p className="muted">
              Each piece lives here. Paste your draft into <em>Manuscript</em>, then click
              <em> Polish with Claude</em> to have it rewritten in the tradition of the
              great essayists.
            </p>
          </div>
        )}

        {selected && (
          <>
            <div className="articles-editor__form">
              <label className="field field--wide">
                <span>Title</span>
                <input
                  className="input input--display"
                  value={selected.title}
                  onChange={(e) => updateArticle(selected.id, { title: e.target.value })}
                />
              </label>
              <label className="field">
                <span>Author</span>
                <input
                  className="input"
                  value={selected.author}
                  onChange={(e) => updateArticle(selected.id, { author: e.target.value })}
                />
              </label>
              <label className="field">
                <span>Kicker</span>
                <input
                  className="input"
                  placeholder="Essay, Dispatch, Reported…"
                  value={selected.kicker || ''}
                  onChange={(e) => updateArticle(selected.id, { kicker: e.target.value })}
                />
              </label>
            </div>

            <div className="articles-editor__panes">
              <section className="pane">
                <div className="pane__head">
                  <h3>Manuscript</h3>
                  <span className="muted">{wordCount(selected.body)} words</span>
                </div>
                <textarea
                  className="input textarea textarea--editor"
                  value={selected.body}
                  rows={24}
                  placeholder="Paste or write the draft here."
                  onChange={(e) => updateArticle(selected.id, { body: e.target.value })}
                />
                <div className="pane__actions">
                  {jobId ? (
                    <button className="btn btn--danger" onClick={cancel}>Cancel</button>
                  ) : (
                    <button
                      className="btn btn--primary"
                      onClick={polish}
                      disabled={!selected.body.trim()}
                    >
                      ✎ Polish with Claude
                    </button>
                  )}
                </div>
                {thinkBuffer && (
                  <details className="thinking">
                    <summary>Editor's reasoning</summary>
                    <pre>{thinkBuffer}</pre>
                  </details>
                )}
                {error && <div className="error">{error}</div>}
              </section>

              <section className="pane pane--polished">
                <div className="pane__head">
                  <h3>Polished</h3>
                  <span className="muted">
                    {wordCount(jobId ? streamBuffer : selected.polished)} words
                  </span>
                </div>
                <textarea
                  className="input textarea textarea--editor textarea--polished"
                  value={jobId ? streamBuffer : selected.polished}
                  rows={24}
                  placeholder={
                    jobId
                      ? 'Claude is polishing the piece...'
                      : 'The polished version will appear here. You can edit it before publishing.'
                  }
                  onChange={(e) => updateArticle(selected.id, { polished: e.target.value })}
                  readOnly={Boolean(jobId)}
                />
                <div className="pane__actions">
                  {selected.polished && !jobId && (
                    <button
                      className="btn btn--ghost"
                      onClick={() => updateArticle(selected.id, { polished: '', status: 'draft' })}
                    >
                      Clear polished version
                    </button>
                  )}
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function wordCount(s) {
  if (!s) return 0
  return s.trim().split(/\s+/).filter(Boolean).length
}
