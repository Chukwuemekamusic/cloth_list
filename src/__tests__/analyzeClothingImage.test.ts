import { describe, it, expect, vi, beforeEach } from 'vitest'
import { parseAnalysis } from '@/lib/analyzeClothingImage'

// Unit tests for parseAnalysis — no real Claude API needed.
// Full-stack tests mock the module to verify the API route handles responses correctly.

vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn(),
    },
  })),
}))

describe('parseAnalysis', () => {
  it('parses a full valid response', () => {
    const raw = JSON.stringify({
      itemType: 'ankara dress',
      brand: null,
      color: 'blue',
      pattern: 'floral',
      sizeDetected: 'M',
      sizeConfidence: 'high',
      estimatedPriceNaira: 22000,
      descriptors: ['cotton', 'slim fit'],
    })

    const result = parseAnalysis(raw)

    expect(result.itemType).toBe('ankara dress')
    expect(result.brand).toBeNull()
    expect(result.color).toBe('blue')
    expect(result.pattern).toBe('floral')
    expect(result.sizeDetected).toBe('M')
    expect(result.sizeConfidence).toBe('high')
    expect(result.estimatedPriceNaira).toBe(22000)
    expect(result.descriptors).toEqual(['cotton', 'slim fit'])
  })

  it('fills in defaults for missing optional fields', () => {
    const raw = JSON.stringify({
      itemType: 'joggers',
      color: 'black',
      estimatedPriceNaira: 12000,
    })

    const result = parseAnalysis(raw)

    expect(result.brand).toBeNull()
    expect(result.pattern).toBeNull()
    expect(result.sizeDetected).toBeNull()
    expect(result.sizeConfidence).toBe('none')
    expect(result.descriptors).toEqual([])
  })

  it('extracts JSON embedded in prose', () => {
    const raw = `Here is my analysis:\n{"itemType":"polo shirt","brand":"Lacoste","color":"white","pattern":null,"sizeDetected":"L","sizeConfidence":"high","estimatedPriceNaira":10000,"descriptors":["premium"]}`

    const result = parseAnalysis(raw)
    expect(result.itemType).toBe('polo shirt')
    expect(result.brand).toBe('Lacoste')
    expect(result.sizeConfidence).toBe('high')
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
      estimatedPriceNaira: 18000,
      descriptors: [],
    })

    const result = parseAnalysis(raw)
    expect(result.sizeConfidence).toBe('none')
  })

  it('filters non-string values out of descriptors array', () => {
    const raw = JSON.stringify({
      itemType: 'hoodie',
      color: 'grey',
      estimatedPriceNaira: 15000,
      descriptors: ['warm', 42, null, 'oversized'],
    })

    const result = parseAnalysis(raw)
    expect(result.descriptors).toEqual(['warm', 'oversized'])
  })
})
