import type { NextRequest } from 'next/server'
import { analyzeClothingImage } from '@/lib/analyzeClothingImage'
import { checkRateLimit } from '@/lib/rateLimit'

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

  if (
    typeof body !== 'object' ||
    body === null ||
    typeof (body as Record<string, unknown>).image !== 'string' ||
    (body as Record<string, unknown>).image === ''
  ) {
    return Response.json({ error: 'Missing or empty "image" field.' }, { status: 400 })
  }

  const base64 = (body as { image: string }).image

  try {
    const analysis = await analyzeClothingImage(base64)
    return Response.json(analysis)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Analysis failed.'
    return Response.json({ error: message }, { status: 502 })
  }
}
