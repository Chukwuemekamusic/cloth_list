---
mode: afk
---

## Parent PRD

`issues/prd.md`

## What to build

Update the analysis module and API route so that Claude estimates prices in the correct market and returns a raw visual description draft in every response.

Changes:
- `analyzeClothingImage` accepts a `currency: Currency` parameter. The system prompt gains a market-aware pricing section: GBP ranges (£5–15 basics, £15–40 branded, £20–60 curated upcycled, £40–120 handmade/altered) when `currency === 'GBP'`; existing NGN ranges when `'NGN'`.
- The system prompt also instructs Claude to return `rawDescriptionDraft`: 2–3 sentences of visual observation only (item type, features, colours, visible materials). Claude must not invent provenance.
- `parseAnalysis` extracts `estimatedPrice`, `currency`, and `rawDescriptionDraft` from the JSON. Falls back to `''` if `rawDescriptionDraft` is missing.
- `POST /api/analyze` accepts and validates a `currency` field in the request body, defaulting to `'GBP'` if absent.

## Acceptance criteria

- [ ] `analyzeClothingImage` signature includes `currency: Currency`
- [ ] GBP system prompt includes the UK price ranges from the PRD; NGN prompt uses existing ranges
- [ ] Claude JSON schema includes `rawDescriptionDraft`
- [ ] `parseAnalysis` extracts `estimatedPrice`, `currency`, and `rawDescriptionDraft`; returns `rawDescriptionDraft: ''` when field is absent
- [ ] `/api/analyze` accepts `currency` in the request body and passes it to `analyzeClothingImage`; defaults to `'GBP'`
- [ ] `parseAnalysis` tests updated: extracts all three new fields from a full mock response; handles missing `rawDescriptionDraft` gracefully

## Blocked by

- Blocked by `issues/008-core-type-changes.md`

## User stories addressed

- User story 1 (£ prices by default)
- User story 2 (₦ prices for Lagos)
- User story 7 (caption price reflects selected market)
- User story 9 (draft description from photo)
- User story 10 (description generated during analysis call, no extra wait)
