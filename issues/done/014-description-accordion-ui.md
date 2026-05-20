---
mode: afk
---

## Parent PRD

`issues/prd.md`

## What to build

A new `DescriptionAccordion` component that gives sellers a full path from raw AI draft to polished, copyable listing description. Integrated into `ListingReview` below the existing New Item button.

Component receives `rawDescriptionDraft: string` and `currency: Currency` as props. Internal state: `isOpen`, `contextNotes`, `descriptionText`, `previousText` (for undo), `isPolishing`.

Layout when open (top to bottom):
1. **Context notes textarea** — optional; placeholder explains its purpose (origin material, dyeing process, patches, measurements)
2. **"Generate description" button** — synchronous; sets `descriptionText` from `rawDescriptionDraft`, appending context notes as a visible note if present
3. **Description textarea** — editable; empty until Generate is tapped
4. **"Polish with AI" button** — disabled while polishing; calls `POST /api/polish` with `descriptionText`, `contextNotes`, and `currency`; saves current text to `previousText`; replaces `descriptionText` with the result
5. **"Undo" link** — visible only after a polish has been applied; restores `previousText`
6. **"Copy description" button** — copies `descriptionText`; shows brief toast confirmation

The accordion header is labelled clearly ("Listing description — eBay, Vinted, Shopify") and is collapsed by default.

`ListingReview` is updated to accept `rawDescriptionDraft: string` and `currency: Currency` props and render `DescriptionAccordion` below the existing New Item button.

`page.tsx` is updated to pass `rawDescriptionDraft` and `currency` to `ListingReview`.

## Acceptance criteria

- [ ] Accordion is collapsed by default; label references eBay, Vinted, Shopify
- [ ] "Generate description" is instant (no API call); populates textarea from `rawDescriptionDraft`
- [ ] Context notes textarea is visible before Generate is tapped
- [ ] "Polish with AI" calls `POST /api/polish` and replaces textarea content with result
- [ ] "Polish with AI" is disabled while a polish request is in flight
- [ ] "Undo" appears after first polish and restores pre-polish text
- [ ] "Copy description" copies `descriptionText` and shows a toast
- [ ] Description and caption are independent — editing one does not affect the other
- [ ] `ListingReview` and `page.tsx` updated to pass required props

## Blocked by

- Blocked by `issues/009-currency-aware-analysis.md`
- Blocked by `issues/013-polish-api-module.md`

## User stories addressed

- User story 9 (draft listing description from photo)
- User story 10 (instant — generated during analysis call)
- User story 11 (context notes for origin story details)
- User story 12 (context notes visible before draft is generated)
- User story 13 ("Generate description" is instant)
- User story 14 (edit draft freely before polishing)
- User story 15 ("Polish with AI" rewrites into professional copy)
- User story 16 (polish uses context notes)
- User story 17 (80–120 words, flowing paragraph)
- User story 18 (polish replaces textarea content)
- User story 19 (undo after polishing)
- User story 21 ("Copy description" separate from WhatsApp caption)
- User story 22 (collapsed by default)
- User story 23 (labelled for eBay, Vinted, Shopify)
- User story 24 (description and caption independent)
