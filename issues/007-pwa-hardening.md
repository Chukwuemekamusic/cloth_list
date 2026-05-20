---
mode: afk
---

## Parent PRD

`issues/prd.md`

## What to build

Turn the Next.js app into a properly installable PWA. This covers the web app manifest, a service worker that caches the app shell for offline access, and the "Add to home screen" prompt on Android. After this slice, a reseller can install ClothList on their Android home screen and open it instantly — even before a network connection is established.

Offline support is scoped to the shell and editing step only. The AI analysis step requires a network connection and shows a clear message if one is unavailable.

## Acceptance criteria

- [ ] `manifest.json` is present with `name`, `short_name`, `display: "standalone"`, `start_url`, `background_color`, `theme_color`, and a full icon set (192×192 and 512×512 minimum)
- [ ] Android Chrome shows the "Add to home screen" banner after the app is used
- [ ] App installed from home screen launches in standalone mode (no browser chrome)
- [ ] App shell (layout, photo input screen) loads from service worker cache when offline
- [ ] Caption editor screen (post-analysis) remains usable offline — edits, overrides, and regenerate all work without a connection
- [ ] A clear "No connection — AI analysis requires internet" message is shown if the user tries to analyse a photo while offline
- [ ] Lighthouse PWA audit scores "Installable" and "PWA Optimized"

## Blocked by

`issues/001-project-scaffold.md`

## User stories addressed

- User story 24 (fast load on 3G — shell is cached)
- User story 26 (install on Android home screen)
- User story 27 (offline editing after caption is generated)
