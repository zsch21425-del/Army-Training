import React, { useState } from 'react'

export default function FrontMatterView({ magazine, onChange }) {
  const [loading, setLoading] = useState('')
  const [error, setError] = useState('')

  const generate = async (kind) => {
    setLoading(kind)
    setError('')
    try {
      const result = await window.atelier.claude.writeFrontMatter({
        magazine: {
          title: magazine.title,
          subtitle: magazine.subtitle,
          issue: magazine.issue,
        },
        articles: magazine.articles,
        kind,
      })
      if (!result.ok) {
        setError(result.error || 'Failed.')
        return
      }
      if (kind === 'letter') onChange({ ...magazine, editorsLetter: result.text })
      if (kind === 'masthead') onChange({ ...magazine, masthead: result.text })
    } finally {
      setLoading('')
    }
  }

  return (
    <div className="view view--pad">
      <header className="view__head">
        <h1 className="view__title">Editor's Letter & Front Matter</h1>
        <p className="view__sub">
          The Editor's Letter opens the issue. Claude can draft one from the articles you have
          gathered, or you can write it yourself.
        </p>
      </header>

      <div className="front-matter">
        <section className="pane">
          <div className="pane__head">
            <h3>Editor's Letter</h3>
            <button
              className="btn btn--primary"
              onClick={() => generate('letter')}
              disabled={loading === 'letter' || magazine.articles.length === 0}
            >
              {loading === 'letter' ? 'Drafting…' : '✎ Draft with Claude'}
            </button>
          </div>
          <textarea
            className="input textarea textarea--editor"
            rows={22}
            value={magazine.editorsLetter}
            placeholder="Write or generate a letter introducing this issue."
            onChange={(e) => onChange({ ...magazine, editorsLetter: e.target.value })}
          />
        </section>

        <section className="pane">
          <div className="pane__head">
            <h3>Masthead copy</h3>
            <button
              className="btn btn--ghost"
              onClick={() => generate('masthead')}
              disabled={loading === 'masthead'}
            >
              {loading === 'masthead' ? 'Drafting…' : '✎ Draft with Claude'}
            </button>
          </div>
          <textarea
            className="input textarea"
            rows={10}
            value={magazine.masthead}
            placeholder="Publication name, issue, date, ethos. One line per item."
            onChange={(e) => onChange({ ...magazine, masthead: e.target.value })}
          />
        </section>

        {error && <div className="error">{error}</div>}
      </div>
    </div>
  )
}
