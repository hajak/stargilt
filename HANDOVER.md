# Handover — 2026-07-17 (post-v0.10.0)

Shift-change for the StarGilt deckbuilder. **The Dopamine & Juice overhaul is BUILT, verified, and live** — `chapters · v0.10.0` on https://www.stargilt.com (deploy: `railway up --detach --service stargilt`).

## What Was Done (this session)
The full `tasks/dopamine-plan.md` implementation (all 6 sections, critique bugs B1–B4 respected), plus two user additions folded in mid-build:

- **§0 Heat spine** — global `Heat` {run, surge, timeScale, fxScale} on its own self-sleeping RAF (B1). `Heat.reset()` wired at new-turn / boss-clear (×.4 dip for the draft beat) / rank-up; Endless breathes per 6-turn saw-tooth (B4); trials pin .05.
- **§1 evolving music** — `Music.onHeat` filter sweeps (LFO-safe), density gates, BPM 104→146 by act (~3 BPM/s via Heat's RAF), lead-arp layer with .6/.55 hysteresis, **Phrygian boss ALT chord tables swapped by REFERENCE at the bar seam** (`Music.CUR`; `CH` never mutated; reverts when `state.twist` clears), quantized `stinger('bossclear')`, `duckNow` locked out during `fadeOut` (`_fading`), muted → scheduler idles.
- **§2 scaled FX** — canonical scalars `mag`/`over` gate categorical tiers at the multiply-reveal (B3); `freeze()` hit-stop routed through the caller's `tw` (rush/act-speed aware, skipped in trials); **trauma-model `shake()`** (trauma², summed sines, ~2.5° rotation, `dip()` directional channel — same `shake(power)` signature at all ~30 sites; tally sites retuned ×3-4); particle pool capped 300; particle/shake physics × `Heat.timeScale`; continuous feast → **THE FORGE GORGES**.
- **§3 cards land heavier** — `cardWeight = RARITY_JUICE × (1+tier·.4) × (1+min(glory,8)·.06)`; `.landsquash` via `--sq` (common imperceptible); anticipation lift/hold by weight; per-rarity bass registers; buy/forge heft.
- **§4 big-win tiers** — reserved `AudioFX.chant(variant)` (apex only, transposed); `state.bestTurnGlory` per-turn peak (B2 — `recordScore()` is still end-of-run only; bestTurnGlory rides the save blob); **Tier-4 record-shatter** goldbloom via `finishScores() → {best, shattered}`; column of fire BEHIND `.ts-x`; **victory hard-stop** (music cuts → 420ms blackout+silence → Masterwork slam + fanfare); `Firsts` one-time flourishes (ch-sg-firsts).
- **§5 death feel** — filters slam shut, `deathgray` drain, crash → true silence → 49Hz verdict; a new best removes the gray.
- **§6 restraint** — reduced-motion gates the whole layer (shake→border pulse, freeze→0, bursts ×.3, music stays calm — color/sound/number channels preserved); **SCREEN FX slider** in SOUND SETTINGS (`AudioFX.juice` → `Heat.fxScale`, ch-af-vol blob); coach protection (`inTrial()`: no freeze, juice ≤.35, Heat .05).
- **HIGHSCORE tabs** — THE WORLD / MY RUNS (local ch-af-scores; race yourself).
- **ANALYTICS** main-menu panel — 6 stat tiles, most-worked wares, last-12-runs bars; `ch-bal-log` + `ch-af-scores` **only** (own data, nothing leaves the machine).

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
- **v0.10.0 live and prod-verified.** All suites green: v0100test (27), v090 (13), v085 (14), v084 (7), burn (8), v080 (12), v069 (14), pilejump (5), scores (46), admin (32).
- **No known bugs open.** Feel-checks that only a human can do: the apex chant in context, boss-mode music darkening, the victory hard-stop, death silence, trauma-shake feel on a real feast, SCREEN FX slider sweep.

## Next Steps
- [ ] **Hampus plays it** — the whole overhaul is tuned by formula, not by ear/eye on a real run yet. Expect knob-turning requests (chant volume, shake ceiling, GORGES threshold).
- [ ] The parked **design-improvements list** the user said he'd send ("I will do it soon. Ignore for now.").
- [ ] Possible follow-ups: mobile perf tier for freeze/bursts (critique #7 — only reduced-motion + the slider gate today); Analytics could later add per-run drill-in.

## Important Files
| File | Purpose |
|------|---------|
| `index.html` | The entire game. `chapters · v0.10.0`. |
| `chapters.html` | Byte-identical copy — keep synced. |
| `tasks/dopamine-plan.md` | The build spec (now fully implemented). |
| `tasks/todo.md` | Rolling log — Round 45 = this build. |
| `CONTEXT.md` | Project bible; v0.10.0 changelog is the header entry. |
| scratchpad `v0100test.mjs` | The 27-assert overhaul suite (+ the full battery beside it). |
