# ClothList — Cycle 2 Handoff Brief
*Generated: 2026-05-20*

## What was built in Cycle 2

Cycle 2 extended ClothList beyond the Lagos market. A `£ GBP / ₦ NGN` pill toggle on the input screen lets sellers pick their market before taking a photo; the selection persists across sessions via `localStorage`. Claude's analysis prompt is built dynamically — GBP mode uses UK secondhand/upcycled price ranges (£5–120), NGN mode uses the existing Nigerian ranges. The `ClothingAnalysis` type was extended with `estimatedPrice`, `currency`, and `rawDescriptionDraft` (a 2–3 sentence visual observation generated during analysis at no extra cost). Switching currency after results appear shows an inline confirmation before re-triggering analysis. A collapsible `DescriptionAccordion` on the review screen gives sellers a full path from AI draft to polished copy: add context notes → generate instantly → edit freely → Polish with AI (80–120 word rewrite via `POST /api/polish`) → undo if needed → copy independently of the WhatsApp caption. The caption formatter is now currency-aware via `formatPrice(price, currency)`.

## Completed issues

| Issue | Title |
|-------|-------|
| 008 | Core type changes — `Currency` alias, `estimatedPrice`, `rawDescriptionDraft` |
| 009 | Currency-aware analysis — dynamic system prompt, new JSON fields, `/api/analyze` update |
| 010 | Currency toggle UI + localStorage |
| 011 | Multi-currency caption generator — `formatPrice` exported, caption end-to-end |
| 012 | Currency switch post-analysis confirmation |
| 013 | Polish API + module — `polishDescription`, `POST /api/polish`, 7 tests |
| 014 | Description accordion UI — full generate/edit/polish/undo/copy flow |

## What was deferred (from PRD out-of-scope)

- Direct eBay, Vinted, or Shopify API integration — descriptions are copy-pasted manually
- More than two currencies (GBP and NGN only)
- Style controls for Polish ("make it shorter", "more formal", "more casual")
- Description regeneration button (Polish + Undo covers the use case)
- Saving captions or descriptions to local listing history
- Live price scraping or market data APIs
- Automatic currency detection from browser locale

## Suggested focus for Cycle 3

**1. Description quality — post-validation refinement.** Friend validation (~2026-05-23) with the UK upcycled seller may surface tone, length, or platform-fit issues with the Polish output. Cycle 3 should address her specific feedback before broadening scope. Likely candidates: tone presets ("more casual / more formal"), word-count display, or platform-specific copy variants (eBay vs Vinted vs Shopify descriptions differ in formality).

**2. Listing history.** Sellers doing volume (10+ items/day) need to review and re-share past listings without retaking photos. A simple local-storage listing history (last 20 items, caption + description + thumbnail) would unlock repeat sellers. This pairs naturally with the description flow already built.

## Known design constraints

- **`Currency` type alias:** `'GBP' | 'NGN'` only. Do not add a third currency without a PRD — the analysis prompt, `formatPrice`, and all tests are wired for exactly two values.
- **`rawDescriptionDraft` is observation-only:** Claude must describe only what it sees in the image. Seller context notes are the sole source of provenance details. This is enforced by prompt wording — weakening it breaks the trust model with sellers.
- **`polishDescription` is a deep module:** All Claude API concerns live inside `src/lib/polishDescription.ts`. Callers pass `(draft, notes, currency)` and receive a string. Do not expose Anthropic SDK types to the route or the UI.
- **`max_tokens: 256` on polish:** Polish output is capped at 120 words (~160 tokens). 256 is the ceiling. Do not increase without re-evaluating cost per request.
- **Post-analysis currency switch requires re-analysis:** Switching currency after results are shown must always trigger a fresh Claude call. Silent symbol substitution is explicitly out of scope — the confirmation UX is load-bearing.
- **Rate limiter is in-memory:** Both `/api/analyze` and `/api/polish` share the same IP-based rate limiter (`src/lib/rateLimit.ts`, 10 req/hour). It resets on server restart. Do not introduce Redis without a discussion.
- **Dark mobile shell:** `bg-zinc-950 text-zinc-50` throughout. Touch targets min 44px (enforced in `globals.css`). All new UI must follow this palette.
- **Caption shape is fixed:** 3 lines always — descriptors/brand/itemType/emojis | size | price — DM to order!. Max 200 chars, descriptors dropped first. Do not add a 4th line or change the CTA format.
- **Model:** `claude-opus-4-7` for both analysis and polish. Do not downgrade to Haiku.

## Key files

| Path | Purpose |
|------|---------|
| `issues/prd.md` | Cycle 2 spec (multi-currency + long-form description) |
| `issues/done/` | All 14 completed issue definitions (cycles 1 + 2) |
| `issues/status.json` | Machine-readable tracker |
| `src/types/clothing.ts` | Canonical `ClothingAnalysis` type + `Currency` alias |
| `src/lib/analyzeClothingImage.ts` | Dynamic system prompt, `parseAnalysis`, `analyzeClothingImage(base64, currency)` |
| `src/lib/polishDescription.ts` | `polishDescription(draft, notes, currency) → Promise<string>` |
| `src/app/api/polish/route.ts` | `POST /api/polish` |
| `src/components/DescriptionAccordion.tsx` | Full description flow UI |
| `src/app/page.tsx` | App shell — currency state, pending-currency confirmation, phase management |

## Context for the next /grill-me session

ClothList now serves two distinct markets: Lagos sellers using WhatsApp (₦ pricing, 3-line captions) and UK secondhand/upcycled sellers on eBay, Vinted, and Shopify (£ pricing, 80–120 word listing descriptions). The core flow is: photo → Claude Vision analysis → review screen with caption + collapsible description accordion → copy/share. Currency selection persists in `localStorage` and defaults to GBP. The description accordion generates a raw draft from the analysis call (free, instant), lets the seller add provenance context, then optionally polishes the draft into professional listing copy via a second Claude call. The app is a mobile-first PWA. For the next cycle, focus on feedback from the UK upcycled seller validation session (~2026-05-23) — description tone and platform-fit issues are the most likely gaps. Do not revisit: currency-switch confirmation UX, rawDescriptionDraft observation-only rule, or the 3-line caption shape — these are settled decisions.
