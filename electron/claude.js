const Anthropic = require('@anthropic-ai/sdk')
const { loadApiKey } = require('./store')

const LITERARY_EDITOR_SYSTEM = `You are a literary editor of the first rank, steeped in the tradition of the essayists and journalists whose prose endures: Joan Didion, James Baldwin, E. B. White, Susan Sontag, John McPhee, Zadie Smith, Ta-Nehisi Coates, Janet Malcolm. A writer has submitted a rough draft for publication in a high-end magazine. Your task is to rewrite it so that it reads as if one of them had written it.

Principles you work by:

— Preserve the writer's facts, arguments, and intent with absolute fidelity. You are rewriting their piece, not replacing it. Invent nothing.
— Sharpen the prose. Compress where it is slack. Cut the throat-clearing, the qualifiers, the adverbs that do no work. Every sentence should earn its place.
— Favor concrete nouns and active verbs. Name the thing; show the motion. Abstractions come later, if at all.
— Vary sentence length with intent. A short sentence after a long one can land like a verdict. Use that.
— Keep the voice confident and measured. Never florid. Never academic. Never corporate. Never performatively casual. Write as an intelligent adult addressing other intelligent adults.
— Open with a sentence that arrests. No "In today's world." No "Since the dawn of time." No dictionary definitions. Begin in medias res, with a scene, an image, a claim.
— Close with a sentence that resonates. The ending is the reader's last impression; make it one they carry.
— Eliminate cliché. If the phrase could appear in a middling op-ed, rewrite it.
— Trust the reader. Do not explain what the prose has already shown.

Formatting:

— Paragraph breaks should follow the movement of thought. Short paragraphs are permitted and often preferable.
— You may use em-dashes, italics (wrap in *asterisks*), and the occasional colon for emphasis. Use semicolons sparingly and correctly.
— Do not use markdown headers, bullet lists, or code blocks unless the original piece demands them.

Output:

Respond with the rewritten article only. Prose, clean. No preamble. No title. No byline. No editor's notes. No "Here is the rewritten version." Just the piece.`

function buildClient() {
  const apiKey = loadApiKey()
  if (!apiKey) throw new Error('No Anthropic API key configured. Open Settings and paste your key.')
  return new Anthropic({ apiKey })
}

async function polishArticle({ article, onChunk, onThinking, signal }) {
  const client = buildClient()
  const userText = [
    article.title ? `Title the writer proposed: ${article.title}` : null,
    article.author ? `Byline: ${article.author}` : null,
    '',
    'Draft:',
    '',
    article.body,
  ].filter(x => x !== null).join('\n')

  const stream = client.messages.stream({
    model: 'claude-opus-4-7',
    max_tokens: 16000,
    thinking: { type: 'adaptive', display: 'summarized' },
    output_config: { effort: 'high' },
    system: [
      {
        type: 'text',
        text: LITERARY_EDITOR_SYSTEM,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content: userText }],
  })

  if (signal) {
    signal.addEventListener('abort', () => stream.controller.abort(), { once: true })
  }

  let polished = ''
  for await (const event of stream) {
    if (event.type === 'content_block_delta') {
      if (event.delta.type === 'text_delta') {
        polished += event.delta.text
        onChunk?.(event.delta.text)
      } else if (event.delta.type === 'thinking_delta' && onThinking) {
        onThinking(event.delta.thinking)
      }
    }
  }
  const final = await stream.finalMessage()
  return {
    polished: polished.trim(),
    usage: final.usage,
    stop_reason: final.stop_reason,
  }
}

async function writeFrontMatter({ magazine, articles, kind, signal }) {
  const client = buildClient()

  const articleSummaries = articles
    .map((a, i) => {
      const text = a.polished || a.body || ''
      const preview = text.slice(0, 600)
      return `Article ${i + 1}: ${a.title || '(untitled)'}\n${preview}${text.length > 600 ? '…' : ''}`
    })
    .join('\n\n---\n\n')

  const asks = {
    letter: `Write the Editor's Letter that opens this issue. 350–500 words. First person, addressed to the reader. Name the through-line that connects these pieces. Close with something that lingers. Sign it "— The Editor" on its own line.`,
    toc: `Write a Table of Contents for this issue. For each article, produce a title (refine the writer's proposed title if the original is weak) and a one-sentence teaser of no more than 20 words. Return as plain text, one article per block:\n\nTITLE IN SMALL CAPS\nTeaser sentence.\n\n(blank line between entries)`,
    masthead: `Write the masthead for this issue: three or four lines naming the magazine, the issue number, the publication date (invent a plausible one if missing), and a line giving the publication's ethos in under fifteen words. Return as plain text, one item per line.`,
  }[kind]

  const resp = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 4000,
    thinking: { type: 'adaptive' },
    output_config: { effort: 'high' },
    system: LITERARY_EDITOR_SYSTEM,
    messages: [
      {
        role: 'user',
        content: `The magazine is titled "${magazine.title || 'Untitled'}"${magazine.subtitle ? `, subtitled "${magazine.subtitle}"` : ''}${magazine.issue ? `, Issue ${magazine.issue}` : ''}.\n\n${asks}\n\nHere are the pieces in this issue:\n\n${articleSummaries}`,
      },
    ],
  }, { signal })

  const text = resp.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('\n')
  return text.trim()
}

async function validateApiKey(key) {
  try {
    const client = new Anthropic({ apiKey: key })
    await client.models.retrieve('claude-opus-4-7')
    return { ok: true }
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      return { ok: false, error: 'The API key was rejected. Check that it is active and try again.' }
    }
    if (err instanceof Anthropic.APIError) {
      return { ok: false, error: `API error ${err.status}: ${err.message}` }
    }
    return { ok: false, error: err.message || String(err) }
  }
}

module.exports = { polishArticle, writeFrontMatter, validateApiKey }
