import { paragraphsFromText } from './magazine'

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function inlineEmphasis(s) {
  return esc(s).replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
}

export function renderArticleParagraphs(text, { dropCap = true } = {}) {
  const paras = paragraphsFromText(text)
  return paras
    .map((p, i) => {
      const cls = dropCap && i === 0 ? 'para para--lede' : 'para'
      return `<p class="${cls}">${inlineEmphasis(p)}</p>`
    })
    .join('\n')
}

const PRINT_STYLES = `
  @page { size: Letter; margin: 0; }
  :root { --ink: #1a1613; --cream: #f5f1e8; --rule: #1a1613; --accent: #7c2d2d; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #fff; color: var(--ink); font-family: "EB Garamond", Georgia, serif; }
  .page { width: 8.5in; min-height: 11in; padding: 0.75in 0.75in 0.9in; page-break-after: always; position: relative; background: #fff; }
  .page:last-child { page-break-after: auto; }

  .page--cover { background: var(--cream); padding: 1.1in 0.9in 0.9in; display: flex; flex-direction: column; justify-content: space-between; }
  .cover-head { display: flex; justify-content: space-between; font-family: Inter, sans-serif; font-size: 9.5pt; letter-spacing: 0.22em; text-transform: uppercase; }
  .cover-title { font-family: "Playfair Display", "Didot", Georgia, serif; font-weight: 900; font-size: 76pt; line-height: 0.95; letter-spacing: -0.015em; margin: 0.6in 0 0.25in; }
  .cover-subtitle { font-family: "Cormorant Garamond", Georgia, serif; font-style: italic; font-size: 22pt; color: var(--accent); line-height: 1.25; max-width: 5.5in; }
  .cover-rule { height: 1px; background: var(--ink); margin: 0.4in 0 0.3in; }
  .cover-features { font-family: "Cormorant Garamond", Georgia, serif; font-size: 13pt; line-height: 1.65; }
  .cover-features li { list-style: none; padding: 0; margin: 0 0 0.12in; }
  .cover-features li b { font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; font-size: 10pt; display: block; color: var(--accent); margin-bottom: 2pt; }

  .page--masthead { padding-top: 1.2in; }
  .masthead-rule { border-top: 2px solid var(--ink); border-bottom: 1px solid var(--ink); padding: 14pt 0; margin-bottom: 0.5in; font-family: Inter, sans-serif; text-transform: uppercase; letter-spacing: 0.22em; font-size: 9pt; display: flex; justify-content: space-between; }
  .masthead-body { font-family: "EB Garamond", Georgia, serif; font-size: 12pt; line-height: 1.7; white-space: pre-line; max-width: 5.4in; }

  .page--toc .toc-head { font-family: "Playfair Display", serif; font-weight: 900; font-size: 36pt; letter-spacing: -0.01em; margin: 0 0 0.1in; }
  .page--toc .toc-sub { font-family: "Cormorant Garamond", serif; font-style: italic; font-size: 14pt; color: var(--accent); margin-bottom: 0.4in; }
  .toc-list { border-top: 1px solid var(--ink); }
  .toc-entry { display: grid; grid-template-columns: 0.6in 1fr 0.6in; padding: 14pt 0; border-bottom: 1px solid rgba(26,22,19,0.25); align-items: baseline; }
  .toc-entry .n { font-family: Inter, sans-serif; letter-spacing: 0.2em; font-size: 9pt; color: var(--accent); }
  .toc-entry .t { font-family: "Playfair Display", serif; font-weight: 700; font-size: 17pt; letter-spacing: 0.005em; }
  .toc-entry .t small { display: block; font-family: "Cormorant Garamond", serif; font-style: italic; font-weight: 400; font-size: 12pt; color: #453a30; margin-top: 4pt; letter-spacing: 0.01em; }
  .toc-entry .p { font-family: Inter, sans-serif; font-size: 10pt; text-align: right; color: #453a30; }

  .page--letter .letter-kicker { font-family: Inter, sans-serif; letter-spacing: 0.24em; text-transform: uppercase; font-size: 9pt; color: var(--accent); margin-bottom: 0.2in; }
  .page--letter .letter-head { font-family: "Playfair Display", serif; font-weight: 700; font-size: 30pt; margin: 0 0 0.35in; max-width: 5.5in; line-height: 1.1; }
  .page--letter .letter-body { font-family: "EB Garamond", serif; font-size: 12.5pt; line-height: 1.72; column-count: 1; max-width: 5.6in; }
  .page--letter .letter-body p { margin: 0 0 0.14in; text-indent: 0; }

  .page--article { padding: 0.7in 0.75in 0.9in; }
  .article-kicker { font-family: Inter, sans-serif; letter-spacing: 0.24em; text-transform: uppercase; font-size: 9pt; color: var(--accent); }
  .article-title { font-family: "Playfair Display", serif; font-weight: 900; font-size: 42pt; line-height: 1.02; letter-spacing: -0.015em; margin: 0.1in 0 0.15in; }
  .article-dek { font-family: "Cormorant Garamond", serif; font-style: italic; font-size: 16pt; color: #403830; line-height: 1.35; max-width: 5.5in; margin-bottom: 0.2in; }
  .article-byline { font-family: Inter, sans-serif; font-size: 9.5pt; letter-spacing: 0.16em; text-transform: uppercase; border-top: 1px solid var(--ink); border-bottom: 1px solid var(--ink); padding: 8pt 0; margin-bottom: 0.35in; }
  .article-byline b { font-weight: 600; }

  .article-body { column-count: 2; column-gap: 0.35in; column-rule: 0.5pt solid rgba(26,22,19,0.18); font-family: "EB Garamond", Georgia, serif; font-size: 11.2pt; line-height: 1.62; text-align: justify; hyphens: auto; }
  .article-body .para { margin: 0 0 8pt; text-indent: 14pt; }
  .article-body .para--lede { text-indent: 0; }
  .article-body .para--lede::first-letter {
    font-family: "Playfair Display", serif;
    font-weight: 900;
    float: left;
    font-size: 58pt;
    line-height: 0.85;
    padding: 4pt 8pt 0 0;
    color: var(--accent);
  }
  .article-body .para--lede::first-line {
    font-variant: small-caps;
    letter-spacing: 0.04em;
    font-weight: 500;
  }

  .colophon { text-align: center; font-family: Inter, sans-serif; letter-spacing: 0.3em; text-transform: uppercase; font-size: 8pt; color: #6b5f53; padding-top: 2in; }
`

