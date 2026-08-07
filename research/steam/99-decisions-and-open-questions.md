# Decisions only Hampus can make + what stayed unverified

## The decision list (in dependency order)

1. **Free or paid?** — the fork everything else hangs on. The one-way door: free→paid grandfathers
   every free claimer forever. If in doubt: **paid low-tier + free demo** keeps every option open.
   (Analysis: [01-process-and-money.md](01-process-and-money.md).)
2. **The exact name** — "StarGilt — Forged in Chains"? It freezes at store-page review.
3. **Platforms at launch** — recommendation: Windows + native Linux, macOS deferred ($99/yr Apple
   fee + notarization is the only real signing cost in the whole pipeline).
4. **Next Fest or not** — once per game, ever, before release only. Needs a demo. Decide before
   pressing Release.
5. **Swedish tax posture for a PAID release** — hobbyverksamhet vs enskild näringsverksamhet, moms:
   outside Steam's docs entirely. → Skatteverket / Klara Consulting before charging money. (A free
   release makes this moot.)
6. **When to pay the $100** — it starts the 30-day release clock; pay early once committed.
7. **Deck text size** — accept "Playable with small text" or budget a css-zoom pass for 1280×800.

## Unverified / to confirm during actual onboarding

- Whether Swedish **VAT applies to the $100** fee (Valve says consumption taxes "in accordance with
  country requirements"; exact Swedish application unconfirmed).
- The **exact identity documents** Valve's third-party verifier requests from a Swedish individual.
- The demo-App-ID **fee exemption** (universal practice, but not explicitly restated in the current
  fee doc).
- Steam client's **offline achievement caching** wording at doc level (behavior is standard).
- Exact **EULA-upload flow** in App Admin (only relevant if we attach the privacy notice there).
- macOS Gatekeeper behavior for non-notarized Steam installs on current macOS (moot if macOS skipped).

## What we deliberately did NOT do (per instruction)

No Steamworks account, no fee paid, no packaging code written, no store assets produced. The next
concrete step, when wanted, is: **decide free-vs-paid → create the partner account** (the 2–7 day
verification is the longest lead item that costs nothing).

## Effort estimate for the whole thing (when green-lit)

| Work | Estimate |
|---|---|
| Electron wrapper + overlay + save adapter + Steam flag | 1–2 days |
| Achievements mapping from `Firsts` (~15) + icons | 1 day |
| Store asset pack (8 images from key-art masters) + 5–8 screenshots + trailer | 2–3 days |
| Privacy notice | half a day |
| Steamworks admin (app config, depots, cloud, content survey) | 1 day |
| **Active work total** | **~1 week** |
| Waiting (verification + reviews + Coming Soon + 30-day clock, overlapping) | **5–8 weeks calendar** |
