# Handover — 2026-07-18 (post-v0.11.0)

Shift-change for the StarGilt deckbuilder. **LIVE: `chapters · v0.11.0`** on https://www.stargilt.com.

## What Was Done (latest session — v0.11.0)
Nine playtest fixes + one design pivot, all verified (v0110test 21/21, battery 223 asserts) and prod-confirmed:
- **VIEW YOUR CARDS** during Boon/Master-Relic rewards (read-only pile view above the suspended overlay; `pvReadonly`).
- Piles moved down (96px); **burn button on pile-view card-body zoom**; opaque+blurred reward backdrops.
- **Phantom CLOSE solved**: `#inspect` was z-buried under `#mrdraft` (both 170, DOM order) → inspect z175. + **SKIP CLAIM** (`mrResolve`, click-only).
- **Admin**: LIVE is now age-gated (10 min → ABANDONED tN); live rows show Σ per-turn score (was 0★). **WATCH** spectate: `ch_board` per-turn snapshot beacon → `/api/admin/board?cid=` → `#spectate` panel (12s poll, no animation).
- **Mult nerf** (~15-18% mid-game): CHAIN_RATE .18 / ECHO_RATE .10 / TRIBAL_RATE .20 shared constants — **compute + reveal must never desync**; card m / relicMult / emberBloom shaved ~20%; `DEMAND_LATE_RATE` 1.13→1.12 refunds the late game (t48 74,550).
- **Bazaar restocks after every boss** (was rank-up-only; max rank ~Act 3-4 froze the shop); SOLD slots say "new wares after the boss".
- **ENDLESS REMOVED** (design decision): the t48 Masterwork kill ENDS the game — hard-stop → slam → `runVictory()` WITHOUT resolving the turn (no sweep/turn-49/redeal); old endless saves retired in `loadSave()`.
- **THE VICTORY DEBRIEF** (`#debrief`, forge-intelligence dossier): run-curve SVG (log-Y, boss diamonds), Eight Trials ledger (THE CLOSEST SHAVE), Engine Autopsy (peak turn / `state.maxCombo` / base×mult verdict), deck histogram + most-worked wares, bench roll-call, MASTERWORK COMPLETE stamp. `runVictory` snapshots `Balance.rows/cards` BEFORE `Balance.end()` — **order is load-bearing**. `#gameover` is death/trial-only now. New `game_won` telemetry.

Previous session (v0.10.0): the full Dopamine & Juice overhaul — Heat spine, evolving music, trauma shake, cardWeight, big-win tiers, death feel, restraint; honor-roll tabs + player ANALYTICS. See CONTEXT.md.

## What Worked / What Didn't
- **Build-order discipline held**: Heat spine first, verified headless (13-assert smoke) before each next pass — every pass got its own targeted headless check before moving on.
- **`pilejumptest` "failed" honestly**: the trauma shake ROTATES `#app`, so the pile's bounding rect legitimately sways ≤8px mid-shake (it rides the board — intended). The test's invariant was updated to (a) layout offset (`offsetLeft/Top`, transform-immune) constant, (b) exact return to rest. The containing-block bug is still covered.
- **Music never starts on programmatic clicks headless** — test suites must call `__afMusic.start()` explicitly; AudioContext itself runs fine in chrome-headless-shell.
- **BPM-ramp test wrote a wrong expectation once** (expected full 128 in 5s; ramp is deliberately ~3 BPM/s) — the code was right, the assertion was fixed.

## Key Decisions
- **BPM maps from act, not from Heat.run** — boss twists would otherwise jerk tempo ±12 on entry/exit; act-driven is monotonic and plan-faithful.
- **Victory fanfare is AudioFX, not a Music stinger** — `Music.out` is ramping to 0 during the fadeOut, so a stinger routed through it would be inaudible.
- **Common cards' squash threshold**: `sq = .022·max(0, weight−.9)` with a .005 floor → common (w≈1.06) never squashes; the throne stays with mythics/forged.
- **Tally per-payer rumble**: trauma² crushes old `shake(1)` to invisible; retuned to `shake(2.5+g*1.2)`/`shake(3)` so a big-star streak crescendos (deliberately near-saturates on a 15-payer feast — that's the feast feeling like one).
- **Analytics is a separate overlay (`#pstats`), not a hiscore tab** — different job (self-knowledge vs. ranking), and the user asked for a main-menu item.

## Lessons & Gotchas
- All prior gotchas stand (see git history / CONTEXT.md): `index.html`==`chapters.html` (`cp` after every edit), never `position:fixed` inside transformed `#app`, `recordScore()` mutates, chrome-headless-shell not full headless, test hooks `__af`/`__afMusic`/`__afBalance`.
- **`Heat` is defined AFTER `Music`/`AudioFX`/`ParticleField` in source** — those reference `Heat`/`REDUCED_MOTION` only at runtime (safe), but never at definition time.
- **`AudioFX.juice` is the persisted knob; `Heat.fxScale` is the live mirror** — set via `AudioFX.setJuice()` only.
- Prod-verify through the gate: cookie is `sg_gate=<sha256('sg-gate::Mellon')[:32]>`, not the plaintext.

## Current State
- **v0.11.0 live and prod-verified** (version string + /api/admin/board answering through the gate). All suites green: v0110 (21), v0100 (26), v090 (13), v085 (14), v084 (7), burn (8), v080 (12), v069 (14), pilejump (5), passAsmoke (13), scores (46), admin (32), hiscore (12) — 223 assertions.
- **No known bugs open.** Human feel-checks pending: the debrief entrance on a REAL win, the mult nerf's mid-game tension (watch Boss 2-3 clear rates in /admin), spectate against a live human session.

## Next Steps
- [ ] **Watch the admin Difficulty tab** after a few days of v0.11 play: did t9-18 tighten as intended (clear rates), did anyone hit the Boss-1 wall harder (Act-1 was meant to stay untouched)? CHAIN_RATE .18→.16 is the single dial if more bite is wanted.
- [ ] First real v0.11 winner: check the debrief renders well with their real data (esp. long names, huge glory, the async honor-roll placement upgrade).
- [ ] The parked **design-improvements list** the user said he'd send ("I will do it soon. Ignore for now.").
- [ ] Possible follow-ups: mobile perf tier for freeze/bursts; ANALYTICS per-run drill-in; spectate auto-refresh countdown chip.

## Important Files
| File | Purpose |
|------|---------|
| `index.html` | The entire game. `chapters · v0.11.0`. Edit here, then `cp index.html chapters.html`. |
| `chapters.html` | Byte-identical copy — never hand-edit. |
| `server.js` | Static + gate + telemetry + honor roll + admin API (new: `/api/admin/board`). |
| `admin.html` | Forge Console (new: LIVE/ABANDONED age gate, WATCH spectate panel). |
| `CONTEXT.md` | Project bible; v0.11.0 changelog is the header entry. |
| `tasks/todo.md` | Rolling log — Round 46 = this build. |
| scratchpad `v0110test.mjs` | The 21-assert v0.11 suite (+ the full battery beside it). |
