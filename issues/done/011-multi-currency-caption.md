---
mode: afk
---

## Parent PRD

`issues/prd.md`

## What to build

Replace the hardcoded `₦` price formatter in `generateCaption` with a currency-aware `formatPrice` function, and update all call sites and tests.

- Extract `formatPrice(price: number, currency: Currency) → string` as a named export. Returns `£15` for GBP and `₦15,000` for NGN (locale-formatted).
- `generateCaption` gains a required `currency: Currency` parameter. Uses `formatPrice` internally. `estimatedPriceNaira` reference replaced with `analysis.estimatedPrice`.
- All existing `generateCaption` tests pass `currency` explicitly.
- New tests: `formatPrice` returns correct symbol and formatting for both currencies; `generateCaption` produces the correct currency symbol end-to-end.

## Acceptance criteria

- [ ] `formatPrice` exported from `src/lib/generateCaption.ts`; returns `£N` for GBP and `₦N,NNN` for NGN
- [ ] `generateCaption` accepts `currency` as a required third parameter
- [ ] Caption price line uses the correct symbol for the active currency
- [ ] All tests in `src/__tests__/generateCaption.test.ts` pass, updated for new signature
- [ ] New tests cover `formatPrice` for both currencies and end-to-end caption symbol correctness

## Blocked by

- Blocked by `issues/008-core-type-changes.md`

## User stories addressed

- User story 7 (caption price reflects selected market)
- User story 8 (price override shows right currency symbol)
