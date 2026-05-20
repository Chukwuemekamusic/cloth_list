---
mode: afk
---

## Parent PRD

`issues/prd.md`

## What to build

The `shareCaption(caption, imageBlob) → ShareResult` module and its integration into the listing screen. On Android Chrome, this triggers the native share sheet so the user can send both the caption text and the image to WhatsApp Status, Instagram, Facebook Marketplace, or any other app. On iOS or unsupported browsers, it falls back to copying the caption text to clipboard.

Visual feedback is shown for each outcome (shared, copied, error). Tests mock `navigator.share` and `navigator.clipboard` to verify the fallback logic.

**`ShareResult` type:**
```ts
{ status: "shared" | "copied" | "error"; message?: string }
```

## Acceptance criteria

- [ ] On Android Chrome, tapping "Share" opens the native OS share sheet with the caption pre-filled as text and the image attached
- [ ] If `navigator.share` is unavailable or the user cancels, the caption is copied to clipboard as fallback
- [ ] A toast/banner confirms the outcome: "Shared!", "Caption copied!", or a plain-English error message
- [ ] The confirmation is visible for ~2 seconds then dismisses automatically
- [ ] Copy-only clipboard fallback works on iOS Safari and desktop browsers
- [ ] Unit tests: `navigator.share` available + succeeds → returns `"shared"`, `navigator.share` unavailable → falls back to clipboard → returns `"copied"`, both unavailable → returns `"error"`
- [ ] Unit tests run without a real browser (navigator APIs are mocked)

## Blocked by

`issues/005-end-to-end-listing-flow.md`

## User stories addressed

- User story 20 (copy to clipboard in one tap)
- User story 21 (visual confirmation of copy)
- User story 22 (share image + caption via Android share sheet)
- User story 23 (share to any app via share sheet)
