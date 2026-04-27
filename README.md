# Blackjack Bot — Windows v1.0.0

Autonomous 6-deck blackjack player with Hi-Lo counting, Illustrious 18, and Fab 4 deviations. Source on branch [`claude/blackjack-agent-xx2x6`](../../tree/claude/blackjack-agent-xx2x6).

## Pick the format that gets past your security software

The `.exe` is **unsigned** (a Microsoft-trusted code-signing cert costs ~$300/year), so Windows SmartScreen and most browsers will block or warn on direct `.exe` downloads. Three options, in order of how likely each is to download cleanly:

### A. Portable 7-Zip — recommended (no installer needed)

**[BlackjackBot-Portable-1.0.0.7z](./releases/BlackjackBot-Portable-1.0.0.7z)** — 67 MB

1. Install 7-Zip if you don't have it: https://www.7-zip.org/
2. Right-click the downloaded `.7z` → 7-Zip → **Extract Here**.
3. Open the extracted folder and double-click **`Blackjack Bot.exe`**.
4. SmartScreen says "Windows protected your PC" → click **More info** → **Run anyway**.

To uninstall, just delete the folder.

SHA-256: `d6af316804168aec4291ce1d17dada0413b8b77252e2f96f900764d56258ae6b`

### B. Installer wrapped in a ZIP

**[BlackjackBot-Setup-1.0.0.zip](./releases/BlackjackBot-Setup-1.0.0.zip)** — 77 MB

Browsers usually don't block `.zip` downloads. Inside is the standard NSIS installer.

1. Download the `.zip`.
2. Right-click → **Extract All**.
3. Run the extracted `BlackjackBot-Setup-1.0.0.exe`. SmartScreen may still warn → **More info** → **Run anyway**.

SHA-256 (zip): `0caf55c45215e3ffc38174f78ddcf313207aea26ffd105c3d7769977c7e19571`

### C. Raw installer (likely to be blocked at download)

**[BlackjackBot-Setup-1.0.0.exe](./releases/BlackjackBot-Setup-1.0.0.exe)** — 77 MB

This is what's blocked for you right now. Listed for completeness.

SHA-256 (exe): `ca227573c6835221dbefb618a233fe28ced5223d540663ef11737d344705bf0b`

## If the browser flat-out refuses every download

Open PowerShell and pull the file directly — no browser SmartScreen at all:

```powershell
Invoke-WebRequest `
  -Uri "https://github.com/zsch21425-del/Army-Training/raw/release/exe-v1.0.0/releases/BlackjackBot-Portable-1.0.0.7z" `
  -OutFile "$env:USERPROFILE\Downloads\BlackjackBot-Portable.7z"
```

Then extract with 7-Zip as in option A.

If Windows Defender quarantines the file *after* download, right-click it → **Properties** → check **Unblock** → OK. If Defender deletes it on sight, add an exclusion: Settings → Privacy & security → Windows Security → Virus & threat protection → Manage settings → Exclusions → Add an exclusion → Folder, pointing at the folder you'll extract to.

## What the app does on first run

1. Opens a control panel with **Start / Stop**, a live log, and live stats (rounds, bankroll, P&L, running and true count).
2. On first **Start**, downloads Chromium (~170 MB) into your user-data folder. One-time, ~2 minutes.
3. A browser window opens with a bundled blackjack table. The bot plays autonomously: places bets sized from the running Hi-Lo count, decides every action via basic strategy with Illustrious 18 + Fab 4 deviations, handles splits, doubles, surrender, insurance.
4. Stop anytime. Stats update after every round.

## Verify the build before running

If you're cautious about an unsigned binary (sensible), the source is fully reproducible. Clone the source branch, run `npm install && npm run playwright:install && npm run dist:win`, and your local SHA-256 of `BlackjackBot-Setup-1.0.0.exe` should match the value above.
