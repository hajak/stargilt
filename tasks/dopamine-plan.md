# StarGilt — Dopamine & Juice Overhaul (implementation spec)

**Status:** APPROVED, not yet built. Scope = **the whole system**, **bold-but-tiered** (quiet floor, loud apex), **evolving music INCLUDED**. Single file `index.html` (then `cp index.html chapters.html`). Built from a 6-agent research workflow + adversarial critique — the four critique bugs (B1–B4) are already folded into this spec, so **build from this doc, not the raw synthesis**.

All line numbers are vs `index.html` @ v0.9.1 — re-grep before editing (the file drifts). Confirmed anchors: `RARITY_JUICE` (2250, `{common:1,uncommon:1.5,rare:2.4,mythic:4,master:7,slag:.5}`), `impact(entry)` card-land (4028, uses `juice=RARITY_JUICE[def.rarity]`), `playCard` (3964), `buildCardEl` (2400), `buyCard` juice (4306, computed then unused), the tally multiply-reveal + `showMult` (4548–4556), feast (4685–4686), MULT-MAXED (4556), `shake`/`shakeLoop` (1942–1953, trauma-capable already: additive, cap 26, ×.86 decay), `ParticleField` (~1877) + `FX`/`AMBIENT` fields, `slamText` (1975, `slam` keyframe @1030), `flashWash`/`shockwave`/`floatText` (1955–1980), `AudioFX` (1621, primitives `tone`/`noise`; `thud(i,p)`/`zap(n)`/`chimeStep(i)` already magnitude-scaled; `boom`/`shimmer` already duck music), `Music` generative engine (1707–1868: swung dorian vamp, per-voice gains `bassGain`/`pluckIn`/pad `.06`, filter cutoffs pad 650 / bass 520 / pluck 2600, density gates in `schedule()` @1785 hat `.92`/stab `.6`/noodle `.14/.07`, live `BPM` getter, `duckNow`/`fadeOut`/`realign`; **never reads game state today**), `chordNow()` (1731), `computeScore()`→`sc.final`/`sc.base`/`sc.mult`, overshoot `turnGlory/state.tithe` (turnGlory defined @4639, AFTER the reveal — at the reveal use `sc.final`), `recordScore()` (4850, MUTATES localStorage — end-of-run only), `state.combo` streak, `effMultCap()`, `inTrial()`, `state.endless`, `enterBossState`/`bossDefeat` (3878-ish), `rankUpOverlay` (4985), `runVictory` (4902), `gameOverSequence` (4665), `THE EMBERHEART SHATTERS` (4673), reduced-motion media query (1162, only covers `.sm-*`).

---

## 0. THE SPINE — a global `Heat` signal (build FIRST)

One scalar all channels subscribe to. Place near `ParticleField` (~1877).

```js
const clamp01 = v => Math.min(1, Math.max(0, v));
const Heat = {
  run: 0,    // slow 0..1, run-long intensity → MUSIC + ambient vignette
  surge: 0,  // fast 0..1, per-event spike → FX gain, decays
  timeScale: 1, // 1 normal; <1 = hit-stop / slow-mo (apex only)
  _raf: 0, _last: 0,
  set(run){ this.run = clamp01(run); Music.onHeat && Music.onHeat(this.run); },
  spike(v){ this.surge = Math.min(1, this.surge + v); this._ensure(); },
  _ensure(){ if(!this._raf){ this._last = performance.now(); this._raf = requestAnimationFrame(t=>this._tick(t)); } },
  _tick(t){
    const dt = Math.min(.05, (t - this._last)/1000); this._last = t;
    this.surge = Math.max(0, this.surge - dt*1.4);           // linear decay ~1.5/s (Eiserloh)
    Music.rampTick && Music.rampTick(dt);                    // BPM lerp lives here too
    if(this.surge>0 || (Music.bpmRamping&&Music.bpmRamping())) this._raf = requestAnimationFrame(x=>this._tick(x));
    else this._raf = 0;                                       // sleeps when idle (no perpetual RAF)
  },
};
```

