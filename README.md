# Atelier Magazine

A Windows desktop studio that turns rough article drafts into a polished, print-ready magazine. Articles are rewritten in the tradition of the great essayists — Didion, Baldwin, White, McPhee, Sontag, Smith — by Claude (Anthropic's AI). The issue is laid out with classical editorial typography and exports to print-ready PDF.

---

## Prerequisites

Install these once on your Windows machine:

1. **Node.js 18 or newer** — download from <https://nodejs.org> (pick the LTS installer).
2. **An Anthropic API key** — create one at <https://console.anthropic.com>. You'll paste it into the app's Settings panel; it is stored only on your machine, encrypted with Windows DPAPI.
3. **Git** (optional, if you want to clone instead of download zip) — <https://git-scm.com/download/win>.

> The Claude API is paid. Polishing a typical ~1,500-word article with Claude Opus 4.7 at high effort costs roughly 10–30 cents, depending on length and how much the model thinks. Keep an eye on your console usage dashboard.

---

## Install

Open **PowerShell** or **Command Prompt** in the project folder and run:

```powershell
npm install
```

This downloads Electron, React, Vite, and the Anthropic SDK (about 500 packages). It takes 30–60 seconds.

---

## Run (development mode)

```powershell
npm run dev
```

This launches both the Vite dev server and Electron. The app window opens automatically. Edits to the React code hot-reload.

If the window does not open, check that port 5173 isn't in use by another app.

---

## Build a Windows installer (.exe)

```powershell
npm run dist
```

Output: a one-click NSIS installer in the `release/` folder, something like `Atelier-Magazine-Setup-0.1.0.exe`. Double-click to install; the app then lives in Start Menu like any other Windows program.

---

## First-time setup inside the app

1. Launch the app. You'll see a banner telling you an API key is needed.
2. Click **Settings** in the left sidebar.
3. Paste your Anthropic API key into the field and click **Save**. The app validates the key against the API; if valid, it's encrypted and stored locally.
4. Go to **Cover & Masthead** and fill in your magazine title, subtitle, issue number, date, and editor name.

---

## Usage — the workflow

### 1. Add your articles

Go to **Articles** in the sidebar.

- **Import files** — click *Import files* to pick one or more `.txt` or `.md` drafts from your computer. Each becomes an article.
- **New article** — click *+ New* to write one directly in the app.

For each article, fill in:
- **Title** (the working title; Claude will refine it)
- **Author** (the byline)
- **Kicker** (e.g. *Essay*, *Dispatch*, *Reported* — appears above the title in the layout)
- **Manuscript** — the full draft text

### 2. Polish with Claude

With an article selected, click **✎ Polish with Claude**. Claude Opus 4.7 rewrites the draft in literary prose and streams the result into the right-hand pane in real time. You can watch it write.

A few things to know:
- The rewrite preserves your facts and arguments. It sharpens prose, cuts cliché, and varies cadence.
- You can edit the polished version after — it's just a text field.
- Click **Cancel** to stop a polish in progress.
- Expand *Editor's reasoning* to see what Claude was thinking about as it rewrote.

### 3. Draft the Editor's Letter

Go to **Editor's Letter** in the sidebar. Click **✎ Draft with Claude** and Claude will write a 350–500-word letter from the editor, tying together the pieces you've gathered. You can edit the result.

You can also auto-generate masthead copy from the same view.

### 4. Preview

The **Preview** view shows your magazine live — cover, masthead, table of contents, editor's letter, and each article laid out with a drop cap and two-column body on US Letter pages. It updates as you type.

### 5. Export

Go to **Export**.

- **Export PDF** — produces a print-ready Letter-sized PDF. Pick a save location; the app does the rest.
- **Export HTML** — produces a self-contained HTML file you can open in any browser or upload to a web host.

---

## What the magazine looks like

- **Nameplate:** Playfair Display, 76pt, heavy weight, on a cream background.
- **Tagline:** Cormorant Garamond italic, in a burgundy accent.
- **Body text:** EB Garamond, 11.2pt, two-column justified with hyphenation.
- **Opening paragraph** of each article gets a 58pt drop cap and small-caps first line.
- **Table of Contents** is a lettered catalogue with titles, teasers, and bylines.
- **Accent color:** deep burgundy (`#7C2D2D`). Paper color: cream (`#F5F1E8`).

---

## Troubleshooting

**The app opens but says "No API key set."**
Go to Settings and paste your key. If validation fails, double-check that you copied the whole key (they're long) and that it hasn't been revoked.

**Polishing gives an error about rate limits or credits.**
Check your Anthropic console for usage and billing status.

**Fonts look wrong.**
The app loads Google Fonts at startup. If you're fully offline it falls back to Georgia and Didot; acceptable but not as elegant. Connect to the internet once to cache the fonts.

**PDF export looks cramped.**
Make sure the article has paragraph breaks (blank lines between paragraphs). The layout uses those to flow the two-column body.

**I want a different color or font.**
Edit `src/styles.css` and the `PRINT_STYLES` constant in `src/lib/render.js`. The `--accent` CSS variable is the burgundy; swap to change the palette.

---

## Where things live

```
electron/          Electron main process (Node.js)
  main.js          Window, menu, IPC wiring
  preload.js       Context-isolated bridge (window.atelier)
  claude.js        Anthropic SDK wrapper — polish + editor's letter
  store.js         Settings + magazines persistence (DPAPI-encrypted key)
  pdf.js           PDF + HTML export, file import dialogs

src/               React renderer (browser-side UI)
  App.jsx          Top-level shell + routing
  styles.css       All UI styles
  components/      Sidebar, Cover, Articles, FrontMatter, Preview, Export, Settings
  lib/
    magazine.js    Data model
    render.js      Magazine → HTML rendering (shared by Preview and Export)
```

Your drafts live on this computer at
`%APPDATA%\Atelier Magazine\magazines.json` (created on first save).

---

## License

Personal use. Contains no warranty.
