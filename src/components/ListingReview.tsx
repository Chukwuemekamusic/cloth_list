'use client'

import { useState, useEffect, useRef } from 'react'
import type { ClothingAnalysis } from '@/types/clothing'
import { generateCaption } from '@/lib/generateCaption'
import { shareCaption } from '@/lib/shareCaption'

interface Props {
  analysis: ClothingAnalysis
  imageDataUrl?: string
  onNewItem: () => void
}

const CONFIDENCE_BADGE: Record<
  ClothingAnalysis['sizeConfidence'],
  { label: string; className: string }
> = {
  high: { label: 'High confidence', className: 'bg-green-900/60 text-green-300' },
  low: { label: 'Low confidence', className: 'bg-yellow-900/60 text-yellow-300' },
  none: { label: 'Not detected', className: 'bg-zinc-800 text-zinc-400' },
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, b64] = dataUrl.split(',')
  const mimeMatch = header.match(/:(.*?);/)
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg'
  const bytes = atob(b64)
  const arr = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
  return new Blob([arr], { type: mime })
}

export default function ListingReview({ analysis, imageDataUrl, onNewItem }: Props) {
  const [sizeOverride, setSizeOverride] = useState(analysis.sizeDetected ?? '')
  const [priceOverride, setPriceOverride] = useState(String(analysis.estimatedPriceNaira))
  const [captionText, setCaptionText] = useState(() => generateCaption(analysis))
  const [toast, setToast] = useState<string | null>(null)
  const [sharing, setSharing] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current)
    }
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2000)
  }

  const buildOverrides = (size: string, price: string) => ({
    size: size || undefined,
    price: parseInt(price, 10) || undefined,
  })

  const handleSizeChange = (val: string) => {
    setSizeOverride(val)
    setCaptionText(generateCaption(analysis, buildOverrides(val, priceOverride)))
  }

  const handlePriceChange = (val: string) => {
    setPriceOverride(val)
    setCaptionText(generateCaption(analysis, buildOverrides(sizeOverride, val)))
  }

  const regenerate = () => {
    setCaptionText(generateCaption(analysis, buildOverrides(sizeOverride, priceOverride)))
  }

  const handleShare = async () => {
    setSharing(true)
    try {
      const imageBlob = imageDataUrl ? dataUrlToBlob(imageDataUrl) : undefined
      const result = await shareCaption(captionText, imageBlob)
      if (result.status === 'shared') showToast('Shared!')
      else if (result.status === 'copied') showToast('Caption copied!')
      else showToast(result.message ?? 'Could not share. Please try manually.')
    } finally {
      setSharing(false)
    }
  }

  const badge = CONFIDENCE_BADGE[analysis.sizeConfidence]
  const charCount = captionText.length
  const overLimit = charCount > 200

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Detected details panel */}
      <div className="w-full rounded-2xl bg-zinc-900 p-4 flex flex-col gap-3">
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Detected details
        </h2>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-zinc-500">Item</dt>
          <dd className="text-zinc-100 font-medium">{analysis.itemType}</dd>

          <dt className="text-zinc-500">Brand</dt>
          <dd className="text-zinc-100 font-medium">{analysis.brand ?? 'Not detected'}</dd>

          <dt className="text-zinc-500">Color</dt>
          <dd className="text-zinc-100 font-medium">{analysis.color}</dd>

          <dt className="text-zinc-500">Size</dt>
          <dd className="flex items-center gap-2 flex-wrap">
            <span className="text-zinc-100 font-medium">
              {analysis.sizeDetected ?? '—'}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.className}`}>
              {badge.label}
            </span>
          </dd>

          <dt className="text-zinc-500">Price</dt>
          <dd className="text-zinc-100 font-medium">
            ₦{analysis.estimatedPriceNaira.toLocaleString('en-US')}
          </dd>
        </dl>
      </div>

      {/* Override fields */}
      <div className="flex gap-3">
        <div className="flex-1 flex flex-col gap-1.5">
          <label htmlFor="size-override" className="text-xs font-medium text-zinc-400">
            Size
          </label>
          <input
            id="size-override"
            type="text"
            value={sizeOverride}
            onChange={(e) => handleSizeChange(e.target.value)}
            placeholder="e.g. L, XL, 42"
            className="w-full h-11 rounded-xl bg-zinc-900 border border-zinc-700 px-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
          />
        </div>
        <div className="flex-1 flex flex-col gap-1.5">
          <label htmlFor="price-override" className="text-xs font-medium text-zinc-400">
            Price (₦)
          </label>
          <input
            id="price-override"
            type="number"
            min="0"
            value={priceOverride}
            onChange={(e) => handlePriceChange(e.target.value)}
            placeholder="e.g. 15000"
            className="w-full h-11 rounded-xl bg-zinc-900 border border-zinc-700 px-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
          />
        </div>
      </div>

      {/* Caption textarea */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="caption" className="text-xs font-medium text-zinc-400">
            Caption
          </label>
          <span className={`text-xs tabular-nums ${overLimit ? 'text-red-400' : 'text-zinc-500'}`}>
            {charCount} / 200
          </span>
        </div>
        <textarea
          id="caption"
          value={captionText}
          onChange={(e) => setCaptionText(e.target.value)}
          rows={5}
          className="w-full rounded-xl bg-zinc-900 border border-zinc-700 px-3 py-2.5 text-sm text-zinc-100 resize-none focus:outline-none focus:border-zinc-500 leading-relaxed"
        />
      </div>

      {/* Share / Copy */}
      <div className="relative">
        <button
          onClick={handleShare}
          disabled={sharing}
          className="w-full h-14 rounded-2xl bg-white text-zinc-950 font-semibold text-base active:scale-95 transition-transform disabled:opacity-50"
        >
          {sharing ? 'Sharing…' : 'Share / Copy'}
        </button>
        {toast && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-zinc-800 text-zinc-100 text-xs font-medium px-3 py-1.5 rounded-full shadow-lg">
            {toast}
          </div>
        )}
      </div>

      {/* Regenerate */}
      <button
        onClick={regenerate}
        className="w-full h-12 rounded-2xl border border-zinc-700 text-zinc-300 font-medium text-sm active:scale-95 transition-transform"
      >
        Regenerate caption
      </button>

      {/* New item */}
      <button
        onClick={onNewItem}
        className="w-full h-12 rounded-2xl border border-zinc-800 text-zinc-500 font-medium text-sm active:scale-95 transition-transform"
      >
        New item
      </button>
    </div>
  )
}
