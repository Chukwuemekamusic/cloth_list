# PRD: Multi-Currency Pricing & Long-Form Listing Description

**Working title:** ClothList — Cycle 2
**Version:** 1.0
**Date:** 2026-05-20

---

## Problem Statement

ClothList's Cycle 1 MVP is built for the Lagos resale market: prices in Naira, 3-line WhatsApp captions, copy-to-clipboard. It does not serve sellers on Western secondhand platforms. A UK-based seller of upcycled clothing using eBay, Vinted, and Shopify needs two things the current app cannot provide:

1. **Market-appropriate pricing in £.** Nigerian resale prices and UK secondhand prices are not conversions of each other — they reflect entirely different markets. A hardcoded ₦ symbol and Nigerian price ranges produce meaningless output for a UK seller.

2. **A richer listing description.** eBay, Vinted, and Shopify listings require 80–150 word descriptions that convey provenance, materials, and style — not a 3-line WhatsApp caption. For upcycled one-of-a-kind pieces, the description must capture the origin story (e.g. "originally a flawed pink sweatshirt, hand-dyed lilac") that only the seller knows and that no photo can reveal. There is currently no way to produce or edit this kind of copy inside the app.

---

## Solution

**Multi-currency toggle:** A `₦ NGN / £ GBP` pill button on the input screen (defaulting to GBP) selects the market before analysis. The selected currency is sent to the Claude analysis API so pricing is estimated in the correct market context from the start. Switching currency after analysis prompts re-analysis rather than silently converting numbers.

**Long-form description generator:** An expandable "Add listing description" accordion on the review screen gives sellers a two-step path to polished copy. Claude generates a raw visual draft during the analysis call (no extra image send). The seller opens the accordion, optionally adds context notes about details Claude cannot see, taps "Generate description" to load the draft instantly, edits freely, then taps "Polish with AI" to have Claude rewrite the current text into a flowing 80–120 word listing description. A separate "Copy description" button copies it independently of the WhatsApp caption.

---

## User Stories

### Currency

1. As a UK reseller, I want prices displayed in £ by default, so that captions are ready to post without manual editing.
2. As a Lagos reseller, I want to switch to ₦ pricing, so that the app still works for my market.
3. As a seller, I want my currency preference remembered between sessions, so that I don't have to re-set it every time I open the app.
4. As a seller, I want the currency toggle on the input screen before I take a photo, so that the AI estimates prices in my market from the start.
5. As a seller, I want to switch currency after getting results, so that I can compare markets if needed.
6. As a seller, I want a clear prompt when switching currency post-analysis, so that I understand a fresh AI call is needed and can confirm or cancel.
7. As a seller, I want the suggested price in the caption to reflect the selected market, so that the figure is realistic for my buyers.
8. As a seller, I want the price override field to show the right currency symbol, so that I know what currency I'm entering.

### Long-form description — generation

9. As a UK upcycled clothing seller, I want the app to generate a draft listing description from my photo, so that I have a starting point without typing from scratch.
10. As a seller, I want description generation to happen during the analysis call, so that it is available instantly when I need it without an extra wait.
11. As a seller, I want to add context notes about things Claude cannot see (origin material, dyeing process, patches, measurements), so that the final description reflects the item's full story.
12. As a seller, I want the context notes field visible before I generate the description, so that I can fill in details before the draft is populated.
13. As a seller, I want tapping "Generate description" to be instant, so that I do not wait for another API call just to see the draft.

### Long-form description — editing and polishing

14. As a seller, I want to edit the generated draft freely before polishing, so that I can fix errors and add my voice.
15. As a seller, I want to tap "Polish with AI" to have Claude rewrite my edited draft into professional listing copy, so that the final description sounds polished without me being a copywriter.
16. As a seller, I want the polish to use my context notes as well as the edited draft, so that Claude has the full picture when rewriting.
17. As a seller, I want the polished description to be 80–120 words in flowing paragraph form, so that it fits naturally on eBay, Vinted, and Shopify.
18. As a seller, I want the polish to replace the textarea content, so that I am always editing one version and not juggling two.
19. As a seller, I want an undo option after polishing, so that I can restore my previous text if the AI version is worse.
20. As a seller, I want polishing to reflect the selected currency (£ or ₦), so that price references in the description are market-appropriate.

