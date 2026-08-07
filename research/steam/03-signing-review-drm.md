# Certificates, Valve's review, DRM, and the Steam Deck

*Verified against partner.steamgames.com docs current 2026-08; ✓ = primary-source verified,
? = community-consensus / derived.*

## Certificates & signing — the short version: almost none

| Platform | Signing needed? | Detail |
|---|---|---|
| **Windows** | **No** ✓ | Steam imposes no Authenticode requirement. SmartScreen never fires for Steam installs — the Steam client writes files without Mark-of-the-Web (?). Unsigned is normal. **Caveat**: a bare .exe downloaded from a website (itch, own site) DOES get MOTW → SmartScreen warnings; that's a distribution-channel issue, not a Steam one. |
| **Linux** | **No** ✓ | No signing/cert system exists. 64-bit recommended. |
| **macOS** | **Yes** ✓ | Valve policy (2019-10-14): new Mac apps must be 64-bit and **Apple-notarized** → Apple Developer Program **$99/yr** + Developer ID cert + two Steam-specific hardened-runtime entitlements. Enforcement is a self-attested checkbox, and non-notarized Mac games demonstrably ship (?) — but the honest path is notarize or skip macOS. **Recommendation: skip macOS at launch.** |

## Valve's review — what actually gets checked

Two review gates, each **typically 3–5 business days** (Valve says submit ≥7 days ahead):

**Store page review** ✓: screenshots must be actual gameplay (no concept art/awards/marketing text),
capsules must carry a readable title/logo, description coherent with no external links, unreleased
features clearly marked.

**Build review** ✓: the game must **launch and run through the Steam client on every OS checked on the
store page** (the classic indie rejection is "fails to launch on Windows through the Steam client" —
usually launch options or a working-directory assumption), advertised features present, transactions
through Steam Wallet.

- First game on a new account frequently gets pulled into "requires further review" — community
  reports (2025) include multi-week stalls (?). **Budget 2–4 weeks of buffer.**
- **Updates after launch are never reviewed** ✓ — "you are free to update your game as much as you
  need to." The weekly v0.13.x cadence survives Steam unchanged.
- The **content survey** (General / Mature / AI-generated) is mandatory before review and **locks
  after approval** (changes go through Steam Support) ✓ — settle the AI-art answer first
  (see [04](04-store-page-assets.md)).
- Every OS checkbox on the page is a review obligation — tick only what the build actually supports;
  adding a platform later needs no page re-review.

## DRM — skip it

The Steamworks DRM wrapper is optional, called "not an anti-piracy solution … easily removed by a
motivated attacker" by Valve's own docs ✓, must be reapplied to every build, and is community-reported
to break Electron launcher executables (?). StarGilt ships **without DRM**. If any ownership check is
ever wanted: `SteamAPI_RestartAppIfNecessary` in the wrapper, nothing more.

## Steam Deck

- Categories ✓: **Verified** (all checks incl. full controller support) / **Playable** (works with
  manual effort — e.g. trackpad mouse, on-screen keyboard) / **Unsupported**.
- Review is free, automatic-or-requested, ~1 week; **results auto-publish unless a new build ships
  first — freeze the default branch while a Deck review is pending** ✓.
- StarGilt today: mouse-only → **cannot be Verified, routinely Playable** via right-trackpad mouse
  emulation (?). Ship a default Steam Input template (trackpad = cursor, trigger = click).
- **Watch the text**: Deck is 1280×800; the 1470×830 layout scaled down shrinks text ~13% and skirts
  Valve's ~9px legibility floor (derived ?). A Deck css-zoom pass may be needed for a clean Playable.
- A native Linux build (nearly free from the Electron config) sidesteps Proton entirely and is the
  cheapest platform win. Windows-build-under-Proton also works (see [05](05-stargilt-specific.md) for
  the cloud-save path mapping).

Sources: [platforms](https://partner.steamgames.com/doc/store/application/platforms) ·
[review process](https://partner.steamgames.com/doc/store/review_process) ·
[macOS notarization announcement](https://steamcommunity.com/groups/steamworks/announcements/detail/3632639303428097613) ·
[DRM](https://partner.steamgames.com/doc/features/drm) ·
[Deck compatibility](https://partner.steamgames.com/doc/steamdeck/compat) ·
[MOTW background](https://textslashplain.com/2016/04/04/downloads-and-the-mark-of-the-web/)