**B1 FIX (critique):** there is NO always-on RAF in this codebase — `shakeLoop`/`ParticleField.loop` self-terminate. `Heat` owns its OWN self-sleeping RAF (above). Do NOT try to piggyback on `shakeLoop`.

**`Heat.run` recompute** (call `Heat.set(...)` at: turn-start in the new-turn block ~4786, `enterBossState`, the rank-up loop ~4711, and on entering Endless):
```
Heat.set( 0.10*(actOf(state.turn)-1)/7 + 0.14*Math.min(state.bossesCleared,8)/8
        + 0.10*state.rank/9 + (state.twist?0.30:0) )
```
**B4 FIX (Endless plateau):** the formula saturates → Endless would pin at max forever. Make `Heat.run` **non-monotonic**: after each `bossDefeat`, `Heat.run *= 0.4` for the reward/draft beat (critique §2.7, generalized), and in Endless (`state.endless`) drive `run` off a **local per-cycle** intensity (e.g. `(turn - lastCycleStart)/6`) NOT the cumulative counters, so each Endless cycle breathes.

**Canonical derived scalars** (critique addition #3 — define ONCE, at the reveal after `sc` exists; the synthesis used `over01`/`overCap` inconsistently):
```js
const mag  = clamp01(Math.log10(sc.final + 1) / 5);          // absolute size 0..1
const over = state.tithe ? (sc.final / state.tithe) : 1;     // overshoot ratio (use sc.final, not turnGlory yet)
const over01 = clamp01((over - 1) / 3);
```
**B3 FIX (over misfires):** early tithes are tiny → an easy Act-1 dump hits `over` 3–5× while a hard late-boss clear sits `over≈1`. **Gate every apex tier behind BOTH `over` AND an absolute `mag` floor** — `over` is surprise (RPE), `mag` is the admission ticket. e.g. `tier3 = over>=3.5 && mag>=0.6`.

Feed `Heat.spike` at the reveal: `Heat.spike(0.4 + 0.6*over01)`. Also feed **`state.combo`** (critique #1 — a long chain is part of "this turn is big"): add `+ 0.15*clamp01(state.combo/12)`.

---

## 1. MUSIC THAT EVOLVES (the magic — INCLUDED, bold-tiered, transition-safe)

Add `Music.onHeat(run)` + `Music.rampTick(dt)` + `Music.bpmRamping()`. All changes glide via `setTargetAtTime` or land at `step===0` (the bar seam @1788) — nothing truncates a ringing envelope (the one structural rule).

- **1.1 Density gates by `Heat.run`** (in `schedule()` @1785, edit the 3 literals): hat `Math.random() < .5 + .42*run`; stab `< .35 + .4*run`; noodle `< (.04 + .14*run)*(step%2?2:1)`. Sparse/calm early → busy/driving late.
- **1.2 Open the filters** (the single biggest "awakening" gesture): in `onHeat`, `padFlt.frequency.setTargetAtTime(500 + 3500*run, t, .4)` and `bassFlt.frequency.setTargetAtTime(...)`. **VERIFY (critique #7):** `padFlt.frequency` already has the `lfoF`→`lfoFG(220)` LFO summed onto it (1748-50); `setTargetAtTime` on the same AudioParam adds to the LFO — base `500+3500*run` stays positive, keep Q `.6`, confirm no self-oscillation.
- **1.3 Tempo ramp by act.** `Music.rampBPM(target)` lerps `this.BPM` from `rampTick(dt)` (driven by Heat's RAF). Map `104 + 6*(actOf-1)` → ~146 by act 8. `GRID`/`BEAT` are live getters; verify no dropped/dup notes across the sweep (LOOK .9/TICK 200 still lead the playhead).
- **1.4 Add ONE lead/arp layer, gated high.** In `start()` create a persistent `leadGain` (0) → `this.out`, reuse `pluck()`. In `schedule()` when `run>0.6` fire an arp off `ch.pool` on `step%2`; ramp `leadGain` with **hysteresis** (on .6 / off .55) so it doesn't chatter.
- **1.5 Boss mode = MODE swap (not just louder).** `chordNow()` consults `state.twist`; when a boss is live swap `pool`/`stab` refs to a **darker ALT set** (Phrygian-ish, flatten 2nd/6th). **Critique #6:** build separate ALT chord tables, swap the *reference* (never mutate the shared `CH` dict); swap only at `step===0`; revert exactly on `bossDefeat`.
- **1.6 Quantized stingers** for boss-clear (major-triad swell) + victory (4-note fanfare, whole-step gear-change), in the brightened mode on the next bar; reuse `duckNow`. **Critique #8:** sequence `out.gain` writes — a stinger during `fadeOut` must not cancel the fade.

---

## 2. FX THAT SCALE WITH THE WIN (bold-tiered)

The per-card tally loops (~4498 stars, ~4525 mult) already escalate — leave them. Fix the flat climaxes.

- **2.1 Scale the multiply-reveal** (the #1 change; overlay layer only): replace the constants at the reveal (~4620–4633) with expressions of `mag`/`over01`: `shake(6 + 14*mag)`; `FX.burst(x,y,col, 24+60*mag, 5+5*mag)`; ONE coalesced `flashWash` at `0.12+0.3*over01` (**critique #9:** the reveal already fires flashWash twice @4627+4629 — coalesce, don't add a 3rd); `FX.stream(..., 16+24*mag, 450)`.
- **2.2 Hit-stop** (the missing technique, biggest perceived-impact/effort): a `freeze(ms)` that ramps `Heat.timeScale` 0→1 and is respected by the tally `tw()` helper (~4483) and the particle loop. Call `await freeze(60 + 90*mag)` right before `AudioFX.boom()` at the reveal. **MUST (critique #5):** route `freeze` through the SAME time scalar as `tw` and make it **cancelable by click-to-rush** and compatible with the Act-3+ auto-speed (v0.8.5) — a fixed 150ms freeze that ignores the rush feels wrong and swallows skip-clicks.
- **2.3 `slamText` overshoot scaled by mag:** pass `size: 2.6 + 1.2*mag`; drive a `--slam-punch` CSS var so the `slam` keyframe overshoot grows (1.18→1.35). Chromatic-aberration on the number **only when `over>2` AND the short equation form** (critique #8 — never muddy the load-bearing math; long-eqn `size 2.5` branch is already tight).
- **2.4 Feast continuous** (not binary): replace the `surplus>=state.tithe` threshold (4685-86) with `size: 2.2 + 0.9*over01` and tiered strings: `over<1.3` "TITHE PAID" → `<2` "THE FORGE FEEDS" → `<3.5` "THE FORGE FEASTS · N OVER" → `>=3.5 && mag>=0.6` reserved apex "**THE FORGE GORGES**".
- **2.5 `shake()` → trauma model** (non-breaking, upgrades all ~30 sites): keep `trauma`[0,1], `offset = maxOffset*trauma²`, `trauma -= 1.2*dt`, summed-sine noise (not `rand()`) + slight rotation (maxAngle ~3°). Keep the `shake(power)` signature (`power → trauma += power*0.05`). **Critique #11:** re-tune the factor against the per-payer `shake(1)` tally-loop site so a 15-payer feast doesn't saturate to continuous buzz. **Critique #12/mobile:** `#app` transform now also carries the absolute-positioned HUD piles (v0.9.1) — verify rotation doesn't visibly skew the deck/discard/END TURN.
- **2.6 MULT-MAXED scales past cap:** `overCap = add/effMultCap()`; `shake(3 + 4*overCap)`, add `flashWash` only above 1.5× cap.
- **2.7 Boss-clear / rank-up escalate by act/rank:** scale `shake`/burst/flash by `actOf/8` and `rank/9` — the 8th boss must feel categorically bigger than the 1st.
- **2.8 Particle budget** (critique #10): hard-cap `FX.parts` ≤ ~300 (clamp `burst` n when over) so a 20-card feast doesn't strobe into mush. **The number/outcome always renders on top of particles.**

---

## 3. POWERFUL CARDS LAND HEAVIER

`RARITY_JUICE` (2250) is the weight scalar; `impact()` (4028) already uses it for shake/shockwave but the card never deforms and buy/forge are rarity-flat.

- **3.1 Landing squash** (missing Disney principle; #1 "heavier" cue): `.landsquash` keyframe, volume-preserving `40%{scaleX(1+.06*juice) scaleY(1-.05*juice)}`, toggled in `impact()` with `--juice` var. **Critique #10:** remap so `common ≈ 0.15` (imperceptible) or every play feels juicy and mythics lose their throne.
- **3.2 Anticipation scales with rarity:** in `playCard` (3964) scale the wind-up lift (`-92 - juice*12`) and hold (`130 + juice*30`ms) — a mythic *loads* visibly before the drop.
- **3.3 Low-freq thud per rarity:** extend `impact` audio: common = crisp tick `thud(.5,1.3)`, rare = `strum`, mythic = `shimmer`+thud, master = `boom`-lite + a 40–60Hz sub sine (300ms) + downward `f2=f*0.35`. Low-and-loud = mass.
- **3.4 Directional screen-dip + neighbor recoil** on heavy land (bias shake downward for high-juice; nudge adjacent played cards outward via `T()` @2457, settle back).
- **3.5 Weight = power, not just rarity:** `weight = RARITY_JUICE[rarity] * (1 + (def.tier||0)*0.4) * (1 + Math.min(def.glory,8)*0.06)`; use `weight` everywhere `impact` uses `juice`. A forged high-glory rare out-lands a vanilla mythic.
- **3.6 Forge & buy stop being rarity-flat:** route `weight` into `resolveCommissions` (~3459) and `buyCard` (~4306, `juice` already computed & unused).

---

## 4. BIG-WIN TIERS (categorical, not louder) — the reserved vocabulary

Each tier ADDS a channel nothing below gets. Gate on `over` AND `mag` (B3) AND a per-turn best.

**B2 FIX:** `recordScore()` (4850) MUTATES localStorage — never call it per turn. Add a read-only `state.bestTurnGlory` tracker for the per-turn apex; keep `recordScore().best` strictly for end-of-run screens.

| Tier | Trigger | Reserved effects |
|---|---|---|
| 0 Routine | `over<1.3` | existing tally, small shake, one `strum`. **Deliberately understated** (baseline demoted). |
| 1 Good | `over 1.3–2` | continuous-scaled reveal (2.1), warmer flash, `Heat.spike(.4)`. |
| 2 Great | `over 2–3.5 && mag>=.5`, or MULT-cap hit | hit-stop 90ms, `slamText` overshoot bump, "FORGE FEASTS", music stinger. |
| 3 Apex | `over>=3.5 && mag>=.6`, or a new turn-best | **slow-mo ramp out of hit-stop** (timeScale 0→.2→1 over 120ms); full-screen wash .35; chromatic aberration on the number; a **unique one-shot synth chant** (stacked `power()`+`shimmer()`+rising arp) used ONLY here; "★ NEW BEST ★" via `.newbest` (347). |
| 4 Record-shatter | `state.glory > prevBest*1.5` (end of run) | everything in 3 + a signature flourish saved exclusively for this (board briefly desaturates to gold and re-blooms). ~a few per 100 runs. |

- **4.1 Personal-best is a first-class interrupt** at the end-of-turn AND death/victory screens (branch on best into Tier-3 vocab). Highest-leverage *honest* surprise.
- **4.2 A "column of fire"** on the `.ts-x.hot` xEl scaling with `over` (Balatro's burning mult) — **critique #8:** flame sits BEHIND the glyph, digit at full contrast.
- **4.3 Final-boss kill = hard-stop then fanfare** (invert the pile-on): `Music.fadeOut` (already @4907) + 400ms freeze-and-silence + black except the Masterwork text, THEN the fanfare. Contrast beats more-juice.
- **4.4 Novelty (critique #5):** flag first-encounter-only flourishes (first boss kill, first mythic land, first record) in the save blob; vary the apex chant (transpose a step / rotate arp) so it never becomes a ringtone.

---

## 5. DEATH FEEL (critique's top omission — build it)

The plan lavished victory and ignored loss — half a roguelike's emotional loop. Reserved **deflation** vocabulary at `THE EMBERHEART SHATTERS` (4673) + `gameOverSequence` (4665): filter slams shut (`onHeat`-style but downward), `Music.fadeOut` + a low sub-thud, desaturate the board, genuine silence-then-verdict. The negative-space twin of the apex.

---

## 6. RESTRAINT & ACCESSIBILITY (build alongside, not after)

- **6.1 Demote the baseline** (bold-tiered mandate): pull routine (`over<1.3`) shake/burst/flash BELOW today's values so Tiers 2–3 have headroom. Do this as each `mag`/`over` is wired.
- **6.2 Budgets:** particle pool ≤300 (2.8), trauma cap 1 (native to the model). Number/outcome always above particles.
- **6.3 `prefers-reduced-motion`** (current query @1162 only covers `.sm-*` — extend to the whole new layer): shake→static border-pulse, freeze/slow-mo→0, particle counts ×0.3, music tempo/filter sweeps disabled (start calm, stay calm). **Preserve info channels** (color, number pops, sound chant still fire).
- **6.4 In-game "Reduce Effects" slider** next to the volume UI (~5225–5244, `ch-af-vol` blob): 0–1 knob scaling `mag`/`surge` output globally.
- **6.5 Coach protection (critique #6, wordless-contract memory):** when `inTrial()` or the coach is live, force `Heat.run` low and juice tier ≤1 — NO freeze/slow-mo/heavy shake (they obscure the coach glow and desync its timing).
- **6.6 Stop the Music scheduler when muted** (minor CPU): `Music.tick` (1772) still runs while muted though `schedule()` early-returns @1789.

---

## BUILD ORDER (impact-to-effort)

1. `Heat` spine (§0, with its own RAF) + multiply-reveal scaling (§2.1) + feast continuous (§2.4). Half a day; transforms the most-repeated moment. **If only one thing ships, ship §2.1+§2.4 with the `mag`-floor.**
2. Hit-stop (§2.2, rush-aware) + per-card squash (§3.1) + anticipation-by-rarity (§3.2). Highest-ROI weight the codebase lacks.
3. Trauma-shake rewrite (§2.5) — non-breaking, upgrades all sites.
4. Music evolution (§1.1/1.2/1.3 first, then 1.4/1.5/1.6).
5. Personal-best tier (§4.1) + apex vocabulary (§4.2/4.3/4.4) + death feel (§5).
6. Boss/rank/buy/forge escalation (§2.7/§3.6) + music stingers/mode (§1.5/1.6).
7. Restraint + accessibility (§6) — tuned continuously, never bolted on last.

## MUST-VERIFY (headless where possible; some are feel-checks)
1. `Heat` surge decays on an idle screen (its RAF sleeps when surge=0 & BPM not ramping). 2. `recordScore()` never called speculatively per turn; `state.bestTurnGlory` drives per-turn apex. 3. Apex gated by `mag` floor — a late-boss clear hits Tier-3, an easy Act-1 dump does NOT. 4. 5+ Endless cycles still breathe (Heat not pinned). 5. `freeze` obeys click-to-rush + Act-3 auto-speed. 6. `schedule()` never mutates shared `CH`; boss revert exact. 7. filter sweep composes with pad LFO (no self-osc). 8. `out.gain` writes sequenced (stinger vs fadeOut). 9. BPM sweep: no dropped/dup notes. 10. particle pool ≤300; number on top. 11. reduced-motion gates the whole layer + still signals (color+chant). 12. shake rotation doesn't skew the fixed/absolute HUD piles. 13. **projection===tally invariant intact** — `updateTitheMeter(sc)` still equals revealed `sc.final`; no new effect writes `#tithe`/glory counters. 14. Run the full regression battery + `cardaudit`.

## Reference
Full research (juice/impact, dopamine psychology, adaptive synth music, Balatro/Hades case studies) + the raw synthesis + critique: workflow run `wf_6ae7f53b-bd7`, journal at `.claude/projects/…/subagents/workflows/wf_6ae7f53b-bd7/journal.jsonl`; extracted design/critique in the session scratchpad (`dop-design.md`, `dop-critique.md`).