export function renderMagazineHTML(mag) {
  const cover = `
    <div class="page page--cover">
      <div>
        <div class="cover-head">
          <span>Issue ${esc(mag.issue || '—')}</span>
          <span>${esc(mag.coverDate || '')}</span>
        </div>
        <h1 class="cover-title">${esc(mag.title || 'Untitled')}</h1>
        <p class="cover-subtitle">${inlineEmphasis(mag.subtitle || '')}</p>
      </div>
      <div>
        <div class="cover-rule"></div>
        <ul class="cover-features">
          ${mag.articles
            .slice(0, 4)
            .map(a => `<li><b>${esc(a.author || 'By the Editor')}</b>${esc(a.title || 'Untitled')}</li>`)
            .join('')}
        </ul>
      </div>
    </div>
  `

  const masthead = mag.masthead
    ? `<div class="page page--masthead">
        <div class="masthead-rule"><span>${esc(mag.title || '')}</span><span>Masthead</span></div>
        <div class="masthead-body">${esc(mag.masthead)}</div>
      </div>`
    : ''

  const tocLines = mag.articles.map((a, i) => {
    const dek = a.dek || (a.polished || a.body || '').split(/\.\s/)[0].slice(0, 110)
    return `<div class="toc-entry">
      <div class="n">${String(i + 1).padStart(2, '0')}</div>
      <div class="t">${esc(a.title || 'Untitled')}<small>${inlineEmphasis(dek)}</small></div>
      <div class="p">${esc(a.author || '')}</div>
    </div>`
  }).join('')

  const toc = `
    <div class="page page--toc">
      <h2 class="toc-head">Contents</h2>
      <p class="toc-sub">In this issue —</p>
      <div class="toc-list">${tocLines}</div>
    </div>
  `

  const letter = mag.editorsLetter
    ? `<div class="page page--letter">
        <div class="letter-kicker">Editor's Letter</div>
        <h2 class="letter-head">${esc(mag.title || 'From the Editor')}</h2>
        <div class="letter-body">${renderArticleParagraphs(mag.editorsLetter, { dropCap: false })}</div>
      </div>`
    : ''

  const articles = mag.articles.map((a, i) => {
    const text = a.polished || a.body
    const dek = a.dek || (text || '').split(/\.\s/)[0].slice(0, 160)
    return `<div class="page page--article">
      <div class="article-kicker">Article ${String(i + 1).padStart(2, '0')} · ${esc(a.kicker || 'Essay')}</div>
      <h2 class="article-title">${esc(a.title || 'Untitled')}</h2>
      <p class="article-dek">${inlineEmphasis(dek)}</p>
      <div class="article-byline"><b>${esc(a.author || 'Anonymous')}</b></div>
      <div class="article-body">${renderArticleParagraphs(text)}</div>
    </div>`
  }).join('')

  const colophon = `<div class="page">
    <div class="colophon">${esc(mag.title || '')} · ${esc(mag.coverDate || '')} · Typeset at the Atelier</div>
  </div>`

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${esc(mag.title || 'Magazine')}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
  <style>${PRINT_STYLES}</style>
</head>
<body>
  ${cover}
  ${masthead}
  ${toc}
  ${letter}
  ${articles}
  ${colophon}
</body>
</html>`
}
