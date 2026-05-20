# ClothList — Cycle 2 Context
*Auto-updated by `/build-admin complete`. Last updated: 2026-05-20*

## Cycle overview

Add multi-currency pricing (GBP/NGN) and a long-form listing description generator for UK sellers on eBay, Vinted, and Shopify.

## Issues

| # | Title | Status |
|---|-------|--------|
| 008 | Core type changes | done |
| 009 | Currency-aware analysis | done |
| 010 | Currency toggle UI + localStorage | done |
| 011 | Multi-currency caption generator | done |
| 012 | Currency switch post-analysis confirmation | done |
| 013 | Polish API + module | done |
| 014 | Description accordion UI | done |

## Files created this cycle

| Path | What it does |
|------|-------------|
| `src/lib/polishDescription.ts` | `polishDescription(draft, notes, currency) → Promise<string>` — Claude text-only call, `max_tokens: 256` |
| `src/app/api/polish/route.ts` | `POST /api/polish` — validation, rate limiting, structured errors, returns `{ description: string }` |
| `src/components/DescriptionAccordion.tsx` | Collapsed accordion: context notes → generate (instant) → edit textarea → Polish with AI → undo → copy |
| `src/__tests__/polishDescription.test.ts` | 7 unit tests for `polishDescription` — mock Claude client via `vi.hoisted` |

## Files modified this cycle

| Path | What changed |
|------|-------------|
| `src/types/clothing.ts` | Added `Currency` type alias; renamed `estimatedPriceNaira → estimatedPrice`; added `currency: Currency` and `rawDescriptionDraft: string` to `ClothingAnalysis` |
| `src/lib/analyzeClothingImage.ts` | `analyzeClothingImage` now accepts `currency: Currency`; system prompt is built dynamically with GBP/NGN price ranges; JSON schema includes `estimatedPrice`, `currency`, `rawDescriptionDraft`; `parseAnalysis` extracts all three new fields |
| `src/app/api/analyze/route.ts` | Accepts `currency` field in request body, defaults to `'GBP'`, passes to `analyzeClothingImage` |
| `src/lib/generateCaption.ts` | Exported `formatPrice(price, currency) → string`; `generateCaption` accepts optional `currency` param (falls back to `analysis.currency`) |
| `src/app/page.tsx` | Holds `currency` state (localStorage-persisted, default `'GBP'`); `pendingCurrency` for post-analysis switch confirmation; `CurrencyToggle` pill shown on input + review screens; `runAnalysis` accepts optional `overrideCurrency` |
| `src/components/ListingReview.tsx` | Uses `analysis.currency` for price display symbol and price override label; renders `DescriptionAccordion` below New Item button |
| `src/__tests__/analyzeClothingImage.test.ts` | Updated for new JSON schema (`estimatedPrice`, `currency`, `rawDescriptionDraft`); 3 new tests |
| `src/__tests__/generateCaption.test.ts` | `base` fixture updated (`estimatedPrice`, `currency`, `rawDescriptionDraft`); new `formatPrice` describe block with 5 tests |

## Key patterns established this cycle

- **`Currency` type alias:** `'GBP' | 'NGN'` exported from `src/types/clothing.ts` — use this type everywhere, never inline the union.
- **Dynamic system prompt:** `buildSystemPrompt(currency)` in `analyzeClothingImage.ts` constructs the prompt at call time — price ranges and JSON field notes differ by currency. Don't hardcode a single prompt.
- **`rawDescriptionDraft` is observation-only:** Claude must describe only what it sees. Seller context notes are the sole source of provenance details. This invariant is enforced by the prompt wording — do not weaken it.
- **`polishDescription` is a deep module:** Simple interface (`draft, notes, currency → string`), fully testable with a mocked client. All Claude API concerns live inside it; callers know nothing about Anthropic SDK.
- **`vi.hoisted` for shared mock state:** When a test file needs a `vi.fn()` mock that's referenced both in `vi.mock()` and in test assertions, define it with `vi.hoisted(() => ({ mockFn: vi.fn() }))` — plain `const` won't work because `vi.mock` is hoisted before variable declarations.
- **Post-analysis currency switch:** `pendingCurrency` state in `page.tsx` intercepts toggle clicks when `analysis !== null`. Confirmation banner shown; confirm triggers re-analysis with new currency; cancel restores previous selection. Never silently convert numbers.
- **`formatPrice` not `₦` literals:** All price rendering goes through `formatPrice(price, currency)` — no hardcoded currency symbols anywhere in caption or UI code.
- **`max_tokens: 256` on polish:** Description is capped at 120 words (~160 tokens). 256 is the ceiling — don't increase it without re-evaluating cost.
- **DescriptionAccordion is independent:** It receives `rawDescriptionDraft` and `currency` and manages all its own state. It does not share state with `ListingReview` or the caption flow.

## What remains

All Cycle 2 issues are complete. Next cycle begins after friend validation (~2026-05-23).
