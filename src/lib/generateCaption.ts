import type { ClothingAnalysis, Currency } from '@/types/clothing'

export interface CaptionOverrides {
  size?: string
  price?: number
}

const EMOJI_MAP: Array<[RegExp, string]> = [
  [/dress|gown|ankara|skirt/i, '✨'],
  [/suit|blazer|tuxedo|corporate/i, '💼'],
  [/native|agbada|kaftan|dashiki|buba/i, '👘'],
  [/hoodie|sweatshirt|sweater/i, '🧥'],
]

function pickEmojis(itemType: string, descriptors: string[]): string {
  const text = `${itemType} ${descriptors.join(' ')}`
  const isPremium = /premium|luxury|designer/i.test(text)

  for (const [pattern, emoji] of EMOJI_MAP) {
    if (pattern.test(itemType)) {
      return isPremium ? `${emoji}✨` : emoji
    }
  }

  return isPremium ? '🔥✨' : '🔥'
}

export function formatPrice(price: number, currency: Currency): string {
  if (currency === 'GBP') return `£${price.toLocaleString('en-GB')}`
  return `₦${price.toLocaleString('en-US')}`
}

export function generateCaption(
  analysis: ClothingAnalysis,
  overrides?: CaptionOverrides,
  currency?: Currency
): string {
  const effectiveSize = overrides?.size ?? analysis.sizeDetected
  const effectivePrice = overrides?.price ?? analysis.estimatedPrice
  const effectiveCurrency = currency ?? analysis.currency

  const emojis = pickEmojis(analysis.itemType, analysis.descriptors)
  const sizeLine = effectiveSize ? `${effectiveSize} available` : 'Size — ask seller'
  const priceLine = `${formatPrice(effectivePrice, effectiveCurrency)} — DM to order!`

  const brandedItem = analysis.brand
    ? `${analysis.brand} ${analysis.itemType}`
    : analysis.itemType

  const buildCaption = (descriptorCount: number): string => {
    const chosen = analysis.descriptors.slice(0, descriptorCount)
    const line1 =
      chosen.length > 0
        ? `${chosen.join(' ')} ${brandedItem} ${emojis}`.trim()
        : `${brandedItem} ${emojis}`.trim()
    return [line1, sizeLine, priceLine].join('\n')
  }

  for (let n = Math.min(2, analysis.descriptors.length); n >= 0; n--) {
    const caption = buildCaption(n)
    if (caption.length <= 200) return caption
  }

  // Last resort: bare item type only
  return [`${analysis.itemType} ${emojis}`.trim(), sizeLine, priceLine].join('\n')
}