### Long-form description — copy and layout

21. As a seller, I want a "Copy description" button separate from the caption's Share/Copy, so that I can copy the right content for the right platform without mixing them.
22. As a seller, I want the description section collapsed by default, so that the core WhatsApp caption flow is not cluttered for sellers who don't need descriptions.
23. As a seller, I want the description section labelled clearly (eBay, Vinted, Shopify), so that I immediately understand what it is for.
24. As a seller, I want the description and caption to be independent, so that editing one does not affect the other.

---

## Implementation Decisions

### Type changes

The `ClothingAnalysis` type is the canonical data shape shared by all modules. Two changes:

- `estimatedPriceNaira: number` is renamed to `estimatedPrice: number` — currency is now tracked separately
- `currency: 'GBP' | 'NGN'` is added — the currency the price was estimated in
- `rawDescriptionDraft: string` is added — Claude's raw visual description of the item, generated during analysis

All downstream modules (`generateCaption`, `ListingReview`, the API route) import this type and must be updated to use the new field names.

### Currency toggle

A `Currency` type alias (`'GBP' | 'NGN'`) is defined alongside or within the `ClothingAnalysis` type for reuse across modules. The toggle state lives in `page.tsx` (or a React context if it grows), defaulting to `'GBP'`, persisted to `localStorage`. It is passed as a prop/parameter to all components and functions that need it.

### Analysis module changes

`analyzeClothingImage` accepts a `currency` parameter. The system prompt is extended with two changes:

1. A market-aware pricing section: when `currency === 'GBP'`, Claude is given UK secondhand/upcycled price ranges in £; when `currency === 'NGN'`, it uses the existing Nigerian ranges in ₦.
2. An additional JSON field `rawDescriptionDraft`: Claude writes 2–3 sentences describing what it visually observes in the image — item type, notable features, colors, materials visible. No origin story is invented; this is observation only.

The `parseAnalysis` function is updated to extract `estimatedPrice`, `currency`, and `rawDescriptionDraft` from the JSON.

The `POST /api/analyze` route is updated to accept and validate a `currency` field in the request body, defaulting to `'GBP'` if absent.

### Caption generator changes

`formatPrice(price: number, currency: Currency) → string` replaces the current hardcoded `₦` formatter. `generateCaption` accepts `currency` as a required parameter (alongside `analysis` and `overrides`). All call sites are updated.

### Polish API — new deep module

A new `polishDescription(draft: string, notes: string, currency: Currency) → Promise<string>` function encapsulates the Claude text-only call. It is called by the new `POST /api/polish` route.

The `POST /api/polish` route:
- Accepts `{ draft: string, notes: string, currency: 'GBP' | 'NGN' }`
- Validates that `draft` is a non-empty string
- Runs the same IP-based rate limiter as `/api/analyze`
- Calls `polishDescription`, returns `{ description: string }`
- On Claude error, returns a structured error response (not a 500 crash)

The polish prompt instructs Claude to rewrite the provided text into a flowing paragraph of 80–120 words in the style of a premium secondhand/upcycled clothing listing. It incorporates any seller notes. If `currency === 'GBP'`, any price references use £; if `'NGN'`, ₦.

### Description accordion UI

A new `DescriptionAccordion` component receives `rawDescriptionDraft`, `currency`, and no other external dependencies. Internal state: `isOpen`, `contextNotes`, `descriptionText`, `previousText` (for undo), `isPolishing`.

