# The process & the money — Steamworks onboarding for a Swedish solo dev

*All claims verified against partner.steamgames.com docs current as of 2026-08 unless marked
UNVERIFIED. Sources at the bottom of each section.*

## Onboarding: you, personally, no company

- Register at partner.steamgames.com as **"Sole Proprietorship"** with your **exact legal first and
  last name** as the company name — no alias, no "StarGilt Studio". The name must match your bank
  documents and the tax interview exactly; mismatches stall verification.
- Digitally sign the NDA + Steam Distribution Agreement.
- Provide bank details (account holder name must match), complete the tax interview, pass identity
  verification by a third-party service: **2–7 business days**, possibly with document requests
  (exact documents demanded from a Swedish individual: UNVERIFIED — expect government ID).

**The Swedish tax angle:**
- The tax interview is a W-8BEN equivalent. Claim the **US–Sweden treaty** with your **personnummer**
  as foreign TIN → **0% US withholding** on royalties (the treaty rate; without a valid claim Valve
  withholds 30%). You get IRS Form 1042-S annually by March 15.
- Only matters for a *paid* game, but do it correctly during onboarding regardless.
- **Not covered by any Steam doc:** the Swedish domestic side — hobbyverksamhet vs enskild
  näringsverksamhet, moms on the income, deklaration. → a Skatteverket / Klara Consulting question
  before a *paid* release. (For a free release there's no income, so nothing arises.)

Sources: [onboarding](https://partner.steamgames.com/doc/gettingstarted/onboarding) ·
[tax FAQ](https://partner.steamgames.com/doc/finance/taxfaq) ·
[Steam Direct](https://partner.steamgames.com/steamdirect) ·
[PwC treaty table](https://taxsummaries.pwc.com/sweden/corporate/withholding-taxes)

## Fees & revenue

| Item | Amount | Notes |
|---|---|---|
| Steam Direct fee | **$100 per app** | Non-refundable. Paid via normal Steam payment (not wallet). Possible VAT on top ("Valve will charge VAT … in accordance with country requirements" — Swedish application UNVERIFIED). |
| Fee recoup | at $1,000 AGR | Adjusted Gross Revenue from store + in-app. **A free game never recoups it.** |
| Valve's cut (paid game) | **30%** | 25% above $10M lifetime, 20% above $50M — irrelevant at indie scale. Exact terms live in the login-gated Distribution Agreement. |
| Payouts | monthly, net-~30 | **USD SWIFT wire only, $100 minimum payout**; Valve eats its own wire fees, your bank's receiving/FX fees are yours. Below-threshold money sits at Valve. |
| Steamworks account | $0 | The fee is per-app only. |
| Demo App ID | $0 | Created from the base game's dashboard; no second Direct fee (high-confidence, not explicitly restated in the fee doc). |

## Timeline gates (they stack)

1. **30 days** minimum between paying the app fee and the earliest possible release.
2. Store page review: **3–5 business days** (submit ≥7 days before you want it live).
3. **2 weeks minimum** with the page publicly in "Coming Soon".
4. Build review: **1–5 days** (runs in parallel with the Coming Soon window).
5. Release = a **manual button press** by you once every gate is green. Wishlisters get an automatic
   email from Steam.

The 30-day and 2-week clocks can overlap, so the practical floor from "account exists" to "released"
is ~5–6 weeks; **budget 6–8** with first-account review friction.

## Free vs paid — the decision matrix for StarGilt

**Both cost the same $100 and use the identical pipeline.** The differences:

| | FREE | PAID |
|---|---|---|
| The $100 | sunk forever | recouped at $1,000 AGR (= ~200 copies at $4.99 after Valve's 30%… roughly) |
| Onboarding | still needs full bank + tax verification | same |
| Later switch | **free → paid: everyone who claimed keeps it forever** + support ticket + 1 week notice | paid → free anytime (same ticket + notice) |
| Price rules | n/a | min $0.99 tier; price locked 30 days post-launch; launch discount max 40% for 7–14 days, configured **before** release |
| In-app purchases | must use Steam Wallet | same |
| Reach | free games get huge install counts, low review-quality signal | wishlists/Next Fest machinery works better for paid |
| The web version | coexists fine either way (see 05) | coexists fine (Cookie Clicker precedent) |

**Recommendation:** if there is *any* chance of ever charging, do **paid (low tier, e.g. $4.99) with a
free demo** — the demo satisfies the "let people try it" instinct, keeps Next Fest eligibility
meaningful, and avoids the free-claimer grandfather clause. If the goal is purely maximum players and
money truly never matters, free is simpler and skips the whole payout/Swedish-tax question.

Sources: [app fee](https://partner.steamgames.com/doc/gettingstarted/appfee) ·
[pricing](https://partner.steamgames.com/doc/store/pricing) ·
[free to play](https://partner.steamgames.com/doc/store/freetoplay) ·
[payments FAQ](https://partner.steamgames.com/doc/finance/payments_salesreporting/faq) ·
[revenue tiers (2018 announcement, still current)](https://www.geekwire.com/2018/valves-new-steam-revenue-sharing-tiers-spur-controversy-among-indie-game-developers/)
