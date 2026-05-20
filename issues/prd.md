# PRD: WhatsApp-First AI Listing Tool for African Clothing Resellers

**Working title:** ClothList  
**Version:** 1.0 (MVP)  
**Date:** 2026-05-18

---

## Problem Statement

Informal clothing resellers in Nigeria (and across West and East Africa) sell primarily through WhatsApp Status, Instagram, and Facebook Marketplace. Their core workflow is manual and repetitive: photograph an item, think of a compelling caption, note the size and price, then paste all of this into each platform individually.

This process is slow, mentally draining, and scales poorly. A seller with 20 items to list in a day spends hours on caption writing rather than selling. There is no affordable tool that addresses this workflow for African resellers — existing AI listing tools are built for Western platforms (eBay, Depop, Vinted), priced in USD, and assume desktop-first usage patterns.

---

## Solution

A mobile-first Progressive Web App (PWA) that lets a reseller snap or upload a photo of a clothing item and instantly receive a short, punchy, WhatsApp-ready caption — including item name, key details, size, and a suggested price in Naira — which they can edit and copy to clipboard in one tap.

No account required. No app store. Works on any Android browser. Fast enough to list an item in under 30 seconds.

---

## User Stories

### Photo Input
1. As a reseller, I want to take a photo directly from the app using my phone camera, so that I don't have to open a separate camera app and re-upload.
2. As a reseller, I want to upload a photo from my phone gallery, so that I can use photos I already have.
3. As a reseller, I want to see a preview of my photo before generating a caption, so that I can confirm I've selected the right image.
4. As a reseller, I want to retake or replace the photo before generating, so that I can fix a bad shot without starting over.
5. As a reseller, I want the app to work on a low-end Android phone with a modest camera, so that I'm not excluded by hardware limitations.

### AI Analysis
6. As a reseller, I want the app to automatically identify the type of clothing item from my photo, so that I don't have to describe it myself.
7. As a reseller, I want the AI to detect the brand if it's visible on the item, so that my listing is more accurate without extra effort.
8. As a reseller, I want the AI to identify the dominant color and pattern of the item, so that the caption describes it accurately.
9. As a reseller, I want the AI to read the size label from the photo if it's visible, so that I don't have to type it manually.
10. As a reseller, I want the AI to suggest a price based on the item category, so that I have a starting point even if I don't know the market rate.
11. As a reseller, I want to see what the AI detected (item type, size, price) before the caption is generated, so that I can catch errors early.

### Caption Editing
12. As a reseller, I want to confirm or correct the AI's size detection before the caption is finalized, so that I don't send buyers wrong information.
13. As a reseller, I want to adjust the suggested price before copying the caption, so that I can set my own margin.
14. As a reseller, I want to edit the full caption text after it's generated, so that I can add personal touches or fix anything.
15. As a reseller, I want the caption to be short and punchy (2–4 lines), so that it reads naturally on WhatsApp and Instagram.
16. As a reseller, I want the caption to include a call to action (e.g. "DM to order"), so that interested buyers know what to do.
17. As a reseller, I want prices to be displayed in Naira (₦), so that the caption is ready to post without any editing.
18. As a reseller, I want to regenerate the caption if I don't like the first result, so that I have options.
19. As a reseller, I want a character count on the caption, so that I can keep it concise.

### Copy & Share
20. As a reseller, I want to copy the caption to clipboard with one tap, so that I can paste it straight into WhatsApp.
21. As a reseller, I want a clear visual confirmation when the caption is copied, so that I know the copy succeeded.
22. As a reseller, I want to share the caption and image together via the native Android share sheet, so that I can send both to WhatsApp Status in one action.
23. As a reseller, I want to share to Instagram, Facebook Marketplace, or any other app through the same share sheet, so that the tool isn't locked to WhatsApp.

### General UX
24. As a reseller, I want the app to load fast on a slow mobile data connection (3G), so that I can use it at the market.
25. As a reseller, I want to use the app without creating an account or logging in, so that I can start immediately with zero friction.
26. As a reseller, I want to install the app on my Android home screen, so that I can open it quickly like a native app.
27. As a reseller, I want the app to work offline for the editing step (after the caption is generated), so that a dropped connection doesn't lose my work.
28. As a reseller, I want all text in clear, simple English, so that it's accessible regardless of education level.
29. As a reseller, I want to list a new item immediately after copying a caption, so that I can process multiple items in a session without friction.

---

## Implementation Decisions

### Architecture

The app is a Next.js PWA with API routes that proxy calls to the Claude Vision API. No database. No authentication. All state is ephemeral and held client-side for the duration of a session.

### Modules

