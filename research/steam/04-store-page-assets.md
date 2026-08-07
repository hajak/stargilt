# The store page — exact assets, disclosures, launch mechanics

*All sizes fetched from partner.steamgames.com docs on 2026-08-07 (post-Oct-2024 asset rules).*

## The asset pack (make all of it from ONE key-art master)

The `art/` PNG masters (1.7–2.2 MB, e.g. `cover.png`, `emblem.png`) are the raw material.

**Store capsules** — may contain ONLY the game's title/logo (no scores, awards, quotes, discount text —
rules effective Sep 1 2022; violations = ineligible for featuring/sales):

| Asset | Size | Notes |
|---|---|---|
| Header capsule | **920×430** | store page top, also library fallback |
| Small capsule | **462×174** | search/lists — logo must fill the frame, it renders at 120×45 |
| Main capsule | **1232×706** | front-page features |
| Vertical capsule | **748×896** | sales/browse layouts |
| Page background (optional) | 1438×810 | else auto-generated from a screenshot |

**Library assets:**

| Asset | Size | Notes |
|---|---|---|
| Library capsule | **600×900** PNG | the "box cover" |
| Library header | **920×430** PNG | |
| Library hero | **3840×1240** PNG | **center 860×380 safe area; NO text allowed** (cropped hard on small windows) |
| Library logo | **1280w or 720h** transparent PNG | overlays the hero |

**Screenshots**: minimum **5**, minimum **1920×1080**, 16:9, *actual gameplay only*; ≥4 must be marked
all-ages for front-page eligibility. ⚠️ StarGilt renders at 1470×830 — capture at devicePixelRatio 2
(or a 1920×1080 window with the wrapper) so they're native-res, not upscaled mush.

**Trailer**: H.264 .mp4, up to 1920×1080 at 30/60 fps, **5000+ Kbps**, AAC stereo. Open on real
gameplay in the first seconds. (The dossier stamp, a boss arrival, THE CLIMB, a big mult reveal —
the game has the moments.)

**Text**: short description ≤ **300 chars**; long description with no external/social links, no
Steam-UI-mimicking imagery. **The game name freezes at page review** — decide "StarGilt — Forged in
Chains" vs "StarGilt: Forged in Chains" beforehand. **Tags**: ≥5 required, first 5 define the game
(Deckbuilding, Roguelike Deckbuilder, Card Game, Singleplayer, Difficult), up to ~15 weigh in filters.

## The content survey (locks after approval!)

Three sections: **General** (fantasy-violence-free? StarGilt is clean), **Mature** (must disclose all
adult content *in the builds* even if unreachable — none), **AI-Generated Content** (policy Jan 2024,
clarified **Jan 16 2026**: scope = player-facing content *plus store/marketing assets*; internal AI
dev-tools are out of scope). StarGilt's card art is procedural code — not AI-generated — but **if any
capsule/key art is ever made with AI assistance, it must be disclosed**. ~20% of 2025 Steam releases
filed AI disclosures; it's normalized, not a scarlet letter.

## Launch mechanics

- **Coming Soon** page: public ≥ **2 weeks** before release (hard gate). Everything above must pass
  page review first (3–5 business days).
- **Release date display**: use **month or quarter**, not an exact date — editable until 2 weeks out,
  ranks better than bare "Coming Soon".
- **Launch discount**: max **40%**, 7–14 days, configured **before** pressing release. Price is then
  locked for 30 days (and any price *increase* triggers a 30-day discount cooldown) — plan launch
  price + discount together.
- **Demo**: own App ID (free, created from the base game's page), own optional store page. Separate
  page = extra search surface + its own reviews (which persist — double-edged).
- **Steam Next Fest**: once per game EVER, only while unreleased, needs a public Coming Soon page +
  playable demo; registration closes ~7–8 weeks before each fest. **Do not release before deciding.**
- **Curator Connect**: up to 100 curator key offers pre-release once a build is uploaded.
- Release is a **manual button**; wishlisters are auto-emailed.

Sources: [store assets](https://partner.steamgames.com/doc/store/assets/standard) ·
[library assets](https://partner.steamgames.com/doc/store/assets/libraryassets) ·
[asset rules](https://partner.steamgames.com/doc/store/assets/rules) ·
[trailers](https://partner.steamgames.com/doc/store/trailer) ·
[content survey](https://partner.steamgames.com/doc/gettingstarted/contentsurvey) ·
[coming soon](https://partner.steamgames.com/doc/store/coming_soon) ·
[release dates](https://partner.steamgames.com/doc/store/release_dates) ·
[discounts](https://partner.steamgames.com/doc/marketing/discounts) ·
[demos](https://partner.steamgames.com/doc/store/application/demos) ·
[Next Fest](https://partner.steamgames.com/doc/marketing/upcoming_events/nextfest/2026june) ·
[AI policy clarification (Gamedeveloper)](https://www.gamedeveloper.com/business/valve-updates-steam-policy-around-ai-disclosures)
