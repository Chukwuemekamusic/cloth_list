import Anthropic from '@anthropic-ai/sdk'
import type { ClothingAnalysis } from '@/types/clothing'

const SYSTEM_PROMPT = `You are an expert clothing analyst for an African resale marketplace.
Analyze the clothing item in the image and return ONLY valid JSON — no prose, no markdown fences.

Nigerian resale price ranges (₦):
- Basic T-shirt: 3000–8000
- Polo shirt: 5000–15000
- Jeans: 8000–25000
- Joggers/sweatpants: 6000–18000
- Dress (casual): 8000–25000
- Ankara dress: 10000–35000
- Suit/blazer: 20000–60000
- Hoodie/sweatshirt: 8000–22000
- Native attire (agbada, etc.): 15000–60000
- Children's clothing: 2000–10000

Return this exact JSON shape:
{
  "itemType": "<clothing type, e.g. 'joggers', 'ankara dress', 'polo shirt'>",
  "brand": "<brand name if clearly visible, else null>",
  "color": "<dominant color>",
  "pattern": "<pattern if present, e.g. 'striped', 'floral', 'plain', else null>",
  "sizeDetected": "<size label if readable in image, else null>",
  "sizeConfidence": "<'high' if read from visible label, 'low' if estimated from proportions, 'none' if not determinable>",
  "estimatedPriceNaira": <number, midpoint of the Nigerian resale range for this item>,
  "descriptors": ["<1-4 short descriptors like 'slim fit', 'cotton', 'vintage', 'premium'>"]
}`

function parseAnalysis(text: string): ClothingAnalysis {
  let raw: unknown
  try {
    raw = JSON.parse(text.trim())
  } catch {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON object found in Claude response')
    raw = JSON.parse(jsonMatch[0])
  }

  if (typeof raw !== 'object' || raw === null) throw new Error('Response is not an object')
  const r = raw as Record<string, unknown>

  return {
    itemType: typeof r.itemType === 'string' ? r.itemType : 'clothing item',
    brand: typeof r.brand === 'string' ? r.brand : null,
    color: typeof r.color === 'string' ? r.color : 'unknown',
    pattern: typeof r.pattern === 'string' ? r.pattern : null,
    sizeDetected: typeof r.sizeDetected === 'string' ? r.sizeDetected : null,
    sizeConfidence:
      r.sizeConfidence === 'high' || r.sizeConfidence === 'low' ? r.sizeConfidence : 'none',
    estimatedPriceNaira: typeof r.estimatedPriceNaira === 'number' ? r.estimatedPriceNaira : 5000,
    descriptors: Array.isArray(r.descriptors)
      ? (r.descriptors as unknown[]).filter((d): d is string => typeof d === 'string')
      : [],
  }
}

export async function analyzeClothingImage(base64Image: string): Promise<ClothingAnalysis> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  let data = base64Image
  let mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' = 'image/jpeg'

  const dataUrlMatch = base64Image.match(/^data:(image\/[^;]+);base64,(.+)$/)
  if (dataUrlMatch) {
    mediaType = dataUrlMatch[1] as typeof mediaType
    data = dataUrlMatch[2]
  } else {
    mediaType = base64Image.startsWith('/9j/') ? 'image/jpeg' : 'image/png'
  }

  const message = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data },
          },
          { type: 'text', text: 'Analyze this clothing item.' },
        ],
      },
    ],
  })

  const textBlock = message.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') throw new Error('No text in Claude response')

  return parseAnalysis(textBlock.text)
}

export { parseAnalysis }
