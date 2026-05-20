import type { NextRequest } from 'next/server'
import { polishDescription } from '@/lib/polishDescription'
import { checkRateLimit } from '@/lib/rateLimit'
import type { Currency } from '@/types/clothing'

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'

  const { allowed, retryAfterMs } = checkRateLimit(ip)
  if (!allowed) {
    return Response.json(
      { error: 'Rate limit exceeded. Try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) },
      }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const b = body as Record<string, unknown>
  if (typeof b.draft !== 'string' || b.draft.trim() === '') {
    return Response.json({ error: 'Missing or empty "draft" field.' }, { status: 400 })
  }

  const draft = b.draft as string
  const notes = typeof b.notes === 'string' ? b.notes : ''
  const currency: Currency = b.currency === 'GBP' || b.currency === 'NGN' ? b.currency : 'GBP'

  try {
    const description = await polishDescription(draft, notes, currency)
    return Response.json({ description })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Polish failed.'
    return Response.json({ error: message }, { status: 502 })
  }
}
