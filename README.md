# Blackjack Bot — Windows Installer (v1.0.0)

Autonomous 6-deck blackjack player with Hi-Lo counting, Illustrious 18, and Fab 4 deviations. Built from branch `claude/blackjack-agent-xx2x6`.

## Download

**[BlackjackBot-Setup-1.0.0.exe](./releases/BlackjackBot-Setup-1.0.0.exe)** — 77 MB, Windows x64

SHA-256:
```
03864c2b96105a7023226fc32eaff2cba987bd25bf8a6ad2d19134fec5222a1e
```

## Install & run

1. Download the `.exe` above.
2. Double-click to install. NSIS installer; you can choose the install directory.
3. Launch **Blackjack Bot** from the Start menu or desktop shortcut.
4. Click **Start**. First launch downloads Chromium (~170 MB, one-time, ~2 min).
5. A browser window opens with the bundled blackjack table. The bot plays autonomously.

## Why 77 MB

The installer bundles the Electron runtime (~100 MB uncompressed, ~77 MB compressed) and the Playwright browser driver. Chromium itself is downloaded on first run into your user-data directory, so the installer stays small.

## Source

Source for this build lives on branch [`claude/blackjack-agent-xx2x6`](../../tree/claude/blackjack-agent-xx2x6).
