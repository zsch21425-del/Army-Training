export function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`
}

export function newArticle({ title = '', author = '', body = '' } = {}) {
  return {
    id: uid('art'),
    title,
    author,
    body,
    polished: '',
    status: 'draft',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

export function newMagazine(overrides = {}) {
  return {
    id: uid('mag'),
    title: 'An Untitled Magazine',
    subtitle: 'A Quarterly of Essays and Reportage',
    issue: '01',
    editor: '',
    coverDate: new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }),
    editorsLetter: '',
    masthead: '',
    articles: [],
    theme: 'classic',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  }
}

export function paragraphsFromText(text) {
  if (!text) return []
  return text
    .split(/\n{2,}/g)
    .map(p => p.trim())
    .filter(Boolean)
}
