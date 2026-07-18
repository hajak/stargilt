# Aetherforge — dopamine deckbuilder (visuals-first, Pyrene-style)

## Round 28: Chapters + Boss Commissions (Strategy C) — built in a SAFE FORK, not deployed
Goal: give the endless-survival game a knowable summit tuned to StarGilt's grain (build the engine → unleash
one long hand), without risking the live v28 game. Built in a forked `chapters.html` (served at /chapters.html).
Design forks locked with user: boss reward = **draft 1-of-3 Master Relics**; chapter feel = **relaxed build
turns, boss is the gate**.
- [x] Forked index.html → chapters.html; namespaced all 8 storage keys with `ch-` prefix (verified: index.html
      keys untouched, zero bare keys written by the fork); Telemetry forced OFF (offline sandbox); BUILD='chapters-C · v0.1'
- [x] "Acts" structure: 3 acts × 3 turns. Build turns relaxed, boss turn (3/6/9) spiked + twisted. Demand via a
      bespoke schedule CHAPTER_DEMAND behind the single TITHE_FOR chokepoint (build 5/8/13/18/27/35, boss base 16/34/64
      × twist mult). Final boss (turn 9) = the win → runVictory → Endless resumes the raw runaway curve.
- [x] Master Relic tier (new rarity 'master' + r-boss/r-master glow): 8 defs. Most are pure data (relicMult:2 Ashen
      Crown, handCombo:4 Chain Eternal, handFocus:2 Bellows, glory:12 First Flame, handGold/Buy Molten Ledger). Two
      greenfield fields wired: handDraw (+1 card/turn, Long Kiln) in dealCards; emberBloom (each Ember +.3× MULT,
      Starforge) in computeScore add-bucket. Keystone (xMult:1.5, true ×MULT) in the x-bucket, gated to the finale draft.
      Chips render in gainsHTML/railChipsHTML/deadlineHTML. Masters are draft-only (cost:0+dead → excluded from MARKET_POOL).
