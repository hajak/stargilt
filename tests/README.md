# StarGilt test suite

Headless regression tests that drive the real game (`../index.html`) in Chrome and assert its
invariants. Committed to the repo so the battery survives — the previous suite lived only in a
scratchpad and was lost when that was rotated.

## Run

```bash
cd tests
npm run setup      # first time only: installs puppeteer-core + chrome-headless-shell
npm test           # run the whole suite
npm test scoring   # run only files whose name contains "scoring"
SG_VERBOSE=1 npm test   # also print every passing assertion
```

`npm test` exits non-zero if any assertion fails — wire it into any "definition of done" before a deploy.

## How it works

- **`harness.mjs`** — one python static server on `:5713` (telemetry is OFF there, so tests never
  touch the network), one headless browser, a fresh page per file. `resolveChrome()` globs the
  puppeteer cache so a chrome version bump doesn't break the path (override with `$SG_CHROME`).
  `bootGame()` boots a run to a playable state; `playTurns()` is a resilient auto-player that
  dismisses every reward/confirm overlay.
- **`run.mjs`** — discovers `*.test.mjs`, runs each, aggregates pass/fail.
- Each **`*.test.mjs`** exports `name` + a default `async ({ page, ok, errs })` function. `ok(cond, text)`
  records an assertion; `errs` is the page-error log (every file asserts it's empty as its last check).

Tests reach into the game through its debug hooks — `window.__af` (run state) and the globals
`computeScore` / `chapterDemand` / `difficultyConfig` / `faceBossNow` / `updateSynIndicators` / etc.

## Coverage

| File | Guards |
|------|--------|
| `smoke.test.mjs` | boots, plays several turns alive, glory accrues, hand/piles render, zero page errors |
| `scoring.test.mjs` | `final = round(base × mult)`, the MULT cap clamps + rises per boss, STAR_BOOST, Iron Cage soft-cap factor |
| `difficulty.test.mjs` | demand monotonic + boss spikes + reachable summit; `difficultyConfig()` registers every knob (shape, not magic numbers) |
| `persistence.test.mjs` | turn-1 save, CONTINUE resumes the exact run + rebuilds the Bazaar DOM, death clears the save |
| `boss.test.mjs` | Face-the-Boss tithe gate (deny below tithe, no stray confirm) + banks the earned glory |
| `cards.test.mjs` | Spell-Surge live `n/N` counter (only Spell-type ticks) + burn-any-card + flame affordance |
| `hud.test.mjs` | `#tithe` holds a big capped score with no overflow/wrap/collision; fail-end confirm |

## Adding a test

Copy an existing `*.test.mjs`, keep the `name` unique, use `ok(...)` for each assertion, and end with
`ok(errs.length === 0, ...)`. Prefer **structural** assertions (ranges, invariants) over exact magic
numbers so intended tuning doesn't produce false failures — pin a number only when that number *is*
the contract.
