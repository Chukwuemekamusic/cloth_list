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

  const prompt = `Rewrite the following clothing listing draft into a flowing paragraph of 80–120 words in the style of a premium secondhand or upcycled clothing listing suitable for eBay, Vinted, or Shopify. Incorporate any seller notes naturally into the description. ${currencyNote} Return only the polished description — no preamble, no quotes, no formatting.

Draft:
${draft}${notesSection}`

  const message = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 256,
    messages: [{ role: 'user', content: prompt }],
  })

  const textBlock = message.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text in Claude response')
  }

  return textBlock.text.trim()
}