- [x] Boss reward = Master Relic draft: cloned the boon overlay into #mrdraft ("THE MASTERWORK IS PLEASED"), no skip,
      claim MOUNTS via state.relics.push+renderBench (flies to #relicrack). 2 drafts (after boss 1 & 2); the boss-2 draft
      pool includes the Keystone. Clearing a boss also re-arms Mercy + gold.
- [x] Twist catalog (5, gift+demand pairs, one distinct per run): Long Night (+2 draw, demand×1.9), Gilded Flood
      (+5 focus ×1.7), Twin Anvils (chain×2 ×1.6), Ember Surge (ember ★×2 ×1.5), Ashen Fast (dross ★×2 ×1.4). Applied via
      focusPerTurn/dealCards/effCombo/emberStarFactor/relicStars; tally animation kept consistent with each.
- [x] Chapter map HUD (I ●●◆ → II ●●◆ → III ●●◆, current glowing, boss diamonds) + twist banner pill on boss turns;
      hoisted above #table in #mainright to clear the absolute #tithe. Both hide in Endless.
- [x] Verified headless (puppeteer + chrome-headless-shell): full 9-turn run boots into chapters → build turns gentle →
      3 bosses spike w/ distinct twists + banners + draw bonus (7-card hand) → both drafts mount a relic (0→1→2) →
      final boss → victory ceremony (rays, "You Are Forged — Master Smith", honor roll) → ENTER ENDLESS → turn 10,
      endless=true, demand back on runaway (61), map hidden. cardaudit: 595 renders, zero overflow. ERRORS: none.
      Namespace proof clean. index.html + server.js byte-untouched. Screenshots ch-*.png in scratchpad.
- [ ] TUNE after user plays it: final-boss demand (base 64 × Long Night 1.9 = 122 may be too hard with only 2 masters);
      CHAPTER_DEMAND is a single commented const. Then fold learnings back into index.html (separate round).

## Round 9: unbreakable card layout, shrine relics, groove — SHIPPED
- [x] Card layout once-and-for-all: art = flex slack (min 24px, absorbs ALL content growth), rules size to content, name/flavor line-clamped, market joins progressive disclosure → **cardaudit.mjs: 455 renders (every def + forged × hand/mkt/bigcard × rest/hover), zero overflow — permanent battery member**
- [x] Unplayable = design: text ribbon deleted; relics wear an arched shrine silhouette + engraved plaque name + corner rivets + glass sheen; dross = same silhouette, ashen; Grimoire: "nothing arched can be played"
- [x] Music rework: 104 BPM swung dorian groove — walking bass hook (loudest voice), Rhodes stabs on the and-beats, shaker hats, Am7⇄D9 vamp w/ F–E7 turnaround; music default .45 (+migration from .35)
- [x] Init hardening: BUILD stamp (corner + console), boot().catch → crimson "THE FORGE FAILED TO LIGHT" banner, boot-phase unhandledrejection guard. (Original report unreproducible — stale tab suspected.)
- [x] Full battery + round8 shrine assertion green; contract EXACT

## Round 8: ⚒ Forge economy, readable cards, music — SHIPPED
- [x] A: Buys→⚒ FORGE everywhere; ic() fixed-color icons (Broker's Writ ◎ bug); Anvil station w/ live "N pairs" badge → opens deck view; 👁 forged-result preview; "N on the table" disabled state explains the played-copy rule
- [x] B: progressive disclosure (rest = name/art/chips/⚡badge/⛓ribbon; hover reveals typeline/syn/flavor, art breathes 50%→36%); chips uniform inline-flex 1.9em ≥12.5px; base font 13.5px; dead cards lift 26px vs 84 (bolted down)
- [x] C: af-restart flag consumed (Grimoire-mute bug); hover-projection green ghost "→ N★" via simulatePlay (order made visible); meter = (★+✦)×MULT living formula; SPARKS out of HUD, ✦ gains stream into the formula slot; SPARKS STRIKE drains ✦→★; "Order of Things" chapter; XI chapters
- [x] D: master→{fx,musicBus} buses; af-vol persistence; Music engine — A-aeolian 72BPM pads (detune LFO, breathing lowpass) + probabilistic pentatonic plucks + rare accents, ≤6 oscillators, boom/shimmer ducking, hidden-tab suspend; mixer popover (MASTER/EFFECTS/MUSIC + SILENCE ALL)
- [x] E: round8.mjs 8/8 green; full battery green; contract EXACT throughout

## Round 7: readability + anatomy coherence — SHIPPED
- [x] (1)+(4) Card face redesign: corner gems removed — ★ glory is now the FIRST chip in the pays row (one-row value story), MIGHT deleted as pure decoration; reclaimed gem strip → bigger floors (chips 11px, syn 10.5px, deadline 10px, typeline 9.5px); hand fan widened (spacing 134)
- [x] (2) Dead cards = enshrined treasures: gilded double border, gold-tinted nameplate, soft breathing halo, still no sway/foil; Dross alone keeps the ashen junk look
- [x] (3) Grimoire opens FIRST at boot (before reveal/deal); suppression flag migrated af-grimoire → af-tutor-off so legacy browser flags stop muting it
- [x] (4) Anatomy chapter rewritten: 5 annotations (TRIBE/COST/❖/PAYS-one-row/⚡), chapter text explains ★ chip = BASE at tally vs instant pays
- [x] Full battery green; contract EXACT throughout

## Round 6: seven-point polish — SHIPPED
- [x] (1) Every Reverie guarantees a free-to-play pile (5th pickReverie food group) + Ember Sigil relic radiates ❖
- [x] (2) Sold-out piles FLIP-slide to the far left; evolution refills from there — live wares stay contiguous
- [x] (3) Relic rack drafts 3 of a 10-passive pool: ×MULT tiers, +❖/+⬤/+◎ on draw (Ember Sigil/Ledger/Writ), Lodestone (buys→hand), Everember (+2✦ radiates), Trophy (+4★ flat), Chainbrand (chain +2 phantom links via effCombo)
- [x] (4) Tutorial auto-opens every fresh visit; PLAY AGAIN sets sessionStorage af-restart to skip in-run
- [x] (5) Grimoire → X chapters: Relic Rack chapter + Anvil & Furnace chapter (opens the live pile viewer, teaches forging/burning) + boon/mercy folded into the Tithe chapter
- [x] (6) Dead cards visibly inert: stone face, zero sway (stillness among the living), double border, no foil/sheen, not-allowed cursor
- [x] (7) The Cooling Rack (tide rare 5⬤, terminal): rest a hand card → returns next turn as an EXTRA draw; savebar UI, saved[] survives the sweep, putInHand return ceremony
- [x] round6.mjs (7 assertions) green; full battery green incl. new tut policy + contract EXACT with all passives
- [x] ⚒ FORGING: own 2 copies → pile viewer offers "FORGE 2 INTO 1" (spends your Buy): forged ⁂ card = +1 glory, +1 all gains, +1 kin/surge, engines +50%/+0.25×; gilded trim, lands on deck top fresh; anvil ceremony
- [x] Living bazaar: each rank-up cycles out the cheapest (or a sold-out) pile for a deeper card (cost ≥ old+1, rarity-weighted) — "THE BAZAAR DEEPENS" flip reveal; kingdom stays 8, boons track it
- [x] Relic rework (user: "never buy them"): relics now RADIATE ×MULT from hand (Reliquary +0.5×, Monument +1×, Aethercrown +2×) — greening scales with the engine like Dominion victory cards; ember ×gem replaces the 0★; Dross keeps its flat 1★
- [x] Meter refreshes on deal (dealt relics/dross change the projection)
- [x] forge.mjs suite: relic mult 1→2, forge (gravekey_f, pair consumed, buy spent), contract EXACT with radiating relic, evolve on rank-up; full battery green

## Round 4: focus economy, boon bug, dross-estates, clarity, sparks — SHIPPED
- [x] BUG (user: "can't click boons"): .cardo{pointer-events:auto} + #tutpanel{pointer-events:auto} punch through closed overlays' pointer-events:none → invisible click-eaters. Fixed: #X:not(.on) *{pointer-events:none!important} gate + inspector clears ghost card; verified with REAL-pointer boonclick.mjs incl. post-tutorial state
- [x] Focus economy: Emberling → free cantrip, Cinder Choir +1 ❖ (chain-neutral), new Grove Warden (verdant village, +2 ❖ +1 ✦)
- [x] Cinder Dross = Estate: dead+slag, worth 1 ★ flat from hand, still burnable junk (worst turn-1 hand now 8 vs quota 6)
- [x] Boon clarity: meter shows "BOON AT n ★" / "⭐ BOON EARNED"; boon overlay explains the multiple
- [x] Mult legibility: hand cards with mult synergies show live armed preview ("would forge +0.6× MULT at the tally")
- [x] Sparks rename: Aether → ✦ Sparks everywhere user-facing ("SPARKS STRIKE" tally beat); Aetherforge/Aethercrown stay as proper nouns; Aether Prism → Spark Prism
- [x] Test infra root-causes: tension's fixed-point mouse clicks hit dross under the new starter (intermittent turn-1 whiff eating Mercy) → synthetic play-all; boot-ready polling in all suites; full battery + real-pointer suite green

## Round 3: make it FEEL like a deck builder — SHIPPED
- [x] A. Atomic balance patch: idol/bulwark/midas lose treasure (Focus binds ~28%→56% of hands), starter 6c/4s/2 Dross, tithe 6·1.35^t (worst turn-1 hand passes at exactly 6), buys TOPDECK + fly-to-deck anim, NEW STEEL glint on first draw
- [x] B. Burn rework: Altar burns exactly 1, instant on click, pays ✦ 2+cost via payGains (meter contract automatic); SPARE skips; backdrop/ESC decline hardening
- [x] C. Pile viewer: click deck/discard → DECK/DISCARD/ALL tabs, grouped ×counts, tribe composition strip, click-through to inspector; "DECK · N OWNED" label
- [x] D. Boons: turnGlory ≥ (2+claimed)×tithe → "Claim a Boon" (2 kingdom + 1 rarity-weighted wildcard, deduped) free to deck top; escalates per claim; decline is pure
- [x] Tests: round3.mjs (8 assertions) + settle() boon-aware helper in all suites; full battery green, zero console errors
- Note: turn-2 worst case covered BY topdecking (validated); watch exponent 1.35 in playtest

## Strategy overhaul: "Dominion's brain, Balatro's heart" (approved plan) — SHIPPED
- [x] Phase 1 — Scoring core: computeScore() BASE×MULT single authority, two-axis meter, tally rewrite w/ multiply reveal + click-to-rush, tithe 8·1.55^t, ranks ×2 + 2 tiers
- [x] Phase 2 — Scarcity: Focus (1/turn; ❖ tag on terminals; treasures/cantrips free) + 1 Buy/turn, +❖/+Buy gains, HUD pips, deny shake, villages (Warren/Conclave) + Caravan/Storm Bazaar
- [x] Phase 3 — Dilution & Furnace: relic rack (Reliquary 3★/Monument 6★/Aethercrown 12★ — dead, score flat from hand), Cinder Dross slag + Zealot junk-for-power, interactive burn mode w/ combust ceremony
- [x] Phase 4 — The Reverie: pickReverie() 8 piles w/ guaranteed food groups, Dominion stock (4/3/2/1, sold = gone), face-down flip reveal + "THE BAZAAR IS SET", 6 mult engines (Compound/Prism/Catalyst/Resonator/Fractal ×1.5/Mirrorforge ×2)
- [x] Phase 5 — Tests: strategy.mjs (7 mechanic assertions incl. grand contract 54=54), all 7 suites green, zero console errors; Grimoire now VII chapters

## Readability + inspector + difficulty pass (user feedback round 2)
- [x] Market cards: art 30%, no fade mask, px floors on all rows, power gem hidden — every text row visible
- [x] Card inspector: click Bazaar card → 340×476 zoom + BUY (with stock/deny reasons) — fits 1-buy pacing; hand cards get hover 🔍 + right-click; ESC/backdrop closes
- [x] Grimoire chapter III "Reading a Card": annotated Emberhound (cost/tribe/chips/⚡/★/❖/might labels), panel beside card (panelSide:'right'); VIII chapters
- [x] Difficulty: tithe 8·1.55^t → 7·1.35^t (≈2× run length) + THE FORGE'S MERCY (♥ pip, one failure forgiven per run — kills luck-deaths)
- [x] All 7 suites green incl. mercy-then-death sequence and inspector buy flow

## Card text overflow fix (user feedback round 3: "text goes outside the card edge")
- [x] Names never truncate: killed nowrap/ellipsis on .cname — wraps up to 2 lines everywhere; .long threshold 13→11 chars; mkt long-name floor 8.5px (no more mid-word "Aethercro/wn")
- [x] Rules area reserves the gem strip (margin-bottom 2.4em hand / 1.6em mkt / 2.8em bigcard) — flavor no longer collides with ★/might gems
- [x] Inspector guarantees full text: art 32%, mask removed, overflow visible, font 22px
- [x] Market relics get compact rules text ("Unplayable — pays N ★ from hand")
- [x] Verified: Cinder Warren (user's exact repro), Dragon of the Aurum Vault (longest name), Ashen Reliquary, full market row — all text visible; contract + strategy suites green

Single-file HTML experiment. MTG card anatomy + Dominion market loop. Gameplay intentionally shallow; presentation maximal.

## Build
- [x] index.html skeleton: HUD (gold/aether/glory/turn), market row, play area, hand arc, deck/discard piles
- [x] CSS: void-nebula background, engraved gold frames, 5 mana-color system, rarity glows, foil shader
- [x] Procedural SVG card art (seeded sigils + gradients per card)
- [x] FX layer: canvas particles (burst/coins/embers/motes), screen shake, shockwave rings, floating numbers
- [x] WebAudio synth: whoosh, thud, coin chime, shimmer arpeggio, combo pitch ladder, shuffle riffle
- [x] Game loop: draw 5 → play cards (free, generate gold/aether/draws) → buy from market → end-turn glory tally
- [x] Juice pass: staggered deal-in, 3D hover tilt, play-slam + shake, buy coin fountain, combo ×N badge, rank-up overlay
- [x] Market restock with deepening rarity odds

## Verify
- [x] Headless Chrome run: full loop exercised, glory math verified (5+2+18=25), zero console errors
- [x] Screenshot iteration: lifted hand baseline, de-cluttered market cards, fixed flavor/gem collision, redrew vortex sigil
- [x] Workflow: parallel review (JS bugs / DOM-CSS / juice audit / typography / perf) → apply fixes

## Tutorial mode (added on request)
- [x] "Grimoire" 5-chapter walkthrough: spotlight hole + gold-framed panel, chapter dots
- [x] Steps advance by doing (play/buy/end-turn) or NEXT; end-turn always dismisses
- [x] Auto-runs once (localStorage af-grimoire), replayable via ? button in HUD
- [x] Headless-verified: auto-start once=true, reopen=true, zero console errors

## Usability/readability pass (user request: "Airbnb designers, keep theme")
- [x] Font roles: Grenze Gotisch → ceremony only (logo, rank-up, combo ×N); Fraunces → card names + headings; Alegreya Sans → all UI (buttons, counters, labels, chips, typelines); Alegreya italic → flavor only
- [x] Cards 150×210 → 164×230, base font 10.5 → 12px (market 8.8 → 9.8px), px floors on typeline/chips/names
- [x] Long names wrap (.long) instead of ellipsizing; letter-spacing halved on small caps; secondary text brightened (--dim-bright)
- [x] Filled-gold primary buttons (END TURN, BEGIN); TURN counter de-chromed; wordmark demoted; market hover lift

## Tension: The Ashen Tithe (user request: "no way to lose")
- [x] Rising per-turn glory quota: TITHE_FOR(t)=round(10·1.25^(t-1)); fail at tally → run over
- [x] Live meter under the bazaar shows projected tally (played ★ + aether + combo bonus); ember→gold flip with chime; "SHORT N ★" / "+N TO THE VAULT"
- [x] END TURN goes ember-red (.danger) while ending would kill you
- [x] Judgment beat after combo phase: "TITHE PAID" / "THE FORGE FEASTS +N"; new-turn demand announcement
- [x] Game over: "The Forge Grows Cold" overlay (ember rays, run stats, STOKE A NEW FLAME → reload); descending dirge + ember burst
- [x] Tutorial extended to VI chapters (new: The Ashen Tithe, targets the meter)
- [x] window.__af state handle for test harness
- [x] Verified: tension.mjs (boot meter, safe flip at 25/10, survive→turn 2 quota 13, forced fail→overlay, reload→fresh run) + all 3 prior suites green

## Synergies (user request: "not enough combos / builder dynamic")
- [x] 5 synergy kinds in card data: kin (per other same-color played — order matters), types (N+ Spells played → burst), starScale (+1★/3 cards at tally), aetherX2 (Incarnate), comboX2 (Vintner)
- [x] Every market card now has a synergy; starters stay vanilla; Gilded Idol keys off starter Coins (aurel) so the first combo is discoverable turn 1
- [x] Legibility: color dot + tribe name on every card, ⚡ syn line that rewrites itself and glows when armed ("EMBER KIN ×2 — +2 ✦ now!")
- [x] Fire spectacle: particle arcs from enablers, flash, rising zap pitch, named callout; tally engines get ⚡ slams
- [x] pledgedGlory() and endTurn tally share one formula — meter projection provably equals tally (test: 34=34)
- [x] Whiff fix: killed hover neighbor-shove; cards fire on pointerdown (snappier + immune to mid-animation whiffs)
- [x] Test infra: full headless Chrome compositor flake diagnosed → all suites moved to chrome-headless-shell; __afGive debug hook
- [x] All 5 suites green, zero console errors

## Review (25-agent workflow: 14 confirmed bugs + juice/type advice, all applied)
Races: pendingEffects drain in endTurn; boot deal busy-guarded; atomic aether transmute.
DOM/CSS: hover hit-extender (no jitter); perspective moved to .cardo (tilt now actually 3D);
tilt guarded during deal-flight; market fade-in restored; pilecount pointer-events:none;
tablesigil clamped to section; mythic/afford glows moved to opacity-animated pseudo-layers.
Perf: grain overlay 4x → 1.44x viewport; particle rAF loops idle when empty; shake loop
on-demand; artSVG cached; discard ghost memoized.
Juice: combo threads into audio (pitch ladder + thud detune); tally has anticipation riser,
accelerates, scales with glory; play has wind-up→slam; buy has arrival thud + pile squash;
counters drain differently than they pop; #fx above rank-up overlay.
Verified: 3 headless suites green (full loop, tutorial, race-conditions), zero console errors.

## Round 10 — Design Lab (board + card layout concepts) — DELIVERED, awaiting vote
User: board cramped (bazaar + anvil eat rows), card info hidden below art until hover.
Built standalone `design-lab.html` (http://localhost:5713/design-lab.html) — 6 tabs, game-faithful mocks:
- [x] Board A · Side Bazaar — market as 300px left rail (2-col tiles), relics+Anvil at rail foot, table gets full stage
- [x] Board B · The Counter — whole market on one 96px chip strip (kingdom→relics→Anvil), table gains 120px
- [x] Board C · Forge Hall — shop becomes a phase: pulsing "⚒ ENTER THE BAZAAR" button slides a grand panel over a pure play table (Balatro rhythm)
- [x] Cards 1 · Badge Overlay — full-bleed art, glassy effect tokens dead-center ON the art, ⚡ syn on art's bottom edge
- [x] Cards 2 · Split Face — art top 52%, permanent large-type info panel below (typeline/pays/syn always visible)
- [x] Cards 3 · Iconic Frame — fixed grammar: cost gem TR, big ★ gem BL, translucent pays-band at waist, ⚡ beneath
- [x] Fixes during build: stage scaling for hidden tabs, mkt-size rem/em scaling bug, hand-fan mock, chip flex-shrink
- [ ] User votes ("Board X + Cards Y", mixing allowed) → implement winning pair in index.html, cardaudit.mjs guards

## Round 11 — Board A + Cards 1 implemented; text sweep — SHIPPED
User vote: Board A (Side Bazaar) + Cards 1 (Badge Overlay). Plus: card texts must state mechanics, not coach.
- [x] Board A: #main flex split — Bazaar is now a 296px left rail; kingdom = 2-col grid of .rtile tiles
      (art thumb + name + cost gem + stock), RELICS seam, Anvil bar at rail foot; table gets the full stage
- [x] Tiles keep the whole buy flow: click/right-click → inspector; afford/broke states; stock badge;
      sold piles drift to rail head; evolveMarket pops the new tile (no card3d flip)
- [x] Cards 1: full-bleed art; name scrim on top; payload = glassy tokens dead-center ON the art;
      ⚡ synergy always visible on the art's bottom edge (progressive-disclosure hover-reveal REMOVED);
      typeline/deadline/flavor now live in .botinfo — bigcard (inspector) only
- [x] Dead relics keep the shrine identity: arched alcove art, engraved plaque, rivets, double border;
      hand-aura relics got mechanic tokens (+1 ❖ on draw, buys → hand, chain +2, …) so faces are never blank
- [x] Text sweep: killed all coaching ("Burn it.", "still mostly ash", "villages grant more") —
      every card states its rule: "Pays 1 ★ from hand at the tally. Burns at an Altar for ✦ 2.";
      inspector notes + pv-hint + tutorial IV/VII/VIII reworded for the new anatomy/rail
- [x] cardaudit extended: badge-overlay collision checks (.mid vs .foot vs .nameplate) — caught 8, fixed
      (mkt token stack tightened); 455 renders zero overflow
- [x] Full battery green: contract, strategy, tension, race, synergy, forge, round3/6/8, tut, boonclick
- [ ] Mercy re-earn designs delivered for discussion (not implemented)

## Round 12 — rail readability designs, icon language, annotation fix — PARTIAL SHIP
- [x] (3) FIXED: tutorial spotlight hole now spans card + annotations (Tutor.annoRect); .anno restyled
      bright (solid bg, gold border, parchment text, 13px) — nothing dimmed
- [x] (2) FIXED: icon language discipline — every mark named ONCE (Grimoire first-use + HUD labels
      + anatomy legend), icon-only everywhere else. Swept: inspector notes, floatTexts, tally slams,
      synText, annotations, tutorial I–XI (also fixed stray ◎ → ⚒ in ch. VIII)
- [x] (1) DELIVERED for vote: design-lab.html "RAIL v2" tab — R1 Chip Tiles (payload on tile),
      R2 Hover Ghost (full card floats on hover), R3 Ribbon Rail (one row per card, ledger read)
- [ ] (5) answered in chat: ★ vs ✦ analysis (permanent vs turn-scoped BASE) — awaiting merge/keep decision
- [x] Suites re-run green: cardaudit 455/0, tut, contract

## Round 13 — Sparks (✦) deleted; one star; honest meter (A+C) — SHIPPED
User: two star-like currencies too confusing; meter math didn't visibly sum. Approved plan: fold ✦ into ★.
- [x] Fold: every def's on-play aether merged into printed glory 1:1 (value-neutral, 22 defs);
      syn fires + Altar burns now strike bonus ★ into the same #t-stars number (state.bonusStars)
- [x] Redesigns: Everember → plain dead-glory relic (3★ from hand, cost 4); Incarnate → addMultPerFire
      (+1× MULT per ⚡ fired this turn, state.synFires); Spark Prism → Glass Prism (addMultPerColor tide .4)
- [x] Meter A+C: `12★ × 3.2 + 5★ ≈ 43★` — hand term renders only when dead metal in hand (grey),
      ≈ appears only when base×mult is fractional, fmtMult now 2-decimals when needed,
      output star + quota + boon line wear the Glory glow; parens/sparks slot deleted
- [x] Tally ceremony: ✦ STRIKE beat deleted — struck ★ pre-loaded in the count, ×MULT slam is the drama
      beat, then "+N ★ FROM HAND" flat beat; resets moved to turn start
- [x] Texts: tutorial IV/VI/IX/X rewritten (Sparks no longer named anywhere), burn copy, dross deadline,
      inspector notes; ✦ demoted to pure ornament (favicon, card backs)
- [x] design-lab RAIL v2 mock data updated to post-fold values (rail vote still pending: R1/R2/R3)
- [x] NEW balance.mjs: per-def fold identity vs frozen r12 table ✓; independent hand-written recompute
      == meter == tally (53=round(15×3.2)+5) ✓; meter terms + ≈ assertions ✓
- [x] Full battery green: balance, cardaudit 455/0, contract, strategy, tension, race, synergy(perFire),
      forge, round3/6/8, tut, boonclick. Fixes en route: race.mjs anim-settle poll, strategy.mjs rack
      assumption (random 3-of-10 rack), synergy kin expectation (+2 struck)

## Round 14 — R3 Ribbon Rail — SHIPPED
User vote: R3. The Bazaar rail is now a ledger — one ribbon per ware:
- [x] .rtile → horizontal ribbon: 34px art thumb · ⚡-marked name · micro payload chips
      (railChipsHTML: ★/MULT/hand-★, ⬤ ❖ ⚒ Draw, Burn/Rest, hand-aura effects) · cost gem + stock
- [x] #mrow single column; unreveal slide from left; sold rows drift to the head (translateY fix
      in slideSoldLeft — was measuring left in a column layout); RELICS seam + Anvil bar unchanged
- [x] Overflow guard in smoke test: no ribbon scrolls, rail has no x-scroll, 11 rows fit
- [x] round6 deadcard check made deterministic (__afGive dross)
- [x] Full battery green: balance, strategy, forge, tension, race, tut, boonclick, contract,
      round3/6/8, synergy, cardaudit 455/0

## Rounds 15+16 — focus clarity, longer runs, one deck view, text pass (multi-agent), high scores, relic cluster — SHIPPED
- [x] (1) ❖ visible everywhere: rail ribbons carry a ❖ marker beside the cost gem; card faces
      wear a "❖ 1" cost pill that pulses red when you can't pay it (.nofocus)
- [x] (2) Tithe curve 1.35 → 1.28; NEW lifespan.mjs bot canary (burn/rest-aware, color-coherent buys)
      — median ~110-130, max 210-350 for a bot that never forges → humans should land ~150-400
- [x] (3) Pile viewer: tabs deleted — one collection view, "YOUR CARDS · 15 · 10 to draw · 5 in discard"
- [x] (4) Multi-agent text pass: copy agent (43 rewrites applied — shorter, mechanics-first, lore nouns
      culled: Reverie/Grimoire/Transmutation/Forge-hand gone, tagline now FEED THE FORGE) + accuracy
      agent (17 findings: "One ⚒ per turn" fixed everywhere, kin/types now say "before it", Relic
      typeline collision on playable cards renamed (Tender/Icon/Hoard), no more phantom "marked line"/
      "VAULT", feast slam shows "N ★ OVER", "Fell on turn N", owned counts include rested cards)
- [x] (5) High scores: localStorage top-10 on the game-over card (glory/turns/rank/date),
      current run highlighted, 👑 NEW BEST RUN celebration
- [x] (r16) Relics: moved OUT of the rail into a compact 3-ribbon cluster beside the hand
      (rail = 8 wares + Anvil); all relics +2 cost; evolveRack() cycles the cheapest relic out on
      every rank-up (verified: everember→trophy); hand fan auto-compresses to never bury the cluster
- [x] Battery green (14 suites incl. new lifespan canary + rack-cycle assertion in forge.mjs)

## Round 17 — relics are permanent upgrades (Balatro jokers) — SHIPPED
Correcting r16's misread: relics are BOUGHT at the Bazaar (back in the rail, RELICS · PERMANENT seam)
but never join the deck — they mount a bench beside the hand and power every turn.
- [x] state.relics bench; buyCard routes rack purchases to the bench (fly-to animation, MOUNTED slam);
      relic slots stock ×1 → SOLD; evolveRack refills sold/cheapest each rank-up, never re-offers owned
- [x] Effects went permanent: relicMult → every tally; dead glory → +N★ every tally (meter's flat term
      = bench + hand dross); handFocus/Gold/Buy → paid every turn at turn start (pulses over the bench);
      handCombo → chain +N always; buysToHand → checks the bench; on-draw grant code in dealCards deleted
- [x] Pricing for 100% uptime: reliquary 6, valeledger 6, everember 7, lodestone 8, embersigil 8,
      trophy 8, chainbrand 8, brokerswrit 9, monument 9, aethercrown 12
- [x] Texts: chips "+1 ❖ / turn", "+4★ / tally"; deadline "Relic — X. Never joins your deck.";
      tutorial VIII rewritten; tally beat flashes bench tiles
- [x] Fixed en route: saveNow's fly-anchor picked up a stray slot.rack reference (replace-all bite)
- [x] __afBench debug handle; balance/strategy/forge updated to bench expectations
- [x] Battery green (14 suites); lifespan canary median 150 ★ — relics-as-jokers strengthened runs

## Round 18 — +10% difficulty, anvil commissions, MULT relics halved — IN VERIFICATION
- [x] (1) TITHE_FOR: turn 1 stays 6; from turn 2 the base is 6.6 (≈+10% every demand)
- [x] (2) Anvil rework — COMMISSIONS: clicking ⚒ FORGE spends the ⚒ now and queues the pair;
      resolveCommissions() runs at the sweep (every card in the piles — no hand mutation ever);
      the ⁂ card tops the deck and arrives in the NEXT HAND. forgeCounts() now counts all zones
      (played/saved included) minus committed pairs; anvil badge shows "N pairs · ⁂k";
      pile-view button states: FORGE 2→1 / FORGE ANOTHER / "⁂ ×k at the sweep" / needs your ⚒;
      edge: copy burned after commissioning → "THE ANVIL FOUND NO PAIR", no crash, no card
- [x] (3) MULT relics halved: Reliquary +.25×, Monument +.5×, Aethercrown +1×
- [x] forge.mjs rewritten for commission timing (verified: ⁂ arrives in next hand, EXACT contract)
- [x] Verified by parallel workflow (8 agents): commission flow 5/5 adversarial checks incl.
      scarcity edge + projection==tally on a commission turn; zero pageerrors
- [x] Workflow caught a REAL bug: stale forge button allowed double-commission of one pair
      (second ⚒ vanished) → forgeCounts guard in forgePair; hammer-click verified (1 commission, buys=1)
- [x] Honest-copy fixes from fresh-eyes: anvil tile now says "pair → ⁂ at the sweep · 1 ⚒"
- [x] round6/round8 modernized (agents caught mid-file failures my tail-checks missed):
      bench passives replace in-hand passives; badge-overlay disclosure replaces hover-reveal
- [x] lifespan band recalibrated to r18 curve (median ~70-130 for the bot); tension was a false flag
- [x] All 14 suites genuinely green line-by-line

## Round 19 — five-lens playtest → improvements → STARGILT rename — SHIPPED (deploy pending auth)
Playtest workflow (5 agents: balance/firstrun/juice/adversary/visual) → 43 findings (8 high).
Implemented slate:
- [x] BALANCE: boon escalation (2+claimed)× → (2+.25·claimed)× (2/2.25/2.5 — was outrunning every engine,
      5/70 later hits); Mercy RE-ARMS at each rank-up (variance deaths → walls); HIRE THE SMITH —
      +1 ⚒ this turn for 8⬤, price doubles per run (gold sink; big-money viable)
- [x] BUGS: takeInstOf searches the Cooling Rack (⚒-eater fixed); inspector PLAY disarmed during
      burn/rest prompts (was silently destroying cards); dross note order (slag before dead);
      END TURN refuses during prompts ("RESOLVE THIS FIRST" — was silent limbo); Escape closes burn bar
- [x] JUICE: rush armed from frame one + "▸▸ CLICK TO HURRY" label + rushable tail/sweep;
      tally peak reordered — relics feed the pot FIRST, crown slam shows the TRUE total with ≈ honesty
      + AudioFX.power (was dead asset); bench relics attributed in the mult ticker; floats use fmtMult;
      boon claim flies the card to the deck (power chord, audible decline, table dims, title pops);
      NEVER AGAIN gets a 66Hz sub-drop + music duck; music dies with you at game over; rank-up trimmed
- [x] VISUAL: Anvil + Smith sticky at rail's foot (visible at 1280×800); #app capped 1920px;
      fan raised 26px (⚡ feet unclipped); type floors up; broke-tile contrast; build stamp unclipped
- [x] COPY: Glory-never-spent + MULT sources + ♥ pip (Ch X); reshuffle + Altar-is-a-card (IX);
      dross in the formula (VI); ghost=total (III); ≈ explained (XI)
- [x] RENAME: StarGilt (title/brand/intro/logs/favicon ⭐); Aetherforge Incarnate → Forge Incarnate;
      BUILD stargilt-r19
- [x] Verified: 14-suite battery green (full-output scan, not tails); Smith (+2 hires: buys 3, 8→16→32);
      Mercy return on rank-up; anvil+smith visible at 800px height
- [x] Deploy scaffolding: server.js (no-dep static, traversal-safe) + package.json + .railwayignore
- [x] DEPLOYED: https://stargilt-production.up.railway.app (project stargilt, boot-verified in a real browser)

## Round 20 — playtester feedback #1 — SHIPPED (deploying)
- [x] (1) "PRESS ? ANYTIME" slam removed
- [x] (2) Stage zoom: played cards scale up to 1.3× and sigil circle to 52vh on tall screens
- [x] (3) Engine fuel: Emberwright (4⬤, +2❖ +1 card — a true Village), Gildhall Library (5⬤, free Draw 2
      — a Laboratory), Cinder Choir nets +1 ❖ now; every kingdom guarantees a draw source
- [x] (4) Burning eased: the Ashen Altar is free to play (cantrip), and the pyre reaches your whole
      collection — during the burn prompt, open any pile and every owned group grows a
      "🔥 BURN · +★ N" button (burnFromPiles via takeInstOf); bar copy teaches it
- [x] (5) The DEEP tier: 4 mythic wares (Gilt Colossus 12, Tithe Eternal 12, Starwright 13,
      The Second Sun 14) that never seed the opening kingdom — they cycle in via rank-up evolves
      and boons from rank 2 (~240★), giving 1000+ runs real wares to buy
- [x] Verified: pile-burn E2E (+2★ from a deck Dross, prompt resolves), altar costs no ❖,
      deep tier arrives at rank 2, zoomed stage screenshot; 14-suite battery green (full-output scan)

## Round 21 (v23) — THE THREE TRIALS + usability + de-emoji — LOCALHOST ONLY (user tests before deploy)
- [x] Trials: fresh players get a 3-stage playable ladder (sg-trial in localStorage; af-tutor-off
      veterans auto-graduate). I LIGHT IT (3 wares, no ❖/relics/anvil/boons, curve 5·1.18^t, goal 50★) →
      II STOKE IT (6 wares incl Altar+Emberwright, boons+anvil, 2 dross, 6·1.22^t, goal 150★) →
      III FEED IT (full game, goal 300★ → "You Are Forged"). Victory preempts the judgment (crossing
      the goal can never kill you); trial deaths retry gently, no scoreboard; trial III death graduates
- [x] Coach (trials I–II): one bobbing chip + glow on the single next action — PLAY → FORGE A PAIR →
      BUY → END TURN; burn prompt points at the grey; rest prompt at SKIP. Hooked into
      updatePlayable/updateAfford. Grimoire no longer auto-opens (? only)
- [x] Trial chrome: intro card (name + 3 icon-words + goal + BEGIN), SKIP THE TRIALS always visible,
      glory counter doubles as TRIAL progress bar (TRIAL I · 12/50 ★)
- [x] Usability: boon cards now full-size 164×230 (+50% area) with dimmed table; field cards +10%
      (.72→.79 base); bazaar ribbons 56px, icons 38px, names .84rem, chips 10.5px, cost gem 22px,
      alternating row tint; ⚡ moved from name prefix to a payload chip
- [x] De-emoji: SVG magnifier/eye/flame/note replace 🔍👁🔥♪; ⭐→★, 👑→styled text; favicon = drawn star path
- [x] Tests: 23 suites got sg-trial=done boots; tut.mjs rewritten (fresh→trial intro, ?→grimoire,
      graduate boot); NEW trials.mjs (plays Trial I to victory, gates, advancement, skip);
      full 15-suite battery green
- [ ] Deploy on user approval: `railway up --detach --service stargilt`

## Round 27 — Progression / win-condition DESIGN LAB (prototypes only, game untouched)
The full game is endless-until-death — no "you won" (only `trialVictory` inside the tutorial trials; top rank
@30000 is a non-terminal cap). Built `progression-lab.html` (root, beside design-lab.html; served at
/progression-lab.html) — a theme-exact, interactive prototype of FOUR win-condition strategies so the user can
pick a direction before any game change:
- A · The Final Contract — fixed 8-commission ladder, beat the 8th (Balatro Ante-8 analog). Survive-the-summit.
- B · Rank Ascension — the RANKS ladder becomes the goal; top title repointed to "STAR-GILT". Cumulative ★.
- C · Chapters + Boss Commissions — chapters end in twist-laden boss demands; final boss = win. Most build.
- D · The Grand Commission — one bar to N total ★ (~400); simplest MVP, one line beside the judgment (3719-3725).
All keep an Endless mode after the win. Each panel reuses the real theme + a ported FX kit (canvas burst /
slamText / flashWash / rays / WebAudio) and fires the game's victory ceremony (mirrors `trialVictory`).
Verified: progshots.mjs — A/B/C(+boss)/D tabs + the "You Are Forged" victory, ERRORS none. Recommendation in
the lab: ship D as MVP, or A (+C's twists) for the fullest Balatro feel, B as the identity play.
NEXT: user picks a strategy → implement it in index.html (win test at the judgment, `runVictory()` reusing
#gameover/rankUpOverlay, HUD element, Endless toggle, `run_won` telemetry) + battery + deploy on request.
Game itself unchanged — still v28 live.

## Round 26 (v28) — Player analytics backend + admin console, AND menu beautification — DEPLOYED
Two independent tracks this round, kept separate to avoid two writers on index.html (no git → no worktree isolation):
a background agent owned the menu look while the main thread built the analytics stack (server/admin/tests), then
layered the small telemetry hooks into index.html once the menu agent was done.

### A. Player analytics (net-new backend — the game was 100% client-side before)
- [x] Extended the dependency-free `server.js` (still raw Node http) with a telemetry API + admin API +
      `/admin` serving, in front of the existing static fallback. Blocklist stops serving server-side source.
- [x] Store abstraction `store.js` (zero-dep): **JSON files** when DATA_DIR is set (prod: Railway volume at /data —
      events.jsonl + labels.json + geo.json, write-then-rename), else **in-memory** (dev/tests). Identical async
      interface, so `aggregate.js` (pure) runs the same both ways. (User rejected Postgres to avoid DB cost → pg
      dependency dropped, server back to zero deps. filestore.mjs proves data survives a server restart.)
- [x] `aggregate.js` (pure): groups events by canonical (merged) person; computes unique players, games, trials,
      playtime (session_end sum, capped 2h/segment), furthest reach (just-looked / Trial N ✓ / graduated / full),
      best glory+rank, and soft-identity **match suggestions** (shared name/IP/fingerprint/location/UA, weighted).
- [x] Admin auth: `SG_ADMIN_KEY` passphrase, constant-time (sha256+timingSafeEqual) compare; 503 if unset
      (never silently open), 401 on bad key. Ingest `/api/t` is unauthenticated by design (public players, no login).
- [x] Client telemetry in index.html: stable per-browser `sg-cid` (crypto.randomUUID in localStorage) + a
      `Telemetry` beacon module (sendBeacon → /api/t). 8 hooks: session_start, name_set, game_start,
      trial_won, graduated, game_over, trial_death, session_end (on pagehide). Soft-ids: name, screen, dpr, tz,
      lang, referrer; server stamps ts/ip/ua; geo via free ip-api.com (cached, GEO_OFF to disable).
      **Gated OFF on localhost:5713 + file://** so the game test battery never emits beacons.
- [x] `admin.html`: themed console (Fraunces/Alegreya Sans, gold, .hs-row tables, .ne-card gate) — passphrase
      gate, overview strip, sortable players table with furthest-reach badges, and a detail drawer with all
      soft-ids, run timeline, and "possibly the same person" merge suggestions (+ unmerge). Multiplayer answer:
      per-browser sg-cid is the key; merge folds a person's aliases together, with a caveat that travel/2nd
      computer defeats matching. Data is per-client until the admin merges — no shared login.
- [x] Verified: `apitest.mjs` (30/30 — ingest validation, 401/503 auth, aggregation, name-match, label/merge/
      unmerge, source-file block); `analytics.mjs` browser E2E (real game emits beacons, sg-cid persists across
      reload, 2 sessions/2 games/playtime, no page errors); admin screenshots (overview + detail w/ HIGH match).
- [x] DEPLOYED (user chose JSON over paid Postgres): created Railway volume `stargilt-volume` at /data, set
      DATA_DIR=/data + SG_ADMIN_KEY, `railway up --detach --service stargilt`. Prod smoke green: v28 live, /admin
      gated (401 without key, 200 with), a POSTed beacon wrote through to the volume and showed in the summary.
      One labeled "deploy smoke (ignore)" record seeded during the smoke test lives on the volume (no delete UI yet
      — a `POST /api/admin/forget {cid}` + drawer button is the obvious next add). Admin: /admin on the live URL.

### B. Start-menu beautification (separate background agent)
- [x] Removed the four `.sm-sub` "AI-filler" subtitles; clean single-word items. Locked PLAY keeps dashed+dimmed
      treatment + shake, now with a small inline-SVG padlock (no emoji) that vanishes on unlock; aria kept.
- [x] Forge background graphics scoped to #startmenu (self-contained CSS/SVG): rising forge-fire glow, wordmark
      heat-halo, drifting CSS embers, an anvil silhouette; paused when menu hidden; calmed under prefers-reduced-motion.
- [x] Menu tune: reuse the Music ember-groove, ignited on first pointer/keydown gesture (no autoplay), fades in,
      honors saved volume/mute, carries seamlessly into the game.
- [x] Verified: menuflow (noSubs=true, lockShown=true), menuflow2, cardaudit(515), namescore, NEW menumusic.mjs;
      before/after screenshots. BUILD='v28 · 2026-07-09'.
- [x] Full combined battery green: smoke/contract/balance/strategy/race/tension/synergy/forge/lifespan/round3/6/8/
      boonclick/tut/follow3/trials + menu suites — all ERRORS none, all EXACT, cardaudit zero overflow.

## Round 25 (v27) — HUD declutter + name entry + graceful audio — DEPLOYED
Five playtest asks after the menu round. Named-honor-roll needs a per-player identity; the "multiple
simultaneous players" ask resolves to per-tab sessionStorage isolation (no shared backend).
- [x] Mercy honesty: the heart no longer slams "NEVER AGAIN" — it now reads "RANK UP TO RE-ARM",
      because mercy is re-armed on ascension, so the old text lied.
- [x] HUD declutter: removed the round `?` (grimoire) and music-note (mute) buttons from #hudright —
      both live in the in-game menu now (GRIMOIRE + SOUND SETTINGS). HUD is just ☰ MENU + END TURN.
      Also removed the now-orphaned #mixer popover HTML/CSS/IIFE (sound moved to the menu in v26);
      AudioFX.loadVol() still restores saved volumes on boot; setMuted() made null-safe.
- [x] Graceful audio: Music.fadeOut(sec) ramps the whole mix to silence via linearRampToValueAtTime
      instead of a hard cut. Wired into trialVictory (2.5s), gameOverSequence (2.2s), openFarewell (2.5s)
      — so finishing a tutorial fades the music out over 2–3s rather than stopping dead.
- [x] Name entry: a real game (not a trial) asks the player's name once — #nameentry overlay (z330,
      "Name Yourself, Smith" + ENTER THE FORGE), gated in boot() by `!inTrial() && !hasSessionName()`.
      Input is sanitized (strip <>, trim, 18 chars, "Nameless Smith" fallback) and escHTML'd into the
      honor roll. recordScore() and the live scoreboard row now carry `n:playerName()`.
- [x] Multiple simultaneous players: the active name is per-tab sessionStorage['sg-name'] (localStorage
      copy is only a pre-fill), so two tabs / browsers keep independent identities with no server state.
- [x] Verified: full battery green (smoke shows v27, smith=false; contract/balance/synergy/forge all
      EXACT; cardaudit 515 renders zero overflow; lifespan in band; menuflow/menuflow2/tut/follow3/
      trials/round3/6/8/boonclick ERRORS none). NEW namescore.mjs — name flow, <>-injection stripped,
      score-carries-name, multi-tab isolation (Alice≠Bob), trials-skip-name — all pass. Fixed stale
      removed-element refs in round8/tut/inspect-shots (#mute/#helpbtn → in-game menu). 5 screenshots
      (named honor roll, name-entry card, slim HUD, game menu, sound view).
- [x] DEPLOYED to Railway (`railway up --detach --service stargilt`). Production smoke green:
      v27 boots, hand=5, #helpbtn/#mute/#mixer gone, name-entry present, ERRORS none.
      BUILD='v27 · 2026-07-09'. Live: https://stargilt-production.up.railway.app

## Round 24 (v26) — MENUS: start screen + in-game pause — LOCALHOST ONLY
Recon (7-agent workflow) mapped boot/trials/HUD/grimoire/sound/highscore/overlays. Key seam: TRIAL & state
are parse-time singletons, so every mode change is a localStorage write + location.reload(); the vestigial
`af-restart` sessionStorage flag became the cold-vs-continuation signal.
- [x] START MENU (#startmenu, z320, opaque title screen): LEARN / PLAY / HIGHSCORE / QUIT. Shown on cold
      load only (boot reads coldStart = !sessionStorage['af-restart']); NEXT TRIAL / TRY AGAIN / RESTART /
      mode-switch reloads set af-restart and bypass it.
- [x] PLAY gate: locked until `sg-learned==='1'`, set ONLY on a genuine Trial III win (advanceTrial when
      stage>=3). Removed the skip escape (#ti-skip, #trialskip, skipTrials) AND the "Trial III death
      graduates" line — deaths now replay. Grandfather migration flips sg-learned for anyone already 'done'
      under the old build so existing players aren't locked out. Locked PLAY shakes + "finish LEARN to unlock".
- [x] LEARN: resumes the current trial if mid-trials, else writes sg-trial='1' + reload to start fresh.
      HIGHSCORE: honor-roll screen reusing loadScores()/scoreboardHTML() (empty-state handled). QUIT:
      farewell screen (tries window.close(), else stands) with a back-to-menu link.
- [x] Grimoire confirmed opt-in only (no auto-open; verified). Now reachable from ? AND the in-game menu.
- [x] IN-GAME MENU (#menubtn ☰ in #hudright → #gamemenu modal, z280): RESUME, SOUND SETTINGS (gold sliders
      wired to AudioFX.setVol/setMuted, re-synced each open), GRIMOIRE, RESTART + QUIT TO MENU as
      hold-to-confirm. Backdrop-click + ESC close (ESC first-priority over the inspect/pileview/boon chain).
- [x] holdConfirm(btn,ms,fn): a gold fill sweeps 0→100% over 900ms via rAF; release/leave/cancel aborts and
      resets; fires once. RESTART → af-restart+reload (fresh run, no menu); QUIT → reload without af-restart
      (→ start menu). Not routed through pressable() (which fires on pointerdown).
- [x] Verified: full 15-suite battery green (menu bypassed via af-restart in test setup; trials.mjs skip
      test replaced with a gate assertion). New menuflow.mjs + menuflow2.mjs cover: menu on cold load,
      PLAY-lock, LEARN→Trial I (no skip), PLAY→full game, in-game menu open/sound/grimoire, hold-cancel at
      ~28%, hold-quit→menu, hold-restart→fresh, QUIT→farewell, HIGHSCORE full+empty. 7 screenshots (A–G).
      BUILD='v26 · 2026-07-09'. NOT deployed.
- [x] Adversarial review (18-agent find→verify workflow) confirmed 4 real issues (rest refuted, incl.
      "unbeatable Trial III" = intended must-finish design). All 4 FIXED + re-verified:
      (1) medium — start-menu clicks were dead for ~1–2s on cold load (_smResolve assigned only after boot's
          font/reveal awaits); the choice promise is now created the instant the menu is interactive so an
          early PLAY/LEARN click is captured (new EARLY-CLICK test at 250ms passes).
      (2) medium — multi-touch double pointerdown on a hold button spawned an orphan rAF firing reload with
          no finger held; guarded with `||raf` so only one loop runs.
      (3) low — HUD #mixer sliders went stale after a pause-menu volume change; the popover now re-reads
          AudioFX.vol on open.
      (4) nit — Coach idle-escalation ran behind the open pause menu and ESC-close didn't reset it; idleCheck
          freezes while #gamemenu is open and closeGameMenu() calls Coach.wake().
- [ ] Deploy on user approval: `railway up --detach --service stargilt`

## Round 23 (v25) — ONBOARDING REFINEMENT (11 tester items) — LOCALHOST ONLY
Exploration confirmed the key mechanic: Emberling/Emberhound have an ember-kin syn (+1★ × ember cards
already played), so enablers-first / payoff-last is genuinely optimal; Coins are aurel (safe to merge),
embers are kin fuel (never burn). Pile-view burn buttons appeared on EVERY card — a trap.
- [x] (6) Removed the Smith entirely — tile, updateSmith, smithCost, coach HIRE cue, CSS, smithOn from
      all trials + full-game default, Trial III icon → 'GROW MULT'. Economy unaffected (base buys +
      gains.buy cards + Broker's Writ). trials.mjs updated (noSmith assertions).
- [x] (1) Removed the '▸▸ CLICK TO HURRY' relabel — the tally still fast-forwards silently on any press.
- [x] (10) Reverted one-tap trial buy: clicking a bazaar tile always opens the inspector; buying is its
      BUY button (coach follows in and glows #insp-action).
- [x] (5) Replaced the magnifier badge with a peeled page-corner .dogear on hand cards (pressable →
      inspect); removed ICONS.magnifier.
- [x] (2,3,7,9) Smarter coach: Coach.nextPlay() holds ember-kin payoffs until same-tribe enablers are
      played (so the ⚡ chain fires biggest); prescriptive card-named labels on turns 1–2
      ("PLAY SPARK FIRST" / "PLAY ALTAR FIRST" / "PLAY EMBERHOUND ⚡" / "BUY EMBERLING" / "MERGE COINS"),
      directional after ("PLAY YOUR CARDS" / "BUY A CARD"). Burn only ever targets dross (trials render
      burn buttons on slag only); forge steers to Coins via data-id, never ember/spark kin fuel.
- [x] (8) Interleave: teach the forge once (Coach.taught.forge, set in forgePair), then prioritize BUY
      over FORGE — verified follow3 Trial II buys 12× AND forges 4×.
- [x] (4) BOTH concept-teaching modes: enriched trial intro card (a one-line gloss per new concept) +
      #coachnote in-the-moment banners fired once per concept (FOCUS on first lock, BURN on altar,
      FORGE on first coin-merge cue, BOON on first offer).
- [x] (11) Buying a relic shows a plain-language banner (relicEffectText, e.g. "LEDGER OF THE VALE —
      +1 ⬤ every turn · never joins your deck") — works in trials and the full game.
- [x] (2/14) Seeded Trial I opening hand [emberling, spark, spark] so the chain lesson always has material.
- [x] Verified: 15-suite battery green (full-output); follow3 glow-follower clears Trial I (61★, synFires=1)
      AND Trial II (170★, buy 12 + forge 4 + burn 1 + boon 3), zero stalls; inspector-follow glows
      insp-action; cardaudit 515 zero-overflow with dog-ear + callout; screenshots A–F. Lifespan median
      drifted 121→173★ (turns 7–10) from removing the Smith's extra buys — canary band still passes.
      BUILD='v25 · 2026-07-08'. NOT deployed.
- [ ] Deploy on user approval: `railway up --detach --service stargilt`

## Round 22 (v24) — WORDLESS ONBOARDING v2 — LOCALHOST ONLY (user tests before deploy)
Driven by a 4-lens blind-beginner playtest (workflow). Root cause all four hit: the Coach's
"one glowing next action" contract broke the instant an action lived in a modal, spanned two
clicks, or wasn't a PLAY — a pure glow-follower froze 75 iterations at the first BUY.
- [x] Coach follows into every modal: decide() gained branches (above the busy guard, so the boon
      — which opens mid-sweep with busy=true — gets a live pointer) for #inspect (BUY/PLAY at
      #insp-action), #pileview (FORGE/BURN at the right button), #boon (TAKE ONE), else CLOSE.
      openInspect/openPileView/offerBoon + their closers now Coach.tick()
- [x] Trial BUY is one tap: an affordable market tile in a trial calls buyCard directly (same
      gesture as PLAY); unaffordable tiles / veterans still open the inspector. Gold spend floats −N⬤
- [x] BURN THE GREY guaranteed: Trial II opening hand is scripted (seed=[altar,dross,emberhound,
      emberwright], dross 2→1 so total stays 2) — play altar turn 1 → burn the grey beside it. The
      burn cue never mislabels SKIP: grey in hand→BURN, else grey in piles→OPEN PILES, else NOTHING TO BURN
- [x] SPEND ❖ demonstrated: the two seeded focus cards teach scarcity — play one (❖1→0, floats −1❖),
      the second wears a "❖ 0" lock badge (trial-scoped) + dims; coach skips it to the free card
- [x] Coach extends into Trial III, first-use only: MOUNT the first affordable relic, HIRE the first
      Smith, then falls silent for everything taught in I–II (firstUse flags flip on buy/hire)
- [x] Per-play ★ feedback: each landed card flies a +N★ ghost into the meter and pops it; the meter
      now ticks when the card LANDS (moved out of playCard into impact); the goal pill fills live
      toward the projected landing instead of sitting frozen at 0
- [x] Idle escalation ladder: no input ~4.5s → chip grows (t1); ~9s → a ghost-tap ripple demos the
      click (t2); any pointerdown resets it
- [x] Climb reads as progress: meter fill recolored warm-ember→gold (was alarm-red); "N ★ TO GO"
      while climbing, red "SHORT" only on a real tally shortfall; gate-cleared beat adds a shimmer
- [x] Glow legibility: chip side-anchors beside short rail tiles (never floats over a neighbour row);
      .coach-glow gained a distinct animated outline; forge nag excludes coin/spark starter economy
- [x] Bug found + fixed via glow-follower: resolveBurn/resolveSave didn't re-tick the coach, so
      skipping an empty burn froze the glow on the skip button forever (bot looped 200+); renderPileView
      now re-ticks after a forge re-render replaces the glowed button
- [x] Verified: 15-suite battery green (contract/cardaudit-515/trials/tut/balance/strategy/tension/
      race/synergy/forge/round3/6/8/boonclick/lifespan); NEW follow3.mjs — a PURE glow-follower clears
      Trial I (63★) AND Trial II (211★) with ZERO stalls, buy/burn/forge/boon all glow-reachable;
      screenshots A–E confirm the scripted hand, burn cue, focus lock, ember meter, boon coach.
      Fixed 2 stale suites (boonclick entry flow, round8 removed-behavior assertion) + 20 files' broken
      localStorage arrow-fn patch. BUILD='v24 · 2026-07-08'
- [ ] Deploy on user approval: `railway up --detach --service stargilt`

## Round 29: Chapters v0.2 — real tension + bosses as a concept (SAFE FORK, not deployed)
After the user PLAYED v0.1: "too easy and too short", bosses illegible, twists could fire as non-events. Redesigned in
`chapters.html` per the approved plan. Design locked: 12 acts × 6 turns (72), +30% harder, EVERY turn a climbing gate,
bosses = the twelve **Aspects of the Forge** (named trials, not rivals).
- [x] Demand is now a FORMULA (not a table): HARD=1.30, DEMAND_BASE=8, ACT_GROWTH=1.52, TURN_GROWTH=1.13 behind the single
      TITHE_FOR chokepoint. Verified curve climbs every build turn and spikes each boss: act 1 build 10→17 / boss 25 …
      act 12 build 1041→1697 / Masterwork 3394 (340× total). endlessDemand continues from the Masterwork (no TITHE_BASE cliff).
- [x] 12 authored Aspects (`BOSSES[1..12]`): each is name+epithet+sigil+color+tag+demandMult+gimmick. demandMult is the
      SINGLE boss-spike owner. Every gimmick guaranteed to bite (hooks an always-present term or ships its own substrate —
      drossSeed/comboSeed). No-dud probe: all score-modifier bosses (VI–XII) move the score; pure-demand walls (I–V) bite via ×demandMult.
- [x] computeScore extended: allStarMult, multDamp, xMult (clamped at X_CAP=16 — verified 125×2 stack clamps to 16),
      flatStarSwing (drainFrac skim), handStars (flat base★ inside the mult), negative focus/draw floored at max(1,…).
- [x] Boss presentation: click-required #bossintro slam (sigil medallion + clause ledger ▲gift/▼bite/◆demand), board recolor
      (body.boss-turn + --boss-c, tithe label → the Aspect's name), live boss HUD (#bb-live gimmick readout), shatter defeat beat.
      Two-tier chapter map (Act ribbon I–XII + current 6-turn strip + boss counter). Verified all 12 fire in a full 72-turn run.
- [x] Master-Relic economy for 11 drafts: 21 defs across 3 tiers; LINEAR relics stack (reduce over state.relics), 3 xMult
      CAPSTONES unique+late-gated; masterOffer tiers by bossesCleared, guarantees a focus relic in the first draft. Bench filled 0→11.
- [x] Baseline focus grows with rank (2/3/4 at ranks 3/6/9) so a long hand is always reachable. Boon retune 2×→1.6× base.
- [x] Focus-cost card EDGE (occlusion fix, user ask): focus-cost cards wear a bright amber-ember ring (`.needsfocus`
      .cardface::before) — luminance-contrasting so it reads on red Ember art too — plus the kept ❖ corner tag. Free
      treasures/cantrips stay bare. Verified: coin bare, Emberhound/Wolf/Phoenix ringed.
- [x] Full test battery PASS: 72-turn flow (all 12 bosses fire+recolor+HUD+defeat, 11 drafts mount, Masterwork WINS→Endless
      keeps climbing), no-dud (12/12), xMult cap, cardaudit (735 renders, zero overflow), ch-namespace clean, zero errors.
      BUILD='chapters-C · v0.1' (fork label unchanged). index.html/server.js untouched.
- [ ] DIFFICULTY FEEL: awaits the user's playtest (as v0.1→v0.2 did). Automated `req` data shows a mid-game crucible at
      Act 9 (Hollow Forge ×½ mult) then engine-payoff late; absolute difficulty needs a real hand, not the test's clear-cheat.
- [ ] Fold validated system back into index.html + deploy — separate round, on request.

## Round 30: Chapters v0.3 — 19-item playtest response (SAFE FORK, not deployed)
User played v0.2 and returned 19 verdicts. Four decisions locked via questions: Verdant=MULT / Umbra=Forge; played→small
stack + relics→icon badges; always-peek hand fan; **keep the demand, fix the tools** (don't lower boss demand — strengthen
engine-building). All in `chapters.html`. BUILD unchanged label; `index.html` byte-unchanged.
- [x] WS1 — **8 acts × 6 (48 turns)**, was 12×6 (#19). Kept the demand formula; masterTierFor retuned so the 3 xMult
      capstones stay reachable over 7 drafts. **Boon spam killed** (#1): shared `BOON_MULT=2.4+.2·claims` (was 1.6) → boons
      fired 0× in a full headless run.
- [x] WS2 — bosses legible (#3/#8/#9): re-authored 8 Aspects, each with a CLEAR one-line mechanic (boss 1 no longer a
      no-op wall). `bossLedger`/`live` rewritten to plain sentences ("Reach 24 ★ this turn — 40% more than a normal turn").
      Boss board-recolor scoped to CHROME only — card ★ chips stay gold (verified across all 8 boss turns).
- [x] WS3 — heart → **Emberheart Charm** (#4): removed the free auto-heart (#mercypip + re-arm paths gone); added a
      buyable, stackable, always-on-offer relic with `mercyCharge` that CRUMBLES to forgive one miss (first relic to ever
      leave the bench). Verified: consumes exactly one, forgives, run continues; none left → game over.
- [x] WS4 — forge depth (#6/#10/#12): `forgedDefOf` now L1→L2→L3 (⁂ / ⁂⁂), tier-2 pairs forgeable; forging costs gold
      (2 for L2, **2× = 4** for L3) on top of the ⚒ action; forged cards cost +3/tier (#13). End-Turn shows a ring when the
      last ⚒ is spent (`buys===0`).
- [x] WS5 — color swap (#16): **Verdant = MULT** (Bloom +.3×/colour early on-ramp, Grove Warden +.2×/chain, Compound
      +.5×/colour, Colossus comboX2, Wolf +1×/⚡, Worldtree multDouble); **Umbra = Forge/ramp** (focus/buys/gold, kin-Umbra
      scaling on gravekey/broker/resonator). Ember/Tide/Aurel unchanged.
- [x] WS6 — fix tools (#5/#7/#11b/#13/#17): +1-draw buyable relic (Tidecaller's Lens) + stronger high-cost relics (Furnace
      Heart ×1.5 MULT, Bellows Engine focus+draw); late Bazaar stocks ⁂ upgrades at rank≥3 and cycles 2 piles/rank at rank≥4
      so turn-25+ keeps pulling; Boons hand ⁂ upgrades + rarer wildcards as rank climbs.
- [x] WS7 — layout (#2/#14/#15/#18): burn button = its own dark-ember control (fixes red-on-yellow); **always-peek hand
      fan** (spacing floored ~79px, near-straight when big — every card's name/★/❖ strip reads, verified 12-card hand);
      deck-view scales via dense/vdense zoom (49 cards / 31 distinct fit in 3 rows, no scroll); played cards → compact
      bounded cluster + "PLAYED ×N", relics → compact icon-badge grid (no more tall column colliding with played cards).
- [x] WS8 — headless battery PASS: 48-turn flow (all 8 bosses fire+recolor+plain ledger+defeat, drafts mount, Masterwork
      WINS→Endless), recolor-stays-gold, mercy-consume, forge L1/L2/L3, colour kits, cardaudit **800 renders 0 overflow**
      (incl ⁂/⁂⁂ + new cards/relics), boons 0×, ch-namespaced, zero errors. Screenshots captured.
- [ ] AWAITS PLAYTEST: difficulty *degree* ("keep demand, fix tools" — bosses should now fall to a built engine; tune from
      feel), forge gold cost, boon threshold, and one minor flag — a very wide hand can sit near the bottom-right relic
      badges (hand renders on top; normal 5–8-card hands don't reach them).

## Round 31: Chapters v0.4 — tame the MULT, distinct colours, ship prep (SAFE FORK, not yet deployed)
17-item playtest response. Root problem: MULT exploded (×127) because the additive bucket was uncapped. Locked decisions:
fresh-start on go-live (keep ch- keys, telemetry back ON); Meet-Boss-Now reward = better spoils (4-card draft + gold).
- [x] WS-A — **capped the MULT**: `mult = min(MULT_CAP 7, add) × min(X_CAP 4, x)` (X_CAP was 16). multDouble ×2→flat +3,
      comboX2 double→.12×, and halved every stacking relicMult/handCombo/emberBloom + cut the per-card MULT syns. Verified: a
      degenerate stack clamps at exactly 28 (was ×127+).
- [x] WS-B — **bosses are pure bites**: removed every booster (★×2, +focus/+draw, ×MULT gift, dross×3). 8 Aspects each = one
      clear bite + demandMult. Replaced the dross-clog Ashen Fast with The Guttering (chain=0).
- [x] WS-C — **forge combines both copies**: forgedDefOf doubles every effect (glory/gains/syn.m/relicMult ×2; xMult adds
      bonuses). Two +0.5× → one +1×. Capped by WS-A.
- [x] WS-D — **impressive cards cost 2 ❖** (`focusCostOf`: rare/mythic or cost≥6 → 2, else 1, free-play 0); wired through
      play/simulate/lock/tooltip/card-tag.
- [x] WS-E — **colours distinct**: removed draw from all Ember cards (warren/emberwright/zealot/secondsun) → Tide is the only
      draw colour.
- [x] WS-F — **Meet Boss Now**: "⚔ FACE THE BOSS" button on build turns leaps to the boss (unchanged), banks skipBonus; the
      clear pays a **4-card draft + 4 gold/turn skipped**. Verified: turn 4→6, skipBonus 2, 4-card draft, +8 gold.
- [x] WS-G — Rest feature fully removed (coolingrack + savebar + saveMode surface); End-Turn clears all pulses on click;
      Emberheart & all relics read their real effect (mercyCharge text in 4 generators); Bazaar = 7 cards kept cost-sorted
      (resortMarketRail after sell/evolve); hand raised ~54px + big hands fan UP (bottoms stay on-screen); focus/forge reset
      confirmed already correct.
- [x] WS-H — deck view sorts by **colour → value → cost** (clean colour runs) with **hover-zoom** (any tile pops full-size);
      zoom tiers by total count.
- [x] WS-I — **rebalanced demand to the capped engine**: HARD 1.30→1.00, DEMAND_BASE 8→6, ACT_GROWTH 1.52→1.42. Curve now
      boss1=13 … boss8=216 (was 604). Full 48-turn flow wins, 8 bosses, cardaudit 785 renders 0 overflow, no errors. FINAL
      feel-tuning is the user's playtest (the crude bot can't see forging/free-cards).
- [ ] WS-J — PROMOTE + DEPLOY (gated on user go-ahead): telemetry ON + BUILD tag, overwrite index.html with the chapters
      game, update CONTEXT.md, `railway up --detach --service stargilt`. Not yet run (overwrites the live game).

## Round 32 — v0.5 (from real /admin play data + design screenshots)
- [x] R1 — **card cropping fixed + design review**. Hand fan raised (base offset 54→84, arc coeff 7→4): bottom clearance
      20px→59px, no card clips the viewport edge at rest or on hover. Pile-view hover-zoom reworked: scale the WHOLE
      `.pv-slot` as one unit (was scaling only `.cardo`, so the FORGE row bisected the enlarged card) + generous grid
      padding (52/44px) absorbs the zoom growth inside the overflow clip box → no edge crop. Verified: hand, pile-view
      (top/edge/bottom hovers), inspect popover, market rail — all clean via screenshots.
- [x] R2 — **starter engine cards + focus→1**. Two 0-glory cantrip starters (full game only, cost 0 so never in market):
      Tidewake (Draw 2, kills draw-variance deaths) + Kindling (+1 ❖, the focus battery). Base focus 2→1
      (focusPerTurn 1+floor(rank/3)); Kindling makes the opening a choice not a straitjacket. Start deck now 14 cards.
- [x] R3 — **impressive draw carries Dross**. leviathan (Draw 3) gainSlag:1; new Abyssal Archive (tide mythic, Draw 4,
      2 ❖, gainSlag:2, buyable) — activates the burn economy ("I never burn cards"). gainSlag verified: +2 total dross on play.
- [x] R4 — **early boss cliff flattened from data**. Deaths clustered at t4 (draw-starve → fixed by R2) and boss t6
      (67 = 2.1× cliff over t5=32). Early boss demandMults eased 1.5/1.8/2.0/2.2 → 1.3/1.6/1.85/2.1 (boss1 demand 67→58,
      cliff 2.1×→1.8×). Bosses 5-8 unchanged (the "good AND lucky" endgame). Base rate untouched (normal turns already roomy).
- Hygiene: no JS errors; localStorage ch- keys only; index.html untouched (0 chapter refs). Node server on :3000 for /admin.
- NEXT: user re-tests via localhost:3000 → /admin ⚖ Difficulty to see the new curve; then WS-J promote/deploy when it feels right.

## Round 33 — v0.5 hand-forge, relic text, and 3 difficulty variants (A/B/C test)
- [x] (1) Forge-on-hand-hover: hovering a hand card that has a forgeable pair now shows a "⚒ FORGE · N⬤" button
      just below the lifted card (child element, so moving onto it never breaks the card's pointerleave). Mirrors the
      pile-view forge (committed → "⁂ ×N at the sweep"; unaffordable → "needs ⚒/needs N⬤"). Verified via screenshot.
- [x] (2) Removed "never joins your deck" / "Never joins your deck." from the 3 relic-text generators (deadlineHTML,
      relicEffectText, mercyCharge line) — it read like a tutorial. (Lone remaining match is a dev code comment.)
- [x] (3) Difficulty too hard again (v0.5 data: deaths cluster t4/t5, players stuck ~15-25 output vs demand 23/32 while
      focus stays 1 until rank 3). Built THREE URL-selectable easier variants, each self-tagging its BUILD for the ⚖ panel:
      - A `?v=a` — lower demand curve (RATE 1.28→1.20): t4 23→19, t5 32→25, boss1 58→42 (eases late too, boss2 314→155).
      - B `?v=b` — faster focus economy (focusPerTurn 1+ceil(rank/2)): 2 ❖ by rank 1 (~t4-5); demand unchanged.
      - C `?v=c` — deeper/longer early grace (6→9 turns, floor .6→.5): t4 23→19, t5 32→26, boss1 58→47; t9+/boss2 unchanged.
      All three boot error-free, tag as v0.5a/b/c, correct demand curves. Default (no param) = A.
- NEXT: user plays a few runs of each URL → /admin ⚖ panel separates v0.5a/b/c → pick the best-feeling easer (or combine).

## Round 34 — v0.6 (9-item batch; difficulty variant C chosen)
- [x] (1) Forge moved OFF the hand → onto the Deck/Anvil zoom: clicking a card in the pile view opens inspect with a
      "⚒ FORGE — N ⬤" action (committed → "⁂ ×N AT THE SWEEP"; unaffordable → needs ⚒/⬤). Hand-hover forge removed.
- [x] (2) Emberheart Charm shatters in PLACE (was spliced out): sets inst.shattered, stays on the bench dimmed+cracked
      (CSS .relicbadge.shattered) so the player sees a running tally of charms spent. Miss-forgiveness & game-over now
      key off `mercyCharge && !shattered`.
- [x] (3) Discard pile moved beside the deck (left:176px, was right:60px) so it never overlaps the right-anchored relic
      bench. Removed the "relics you buy mount here" placeholder text (empty rack shows just the RELICS label).
- [x] (4) Removed the 2 starting Cinder Dross (full-game TRIAL.dross 2→0). Start deck now 12 cards.
- [x] (5)(6) Tidewake & Kindling now score 1★ each (glory 0→1).
- [x] (7) Coin of the Vale → 2 gold. Rebalanced gold-ramp cards to stay ahead: idol/emberhound/broker 1→2,
      caravan/bulwark 2→3, midas 3→4, dragon 4→5. (Watch overall gold abundance in playtest.)
- [x] (8) Sealed Hearth "−1 ❖" now actually bites: focus reset floor 1→0, so base-1 focus drops to 0 (free cards +
      Kindling's +1 ❖ still let you act/recover).
- [x] (9) Difficulty variant C baked in as the default (EARLY_GRACE 6→9, GRACE_FLOOR .6→.5; RATE back to 1.28, focus
      floor(rank/3)). A/B/C URL selector removed. Curve: 7·9·13·19·26 → boss1 47 → 50·69·94; t9+/bosses on full curve.
- BUILD bumped to 'chapters · v0.6'. All verified error-free via screenshots + state checks. index.html untouched.

## Round 35 — v0.6.1 (6-item batch) + PROMOTE & DEPLOY (WS-J done)
- [x] (1) Gold too high → reverted Coin of the Vale 2→1 and the gold-ramp cards to pre-v0.6 (idol/hound/broker 1,
      caravan/bulwark 2, midas 3, dragon 4).
- [x] (2) Net-zero focus cards fixed: Sigil Resonator & Mirrorforge Twin get focusCost:1 (cost 2/give 2 → now net +1 ❖).
- [x] (3) New late burn-engine "The Great Kiln" (ember rare, cost 7, cantrip, burn 1 + Draw 2 + 1 ❖ + 3★). Gated
      `deep:true, afterBoss:2` — Bazaar/Boons stock it only after Boss 2 (added the afterBoss check to evolveMarket + boonOffers).
- [x] (4) Everember (+3★ flat, worthless late) → handStars:3 so it adds BASE ★ multiplied by MULT (scales with the engine).
- [x] (5) Dross visibility: added gainSlag:1 to Storm of Sigils (rare, Draw 2, cost 6) — a mid-tier Dross seed so the
      burn loop appears before the leviathan/abyss mythics. (Dross cards DID exist since v0.5; they were just high-cost.)
- [x] (6) FLATTEN + DEPLOY: A/B/C variants already flattened to C (v0.6). Flipped telemetry OFF→host-based (live on
      Railway, off on file://+localhost:5713). BUILD → 'chapters · v0.6.1'. Overwrote index.html with the chapters game
      (old v28 game archived at scratchpad/index.OLD-stargilt.html). Excluded design-lab/progression-lab from deploy.
      Updated CONTEXT.md. `railway up --detach --service stargilt` → LIVE verified: v0.6.1, telemetry 204, no errors.
- **LIVE**: https://stargilt-production.up.railway.app is now the Chapters game. index.html == chapters.html (keep synced).

## Round 36 — v0.6.8 SHARED honor roll + apex stargilt.com (2026-07-16)
- [x] (1) Server: `POST /api/score` + `GET /api/scores?cid=` beside `/api/t` (unauthenticated like telemetry, outside
      the Mellon gate). Validation: cid required, g/t ints (0≤g≤1e7, 0≤t≤10000), name clamp 24 (default 'Nameless
      Smith'), rank clamp 40, MAX_BODY 8KB, server-side ts/d. `shapeTop()` strips cid/rid/ts and computes a boolean
      `me` per requester — player ids never leave the server.
- [x] (2) Store: `scores.json` on the /data volume (write-then-rename, in-memory twin) via `addScore`/`topScores` —
      kept sorted glory-desc (ties: earlier ts), capped at 100. Dedup: same `rid` replaced only by a higher total.
- [x] (3) Client: `submitScore`/`fetchScores` (fetch, null-on-any-failure, gated on `Telemetry.off`); `finishScores()`
      folds the two duplicated game-over record+render blocks — local board paints instantly (personal-best ceremony
      intact), swaps to "THE HONOR ROLL" global top-10 when the POST answers; `openHiscore()` same render-local-then-
      swap; `rid = Telemetry.sid` so win→Endless-death keeps ONE slot at its peak. BUILD → 'chapters · v0.6.8'.
      index.html == chapters.html (cp, diff-verified).
- [x] (4) Tests green: scorestest.mjs (46 asserts × in-memory + DATA_DIR + restart persistence) and hiscoretest.mjs
      (12 in-browser asserts, chrome-headless-shell, two browser contexts = two cids; :5713 fires zero /api requests).
- [x] (5) DEPLOYED + verified live 2026-07-16: gate → v0.6.8 served, `/api/scores` → `{"top":[]}`, `/api/t` → 204.
- [x] (6) Apex stargilt.com (was: no DNS record at all): proxied placeholder `A → 192.0.2.1` created via CF API.
- [x] (7) Apex redirect rule LIVE (2026-07-16): created via the DASHBOARD (Rules → "Redirect from root to WWW"
      template through the user's Chrome session) after two token rounds failed — neither the rolled DNS token
      (`cfut_…`) nor the account-owned token (`cfat_…`, verify via `/accounts/{id}/tokens/verify`) has
      **Zone → Dynamic URL Redirects → Edit**. Edited the template to `http.host eq "stargilt.com"` → 301
      `concat("https://www.stargilt.com", http.request.uri.path)` + preserve query, because the template's
      `https://stargilt.com/*` wildcard misses plain-http requests. Verified: http + https + deep path + query
      all 301 → www → 200.

## Round 37 — v0.6.9 + v0.7.0: bug fix, § debug, balance, Forge Console (2026-07-16)
- [x] (1) Admin "Furthest" split into TWO stats: **Learn** (skipped/started/Trial N ✓|…/Graduated) and **Game**
      (just looked/started/Act N·turn/Forged ★) — aggregate.js emits learn{graduated,reached,cleared,started} +
      game{runs,won,bestTurn}; table, drawer and new funnels all read them. Tutorial adoption now visible at a glance.
- [x] (2) Pile-view wash-out bug fixed: the recede was keyed to container :hover (`#pv-grid-inner:hover`), which
      includes the gaps and empty row-flanks → pointer at rest there dimmed EVERY card with none popped (and the dim
      stuck after forge re-renders swapped the DOM under a still pointer). Now JS pointerover/out delegation sets
      `.receding` on the grid + `.hot` on the slot — pop and dim always agree; re-render + close clear it.
- [x] (3) § secret debug: the § key opens a panel (keyboard-only since v0.7.1 — corner tap element removed on request) with a copyable JSON dump of exact game state
      (build, run numbers, computeScore, all piles as id arrays, overlays, ch-* localStorage, last 15 errors via an
      early ring buffer that wraps console.error/window error/unhandledrejection). `window.__sgDump()` for tests.
- [x] (4) BALANCE v0.7.0: MULT_CAP 7→15; DEMAND_BASE 13→10.4 (flat −20%); scaling star engines ashfall (+1★/burn),
      hourcrown (+1★×turn), worldanvil (+1★/card played) via new syn kinds starPerBurn/starPerTurn. Math note: demand
      is geometric (t48 boss ≈ 4.5M★) — late acts likely still unreachable without bending DEMAND_RATE; decide from
      the new clear-rate chart.
- [x] (5) FORGE CONSOLE: admin.html rewritten (ui.com discipline × Unity depth, zero-dep SVG) — stat tiles + live
      pill, Learn/Game funnels, demand-vs-score log chart w/ crosshair, clear-rate bars, live event feed
      (`/api/admin/events`, 12s auto-refresh), honor-roll panel, card usage, per-player run sparklines in the drawer
      (`/api/admin/balance?cid=` matches merged persons via buildCanon/personOf). Chart palette validated (dataviz
      six checks) on #130d1d.
- [x] (6) Tests all green: admintest.mjs (18, 3× stable), v069test.mjs (14), baltest.mjs, scorestest.mjs (46),
      hiscoretest.mjs (12). DEPLOYED + verified: prod serves v0.7.0, /admin = Forge Console, /api/scores live
      (real players on the board), apex 301 intact.
- [x] (7) Player drawer → full profile (same day): stat strip (visits/playtime/run counts/tutorial-in-words/seen),
      session history (playerDetail → sessions[] by sid: duration, runs, trials, deaths, deepest turn, build), and
      death locations everywhere — deathWhere(endTurn) → "at ◆ The Molten Vise (Act 3)" or "Act N, build turn M of 6"
      + deathShortfall (how many ★ short the last turn was). admintest.mjs → 23 asserts, drawer screenshot verified.
- [x] (8) Magnitude at a glance (user: "a 3-level run and a 21-level run should LOOK different"): sparklines now a
      FIXED 5.5px/turn (length = depth, all runs directly comparable; fixed 272px holder keeps rows aligned);
      8-cell act meter (▰=act survived, half-cell = died inside it, green when Forged) on drawer runs, session rows
      and the players-table Game column; proportional gold time-bars behind session rows and playtime cells
      (scaled to the max in view). admintest → 27 asserts incl. width/meter/bar checks.
- [x] (9) v0.7.2: played-card cluster occludes less — #playanchor 45%→55% (sits low on the board) and layoutPlayed
      rows are 8 WIDE (rows=min(3,ceil(n/8)), scale .7/.56/.48 by rows, maxW 640/50%vw). 15-card chain = 2 short rows
      between the meter and the hand instead of a 3-row wall across the centre. Verified headless with real playCard
      flow (15-card + 27-card chains, screenshots, zero page errors). Deployed.

## Round 38 — v0.8.0: payouts later + Dross economy + tabbed console (2026-07-16)
- [x] (1) ROOT CAUSE of "too easy": six mythics had NO deep/afterBoss gate (only the market cost-floor delayed them) —
      an econ start bought a ×1.5-xMult Gilded Fractal in Act 1-2. Gated: leviathan/abyss deep; dragon/incarnate/
      mirrortwin deep+afterBoss:2 (t12+); fractal deep+afterBoss:3 (t18+ — xMult stays a late lever like T3 masters).
- [x] (2) DEMAND_BASE 10.4→11.7 (half the v0.7 cut restored, −10% vs original 13).
- [x] (3) T1 Dross-for-power wares (strong + focusCost:1, each play silts 1 Dross): Pyre Bloom (ember c4 4★),
      Silt Dredger (tide c5 3★ draw2), Ashgilt Idol (aurel c5 3★ gold2). Keeps the great-card-gives-Dross dynamic
      alive from turn 1 and makes the burn cards matter.
- [x] (4) NEW mid burn-engine The Twin Pyre (ember uncommon c5, cantrip, +1❖, burn 1, afterBoss:1) —
      burn ladder now Altar (early) → Twin Pyre (mid) → Great Kiln (deep).
- [x] (5) Forge Console TABS (page was too tall): Pulse / ⚖ Difficulty / ⚒ Cards / Players — hash-routed
      (#pulse default), sticky topbar stays, no re-render on switch, difficulty run strips capped at 8 + "show all".
- [x] (6) Tests: v080test.mjs (12 asserts: demand, full gating ladder incl. staged rank/boss combos, focus costs,
      overflow, real playCard Dross-silting + burn prompt), admintest 29 (tabs+routing), scorestest 46, v069test 14.
      Deployed v0.8.0.
- [x] (7) v0.8.1: removed the stranded "PLAYED ×N" pill (a v0.3 tight-stack relic hard-positioned at top:58% —
      left floating in empty space after the v0.7.2 cluster move; the 8-wide layout is countable and COMBO ×N
      already shows the chain). Badge CSS + markup + layoutPlayed refs deleted.
- [x] (8) v0.8.2: card-corner dark wedges on pile-view hover-zoom fixed. Root cause (elementsFromPoint + layer
      toggles + pixel zooms): the .foot rules-scrim and .nameplate title-scrim are square-cornered full-width
      strips painting past the cardface's 12px radius (the face can't clip — badges must overflow), and the
      .cardo hot-glow shadow drew a faint SQUARE silhouette (radius-0 box). Fix: matching border-radius on all
      three. Verified: headless corner repro + 3× pixel zooms clean, card overflow audit clean.

## Round 39 — v0.8.3: burn confirm + admin durations + Compare tab (2026-07-16)
- [x] (1) BURN CONFIRMATION (user burned the wrong card from a crowded hand): selecting a card in burn mode now
      zooms it to centre via the #inspect overlay with a big "🔥 BURN · +N ★" button ON the card; below: CANCEL
      (prompt stays armed, pick another) and SKIP BURN (spares everything, = SPARE THEM). Both burn paths (hand
      click via playCard, pile-view .burnbtn) route through it; the coach follows in ("BURN IT"). 8-assert
      burntest.mjs green (confirm/cancel/skip/pile paths).
- [x] (2) Admin: every run row shows its DURATION — /api/admin/balance runs carry `ended` (last event ts);
      gold ⏱ chip on difficulty strips + drawer run timelines.
- [x] (3) Admin ⇄ COMPARE tab: playstyles side by side to spot "not played normally" — per-run averages from the
      ch_run card tallies (buys, plays, forges, burns, relics, deck end = 12+buys−burns), best ★, depth, max MULT
      ever built (ch_turn), playtime. Sortable; inline bars per metric; ember ring on any cell ≥2σ from the field
      (needs 4+ tallied players). Client now tallies relic mounts (rack buys + master drafts → cards.relics).
      admintest → 32 asserts.

## Round 40 — v0.8.4: playtest pass (2026-07-17)
Method: autoplayer bot drove the real UI (play/buy/boss/burn flows) for 9 runs; screenshots of every
screen; then prod analytics queried for the two tagged players' actual boss-death patterns.
Finding: TWO different walls — Boss 1 kills newcomers (Erik missed it 7/16 faced = 44%, once 2★ short;
Marcel died t5 and never returned) while Hampus sails Boss 1 (1/7) and dies at Boss 2 (3/6, all t12).
Late-boss tuning deferred: almost all human data is pre-v0.8 (cap-7 era); need v0.8 clear-rate data.
- [x] (1) FREE Act-1 first-miss mercy — "the Forge forgives an apprentice once", Act 1 only, does NOT count
      as clearing a boss. state.act1Mercy; placed before the Emberheart-charm branch. Softens the newcomer
      floor without touching Hampus's mid-game.
- [x] (2) BUGFIX: opening market ignored afterBoss — pickReverie filtered only !deep, so Twin Pyre (afterBoss:1)
      seeded turn 1. Now filters both gates.
- [x] (3) POLISH: game-over backdrop opaque (.9/.98, was .6/.94 — bright board competed with the stats/honor roll);
      MULT cap reads "CAP 15" not "/15" (slash misread as ×n fifteenths); start menu PLAY primary+first, LEARN
      second with "the optional tutorial" note.
- [x] (4) SECURITY (commit review): static-file guard now requires ROOT+path.sep (a sibling dir sharing ROOT's
      name prefix could satisfy the old bare startsWith).
- [x] (5) NON-ISSUES confirmed by playing: "NEW STEEL" float is card-anchored (correct); Bazaar rail anvil is
      sticky-bottom with a fade + responsive compression (already handled). Left unchanged.
- Tests: v084test (7: menu order/primary, market gate, cap text, Act-1 mercy once-only), full regression
  (burn 8, v080 12, v069 14, scores 46). git repo initialized; v0.8.3 + v0.8.4 committed.
- DEFERRED to user (parked, not built): (a) free-Act-1-mercy is a judgment call — pull it if it feels wrong;
  (b) run persistence + CONTINUE (state is session-only, a mid-run close loses 30-60 min); (c) tally speed-up
  for 10+ card late chains.

## Round 41 — v0.8.5: run persistence + auto tally speed-up (2026-07-17)
The two parked playtest items.
- [x] (1) RUN PERSISTENCE: autosave to localStorage `ch-sg-save` at each turn boundary (saveRun() before dealCards,
      state clean). Start menu shows CONTINUE (primary, first: "resume · Act N, turn T, NNN★") when a save exists for
      THIS device's player (localStorage name match — session name is blank on a reopened tab); PLAY drops to "a new
      run". restoreRun() rebuilds deck/discard/relics(+shattered)/market/kingdom/commissions/counters/twist; boot()
      restore hook after initMarket, guarded by wantRestore. Forged cards (coin_f/coin_f_f) rebuilt via new
      defFromId() (base root + forgedDefOf per _f; null → card dropped, graceful for old saves). clearRun() on death +
      RESTART; KEPT on QUIT-to-menu (leave & resume). "THE FORGE REMEMBERS YOU" slam on resume.
- [x] (2) AUTO TALLY SPEED-UP: endTurn's tw() gains actScale — Acts 1-2 full ceremony, Act 3+ (turn 13+) delays
      ×0.45 (~2.2× faster). Fixes the long-late-chain drag (per-card loop ran 10-15× every turn). Click-to-rush
      (40ms cap) still layers on top. Mercy/charm dramatic beats (raw wait()) untouched.
- Tests: v085test (13: save shape, forged round-trip, CONTINUE menu+note+demotion, exact resume, death-clears,
      Act-3 boundary + scaling wired), full regression (v084 7, burn 8, v080 12, v069 14, scores 46, card-overflow
      clean). git committed. NOTE: v084 menu-order query updated to filter hidden items (CONTINUE is always in the DOM).
- Both parked items from the playtest report (Round 40) are now DONE.

## Round 42 — v0.8.6: fix broken CONTINUE (2026-07-17)
- [x] BUG (user: "CONTINUE doesn't work"): the resume rebuilt the market DATA but not the market DOM.
      restoreRun() set state.market to restored slots (slotEl:null), but the Bazaar still showed the fresh
      random market DOM from initMarket() → phantom un-clickable cards (turn/glory/deck/hand all resumed fine).
      FIX: extracted initMarket's DOM-building loop into buildMarketDOM() (railhead split by slot.rack not index,
      since a restored market may reorder); boot() restore block calls it after restoreRun() + updateAnvil().
- [x] TEST GAP that let it ship: v0.8.5's CONTINUE test kept sessionStorage across reload, so askName never fired
      and the real reopen path wasn't covered. v085test now sessionStorage.clear() before reload, completes the
      name prompt, and asserts a resumed Bazaar card is BUYABLE (deck grows) + slots wired to state. 14/14.
- Verified: resumed board screenshot shows a real interactive Bazaar; full regression clean; git committed; deployed.
- PENDING (user will send): a list of design improvements — parked for now.

## Round 43 — v0.9.0: six UI/balance improvements (2026-07-17)
- [x] (1) Deck+Discard piles → upper-right HUD (position:fixed, top:76px, below END TURN) so a big hand fan no
      longer occludes them. anchor()/screenXY() read live rects → all fly-to-pile animations follow, no anim change.
- [x] (2) Pile view TABS: ALL / DRAW / DISCARD / PLAYED (pvTab + pvSource() filter; PLAYED is view-only).
- [x] (3) ENTER → endTurn (new keydown handler, guarded vs INPUT/TEXTAREA, every overlay .on, burnMode/inspectCtx/
      boonResolve, and #endturn.disabled; endTurn re-checks busy/gameOver/burnMode).
- [x] (4) LATE-GAME MATH (the wall): demand is geometric (×1.28) but score is ~linear×capped-mult → t42-48 needed
      ~68k base★ (impossible). FIX: (a) demand TAPER — pure 1.28 through t18 (Acts 1-3 byte-identical), then 1.13/turn
      (DEMAND_KNEE=19, DEMAND_LATE_RATE=1.13); t48 4.1M→97k (~676 base★, reachable). (b) MULT cap RISES: effMultCap()
      = 15 + 3×bossesCleared + benchSum('capBonus') (15→36 by final boss), routed through computeScore + meter +
      reveal. (c) 2 optional stacking cap relics — furnaceregulator (capBonus:4, T2), unboundforge (capBonus:8, T3);
      new capBonus field in the 3 relic-text renderers. Not mandatory (cap already rises per boss). Math verified.
- [x] (5) .gm-back links restyled: dotted-underline text (old-HTML look) → gold ghost pill (border, radius, gradient).
- [x] (6) Playtime → ACTIVE time: Telemetry.elapsed() now accumulates only visible spans (pauses on
      visibilitychange:hidden), so idle open-tab time no longer inflates it. Admin relabelled "Active time" (foreground
      only). aggregate.js unchanged. NOTE: Erik's 14h55m WAS open-tab wall-clock incl. idle — new data is accurate.
- Tests: v090test (13), full regression (v085 14, v084 7, burn 8, v080 12, v069 14, scores 46, admin 32) + overflow
      clean (2 new relics). git committed; deployed.

## Round 44 — v0.9.1 bugfix + dopamine design handoff (2026-07-17)
- [x] v0.9.1 BUGFIX: deck/discard piles jumped when playing a card — v0.9.0 made them position:fixed inside #app,
      and shake() transforms #app → a fixed element re-anchors to the transformed ancestor (containing-block flip),
      snapping the piles each shake. Fixed: position:absolute + direct children of #app (they ride the shake).
      pilejumptest.mjs (5) + full regression green; deployed.
- [x] DOPAMINE & JUICE OVERHAUL — designed via a 6-agent research workflow + adversarial critique; spec in
      tasks/dopamine-plan.md (approved: whole system, bold-tiered, evolving music; critique bugs B1-B4 folded in).
      HANDOVER.md written. → BUILT in Round 45 (v0.10.0).

## Round 45 — v0.10.0: the Dopamine & Juice overhaul + honor-roll tabs + Analytics (2026-07-17)
- [x] §0 Heat spine: Heat.run/surge/timeScale on its own self-sleeping RAF (B1); reset() at new-turn /
      boss-clear (×.4 dip for the draft) / rank-up; Endless = 6-turn saw-tooth (B4); trial pins .05.
- [x] §1 evolving music: onHeat filter sweeps (LFO-safe), density gates, BPM 104→146 by act (~3/s ramp),
      lead-arp layer (hysteresis .6/.55), Phrygian boss ALT tables swapped BY REFERENCE at the bar seam,
      quantized bossclear stinger, duckNow locked out during fadeOut, muted scheduler idles (§6.6).
- [x] §2 scaled FX: mag/over canonical scalars gate categorical tiers (B3); freeze() hit-stop (rush-aware,
      no-trial); trauma shake (summed sines + rotation + dip channel; tally sites retuned); particle cap 300
      + timeScale physics; continuous feast → THE FORGE GORGES; boss/rank ceremonies escalate by depth.
- [x] §3 cards land heavier: cardWeight = rarity × tier × glory; landsquash (--sq, common imperceptible);
      anticipation lift/hold by weight; per-rarity bass registers; buy/forge heft routed.
- [x] §4 big-win tiers: reserved chant (transposed); bestTurnGlory per-turn peak (B2, persisted in save);
      Tier-4 record-shatter goldbloom (finishScores→{best,shattered}); column of fire behind .ts-x;
      victory hard-stop (blackout+silence then fanfare); Firsts one-time flourishes (boss/mythic/record).
- [x] §5 death feel: filters slam shut, deathgray drain, silence-then-verdict; a best outshines the death.
- [x] §6 restraint: reduced-motion full gating (border-pulse shake, ×.3 bursts, calm music); SCREEN FX
      slider (AudioFX.juice → Heat.fxScale, ch-af-vol blob); coach protection (no freeze, juice ≤.35).
- [x] HIGHSCORE tabs: THE WORLD / MY RUNS (local ch-af-scores — race yourself).
- [x] ANALYTICS main-menu panel: 6 stat tiles + most-worked wares + last-12-runs bars, own data only.
- Tests: v0100test.mjs 27/27; full regression green (v090 13, v085 14, v084 7, burn 8, v080 12, v069 14,
      pilejump 5 — mid-shake assertion updated for rotation, scores 46, admin 32). Deployed + prod-verified.


## Round 46 — v0.11.0: nine playtest fixes + Endless removed + THE VICTORY DEBRIEF (2026-07-18)
- [x] (1) VIEW YOUR CARDS on Boon/Master-Relic overlays — read-only pile view above a suspended reward
      (pvReadonly; pileview z 165→172; Esc closes pileview first, reward survives).
- [x] (2) Piles top 76→96px, clear of END TURN.
- [x] (3) burnMode: pile-view card-body zoom carries the BURN button (shared zoom(), same guard as .burnbtn).
- [x] (4) Boon/mrdraft backdrops opaque (.78/.82) + blur(7/8px) — board readthrough gone.
- [x] (5) Phantom CLOSE: #inspect z170→175 (was buried under #mrdraft z170 by DOM order) + SKIP CLAIM
      button (mrResolve, click-only).
- [x] (6) Admin: LIVE age-gated (STALE_MS 10min → ABANDONED tN); non-ended rows show Σturns[].score + seen-ago.
- [x] (7) Admin WATCH: ch_board per-turn snapshot (self-contained chips <8KB) + /api/admin/board?cid= +
      #spectate panel (12s poll, no animation).
- [x] (8) Mult nerf: CHAIN .18/ECHO .10/TRIBAL .20 shared constants (compute+reveal parity), card m −17-25%,
      relicMult −20%, emberBloom −20%, multDouble +2.5; DEMAND_LATE_RATE 1.13→1.12 (t48 97.3k→74.5k).
- [x] (9) Bazaar restocks after every boss clear; SOLD slots read "new wares after the boss".
- [x] ENDLESS REMOVED: t48 kill ends the game (no sweep/turn-49/redeal); endless saves retired in loadSave().
- [x] THE VICTORY DEBRIEF: #debrief dossier — run-curve SVG, Eight Trials ledger (CLOSEST SHAVE), Engine
      Autopsy (maxCombo tracker), deck histogram, bench roll-call, MASTERWORK COMPLETE stamp; game_won event.
- Tests: v0110test 21/21; battery 223 green (pilejump sway tolerance 8→22px for the lower piles under rotation).
      Deployed + prod-verified.


## Round 47 — v0.11.1: mystical debrief backdrop + star/gold give-back + opening Dross ware + 6 gold (2026-07-18)
- [x] (1) Victory Debrief mystical backdrop: #db-cosmos canvas — counter-rotating forge-sigil rings + twinkling
      gold constellation drifting up, self-sleeping RAF (Cosmos module, started in openDebrief), faint by design,
      REDUCED_MOTION → still frame. z-layer: cosmos 0 / embers 1 / doc 2.
- [x] (2) "Slightly too hard" give-back via STARS+GOLD (not mult): STAR_BOOST=1.06 per played card in BOTH
      computeScore and the tally (projection===tally intact; ⚡ flag still reads raw); per-boss gold +5→+6.
- [x] (3) Opening Bazaar guarantees a strong Dross-for-power ware (cheap/low-focus) — first of the 7 food groups.
- [x] (4) Start with 6 gold (was 3).
- Also: the Victory Debrief prototype artifact (Erik's data) updated with the same cosmos backdrop.
- Tests: full battery 223 green + new-mechanics headless pass. Deployed + prod-verified.


## Round 48 — v0.11.2: version-aware difficulty analytics + game self-registers balance (2026-07-18)
- [x] Also shipped first, separately: the Dross-chip Bazaar fix (ash "+N Dross" market-tile chip).
- [x] Phase 1: game emits ch_config once per run (difficultyConfig() — every knob + 8 boss mults), Balance.config beacon at boot.
- [x] Phase 2: HISTORICAL_VERSIONS registry (git-exact v0.8.3+, prose v0.7.x approx) + /api/admin/difficulty (group by build) + balance?build=.
- [x] Phase 3: Difficulty tab → single-version deep dive (default latest, exact demand from config, settings panel + delta-vs-previous).
- [x] Phase 4: Versions tab — registry table with auto-diff highlights + version-normalized tightness overlay (score÷demand).
- [x] Phase 5: Pulse — engagement global; win%/median-depth/game-funnel (per-run) scope to a build selector; aggregate.js overview.byBuild; playerDetail runs carry build.
- Tests: /api/admin/difficulty + balance?build= + difficultyConfig shape + Difficulty/Versions/Pulse headless; admintest updated (6 tabs, per-run funnel); scores/hiscore/game battery green. Deployed + prod-verified.


## Round 49 — v0.11.3: richer difficulty telemetry (design vs luck) + mid-game tuning (2026-07-18)
- [x] Phase 1: ch_turn logs deckN/drossN + opening-hand {openN,openEnab,openPlay,openDead} (captureOpenHand at deal seam) + focusLeft/buysLeft/played/combo/charms.
- [x] Phase 2: /api/admin/difficulty byTurn adds medDeckN/medDrossN/deadHandRate/avgFocusLeft + miss-cause {dead,diluted,hard}; balance turns carry raw fields.
- [x] Phase 3: admin variance panel (dilution + Dross curves, dead-hand-rate bars), run-strip cause tags (turnCause), post-boss watch, opening-hand one-liner.
- [x] Phase 4: DEMAND_RATE 1.28→1.30 (mid +18-30%, early +8%), DEMAND_LATE_RATE 1.12→1.11 (t48 held ~74k).
- Tests: config/telemetry/dead-hand/server-aggregation/admin-variance headless; demand assertions updated (v0110 t24/36/48=3975/17219/74142, v090 t18=1872); full battery green. Deployed + prod-verified.


## Round 50 — v0.11.4: boss roster redesign for mechanical variety (2026-07-18)
- [x] New dampColor mechanic (starsFor hook, rounded; random colour picked at boss setup, excl. ash; themes the board).
- [x] Roster: The Tarnish (dampColor 0.5) @act3, The Silting (drossSeed:2, 2.4→2.2) @act5, The Hollow Forge→allStarMult:0.6 @act6; kept 1/2/4/7/8; retired comboMult + multDamp; only 1&8 keep −❖.
- [x] bossLedger bite rows for allStarMult<1 + dampColor; live-HUD strings; admin BOSS_BY_ACT mirror (act3/act5).
- Tests: per-mechanic + ledger/live + invariant + t30 demand (~7.8k) headless; boss intro screenshot; full battery 223 green. Deployed + prod-verified.


## Round 51 — v0.11.5: consistency fixes (variance, not curve) (2026-07-18)
- Diagnosis from the v0.11.3 variance panel: Act-2 tightness already ideal; deaths = DEAD HAND bricks + focus-lock (player-named). Fix reliability, not difficulty.
- [x] Focus-lock: common/uncommon focus engines (gains.focus>0) play FREE (freeFocusEngine); rare/mythic keep cost; focusCostOf respects explicit 0.
- [x] 2nd early draw: starter ['tidewake','tidewake','kindling'].
- [x] Dead-hand mulligan: openSnap.enab===0 → reshuffle+redraw once (mulliganDeadHand, guarded; new-turn/resume/turn-1).
- [x] Tighter start: GRACE_FLOOR 0.5→0.62 (lifts t1-5 only, converges by t8; mid untouched; no rate change).
- Tests: focus costs, 2 Tidewakes, mulligan on forced dead hand, t1 demand 6→7 / mid untouched; full battery 223 green. Deployed + prod-verified.


## Round 52 — v0.11.6: start armed with a visible Emberheart Charm (2026-07-18)
- [x] Replace the invisible free Act-1 mercy with a real Emberheart Charm mounted on the bench from turn 1; announce it at game start.
- [x] Charm shatters to forgive the first missed tithe ANYWHERE (not Act-1-only); buy more at the Bazaar.
- [x] boot mounts state.relics=[emberheart] (fresh chapter run; CONTINUE overwrites with saved bench); death path → straight to charm-shatter; state.act1Mercy removed from init/save/restore.
- Tests: v084 mercy rewritten to charm behavior; v085 death clears the charm first; charm-start headless (1 charm mounted + visible + announcement); full battery green. Deployed + prod-verified.


## Round 53 — v0.11.7: focus-badge fix + charm-message hold (2026-07-18)
- [x] costsFocus now keys on focusCostOf(def)>0 (was !isFreePlay) — free focus-engines no longer show a "❖ 0" badge / red edge; real-cost cards (incl. rare/mythic) still do.
- [x] slamText gains a `hold` option; the game-start Emberheart Charm message lingers ~3.6s.
- Tests: badge across card types (Conclave/Warren none, Verdant Bloom/Vintner keep, treasures none); full battery green. Deployed + prod-verified.