Layout when open (top to bottom):
1. Context notes textarea — optional, placeholder explains its purpose
2. "Generate description" button — synchronous, sets `descriptionText` from `rawDescriptionDraft`, appends context notes as a visible note if present
3. Description textarea — editable; empty until Generate is tapped
4. "Polish with AI" button — disabled while polishing; on click, calls `POST /api/polish`, saves `descriptionText` to `previousText`, replaces with result
5. "Undo" link/button — visible only after a polish has been applied; restores `previousText`
6. "Copy description" button — copies `descriptionText` to clipboard; shows brief toast confirmation

`ListingReview` is updated to accept `rawDescriptionDraft` and `currency` props and render `DescriptionAccordion` below the existing New Item button.

`page.tsx` is updated to:
- Hold `currency` state (defaulting to `'GBP'`, synced to `localStorage`)
- Pass `currency` to `POST /api/analyze`
- Pass `rawDescriptionDraft` and `currency` to `ListingReview`
- Show a "Re-analyse with £/₦ prices?" confirmation when `currency` is changed after an analysis result is already in state

---

## Testing Decisions

**What makes a good test:** Tests verify observable outputs for given inputs — not which internal methods were called. A good test for `polishDescription` verifies that the returned string is non-empty and that errors from Claude produce a thrown error, not that `client.messages.create` was called with specific parameters.

**Modules to test:**

- **`generateCaption` (updated)** — All existing tests are updated to pass `currency` explicitly. New tests: `formatPrice` returns `£15` for GBP and `₦15,000` for NGN; caption includes the correct symbol end-to-end. Prior art: `src/__tests__/generateCaption.test.ts`.

- **`parseAnalysis` (updated)** — New tests: correctly extracts `estimatedPrice`, `currency`, and `rawDescriptionDraft` from a full mock response; falls back gracefully when `rawDescriptionDraft` is missing (empty string). Prior art: `src/__tests__/analyzeClothingImage.test.ts`.

- **`polishDescription` (new)** — Mock the Claude API client. Tests: returns the polished description string on success; includes `draft` content in the prompt sent to Claude; includes `notes` when provided; handles Claude API error by throwing a descriptive error. This is a deep module — the interface is simple (`draft, notes, currency → string`) and fully testable without a real API key.

---

## Out of Scope

- Direct eBay, Vinted, or Shopify API integration (listing descriptions are copy-pasted manually)
- More than two currencies (GBP and NGN only in this cycle)
- Style controls for Polish ("make it shorter", "more formal", "more casual")
- Description regeneration button (Polish + Undo covers the use case)
- Saving captions or descriptions to local listing history
- Live price scraping or market data APIs
- Automatic currency detection from browser locale

---

## Further Notes

- **Friend validation (~2026-05-23):** The primary test user for Cycle 2 is a UK seller of upcycled clothing on eBay, Vinted, and Shopify. GBP is the default currency for this reason. Her feedback may surface description format issues (length, tone, platform fit) that should inform Cycle 3.
- **UK upcycled price ranges for the Claude prompt:** Secondhand/upcycled clothing in the UK typically ranges £5–15 for basics, £15–40 for good-condition branded pieces, £20–60 for curated upcycled items, £40–120 for handmade or altered statement pieces. These should be included in the GBP pricing section of the system prompt.
- **`rawDescriptionDraft` is observation-only:** Claude should describe only what it sees. It must not invent provenance details ("this may have been dyed"). The seller's context notes are the only source for origin story details.
- **Re-analysis on currency switch:** When the seller switches currency after results are shown, the confirmation wording should be direct: "Switching to £ needs a fresh analysis — re-analyse now?" This sets the right expectation that the price will change, not just the symbol.
- **Undo scope:** Undo only restores the pre-polish text. It does not undo manual edits the seller made before polishing. One level of undo is sufficient.
- **`max_tokens` for polish route:** The description is capped at 120 words (~160 tokens). Set `max_tokens: 256` on the polish Claude call — generous enough for the output, cheap enough not to worry about.