**1. Image Input Module**
- Handles both camera capture (via browser `MediaDevices.getUserMedia`) and gallery upload (`<input type="file" accept="image/*">`)
- Compresses image client-side before sending to the API to reduce latency and cost
- Interface: returns an image blob/base64 string ready for the analysis module

**2. AI Analysis Module** *(deep — tested in isolation)*
- Sends the image to Claude Vision API with a structured prompt
- Returns a typed JSON object: `{ itemType, brand, color, pattern, sizeDetected, sizeConfidence, estimatedPriceNaira, descriptors[] }`
- `sizeConfidence` distinguishes between "read from label" (high) and "estimated from proportions" (low) so the UI can prompt accordingly
- Price estimation is based on Claude's knowledge of Nigerian resale market ranges for the item category — no external API calls in v1
- Interface is a single async function: `analyzeClothingImage(imageBase64) → ClothingAnalysis`

**3. Caption Generator Module** *(deep — tested in isolation)*
- Pure function: takes a `ClothingAnalysis` object plus user overrides (`{ size, priceNaira }`) and returns a formatted caption string
- Caption structure: line 1 = item name + standout detail, line 2 = size availability, line 3 = price + CTA
- Emoji used sparingly (1–2 per caption, contextually relevant)
- Interface: `generateCaption(analysis, overrides) → string`

**4. Caption Editor Component**
- Pre-filled textarea with the generated caption
- Inline size and price fields above the textarea so overrides are easy
- Regenerate button re-calls the caption generator with current overrides (no new AI call needed — pure function)
- Character count display

**5. Share / Copy Module** *(deep — tested in isolation)*
- Tries `navigator.share({ text, files })` first (Web Share API with image) for native share sheet
- Falls back to `navigator.clipboard.writeText(caption)` for copy-only
- Returns a status (`shared` | `copied` | `error`) for UI feedback
- Interface: `shareCaption(caption, imageBlob) → ShareResult`

### API Design

One server-side API route: `POST /api/analyze`
- Accepts: `{ image: base64string }`
- Returns: `ClothingAnalysis` JSON
- Claude API key is server-side only, never exposed to the client
- Rate limiting: simple IP-based throttle (10 requests/hour per IP) to prevent abuse without requiring auth

### PWA Configuration
- `manifest.json` with `display: standalone`, icon set, theme color
- Service worker for shell caching (offline access to the UI after first load)
- Camera and clipboard permissions requested at point of use, not on app open

### Tech Stack
- **Framework:** Next.js (App Router)
- **AI:** Claude API — `claude-haiku-4-5` for cost efficiency; upgradeable to `claude-sonnet-4-6` if analysis quality needs improvement
- **Styling:** Tailwind CSS (mobile-first)
- **Deployment:** Vercel
- **No database, no auth, no third-party integrations in v1**

---

## Testing Decisions

**What makes a good test here:** Tests should verify observable output for a given input — not implementation internals. A good test for `generateCaption` checks that the output string contains the item name, price, and a call to action. It does not check which internal string methods were called.

**Modules to test:**

- **`analyzeClothingImage`** — mock the Claude API response; verify the function correctly parses and types the returned JSON, handles missing fields gracefully, and rejects malformed responses with a clear error.
- **`generateCaption`** — unit tests covering: standard item with all fields, item with no brand detected, item where size confidence is low, price override by user, very long item descriptors (truncation behaviour).
- **`shareCaption`** — mock `navigator.share` and `navigator.clipboard`; verify correct fallback logic (share → copy → error), and that the correct status is returned in each case.

---

## Out of Scope

- User accounts, login, or listing history
- Direct WhatsApp, Instagram, or Facebook API integration
- Live price scraping from Jiji or Jumia
- Inventory management or bulk listing
- Western resale platforms (eBay, Vinted, Shopify, Poshmark)
- Nigerian Pidgin or other language support
- Payments or in-app monetisation
- Analytics or usage tracking
- Multi-photo listings (single photo only in v1)

---

## Further Notes

- **Friend validation (end of week ~2026-05-23):** User's friend sells revamped + resold clothes on eBay, Vinted, and Shopify. Her workflow feedback may surface UX issues not visible from the Lagos market context. Treat her as a secondary test user for v1.
- **Lagos market seller:** Buys bulk clothing from China, sells informally. Does inventory manually. Potential v2 feature: inventory tracking (scan items into a list, track what's sold). Keep data model in mind.
- **Pricing in v1:** Claude's price estimates will be rough. The goal is to give sellers a starting point, not a definitive market rate. UI copy should set this expectation ("Suggested price — adjust to your margin").
- **Android first:** The Web Share API with file sharing is well-supported on Android Chrome. iOS Safari has limitations with `navigator.share` for files — acceptable to degrade gracefully to copy-only on iOS for MVP.
