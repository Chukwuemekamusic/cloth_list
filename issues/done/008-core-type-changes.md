---
mode: afk
---

## Parent PRD

`issues/prd.md`

## What to build

Update the canonical `ClothingAnalysis` type and all downstream consumers to reflect the new data shape required for multi-currency pricing and long-form description generation.

Specifically:
- Rename `estimatedPriceNaira: number` → `estimatedPrice: number`
- Add `currency: 'GBP' | 'NGN'` to `ClothingAnalysis`
- Add `rawDescriptionDraft: string` to `ClothingAnalysis`
- Export a `Currency` type alias (`'GBP' | 'NGN'`) alongside the interface

Update every file that imports `ClothingAnalysis` or references `estimatedPriceNaira` to use the new field names. The app must compile with no type errors after this slice.

## Acceptance criteria

- [ ] `Currency` type alias exported from `src/types/clothing.ts`
- [ ] `ClothingAnalysis` has `estimatedPrice: number`, `currency: Currency`, and `rawDescriptionDraft: string`; `estimatedPriceNaira` is gone
- [ ] All files that referenced `estimatedPriceNaira` are updated to `estimatedPrice`
- [ ] `tsc --noEmit` passes with no errors

## Blocked by

None — can start immediately.

## User stories addressed

Foundational prerequisite — enables all Cycle 2 user stories.
