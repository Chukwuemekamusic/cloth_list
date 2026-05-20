---
mode: afk
---

## Parent PRD

`issues/prd.md`

## What to build

Add a `₦ NGN / £ GBP` pill toggle to the input screen and wire currency state through `page.tsx` to the API call.

- `page.tsx` holds `currency` state, defaulting to `'GBP'`, initialised from `localStorage` on mount and written back on every change.
- The pill toggle renders on the input screen (before photo is taken), clearly showing the active selection.
- `currency` is passed to `POST /api/analyze` in the request body.
- The price override field in `ListingReview` shows `£` or `₦` according to the current `currency`.

## Acceptance criteria

- [ ] Currency pill toggle visible on the input screen with both `£ GBP` and `₦ NGN` options
- [ ] Default selection is `£ GBP`
- [ ] Selection persists across page reloads via `localStorage`
- [ ] `currency` is included in the `POST /api/analyze` request body
- [ ] Price override input field shows the correct currency symbol for the active selection

## Blocked by

- Blocked by `issues/008-core-type-changes.md`

## User stories addressed

- User story 1 (£ default)
- User story 2 (₦ option)
- User story 3 (preference remembered between sessions)
- User story 4 (toggle on input screen before photo)
- User story 8 (price override shows right currency symbol)
