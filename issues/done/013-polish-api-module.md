---
mode: afk
---

## Parent PRD

`issues/prd.md`

## What to build

A new deep module and API route that takes a seller's edited description draft plus optional context notes and returns a polished 80–120 word listing description.

- `src/lib/polishDescription.ts` — exports `polishDescription(draft: string, notes: string, currency: Currency) → Promise<string>`. Calls Claude with `max_tokens: 256`. Prompt instructs Claude to rewrite the provided text into a flowing paragraph of 80–120 words in the style of a premium secondhand/upcycled clothing listing; incorporates seller notes; uses £ or ₦ for any price references based on `currency`.
- `POST /api/polish` — accepts `{ draft: string, notes: string, currency: 'GBP' | 'NGN' }`. Validates `draft` is a non-empty string. Runs the same IP-based rate limiter as `/api/analyze`. Calls `polishDescription`, returns `{ description: string }`. On Claude error, returns a structured error response (not a 500 crash).
- Tests in `src/__tests__/polishDescription.test.ts`: mock the Claude client; verify success returns a non-empty string; verify `draft` content reaches the prompt; verify `notes` are included when provided; verify Claude API error throws a descriptive error.

## Acceptance criteria

- [ ] `polishDescription` module exists at `src/lib/polishDescription.ts` and is callable independently
- [ ] `POST /api/polish` validates `draft`, applies rate limiting, and returns `{ description: string }`
- [ ] `POST /api/polish` returns a structured error (not a 500) when Claude fails
- [ ] `max_tokens: 256` on the Claude call
- [ ] All four test cases pass (success, draft in prompt, notes in prompt, error handling)

## Blocked by

- Blocked by `issues/008-core-type-changes.md`

## User stories addressed

- User story 15 (Polish with AI rewrites draft into professional copy)
- User story 16 (polish uses context notes as well as draft)
- User story 17 (polished description is 80–120 words in flowing paragraph form)
- User story 20 (polish reflects selected currency)
