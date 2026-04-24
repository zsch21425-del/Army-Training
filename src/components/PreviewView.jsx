import React, { useMemo, useRef, useEffect } from 'react'
import { renderMagazineHTML } from '../lib/render'

export default function PreviewView({ magazine }) {
  const html = useMemo(() => renderMagazineHTML(magazine), [magazine])
  const iframeRef = useRef(null)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    iframe.srcdoc = html
  }, [html])

  return (
    <div className="view preview-view">
      <header className="view__head preview-head">
        <div>
          <h1 className="view__title">Preview</h1>
          <p className="view__sub">Live, paginated. What you see is what prints.</p>
        </div>
      </header>
      <div className="preview-frame">
        <iframe ref={iframeRef} title="Magazine preview" />
      </div>
    </div>
  )
}
