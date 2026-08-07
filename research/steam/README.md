# Publishing StarGilt on Steam — research & learnings

*Researched 2026-08-07 (five parallel research passes over current Steamworks docs + ecosystem sources,
cross-checked). Nothing here has been executed — no accounts created, no fees paid, no packaging done.*

## The answer in one paragraph

You can do this **as a private person in Sweden — no company needed**. The whole pipeline is:
Steamworks partner signup (legal name, bank details, W-8BEN tax interview with your personnummer →
0% US withholding) → pay the **$100 per-app Steam Direct fee** (applies to free games too; only ever
recouped after $1,000 revenue) → wrap `index.html` in **Electron + steamworks.js** (~a day of work,
the game is already Steam-shaped) → build a store page (8 capsule/library images, 5 screenshots at
1920×1080+, a trailer) → pass two Valve reviews (store page, then build; 3–5 business days each,
longer for first-time accounts) → sit through the **mandatory 2-week "Coming Soon"** window → press
the release button yourself. **No certificates or signing are needed for Windows or Linux**; macOS is
the only platform with a real signing requirement (Apple notarization, $99/yr) — skip it at launch.
Total hard cost: **$100 (+ possible VAT)**. Total calendar time: realistically **6–8 weeks** from
signup to release, most of it waiting.

## The files

| File | What's in it |
|---|---|
| [00-stargilt-inventory.md](00-stargilt-inventory.md) | Code-grounded ground truth: what the game is, its saves, its network surface |
| [01-process-and-money.md](01-process-and-money.md) | Steamworks onboarding, fees, Swedish tax angle, timeline gates, **free vs paid** |
| [02-packaging.md](02-packaging.md) | Electron vs Tauri, Steam overlay, where localStorage lives, the recommended wrapper design |
| [03-signing-review-drm.md](03-signing-review-drm.md) | Certificates (spoiler: almost none), Valve's two reviews, DRM (skip), Steam Deck |
| [04-store-page-assets.md](04-store-page-assets.md) | Exact asset sizes, content survey / AI disclosure, launch mechanics, Next Fest |
| [05-stargilt-specific.md](05-stargilt-specific.md) | Telemetry & GDPR, the scoreboard question, Steam Cloud design, achievements from `Firsts` |
| [99-decisions-and-open-questions.md](99-decisions-and-open-questions.md) | The decisions only Hampus can make + unverified items |

## Top learnings (the things that surprised)

1. **Free games pay the $100 too**, and never recoup it. The fee is per-app, not per-account.
2. **Free → paid is a one-way-ish door**: allowed, but needs a Valve support ticket, 1 week public
   notice — and *everyone who claimed it free keeps it forever*. If both models are on the table,
   launch **paid with a demo** (demos have their own free App ID at no extra fee), not free-then-paid.
3. **No code signing for Steam** on Windows/Linux — SmartScreen never fires because Steam's installer
   doesn't apply Mark-of-the-Web. The $100–400/yr Authenticode certificate advice on the internet is
   for direct-download distribution, not Steam.
4. **Updates are never re-reviewed.** Only the first build+page pass review; after that the current
   weekly v0.13.x cadence can continue unchanged on Steam.
5. **The Railway scoreboard should stay.** Steam leaderboards would split web and Steam players onto
   separate ladders, and the dominant Electron binding (steamworks.js) doesn't even expose
   leaderboards. Cookie Clicker is the live precedent: free on the web, paid on Steam, for years.
6. **The real timeline is mostly waiting**: 30 days post-fee before release is allowed, 2 weeks
   minimum Coming Soon, 3–5 business days per review (first-time accounts often get pulled into
   "further review" — budget 2–4 extra weeks).
7. **Steam Next Fest is once per game, ever**, and only before release. Don't release before deciding
   whether to use it.
8. **The AI-disclosure question is about the store art**, not the card engine — since Jan 2026 the
   policy covers player-facing content *and marketing/store assets*. StarGilt's procedural card art is
   code, not AI — but if any capsule art gets made with AI later, it must be disclosed.
