import Anthropic from '@anthropic-ai/sdk'
import type { Currency } from '@/types/clothing'

export async function polishDescription(
  draft: string,
  notes: string,
  currency: Currency
): Promise<string> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const currencyNote =
    currency === 'GBP'
      ? 'Use £ for any price references.'
      : 'Use ₦ for any price references.'

  const notesSection =
    notes.trim()
      ? `\n\nSeller notes about this item:\n${notes.trim()}`
      : ''

  const prompt = `Rewrite the following clothing listing draft into a two-paragraph description of 100–150 words total, in the style of a premium secondhand or upcycled clothing listing suitable for eBay, Vinted, or Shopify. Incorporate any seller notes naturally into the description. ${currencyNote}

Paragraph 1 (2–3 sentences): Vibe and concept — what it is, the overall aesthetic, why it's special. Punchy and engaging.
Paragraph 2: Construction details, key features, measurements if provided, condition notes, and a closing hook.

Return only the two paragraphs separated by a blank line — no preamble, no quotes, no extra formatting.

Draft:
${draft}${notesSection}`

  const message = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }],
  })

  const textBlock = message.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text in Claude response')
  }

  return textBlock.text.trim()
}
