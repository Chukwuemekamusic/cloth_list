---
mode: afk
---

## Parent PRD

`issues/prd.md`

## What to build

The `analyzeClothingImage` module and its backing `POST /api/analyze` API route. The module sends a clothing photo to Claude Vision and returns a typed `ClothingAnalysis` object. The API route is the only place the Claude API key is used — it is never exposed to the client.

This slice also covers IP-based rate limiting (10 requests/hour per IP) and graceful error handling. Tests mock the Claude API response to verify parsing, missing-field handling, and error cases.

**`ClothingAnalysis` type:**
```ts
{
  itemType: string;         // e.g. "joggers", "ankara dress"
  brand: string | null;     // null if not visible
  color: string;
  pattern: string | null;
  sizeDetected: string | null;
  sizeConfidence: "high" | "low" | "none";  // high = read from label
  estimatedPriceNaira: number;
  descriptors: string[];    // e.g. ["premium", "cotton", "slim fit"]
}
```

## Acceptance criteria

- [ ] `POST /api/analyze` accepts `{ image: base64string }` and returns a valid `ClothingAnalysis` JSON response
- [ ] Claude API key is only accessed server-side; client bundle contains no secrets
- [ ] `sizeConfidence` is `"high"` when the AI reads a visible label, `"low"` when estimating, `"none"` when not detectable
- [ ] `estimatedPriceNaira` reflects Nigerian resale market ranges for the item category (prompt-engineered, no external API)
- [ ] Rate limiter returns HTTP 429 after 10 requests from the same IP within an hour
- [ ] API returns a structured error response (not a 500 crash) for malformed input or Claude API failures
- [ ] Unit tests: correct parsing of a full response, graceful handling of missing optional fields, rejection of malformed Claude response
- [ ] Unit tests run with `npm test` without requiring a real Claude API key (Claude response is mocked)

## Blocked by

`issues/001-project-scaffold.md`

## User stories addressed

- User story 6 (identify clothing type)
- User story 7 (detect brand)
- User story 8 (identify color and pattern)
- User story 9 (read size label)
- User story 10 (suggest price)
- User story 11 (show detected details before caption)
