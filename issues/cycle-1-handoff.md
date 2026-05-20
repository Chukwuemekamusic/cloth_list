# ClothList — Cycle 1 Handoff Brief
*Generated: 2026-05-20*

## What was built in Cycle 1

ClothList is now a fully functional end-to-end MVP. A reseller can open the app on Android Chrome, take a photo of a clothing item (or pick one from their gallery), and get a short WhatsApp-ready caption in under 30 seconds — no account, no login. The AI (Claude Vision) detects the item type, brand, color, size, and suggests a Naira price. The reseller sees all of this in a review panel, can correct the size and price inline, edit the full caption text, regenerate it, and then share the caption + image to any app via the Android native share sheet (or copy to clipboard as fallback). The app is a PWA: it can be installed on the Android home screen and the shell loads from a service worker cache — so it opens instantly even before a network connection is established, and the editing step works fully offline.

## Completed issues

| Issue | Title |
|-------|-------|
| 001 | Project scaffold (Next.js, Tailwind, Vercel) |
| 002 | Image input module (camera + gallery, 1MB compression) |
| 003 | AI analysis API route + module (`POST /api/analyze`) |
| 004 | Caption generator module (pure function, tested) |
| 005 | End-to-end listing flow UI (loading, review panel, overrides, char count) |
| 006 | Share/copy module (Web Share API + clipboard fallback) |
| 007 | PWA hardening (manifest, service worker, offline shell, installability) |

## What was deferred (from PRD out-of-scope)

- User accounts, login, or listing history
- Direct WhatsApp, Instagram, or Facebook API integration
- Live price scraping from Jiji or Jumia
- Inventory management or bulk listing
- Western resale platforms (eBay, Vinted, Shopify, Poshmark)
- Nigerian Pidgin or other language support
- Payments or in-app monetisation
- Analytics or usage tracking
- Multi-photo listings (single photo only in v1)

## Suggested focus for Cycle 2

**1. Listing history (most impactful next feature)**
Right now the app is stateless — once the user leaves, the caption is gone. Sellers list 10–20 items per session and often revisit captions later (to repost, adjust price, or share again). A lightweight local history (IndexedDB, no server) would let them tap any past listing to re-share or edit. No auth, no backend — entirely client-side. This is the single most-requested feature type for tools like this.

**2. Friend validation feedback loop (immediate)**
The friend interview is end of week (~2026-05-23). Run the current MVP with her before building anything else. She sells on eBay/Vinted/Shopify with a different mental model — her feedback may surface UX friction (caption format, share flow, onboarding) that should be fixed before adding features. Hold Cycle 2 scope open until after this session.

## Known design constraints

- **No database, no auth — ever in this cycle.** All state is ephemeral client-side. Any feature that requires persistence must use browser storage (IndexedDB, localStorage). Do not introduce a backend DB without a new PRD and user validation.
- **Claude API key stays server-side only.** It is accessed exclusively in `src/app/api/analyze/route.ts`. Never import it in any client component or expose it to the browser bundle.
- **`ClothingAnalysis` is the canonical type.** Defined in `src/types/clothing.ts`. All modules (API route, caption generator, UI) import from there. Do not redefine it locally.
- **Caption structure is fixed: 3 lines.** `[descriptors] [brand] itemType [emojis]` / `[size] available` or `Size — ask seller` / `₦price — DM to order!`. Max 200 chars; descriptors are dropped first if over limit. Do not change this structure without re-testing all caption unit tests.
- **Image arrives at the API as a raw base64 string — no `data:` prefix.** The client strips the prefix before sending. The API route and `analyzeClothingImage` both assume this format.
- **Model is `claude-opus-4-7`** (currently in `analyzeClothingImage.ts`). The PRD specified Haiku for cost, but Opus was used for analysis quality. Do not downgrade without testing caption quality on a sample of real photos.
- **Rate limiter is in-memory** (`src/lib/rateLimit.ts`, module-level Map). It resets on server restart. Acceptable for MVP — do not introduce Redis or a persistent store without discussing it.
- **Image compressed to max 1MB client-side** before base64 encoding. Changing this cap affects API cost and latency.
- **Service worker cache key is `clothlist-v1`** in `public/sw.js`. Bump the version string when making breaking changes to the shell to force cache invalidation.

## Key files

| Path | Purpose |
|------|---------|
| `issues/prd.md` | Source of truth for the Cycle 1 spec |
| `issues/done/` | All 7 completed issue definitions |
| `issues/status.json` | Machine-readable issue tracker |
| `src/types/clothing.ts` | `ClothingAnalysis` — canonical type shared by all modules |
| `src/app/api/analyze/route.ts` | `POST /api/analyze` — rate-limited Claude Vision proxy |
| `src/lib/analyzeClothingImage.ts` | Claude Vision integration + response parser |
| `src/lib/generateCaption.ts` | Pure caption function + `CaptionOverrides` type |
| `src/lib/shareCaption.ts` | Web Share API + clipboard fallback |
| `src/components/ImageInput.tsx` | Camera/gallery picker with client-side compression |
| `src/components/ListingReview.tsx` | Full review screen — overrides, caption editor, share CTA |
| `src/app/page.tsx` | Phase state machine: `input → loading → review → error` |
| `public/sw.js` | Service worker — shell cache + offline navigation fallback |
| `src/app/manifest.ts` | Next.js PWA manifest route |

## Context for the next /grill-me session

ClothList Cycle 1 is complete and fully functional as a PWA. A reseller can snap a photo, get an AI-generated WhatsApp caption, edit it, and share to any app in under 30 seconds — with no account and no install required. The app is installable on Android and the shell works offline. Everything runs on Next.js App Router with no database and no auth; all state is ephemeral client-side. The canonical data shape is `ClothingAnalysis` in `src/types/clothing.ts`, the caption structure is a fixed 3-line format (max 200 chars), and the Claude API key is strictly server-side only in `src/app/api/analyze/route.ts`. The model is currently `claude-opus-4-7`. The obvious gaps are: no listing history (captions are lost when the user leaves), single-photo only, no Naira price intelligence (Claude guesses), and no Pidgin/local language support. Before deciding Cycle 2 scope, run the MVP with the friend who sells on eBay/Vinted (~2026-05-23) — her feedback may change priorities. The most likely Cycle 2 candidate is lightweight client-side listing history (IndexedDB, no backend).
