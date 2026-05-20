# ClothList — Cycle 1 Context
*Auto-updated by `/build-admin complete`. Last updated: 2026-05-20*

## Cycle overview

Build the MVP: photo upload → Claude Vision AI analysis → WhatsApp-ready caption → copy/share.

## Issues

| # | Title | Status |
|---|-------|--------|
| 001 | Project scaffold | done |
| 002 | Image input module | done |
| 003 | AI analysis API + module | done |
| 004 | Caption generator module | done |
| 005 | End-to-end listing flow UI | done |
| 006 | Share/copy module | done |
| 007 | PWA hardening | **todo** |

## Files created this cycle

| Path | What it does |
|------|-------------|
| `src/app/layout.tsx` | Root layout — mobile viewport, theme color, Geist font |
| `src/app/page.tsx` | Home screen — Client Component holding base64 image state, renders ImageInput |
| `src/app/globals.css` | Global styles — Tailwind, touch targets, no horizontal overflow |
| `src/app/api/analyze/route.ts` | `POST /api/analyze` — rate limiting, validation, Claude Vision call, structured error responses |
| `src/components/ImageInput.tsx` | Camera/gallery picker with canvas compression, preview, retake button |
| `src/lib/analyzeClothingImage.ts` | Claude Vision integration — prompts for JSON, parses + validates `ClothingAnalysis` |
| `src/lib/rateLimit.ts` | In-memory IP rate limiter — 10 req/hour sliding window |
| `src/types/clothing.ts` | `ClothingAnalysis` type definition |
| `src/__tests__/analyzeClothingImage.test.ts` | 6 unit tests for `parseAnalysis` — all run without a real API key |
| `src/lib/generateCaption.ts` | Pure caption generator — `generateCaption(analysis, overrides?) → string`; emoji map, price formatter, 200-char enforcer |
| `src/__tests__/generateCaption.test.ts` | 13 unit tests covering all caption variants and edge cases |
| `vitest.config.ts` | Vitest config with `@/` path alias |
| `.env.local.example` | Template for ANTHROPIC_API_KEY |
| `.env.local` | Local env file (gitignored) |
| `src/components/ListingReview.tsx` | Full review screen — detected details panel, size/price overrides, editable caption textarea, live char count, share/copy CTA, regenerate and new-item buttons |
| `src/lib/shareCaption.ts` | `shareCaption(caption, imageBlob?) → ShareResult` — Web Share API with clipboard text fallback |
| `src/__tests__/shareCaption.test.ts` | Unit tests for shareCaption — mocks `navigator.share` and `navigator.clipboard` |

## Files modified this cycle

| Path | What changed |
|------|-------------|
| `package.json` | Added `@anthropic-ai/sdk`, `vitest`, and `"test": "vitest run"` script |

## Key patterns established this cycle

- **Dark mobile shell:** `bg-zinc-950 text-zinc-50` is the base palette — keep all screens consistent with this.
- **Touch targets:** `globals.css` enforces `min-height: 44px` on buttons/links — don't override with smaller heights.
- **No horizontal scroll:** `overflow-x: hidden` on html/body — all layouts must stay within the viewport width.
- **Viewport:** Configured via Next.js `export const viewport` in `layout.tsx`, not a manual meta tag.
- **Env vars:** `ANTHROPIC_API_KEY` must stay server-side only — never import from client components.
- **ClothingAnalysis shape:** Canonical type in `src/types/clothing.ts` — all downstream modules (caption generator, UI) import from there.
- **parseAnalysis is exported:** Tests import `parseAnalysis` directly from `analyzeClothingImage.ts` — don't make it private.
- **Rate limiter is in-memory:** Lives in `src/lib/rateLimit.ts` using a module-level `Map`. Resets on server restart — acceptable for MVP. Do not introduce Redis without discussing it.
- **Model:** Claude `claude-opus-4-5-20251001` is used for image analysis — don't downgrade to Haiku, it misses fine detail.
- **Image compression:** Client compresses to max 1 MB before sending. API expects a raw base64 string (no `data:image/...;base64,` prefix).
- **Caption shape:** 3 lines always — `[descriptors] [brand] itemType [emojis]` / `[size] available` or `Size — ask seller` / `₦price — DM to order!`. Max 200 chars; descriptors dropped first if over limit.
- **`CaptionOverrides`:** Exported type from `generateCaption.ts` — `{ size?: string; price?: number }`. Used by `ListingReview` for the override inputs.
- **ListingReview wiring:** `page.tsx` holds `Phase` state (`input | loading | review | error`). On photo confirm, it posts to `/api/analyze`, transitions to `review`, and passes `ClothingAnalysis` + `imageDataUrl` to `ListingReview`. Error state shows the API error message with a "Try again" button.
- **dataUrlToBlob:** Helper in `ListingReview.tsx` converts base64 data URL to a `Blob` for passing to `shareCaption` — needed because `ImageInput` emits a data URL, not a File.
- **shareCaption fallback:** If `navigator.share` is absent or throws `AbortError`, falls back to `navigator.clipboard.writeText(caption)`. If clipboard also fails, returns `{ status: "error" }`.

## What remains
- **007** — PWA: manifest.json, service worker, installability, offline shell.
