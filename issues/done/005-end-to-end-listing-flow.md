---
mode: afk
---

## Parent PRD

`issues/prd.md`

## What to build

The main listing screen that wires all prior modules into a single end-to-end flow. After the user confirms their photo (from `issues/002`), this screen:

1. Calls `POST /api/analyze` and shows a loading state
2. Displays the AI's detected details (item type, brand, color, size with confidence indicator, suggested price) in a compact review panel
3. Renders the generated caption in an editable textarea
4. Provides inline size and price override fields — changing either instantly regenerates the caption (no new API call)
5. Shows a live character count on the caption textarea
6. Includes a "Regenerate" button that re-runs caption generation with current overrides

This slice delivers the first fully demoable end-to-end flow: take photo → get caption → edit it. Share/copy comes in the next slice.

## Acceptance criteria

- [ ] Submitting a photo triggers `POST /api/analyze` with a visible loading spinner
- [ ] On success, the review panel shows: item type, brand (or "Not detected"), color, size + confidence badge, suggested price in ₦
- [ ] Caption textarea is pre-filled with the generated caption and is fully editable
- [ ] Size override field is pre-filled with detected size; changing it updates the caption instantly
- [ ] Price override field is pre-filled with suggested price; changing it updates the caption instantly
- [ ] Character count updates live as the user edits the caption
- [ ] "Regenerate" button produces a fresh caption from current overrides (no new API call)
- [ ] On API error, a plain-English error message is shown with a "Try again" button
- [ ] "New item" / back button returns to the photo input screen and clears state
- [ ] UI is fully usable on a 375px screen with no horizontal scroll

## Blocked by

- `issues/002-image-input-module.md`
- `issues/003-ai-analysis-api-and-module.md`
- `issues/004-caption-generator-module.md`

## User stories addressed

- User story 11 (see detected details before caption)
- User story 12 (confirm or correct size)
- User story 13 (adjust price)
- User story 14 (edit full caption)
- User story 18 (regenerate caption)
- User story 19 (character count)
- User story 29 (list a new item immediately after)
