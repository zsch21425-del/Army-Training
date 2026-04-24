import React from 'react'

export default function CoverView({ magazine, onChange }) {
  const set = (field) => (e) => onChange({ ...magazine, [field]: e.target.value })
  return (
    <div className="view view--pad">
      <header className="view__head">
        <h1 className="view__title">Cover & Masthead</h1>
        <p className="view__sub">
          The nameplate, the tagline, the issue information. Everything that frames the work.
        </p>
      </header>

      <div className="form-grid">
        <label className="field field--wide">
          <span>Title</span>
          <input className="input input--display" value={magazine.title} onChange={set('title')} />
        </label>

        <label className="field field--wide">
          <span>Subtitle / tagline</span>
          <input className="input input--italic" value={magazine.subtitle} onChange={set('subtitle')} />
        </label>

        <label className="field">
          <span>Issue</span>
          <input className="input" value={magazine.issue} onChange={set('issue')} />
        </label>

        <label className="field">
          <span>Cover date</span>
          <input className="input" value={magazine.coverDate} onChange={set('coverDate')} />
        </label>

        <label className="field">
          <span>Editor</span>
          <input className="input" value={magazine.editor} onChange={set('editor')} />
        </label>

        <label className="field">
          <span>Theme</span>
          <select className="input" value={magazine.theme} onChange={set('theme')}>
            <option value="classic">Classic — Ink & Cream</option>
          </select>
        </label>

        <label className="field field--wide">
          <span>Masthead</span>
          <textarea
            className="input textarea"
            value={magazine.masthead}
            rows={6}
            onChange={set('masthead')}
            placeholder="Names, roles, publication info — one per line."
          />
        </label>
      </div>
    </div>
  )
}
