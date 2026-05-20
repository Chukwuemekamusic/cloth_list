# Cloth Resell

An AI-powered listing tool for clothing resellers. Take a photo of an item, get an instant draft listing with title, price suggestion, and a polished two-paragraph description — ready to post on eBay, Vinted, or Shopify.

## How it works

1. Upload a photo of the clothing item
2. Claude analyses the image and generates a draft listing (title, price, description)
3. Add any seller notes (measurements, condition, story behind the piece)
4. Hit polish — Claude rewrites the description into a clean, platform-ready format
5. Copy and post

## Tech stack

- [Next.js](https://nextjs.org) (App Router)
- [Claude API](https://docs.anthropic.com) — vision analysis + description generation
- Supports GBP and NGN pricing

## Getting started

```bash
npm install
```

Copy the example env file and add your Anthropic API key:

```bash
cp .env.local.example .env.local
```

```env
ANTHROPIC_API_KEY=your_key_here
```

Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API routes

| Route | Method | Description |
|---|---|---|
| `/api/analyze` | POST | Analyses a base64 image and returns a draft listing |
| `/api/polish` | POST | Rewrites a draft description into polished copy |

Both routes are rate-limited per IP.
