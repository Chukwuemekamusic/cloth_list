---
mode: afk
---

## Parent PRD

`issues/prd.md`

## What to build

Bootstrap the Next.js App Router project with Tailwind CSS, a mobile-first shell layout, and a Vercel deployment. The result is a blank but fully functional PWA shell that loads correctly on an Android phone browser — correct viewport, touch-friendly tap targets, and a deploy preview URL for testing on real devices from day one.

This slice establishes the foundation every other slice builds on: project structure, environment variable handling (for the Claude API key), and the CI/deploy pipeline.

## Acceptance criteria

- [ ] `next dev` runs without errors
- [ ] App is deployed to Vercel with a working preview URL
- [ ] `ANTHROPIC_API_KEY` is wired as a Vercel environment variable and accessible in API routes (not exposed to the client)
- [ ] Tailwind is configured and a sample utility class renders correctly
- [ ] Mobile viewport meta tag is set; app looks correct on a 375px-wide screen
- [ ] No desktop-only layout assumptions (no fixed-width centred containers in the shell)

## Blocked by

None — can start immediately.

## User stories addressed

- User story 5 (works on low-end Android)
- User story 24 (loads fast on 3G — foundation for performance budget)
- User story 25 (no login required — no auth scaffolding added)
- User story 28 (clear simple English — sets tone for copy from the start)
