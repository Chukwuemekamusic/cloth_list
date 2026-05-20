import { describe, it, expect } from 'vitest'
import { generateCaption } from '@/lib/generateCaption'
import type { ClothingAnalysis } from '@/types/clothing'

const base: ClothingAnalysis = {
  itemType: 'joggers',
  brand: 'Nike',
  color: 'black',
  pattern: null,
  sizeDetected: 'L',
  sizeConfidence: 'high',
  estimatedPriceNaira: 8500,
  descriptors: ['premium', 'slim fit'],
}

describe('generateCaption', () => {
  it('includes item type, descriptor, size, price, and CTA for full fields', () => {
    const caption = generateCaption(base)
    expect(caption).toContain('Nike')
    expect(caption).toContain('joggers')
    expect(caption).toContain('L available')
    expect(caption).toContain('₦8,500')
    expect(caption).toContain('DM to order')
  })

  it('omits brand cleanly when null', () => {
    const caption = generateCaption({ ...base, brand: null })
    expect(caption).not.toContain('Nike')
    expect(caption).toContain('joggers')
  })

  it('shows "Size — ask seller" when sizeConfidence is none', () => {
    const caption = generateCaption({
      ...base,
      sizeDetected: null,
      sizeConfidence: 'none',
    })
    expect(caption).toContain('Size — ask seller')
    expect(caption).not.toContain('available')
  })

  it('shows "Size — ask seller" when sizeDetected is null regardless of stated confidence', () => {
    const caption = generateCaption({
      ...base,
      sizeDetected: null,
      sizeConfidence: 'low',
    })
    expect(caption).toContain('Size — ask seller')
  })

  it('applies price override over AI estimate', () => {
    const caption = generateCaption(base, { price: 12000 })
    expect(caption).toContain('₦12,000')
    expect(caption).not.toContain('₦8,500')
  })

  it('applies size override over AI detected size', () => {
    const caption = generateCaption(base, { size: 'XL' })
    expect(caption).toContain('XL available')
    expect(caption).not.toMatch(/\bL available\b/)
  })

  it('size override works even when sizeDetected is null', () => {
    const caption = generateCaption(
      { ...base, sizeDetected: null, sizeConfidence: 'none' },
      { size: 'M' }
    )
    expect(caption).toContain('M available')
    expect(caption).not.toContain('ask seller')
  })

  it('stays under 200 characters when descriptors are very long', () => {
    const longDescs = Array.from({ length: 10 }, (_, i) => `descriptor-number-${i}-very-long`)
    const caption = generateCaption({ ...base, brand: null, descriptors: longDescs })
    expect(caption.length).toBeLessThanOrEqual(200)
  })

  it('caps emoji count at 2', () => {
    const caption = generateCaption(base)
    const emojiRegex = /\p{Emoji_Presentation}/gu
    const matches = caption.match(emojiRegex) ?? []
    expect(matches.length).toBeLessThanOrEqual(2)
  })

  it('always produces exactly 3 lines', () => {
    const caption = generateCaption(base)
    expect(caption.split('\n')).toHaveLength(3)
  })

  it('formats price in Naira with thousands separator', () => {
    const caption = generateCaption({ ...base, estimatedPriceNaira: 25000 })
    expect(caption).toContain('₦25,000')
  })

  it('uses fire emoji for generic item types', () => {
    const caption = generateCaption({ ...base, brand: null, itemType: 'jeans', descriptors: [] })
    expect(caption).toContain('🔥')
  })

  it('uses sparkle emoji for dresses', () => {
    const caption = generateCaption({ ...base, brand: null, itemType: 'ankara dress', descriptors: [] })
    expect(caption).toContain('✨')
  })
})
