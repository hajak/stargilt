# Handover — 2026-07-17

Shift-change for the StarGilt deckbuilder. **Next up: the Dopamine & Juice overhaul** — fully designed and approved, ready to build. The detailed, code-anchored implementation spec is **`tasks/dopamine-plan.md`** (read that first; this doc is the surrounding context).

## What Was Done (this session)
A long run of ships, all live on prod (`https://www.stargilt.com`, deploy via `railway up --detach --service stargilt`). Current build: **`chapters · v0.9.1`**. Every change verified headless (chrome-headless-shell puppeteer suites in the session scratchpad) + regression battery, then deployed and prod-confirmed through the Mellon gate.

- **v0.6.8** shared honor roll (server `/api/score`+`/api/scores`, JSON-file store on the Railway volume).
- **v0.6.9** pile-view recede bugfix; the **§ keyboard debug dump**; admin "Furthest" split into Learn/Game funnels.
- **v0.7.0–0.7.2** balance (MULT cap 7→15, scaling star engines), the Forge Console admin redesign, § key-only, played-cluster occlusion fix (8-wide, lower).
- **v0.8.0** re-tune: gated the six ungated mythics, Dross-for-power T1 wares, Twin Pyre mid burn-engine.
- **v0.8.1** removed the stranded "PLAYED ×N" pill. **v0.8.2** card-corner wedge fix.
- **v0.8.3** BURN confirmation dialog + admin **Compare** tab (playstyle outliers).
- **v0.8.4** playtest pass: free Act-1 first-miss mercy, opening-market `afterBoss` bugfix, game-over legibility, "CAP 15" typography, start-menu PLAY-primary, a path-traversal hardening.
- **v0.8.5** **run persistence (CONTINUE)** + auto tally speed-up from Act 3.
- **v0.8.6** fixed CONTINUE (market DOM wasn't rebuilt on restore).
- **v0.9.0** six items: piles → upper-right HUD, pile-view tabs, ENTER→end-turn, **late-game math fix** (demand taper knee t19 + rising `effMultCap` + 2 cap relics), back-links restyle, **playtime → active time**.
- **v0.9.1** (last ship) **bugfix: deck/discard piles jumped when playing a card** (see gotchas).
- **git**: repo initialized this session; every version since v0.8.3 committed. **DESIGN**: ran a 6-agent research workflow + adversarial critique for the dopamine overhaul → wrote `tasks/dopamine-plan.md`.

## What Worked / What Didn't
- **Headless-verify-everything discipline held up** — each feature got a puppeteer suite (scorestest, v069, v080, v084, v085, v090, burntest, admintest, baltest) that caught regressions before deploy. Keep running the whole battery before each ship.
- **The v0.9.0 pile move introduced the v0.9.1 jump bug** — `position:fixed` inside a `transform`-ed ancestor. Fixed by going `position:absolute` + reparenting to `#app` (details below).
- **v0.8.6**: v0.8.5's CONTINUE test kept `sessionStorage` across reload, so it never exercised the real reopen path (where `askName` fires) — the bug shipped. The test now `sessionStorage.clear()`s before reload and asserts a resumed Bazaar card is *buyable*.
- **A tally speed-up test measured wall-clock under a clamped setTimeout** → the 0.45× scale was masked. Switched to summing *requested* delays. Also realized "Act 3" = turns 13-18 (6-turn acts), not turn 3.

## Key Decisions
- **Late-game math (v0.9.0):** demand was geometric (×1.28/turn) but score is ~linear×capped-mult, so t42-48 needed ~68k base★ (impossible). Chose a three-part fix — demand **taper** past the Act-3 boss (Acts 1-3 byte-identical), a **rising** MULT cap (`effMultCap()` +3/boss), and **optional** stacking cap relics — so the summit is reachable without any single relic being mandatory. User picked "taper + cap relics + auto-rise."
- **Playtime = active time (v0.9.0):** `performance.now()` keeps ticking when a tab is backgrounded, so the old metric counted idle open-tab time (Erik's "14h55m" was open-time, not play). Now the clock pauses on `visibilitychange:hidden`.
- **CONTINUE kept on QUIT-to-menu**, cleared on death + RESTART — "leave and resume tomorrow" is the point.
- **Dopamine scope (this session's ask):** user chose **the whole system**, **bold-but-tiered** (quiet floor / loud apex), **evolving music INCLUDED**. Then asked to hand off before building so they can switch models.

## Lessons & Gotchas
- **`position:fixed` + a transformed ancestor = broken.** `shake()` sets `#app.style.transform`; per spec that makes `#app` the containing block for any `position:fixed` descendant, so the HUD piles re-anchored mid-shake and jumped. **Rule: HUD elements that must stay put during shake should be `position:absolute` children of the transformed element (they ride the shake) OR live outside it entirely — never `fixed` inside it.** (v0.9.1 chose absolute-child-of-`#app`.)
- **`recordScore()` MUTATES localStorage** (pushes an entry) — it's an end-of-run call, NOT a per-turn peek. The dopamine plan needs a separate `state.bestTurnGlory` for the per-turn apex (critique bug B2).
- **No always-on RAF exists** — every loop (`shakeLoop`, `ParticleField.loop`) self-terminates. The dopamine `Heat` signal needs its OWN self-sleeping RAF (critique bug B1).
- **Overshoot ratio `score/tithe` misfires early** — tiny early tithes make easy Act-1 dumps look "huge." Gate apex tiers on an absolute magnitude floor too (critique bug B3).
- **`index.html` and `chapters.html` must stay byte-identical** — edit `index.html`, then `cp index.html chapters.html`. Every ship does this.
- **Admin key** is in Railway env (`SG_ADMIN_KEY`), readable via `railway variables --service stargilt --kv`. Prod analytics: `curl -H "x-admin-key: …" https://www.stargilt.com/api/admin/summary`.
- **Deploy is permission-gated in some sessions** — `railway up` may be blocked by the auto-mode classifier; if so, ask the user to run it.
- The generative **`Music` engine is far richer than expected** (swung dorian vamp, per-voice gains, filter cutoffs, density gates, live BPM) — it's already a vertical-layering rig, which is why "evolving music" is feasible without audio files. See `tasks/dopamine-plan.md` §1.

## Current State
- **App: working, healthy.** v0.9.1 live and prod-verified. Real players on the honor roll.
- **Tests: all green** at last run — v090(13), v085(14), v084(7), burn(8), v080(12), v069(14), scores(46), admin(32), pilejump(5), card-overflow clean. Suites live in the session scratchpad `/private/tmp/claude-501/-Users-hajak-Documents-EXPERIMENTS-deckbuilder/e5ee219e-6f23-4f4c-b1d7-7ef71385620d/scratchpad/*.mjs` (they spawn `python3 -m http.server 5713` + chrome-headless-shell; **use chrome-headless-shell, not full headless** — full headless freezes the compositor on this page).
- **No known bugs open.** The pile-jump (the last reported issue) is fixed.
- **Apex domain** `stargilt.com` 301s → `www` (Cloudflare edge rule, set up earlier). Two Cloudflare tokens in `~/.claude/api-tokens.json` (`token` DNS-scope, `account_token`); neither can write redirect rules (that was done via the dashboard).

## Next Steps
- [ ] **Build the Dopamine & Juice overhaul — follow `tasks/dopamine-plan.md` exactly** (the 4 critique bugs B1–B4 are already folded in). Scope: whole system, bold-tiered, evolving music. Build order is in that doc.
- [ ] Start with **§0 Heat spine (own RAF) + §2.1 reveal scaling + §2.4 continuous feast** — the highest-leverage, lowest-risk first slice. Verify the `mag`-floor gating (B3) before pushing further.
- [ ] Then §2.2 hit-stop (rush-aware), §3.1 card-land squash, §3.2 anticipation-by-rarity, §2.5 trauma-shake.
- [ ] Then the evolving music (§1), the big-win tiers (§4), death feel (§5), and restraint/accessibility (§6) tuned alongside.
- [ ] **Do NOT skip the coach protection (§6.5)** — freeze/slow-mo/heavy shake during `inTrial()` breaks the wordless-contract tutorial.
- [ ] Keep `index.html`==`chapters.html`; run the full test battery + `cardaudit`; verify the **projection===tally invariant** (no new effect writes the `#tithe` meter).

## Important Files
| File | Purpose |
|------|---------|
| `tasks/dopamine-plan.md` | **THE next task** — full code-anchored dopamine/juice implementation spec (approved; critique bugs folded in). |
| `index.html` | The entire game (single file). Current build `chapters · v0.9.1`. Edit here. |
| `chapters.html` | Byte-identical copy of `index.html` — keep synced (`cp index.html chapters.html`). |
| `server.js` | Zero-dep Node http: static + Mellon gate + telemetry ingest + honor-roll API + `/admin` + admin API. |
| `store.js` | JSON-file store on the Railway `/data` volume (events, scores, labels, geo). |
| `aggregate.js` | Pure analytics aggregation (funnels, per-player style, sessions). |
| `admin.html` | The "Forge Console" — tabbed analytics (Pulse/Difficulty/Compare/Cards/Players). |
| `CONTEXT.md` | Project bible — every version's changelog + architecture notes. Read for deep context. |
| `tasks/todo.md` | Rolling task log (Rounds 1–43). |
| `HANDOVER.md` | This file. |
