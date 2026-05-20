import { describe, it, expect, vi } from 'vitest'
import { parseAnalysis } from '@/lib/analyzeClothingImage'

vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn(),
    },
  })),
}))

describe('parseAnalysis', () => {
  it('parses a full valid GBP response', () => {
    const raw = JSON.stringify({
      itemType: 'ankara dress',
      brand: null,
      color: 'blue',
      pattern: 'floral',
      sizeDetected: 'M',
      sizeConfidence: 'high',
      estimatedPrice: 35,
      currency: 'GBP',
      rawDescriptionDraft: 'A vibrant blue ankara dress with floral print.',
      descriptors: ['cotton', 'slim fit'],
    })

    const result = parseAnalysis(raw)

    expect(result.itemType).toBe('ankara dress')
    expect(result.brand).toBeNull()
    expect(result.color).toBe('blue')
    expect(result.pattern).toBe('floral')
    expect(result.sizeDetected).toBe('M')
    expect(result.sizeConfidence).toBe('high')
    expect(result.estimatedPrice).toBe(35)
    expect(result.currency).toBe('GBP')
    expect(result.rawDescriptionDraft).toBe('A vibrant blue ankara dress with floral print.')
    expect(result.descriptors).toEqual(['cotton', 'slim fit'])
  })

  it('parses a full valid NGN response', () => {
    const raw = JSON.stringify({
      itemType: 'joggers',
      brand: null,
      color: 'black',
      pattern: null,
      sizeDetected: 'L',
      sizeConfidence: 'high',
      estimatedPrice: 12000,
      currency: 'NGN',
      rawDescriptionDraft: 'Black joggers with an elastic waistband.',
      descriptors: ['slim fit'],
    })

    const result = parseAnalysis(raw)
    expect(result.estimatedPrice).toBe(12000)
    expect(result.currency).toBe('NGN')
  })

  it('fills in defaults for missing optional fields', () => {
    const raw = JSON.stringify({
      itemType: 'joggers',
      color: 'black',
      estimatedPrice: 12000,
      currency: 'NGN',
    })

    const result = parseAnalysis(raw)

    expect(result.brand).toBeNull()
    expect(result.pattern).toBeNull()
    expect(result.sizeDetected).toBeNull()
    expect(result.sizeConfidence).toBe('none')
    expect(result.rawDescriptionDraft).toBe('')
    expect(result.descriptors).toEqual([])
  })

  it('returns rawDescriptionDraft as empty string when field is absent', () => {
    const raw = JSON.stringify({
      itemType: 'hoodie',
      color: 'grey',
      estimatedPrice: 20,
      currency: 'GBP',
    })

    const result = parseAnalysis(raw)
    expect(result.rawDescriptionDraft).toBe('')
  })

  it('extracts JSON embedded in prose', () => {
    const raw = `Here is my analysis:\n{"itemType":"polo shirt","brand":"Lacoste","color":"white","pattern":null,"sizeDetected":"L","sizeConfidence":"high","estimatedPrice":25,"currency":"GBP","rawDescriptionDraft":"A white Lacoste polo shirt.","descriptors":["premium"]}`

    const result = parseAnalysis(raw)
    expect(result.itemType).toBe('polo shirt')
    expect(result.brand).toBe('Lacoste')
    expect(result.sizeConfidence).toBe('high')
    expect(result.currency).toBe('GBP')
    expect(result.rawDescriptionDraft).toBe('A white Lacoste polo shirt.')
  })

  it('throws on malformed JSON with no recoverable object', () => {
    expect(() => parseAnalysis('not json at all')).toThrow()
  })

  it('rejects invalid sizeConfidence values by defaulting to none', () => {
    const raw = JSON.stringify({
      itemType: 'jeans',
      color: 'indigo',
      sizeDetected: 'XL',
      sizeConfidence: 'maybe',
      estimatedPrice: 18,
      currency: 'GBP',
      rawDescriptionDraft: '',
      descriptors: [],
    })

    const result = parseAnalysis(raw)
    expect(result.sizeConfidence).toBe('none')
  })

  it('defaults currency to NGN when value is unrecognised', () => {
    const raw = JSON.stringify({
      itemType: 'hoodie',
      color: 'grey',
      estimatedPrice: 15,
      currency: 'EUR',
      rawDescriptionDraft: '',
      descriptors: [],
    })

    const result = parseAnalysis(raw)
    expect(result.currency).toBe('NGN')
  })

  it('filters non-string values out of descriptors array', () => {
    const raw = JSON.stringify({
      itemType: 'hoodie',
      color: 'grey',
      estimatedPrice: 15,
      currency: 'GBP',
      rawDescriptionDraft: '',
      descriptors: ['warm', 42, null, 'oversized'],
    })

    const result = parseAnalysis(raw)
    expect(result.descriptors).toEqual(['warm', 'oversized'])
  })
})
