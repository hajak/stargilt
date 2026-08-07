# StarGilt-specific: telemetry & GDPR, the scoreboard, saves, achievements, the web version

*The punchline: the architecture is already Steam-shaped. Keep it almost untouched.*

## Telemetry & privacy (the Railway beacons)

- **Valve requires no data-collection disclosure** for this. The store editor has no privacy-policy
  field; the only mandated disclosure in this family is the **kernel-level anti-cheat declaration**
  (Oct 2024) — not applicable. A custom EULA slot exists and is optional.
- **GDPR is our own duty** (Swedish developer = EU controller): `ch-sg-cid` is a persistent
  pseudonymous ID → **pseudonymous data is still personal data** (Recital 26). The standard, lawful
  posture for gameplay telemetry is **Art 6(1)(f) legitimate interest** — no consent banner needed,
  but a **one-page privacy notice is not optional**, even at zero revenue: what's sent (anonymous
  gameplay events + chosen display name for the board), the cid, retention, a deletion contact.
  Link it from the game menu and the Steam support URL. (~2–4 hours of writing; no lawyer needed at
  this scale.) Note the `/admin` panel that names/merges players is part of the processing —
  keep it in the notice's scope.

## The scoreboard: keep Railway, skip Steam leaderboards

- Steam leaderboards would **split the ladder** — web players can never appear on one. The Railway
  board is the only single ladder across both audiences, and it already degrades gracefully offline.
- Practical confirmation: **steamworks.js exposes NO leaderboard API** (checked `client.d.ts`,
  2026-08-07); adopting them would also mean switching bindings (steamworks-ffi-node).
- On Steam, default the board name to the **Steam persona name** (skippable name-entry beat).

## Saves & Steam Cloud (the one real design decision)

- **Never Auto-Cloud the Electron LevelDB `Local Storage` directory** — it's a multi-file store with
  session-changing filenames; partial syncs corrupt it.
- **Design: a save adapter in the wrapper.** The 8 keys in
  [00-stargilt-inventory.md](00-stargilt-inventory.md) dual-write: localStorage (unchanged, keeps
  web/Steam code identical) + one JSON file via **steamworks.js `cloud.writeFile`**
  (ISteamRemoteStorage) — the API path needs **no Auto-Cloud path config and is inherently
  Proton/Deck-safe** (no filesystem path involved). On boot: newest of the two wins (ts field exists
  in the save already).
- If Auto-Cloud were used instead (fallback option): Windows-only build + Proton maps the Windows
  roots into the compat prefix automatically — configure Windows roots only. But the API path is
  cleaner; prefer it.

## Achievements: cheap, optional, ready

- Achievements are **optional** (no Valve requirement). The game's **`Firsts` ledger + Telemetry
  events already track the natural set**: first boss felled, first master relic, first charm shatter,
  first dead-hand turn, the full climb (victory), death-count milestones (the covenant: celebrate the
  climb, not soften it). ~10–20 achievements ≈ one day of mapping + 2 icons each (reuse sigil art).
- **Trap**: definitions must be **published in App Admin** before `activate()` works against the real
  AppID — the classic "works with test app 480, fails in prod".
- Offline: the Steam client caches achievement sets and syncs later (standard behavior, wording
  UNVERIFIED at doc level).

## Offline & the web version

- **No Valve rule requires offline play** — and the game already works fully offline anyway; the
  existing fetch-fallback IS the offline detection. Nothing to build.
- **The free web version can stay live.** Steam's parity rules govern *Steam keys*, not general
  availability; **Cookie Clicker** (free at orteil.dashnet.org, paid on Steam since 2021) is the
  standing precedent. Constraints:
  - The Steam page must **never mention/link the free web version** (no external links, no promoting
    other availability).
  - Don't sell *Steam keys* elsewhere cheaper/earlier than Steam.
  - If a Coming Soon page is up, don't launch a *paid* version on another store before Steam.
- A sane split: web = the living playtest (exp builds, telemetry-driven balance), Steam = the stable
  channel with Cloud + achievements. Same file, two release trains — the repo already versions saves.

Sources: [store editing](https://partner.steamgames.com/doc/store/editing) ·
[anti-cheat disclosure (Gamedeveloper)](https://www.gamedeveloper.com/pc/heads-up-devs-on-steam-now-need-to-disclose-kernel-mode-anti-cheat-software) ·
[Steam Cloud](https://partner.steamgames.com/doc/features/cloud) ·
[achievements](https://partner.steamgames.com/doc/features/achievements) ·
[key parity rules](https://partner.steamgames.com/doc/features/keys) ·
[steamworks.js API surface](https://github.com/ceifa/steamworks.js/) ·
[IAPP on pseudonymization](https://iapp.org/news/a/does-anonymization-or-de-identification-require-consent-under-the-gdpr) ·
[Cookie Clicker precedent](https://store.steampowered.com/app/1454400/Cookie_Clicker/)
