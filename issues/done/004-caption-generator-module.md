---
mode: afk
---

## Parent PRD

`issues/prd.md`

## What to build

A pure `generateCaption(analysis, overrides) → string` function with a full unit test suite. It takes a `ClothingAnalysis` object (from `issues/003-ai-analysis-api-and-module.md`) plus optional user overrides for size and price, and returns a formatted WhatsApp-style caption string.

No API calls, no side effects. This is entirely testable in isolation.

**Caption structure:**
- Line 1: item name + standout descriptor (1–2 relevant emojis)
- Line 2: size availability
- Line 3: price in ₦ + call to action ("DM to order!")

**Example output:**
```
Premium Turkish joggers 🔥
M / L / XL available
₦8,500 — DM to order!
```

## Acceptance criteria

- [ ] `generateCaption` is a pure function (no network calls, no side effects)
- [ ] Output always includes item type, at least one descriptor, size, price in ₦, and "DM to order"
- [ ] When `sizeConfidence` is `"none"`, the size line reads "Size — ask seller" instead of a blank
- [ ] Brand is included in line 1 when present (e.g. "Nike joggers"), omitted cleanly when `null`
- [ ] User override for size replaces the AI-detected size
- [ ] User override for price replaces the AI-estimated price
- [ ] Descriptors are truncated so the full caption stays under 200 characters
- [ ] Emoji count is capped at 2 per caption
- [ ] Unit tests cover: full fields, no brand, low size confidence, no size, price override, size override, very long descriptors

## Blocked by

`issues/003-ai-analysis-api-and-module.md` (shares the `ClothingAnalysis` type)

## User stories addressed

- User story 15 (short, punchy caption)
- User story 16 (call to action)
- User story 17 (price in Naira)
- User story 18 (regenerate with different overrides)
