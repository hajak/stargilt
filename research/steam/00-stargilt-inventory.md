# StarGilt → Steam: what the game IS today (code-grounded inventory)

*Written 2026-08-07 against v0.13.16-exp. This file is the ground truth the rest of the research
folder builds on — everything here was read from the repo, not the web.*

## The artifact

| Thing | Reality |
|---|---|
| Game | **One self-contained `index.html`** (~572 KB, ~7,300 lines: inline CSS + JS, zero build step, zero dependencies) |
| Art | `art/` — 9 files (~7 MB incl. PNG masters; the game only loads the JPGs + `emblem-512.png`) |
| Server | `server.js` (raw Node, no framework) serves static files + ingests telemetry; Postgres in prod via `store.js` |
| Deploys | Railway (`stargilt-production.up.railway.app`), `chapters.html` is a byte-copy deploy artifact |
| Tests | `tests/*.test.mjs` — 151 assertions, puppeteer-driven, its own static-server harness |

**Implication:** packaging for Steam = wrapping `index.html + art/` in a desktop shell. There is no
bundler, no node_modules, no transpile — the wrapper is the ONLY build step we'd be adding.

## Persistence (matters for Steam Cloud)

All state is **localStorage**, keyed:

- `ch-sg-save` — the one active run (see the v0.13.9 "one active run" contract)
- `ch-af-scores` — personal top-10 · `ch-bal-log` — per-run history ring buffer (20 runs, feeds THE CLIMB)
- `ch-sg-name`, `ch-sg-cid` — player name + anonymous client id
- `ch-sg-trial`, `ch-af-tutor-off`, `ch-af-help-off`, `ch-af-vol` — progression + settings flags

**Implication:** Steam Cloud sync = syncing the wrapper's localStorage backing store (a LevelDB
directory in Electron, a WebKit/WebView2 store in Tauri — per-wrapper details in
[02-packaging.md](02-packaging.md)). Alternatively (cleaner): a tiny storage shim that mirrors these
~8 keys to a JSON file in the wrapper's user-data dir, and Auto-Cloud that one file.

## Network surface (matters for privacy disclosure + offline)

Exactly **three endpoints**, all same-origin to the game's own server:

- `POST /api/t` — telemetry beacons (`sendBeacon`/`fetch`): run/turn/board snapshots, anonymous `cid`
- `POST /api/score` — submit a finished run to the shared honor roll
- `GET /api/scores` — fetch the shared honor roll

**Already offline-safe by design:** every network call is wrapped so failure resolves `null` and the
local board stands in (the `:5713` dev harness and `file://` runs force telemetry off). A Steam build
pointed at nothing would already work — the WORLD tab would just stay local. Decision needed:
keep the Railway server, swap to Steam leaderboards, or ship offline-only ([05-stargilt-specific.md](05-stargilt-specific.md)).

## Input, display, audio

- Mouse-first; keyboard has ENTER (present) / ESC (close) only. **No gamepad support** — relevant to
  Steam Deck rating expectations.
- Desktop layout, `#app` maxes at 1920px; tested at 1470×830. No fullscreen toggle in-game (browser F11
  territory today — the wrapper should own this).
- WebAudio everything (no audio files) — one autoplay-gesture gate already exists (the menu click).
  Wrappers can grant autoplay, but the gesture flow also works as-is.

## Already-built things Steam could reuse

- **`Firsts`** (first boss, first master relic, first record…) + `Telemetry.track` events — a natural
  achievements map with the counting already done.
- **The shared honor roll** — a candidate to replace with Steam leaderboards, or keep as the
  cross-platform (web+Steam) board.
- **The King's Ledger dossier** — screenshot-bait for the store page; the cold-open panels + key art in
  `art/` are capsule-art raw material (the PNG masters are 1.7–2.2 MB, plenty of pixels).
- **Version-stamped saves + difficulty self-registration** (`ch_config`) — a live-balance loop that
  works identically under Steam.

## Constraints to respect

- The game is **experience-versioned** (`SAVE_CONTRACT`): old saves are deliberately retired. Fine on
  Steam; just means Cloud never has to migrate ancient saves.
- The **no-difficulties covenant** (climb, don't soften) is a design law — store copy should sell the
  rock face, not apologize for it.
- Player name is free-text shown on a shared board — on Steam, persona name is the obvious default
  (and sidesteps the "type a name" cold-start).
