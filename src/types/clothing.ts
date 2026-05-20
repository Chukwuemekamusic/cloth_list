export type Currency = 'GBP' | 'NGN'

export interface ClothingAnalysis {
  itemType: string
  brand: string | null
  color: string
  pattern: string | null
  sizeDetected: string | null
  sizeConfidence: 'high' | 'low' | 'none'
  estimatedPrice: number
  currency: Currency
  rawDescriptionDraft: string
  descriptors: string[]
}
