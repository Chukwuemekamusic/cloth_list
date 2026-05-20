---
mode: afk
---

## Parent PRD

`issues/prd.md`

## What to build

A self-contained image input component that gives the user two ways to get a photo into the app: take one with their phone camera, or pick one from their gallery. After selection, the image is previewed and the user can retake/replace before proceeding. Images are compressed client-side before being passed downstream to reduce API latency and cost.

This slice delivers a demoable photo capture → preview → confirm flow with no AI involvement yet.

## Acceptance criteria

- [ ] "Take photo" button triggers the device camera on Android Chrome via `<input type="file" accept="image/*" capture="environment">`
- [ ] "Upload from gallery" allows selecting any image from the device
- [ ] Selected photo is displayed as a full-width preview
- [ ] "Retake / Change photo" button clears the preview and returns to the input state
- [ ] Image is compressed client-side to a maximum of 1MB before being stored in component state (to cap API payload size)
- [ ] Component works correctly on a 375px screen with no horizontal scroll
- [ ] No image is sent anywhere in this slice — output is a base64 string held in local state

## Blocked by

`issues/001-project-scaffold.md`

## User stories addressed

- User story 1 (take photo from app)
- User story 2 (upload from gallery)
- User story 3 (preview before generating)
- User story 4 (retake or replace)
- User story 5 (works on low-end Android)
