# Packaging: one index.html → a Steam desktop app

*This domain was researched inline (the workflow's packaging agent hit a session limit); sources are
listed per claim. StarGilt reality: one 572 KB self-contained HTML + ~1 MB of loaded art, saves in
localStorage, WebAudio-only sound — see [00-stargilt-inventory.md](00-stargilt-inventory.md).*

## The recommendation up front

**Electron + [steamworks.js](https://github.com/ceifa/steamworks.js/)** — not because Electron is
elegant, but because it's the path the Steam-HTML5 ecosystem actually supports:

- **steamworks.js only supports Electron/NW.js.** It ships `electronEnableSteamOverlay()`, achievement
  and Steam Cloud APIs, and prebuilt binaries. Tauri has no first-class, battle-tested Steamworks
  binding ([webgamedev.com/publishing/desktop](https://www.webgamedev.com/publishing/desktop)).
- **Chromium consistency**: Tauri uses OS webviews (WebKit on macOS/Linux, WebView2 on Windows) — three
  rendering/AudioContext behaviors to test instead of one. StarGilt leans hard on one canvas/FX/WebAudio
  profile; Electron pins it.
- **Precedent**: Vampire Survivors shipped its HTML5 (Phaser) build on Steam via this exact route —
  browser game on itch first, then Steam ([wiki](https://vampire-survivors.fandom.com/wiki/Vampire_Survivors),
  [Phaser's 2025 guide](https://phaser.io/news/2025/03/publishing-web-games-on-steam-with-electron)).
  Wrapped web games pass Valve review; there is no policy against them.
- Binary size (~100 MB Electron vs ~10 MB Tauri) is irrelevant on Steam.

## The known sharp edges (all have standard fixes)

1. **Steam overlay**: call `require('steamworks.js').electronEnableSteamOverlay()` at the end of
   `main.js`; the community-standard `--in-process-gpu` switch lets the overlay hook the renderer
   ([jake.software write-up](https://jake.software/enabling-the-steam-overlay-in-an-electron-app),
   [liana.one guide](https://liana.one/integrate-electron-steam-api-steamworks)). Overlay freezes when
   the page doesn't repaint — StarGilt's ember/FX canvases animate continuously, so this is naturally
   covered; keep an rAF heartbeat anyway.
2. **steamworks.js needs `contextIsolation:false, nodeIntegration:true`** in the renderer — an
   acceptable posture ONLY because the window loads exclusively our local file. **Never load remote
   content in that window** (the game's fetch calls are data-only, fine).
3. **localStorage location**: Electron persists it in `userData/Local Storage/leveldb`. **Do not point
   Steam Auto-Cloud at that LevelDB directory** (multi-file store, mid-write syncs corrupt) — see
   [05-stargilt-specific.md](05-stargilt-specific.md) for the save-adapter design instead.
4. **WebAudio autoplay**: Electron can grant autoplay
   (`app.commandLine.appendSwitch('autoplay-policy','no-user-gesture-required')`), and the game's
   existing menu-click gesture gate works regardless.
5. **Fullscreen + resolution**: the wrapper owns the window — ship default 1470×830, F11/Alt-Enter
   fullscreen, remember window bounds in userData.

## Build shape (when we do it — not now)

```
steam/
  main.js         # ~80 lines: window, overlay enable, autoplay flag, save-adapter IPC
  preload? no     # nodeIntegration on, single local file
  package.json    # electron + steamworks.js + electron-builder
  ../index.html   # THE GAME, byte-identical to the web build
  ../art/         # jpg/webp only
```
One repo, one `index.html`, two targets: Railway (web) and Electron (Steam). A `window.STEAM` flag
injected by the wrapper is the only branch the game code ever sees.

**Platforms**: Windows x64 first (+ Proton covers Steam Deck automatically); native Linux is nearly
free from the same config and avoids Proton entirely (see 03); macOS deferred (notarization, see 03).

## Alternatives considered

| Wrapper | Verdict | Why |
|---|---|---|
| **Electron** | ✅ recommended | steamworks.js, overlay path known, one engine everywhere |
| Tauri v2 | ❌ for Steam | no mature Steamworks binding; 3 webviews to QA; overlay integration DIY ([webgamedev](https://www.webgamedev.com/publishing/desktop)) |
| NW.js | ⚠️ workable | steamworks.js supports it, but ecosystem momentum is Electron's |
| Greenworks | ❌ legacy | the older binding steamworks.js replaced; effectively unmaintained ([repo](https://github.com/PlutoVR/greenworks)) |
| steamworks-ffi-node | 🔍 watch | newer FFI binding with leaderboard support if we ever want it ([repo](https://github.com/ArtyProf/steamworks-ffi-node)) — not needed for the current design |
