export interface ClothingAnalysis {
  itemType: string
  brand: string | null
  color: string
  pattern: string | null
  sizeDetected: string | null
  sizeConfidence: 'high' | 'low' | 'none'
  estimatedPriceNaira: number
  descriptors: string[]
}
