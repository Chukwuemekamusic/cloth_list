---
mode: afk
---

## Parent PRD

`issues/prd.md`

## What to build

When the seller switches currency after an analysis result is already displayed, show an inline confirmation before discarding the current result and re-triggering analysis.

In `page.tsx`: when `currency` changes and `analysisResult` is non-null, intercept the toggle and display a confirmation prompt — "Switching to £ needs a fresh analysis — re-analyse now?" (or ₦ as appropriate). Two actions: confirm (clears result, sets currency, re-runs analysis with the current image) or cancel (restores the previous currency selection without triggering anything).

## Acceptance criteria

- [ ] Changing the currency toggle while a result is displayed shows a confirmation message (not an immediate re-analysis)
- [ ] Confirmation wording names the target currency: "Switching to £/₦ needs a fresh analysis — re-analyse now?"
- [ ] Confirming clears the current result and re-runs analysis with the new currency
- [ ] Cancelling leaves the result and the previous currency intact
- [ ] Changing currency on the input screen before any analysis triggers no confirmation

## Blocked by

- Blocked by `issues/009-currency-aware-analysis.md`
- Blocked by `issues/010-currency-toggle-ui.md`

## User stories addressed

- User story 5 (switch currency after results to compare markets)
- User story 6 (clear prompt that a fresh AI call is needed)
