# StarGilt — Story & Legibility Spec

> **STATUS: DESIGN ONLY. DO NOT BUILD FROM THIS YET.** This documents the *problem*, the
> agreed *story*, and the exact *places in the code* to change, so a future session can plan and
> execute it. Nothing here is mechanics — only graphics, text, and narrative framing.
> Author: design conversation with Hampus, 2026-08-04.

---

## 0. This is an EXPERIMENT — test wildly, roll back cleanly

This narrative redesign is deliberately isolated so it can be pushed hard and abandoned if it doesn't
feel right, without endangering the shipped game.

- **`main` = production, the known-good game.** Currently `chapters · v0.11.13` (one-slot high-score,
  hover-to-spread, etc.). The commit is also tagged **`stable-v0.11.13`** — the explicit "go back to
  what we have" anchor.
- **Branch `forged-in-chains` = this redesign.** All narrative/legibility work happens here. main is
  never touched until (and unless) the redesign is deemed good and merged.
- **To test the redesign LIVE:** from the branch, `railway up --detach --service stargilt` (deploy
  replaces the live site with the experiment — that's the "wildly test" step). Give the experiment its
  own BUILD string (e.g. `chapters-story · v0.12.0-exp`) so /admin can separate its telemetry by build.
- **To ROLL BACK to what we have:** `git checkout main && railway up --detach --service stargilt` —
  the live site is instantly the stable v0.11.13 again (server data on the volume is untouched; a
  text/graphics redesign changes no schema). `git checkout stable-v0.11.13` reaches the same code.
- **If it feels right:** merge `forged-in-chains` → `main`, tag a new version, deploy from main.
- **If it doesn't:** just stay on `main`. Keep or delete the branch; nothing on main changed.
- *(Alternative if you want the live game truly untouched while testing: a second Railway
  service/environment deploying the branch to a `*.up.railway.app` preview URL — the custom-domain cap
  is full so the preview would be a railway subdomain. Heavier setup; the branch+tag above is enough
  for "test then revert.")*

---

## 1. The problem (why this exists)

StarGilt has **no immediate recognizability**. Balatro is instantly legible because it *rents a
primitive everyone already knows — poker*: you see three kings and feel "that's good" with zero
tutorial. StarGilt invents its entire vocabulary (★, MULT, tithe, Aspect, Dross, Forge), so a
newcomer must learn everything cold. There is nothing external to borrow intuition from.

**Key insight (the thing to hold onto):** *recognizability is borrowed, not authored.* A story/lore
does **not** create it — Slay the Spire, Inscryption, Monster Train all have deep lore and still must
be learned from scratch. Lore adds **depth and retention**; it does not add **instant legibility**.

The theme work already done is *good* (the Forge, the tithe, the eight Aspects, the Bazaar, Dross).
The gap is precisely: **the core loop reads as abstract, and the central pressure has no face.**

### The fix, in one line
Rent a universally-legible *verb* and give the pressure a *face*:
**a master smith, forging under a tyrant king.** "Evil king" is instant, wordless dread — it turns
the abstract "tithe" into a recognizable antagonist, and it lets ★ carry **dual meaning** (see §2).

**Pitch candidates** (for store page / one-liner — pick/refine later):
- "A blacksmith roguelike. Imprisoned by a tyrant, forge ever-greater works to feed his greed — and buy your freedom."
- "Forge or die. Each masterwork feeds the king — and breaks a chain."

---

## 2. The story: *Forged in Chains* (working title)

**Premise.** You are the realm's greatest smith. A tyrant king, coveting your work, has thrown you in
a dungeon and chained you to a **magical Forge**. Each day he demands a greater work. You forge to
survive his wrath — **but every masterwork you strike secretly loosens your chains.** The number you
raise is *both* the king's insatiable greed *and* your own freedom.

**The engine (why this is strong).** ★ does double duty: it *satisfies the king's demand* **and**
*buys your escape*. The meter you fill each turn is simultaneously the thing keeping you alive and the
thing setting you free. That dual stakes is the emotional payload the current abstract "glory" lacks.
This is a deeply rentable frame (Shawshank / Monte Cristo / Rumpelstiltskin / the imprisoned-artisan
myth) — players *arrive already understanding it.*

**How every existing element maps** (framing only — mechanics unchanged):

| Existing element | Current framing | New framing (the tyrant-forge) |
|---|---|---|
| The tithe / demand | "THE FORGE DEMANDS N ★" (abstract) | **"THE KING DEMANDS"** — a tyrant's quota, rising with his greed. The pressure gets a *face*. |
| ★ (glory / worth) | abstract points | **worth** of what you forge — feeds the king *and* buys freedom |
| A turn's output | "base × mult = final ★" | **the piece you struck** ("a Gilded Blade · worth 1,966") |
| The 8 Aspects (bosses, every 6 turns) | "THE FORGE TESTS YOU" | **the king's wardens / champions**, or **the 8 locks on your cell** — each a greater trial to break |
| The Masterwork (t48 final boss) | "the Forge made flesh" | **the ultimate work** that buys your final freedom (or could unmake the king) |
| Victory (Debrief) | "MASTERWORK COMPLETE / You Are Forged — Master Smith" | **freedom**: "THE CHAINS FALL" / "You Are Forged — and Free" |
| Death (game over) | "THE TITHE UNPAID / The Forge Grows Cold" | **the king's wrath**: "THE KING IS NOT PLEASED" / "YOUR CHAINS TIGHTEN" |
| The Bazaar | "THE BAZAAR" (a market) | **a smuggler / a sympathetic guard / the undermarket** slipping you materials in secret |
| Dross | slag to burn | keep — slag from the king's cheap coal, burn it off (already legible) |
| Emberheart Charm | mercy relic; "THE FORGE ARMS YOU" | **a friend's gift** — a smuggled ember that forgives one failed quota (else the king executes you) |
| The Honor Roll | "THE HONOR ROLL REMEMBERS" | smiths who forged their freedom before you — fits as-is |
| RANKS (Cinder Initiate → The Forge Eternal) | a **nobility** climb (Baron, Sovereign, Magnate…) | ✅ **DECIDED: a FREEDOM ladder** — the noble titles are replaced with the smith's arc from chained → free → legend, so rising rank *is* the freedom fiction (see §3/#12 for the proposed 10 names). |
| Trials / tutorial | apprenticeship | the smith's apprenticeship (a flashback *before* prison), or the king testing if you're worth keeping |

---

## 3. Part 1 — In-game graphics & text (the legibility pass) — **HIGHEST LEVERAGE, DO FIRST**

This is where recognizability actually lives. It is pure text/graphics — no mechanics.

**Principles:**
1. Give the pressure a *face* everywhere the player feels it (the king, not "the Forge").
2. Make the *output* feel like an *object* (you struck a *thing* worth N), not an abstract point.
3. Keep it legible in the first 10 seconds — a newcomer should infer "prisoner smith, tyrant, forge for freedom" without reading lore.

### ⚠ CRITICAL implementation rule
Change **display strings and art only** — do **NOT** rename internal identifiers. `state.tithe`, the
`#tithe` element id, `state.glory`, `computeScore`, the `BOSSES` object keys/fields, css class names,
etc. are wired throughout the logic and the tests. Touching them risks breaking scoring, saves, the
projection===tally invariant, and the test suite. Only the **human-visible text** and **visuals**
change. (index.html IS the game; every edit must be `cp index.html chapters.html` — they are kept
byte-identical. Run `cd tests && npm test` — 70 assertions — before deploy.)

### The rename map (before → after → exact code anchor)
All anchors are in `index.html` unless noted. Line numbers drift — grep the quoted string / id.

| # | What the player sees now | Suggested reframing (final copy TBD) | Code anchor (grep) |
|---|---|---|---|
| 1 | **`THE FORGE DEMANDS <n> ★`** (the central pressure HUD) | `THE KING DEMANDS <n>` (worth) | markup: `<div class="t-label">THE FORGE DEMANDS` (~1488); the label is also rewritten at runtime — see #2 |
| 2 | tithe label reset each turn: `tn.nodeValue='THE FORGE DEMANDS '` | king framing; **note there's already a helper** `titheLabelNode()` (~4409) and a boss-turn swap block (~4423) — the label is dynamic, change both the markup default (#1) and this runtime write | `THE FORGE DEMANDS ` at ~4423 + slamText `THE FORGE DEMANDS ${state.tithe} ★` at ~5478 |
| 3 | **`END TURN`** button | keep, or `PRESENT` / `STRIKE` (present the work to the king) | `<button id="endturn">END TURN` (~1471); coach also points at it (~3706); hint bar `PLAY CARDS · BUY AT THE BAZAAR · END TURN` (~1504) |
| 4 | Turn tally reveal: the `base × mult ≈ final ★` slam | name the forged object ("YOU STRUCK …") | the end-turn reveal / slamText path (search `slamText(eqn` / the tally in `endTurn`) |
| 5 | **`THE BAZAAR`** header + `THE BAZAAR IS SET` + restock slams | the smuggler / undermarket | `<h2>THE BAZAAR` (~1478); `THE BAZAAR IS SET` (~4829); `THE BAZAAR DEEPENS…` / `FRESH WARES…` (~5082); hint (~1504) |
| 6 | Boss intro: **`ACT <n> · THE FORGE TESTS YOU`** + medallion | `THE WARDEN COMES` / `A LOCK BARS THE DOOR` | `bossIntro(b)` sets `.bi-pre` = `ACT ${…} · THE FORGE TESTS YOU` (~4430s); `#bossintro` overlay markup |
| 7 | The 8 **Aspect names/epithets/blurbs** | wardens/locks (rename display name + epithet + blurb; keep object keys + mechanics) | `BOSSES` table, entries `1:{name:'The Sealed Hearth'…}` … `8:{name:'The Masterwork'…}` (~3081-3088) — change `name`/`epithet`/`blurb`/`tag` strings only |
| 8 | Death: **`THE TITHE UNPAID`** / **`The Forge Grows Cold`** | `THE KING IS NOT PLEASED` / `YOUR CHAINS TIGHTEN` | `.go-pre`='THE TITHE UNPAID', `<h2>The Forge Grows Cold` (~1610-1611); set again in `gameOverSequence` (~5918-5919); other go-pre variants at ~5604 (trial), ~5902 (`THE FIRE GUTTERS`) |
| 9 | Victory Debrief: **`You Are Forged — Master Smith`**, seal **`MASTERWORK COMPLETE`**, class line **`STARGILT · FORGE INTELLIGENCE · EYES OF THE GUILD ONLY`** | freedom: `THE CHAINS FALL` / `You Are Forged — and Free`; seal `FREE`; reframe the "dossier" as the smith's tally toward freedom | `.db-title` (~1629), `#db-seal` MASTERWORK/COMPLETE (~1631), `.db-class` (~1627); `THE MASTERWORK IS COMPLETE` slam (~5364) |
| 10 | Master-relic draft: **`THE MASTERWORK IS PLEASED`** | `THE KING IS PLEASED` (a reward for a great work) | `.mr-pre` (~1595) |
| 11 | Charm intro: **`THE FORGE ARMS YOU`** / **`AN EMBERHEART CHARM · IT FORGIVES YOUR FIRST MISSED TITHE`** | `A FRIEND SLIPS YOU AN EMBERHEART` / "…forgives one failed quota" | the boot charm-intro slamText beats (search `THE FORGE ARMS YOU`) + `IT FORGIVES THE MISS` / `BUY ANOTHER AT THE BAZAAR` (~5338) |
| 12 | **RANKS** progression titles (nobility) | ✅ **replace with a FREEDOM ladder** (chained → free → legend). Proposed 10 (map 1:1 onto the existing 10; final copy refinable): **1 The Shackled · 2 One Link Broken · 3 Chains Loosening · 4 Half-Unbound · 5 Shackles Sundered · 6 The Unchained · 7 The Fugitive Smith · 8 Ghost of the Forge · 9 The Kingbreaker · 10 The Unbound Eternal** (mirrors the old "The Forge Eternal"). Change only the `name:` display strings; keep the array length + all thresholds/logic. | `const RANKS=[` (~3315), the 10 `name:'…'` fields: Cinder Initiate, Gilded Apprentice, Arcane Broker, Baron of Embers, Magnate of the Vault, Aetherlord, Sovereign of Sigils, Mythic Ascendant, Avatar of the Forge, The Forge Eternal. **Note:** rank names appear in the HUD rank bar, `#rankname`, the game-over/debrief stats, the score entry (`entry.r`), and the leaderboard rows — a rename flows to all of them automatically (they read `RANKS[…].name`). |
| 13 | **Card flavor text** (per-card one-liners) | thread the prison/king/freedom world through flavor | `const DB={` (~2501); each card has a `flavor:'…'` field (e.g. spark ~2502, coin ~2503). ~60 cards. |
| 14 | Start menu items | keep labels; the *framing* comes from the intro (§4) + name-entry (§5) | `#startmenu`: `sm-play` PLAY, `sm-learn` LEARN, `sm-scores` HIGHSCORE, `sm-stats` ANALYTICS, `sm-quit` QUIT, `sm-continue` CONTINUE (~1687-1692) |
| 15 | Name entry: **`THE HONOR ROLL REMEMBERS`** + placeholder `your name` | the smith carves his name; fits, or "SIGN YOUR WORK" | `#nameentry` `.ne-pre` (~1735), `#ne-input` placeholder (~1737) |

**Graphics touches (light, no engine change):**
- The `#tithe` HUD could carry a small **crown/king sigil** beside the demand so the pressure reads as *his*.
- Boss intro medallions (`sigilSVG`) already exist per Aspect — reframe as warden crests / lock sigils (art swap, same call site).
- A **chain motif** on the death screen (chains tighten) and the debrief (chains fall) — CSS/SVG, decorative.
- The Bazaar could get a "smuggled/under the table" visual cue (a curtain, a shadow) — optional.

---

## 4. Part 2 — Intro graphics (the cold-open) — SECOND, keep it SMALL

**Job:** plant the frame in ~5 seconds. NOT a cinematic (those get skipped). One visual beat that
teaches the verb: *you are a chained prisoner; you forge; the number is worth; the king is the threat.*

**Concept (storyboard):**
```
[black] → a heavy cell door SLAMS (thud)
       → a dark forge sputters to life, ember-glow rising
       → a hammer is shoved into your hands; chains rattle at your wrists
       → the king's decree (text, cold): "FORGE, OR ROT."
       → first hammer strike on glowing metal (CLANG + spark burst)
       → a ★ rises from the strike — worth, made visible
       → title: STARGILT  (optional subtitle: "Forged in Chains")
       → straight into the menu / PLAY
```
~5–8s, **skippable**, honors `prefers-reduced-motion` (static frames, no shake).

**Hook point in code:** the boot/menu path. `boot()` runs the start-up; the menu is `#startmenu`
(shown via `initStartMenu`). Options: (a) a one-time cold-open on first visit only, gated via the
existing `Firsts` / `ch-sg-firsts` localStorage (so returning players skip it); or (b) a short beat
on PLAY before the first deal. The dopamine layer already has an FX/Audio vocabulary (`slamText`,
`FX.burst`, `AudioFX`, `flashWash`, `shake`, Heat) to build it from — reuse, don't reinvent.

---

## 5. Part 3 — The story, placed (where the fiction lives)

The narrative adds **depth + retention** — place it where it *won't* tax a newcomer (never a wall
before play):
- **Menu / title:** the subtitle + a one-line hook ("Imprisoned by a tyrant. Forge for your freedom.").
- **Name entry:** "Sign your work, smith." — a small character beat.
- **Boss (warden) intros:** one line of menace per Aspect — the king's warden speaking (reuse `.bi-pre`/blurb).
- **Victory Debrief:** the freedom payoff — the strongest narrative moment; the chains fall, you walk out. Frame the dossier as the tally that bought your escape.
- **Death:** the king's wrath / back to the cell — a short, grim line.
- **Card flavor (`DB[...].flavor`):** the ambient texture — thread the world through ~60 one-liners over time.
- **Optional later:** short inter-act interstitials (a whispered plan, a smuggled note, the king's growing paranoia) between Acts — but keep them skippable and brief.

---

## 6. Open decisions (for Hampus, before an implementer starts)

1. ~~**RANKS**~~ ✅ **RESOLVED (2026-08-04): a FREEDOM ladder** — the 10 noble titles become the
   chained→free→legend arc (proposed names in §3/#12; exact copy still refinable). Rising rank now *is*
   the freedom fiction.
2. **Title:** keep "StarGilt" (domain/brand set at stargilt.com), add a subtitle ("Forged in Chains"),
   or something else? Recommend: keep StarGilt + subtitle.
3. **Tone:** grim-and-mythic (Monte Cristo), or a touch of dark-fairytale wit (Rumpelstiltskin)?
   Sets the voice for all copy.
4. **The king's presence:** a *named* king with a recurring voice/portrait, or an unseen dread (only
   his demands)? Unseen is cheaper and often scarier; a face is more marketable.
5. **Aspects = wardens vs. locks:** are the 8 bosses the king's *champions* (characters) or the 8 *locks*
   on the door (obstacles)? Changes the boss-intro copy + art direction.
6. **Scope of the first pass:** legibility-only (rename map §3, ~1 focused version), or legibility +
   intro + first flavor together (a bigger "narrative update" version)?

---

## 7. Anchor index (file → what lives there, for a future session)

- **`index.html`** — THE game (single file). All HUD/markup/strings/flavor/`BOSSES`/`RANKS`/`DB`/overlays. `cp` to `chapters.html` after every edit (byte-identical; verify `cmp`).
- **`chapters.html`** — byte-identical working copy of index.html.
- **`server.js`** — the playtest gate ("Doors of Durin: Speak, friend, and enter", ~100) + score/telemetry APIs. The gate page is themable too (a cell door?) but is *outside* the game.
- **`admin.html` / `aggregate.js` / `store.js`** — analytics/leaderboard; not narrative (leave alone, except leaderboard *labels* if desired).
- **`tests/`** — the regression suite (`npm test`, 70 assertions). A pure text/art pass shouldn't break it, but **run it** — some tests assert visible strings (e.g. boss/HUD text, the reject note). If a rename changes a string a test checks, update the test intentionally.
- **`tasks/dopamine-plan.md`** — the precedent design doc (the juice overhaul) — same spirit as this file.
- **CONTEXT.md** — the running project log; the theme vocabulary + all prior versions are described there.

## 8. Recommended sequence (when it's time to build)
1. Resolve §6 decisions + write/approve final copy (the rename map is *suggestions*).
2. **Legibility pass** (§3) — the rename map + light king/chain graphics. Ship as one version. This alone attacks the recognizability problem.
3. **Intro cold-open** (§4) — small, skippable, first-visit-gated.
4. **Story depth** (§5) — menu/debrief/warden lines, then card flavor over time.
Each step: edit index.html → `cp` chapters.html → `cmp` → `cd tests && npm test` → deploy → prod-verify → commit.
