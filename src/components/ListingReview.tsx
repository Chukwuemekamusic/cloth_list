'use client'

import { useState, useEffect, useRef } from 'react'
import type { ClothingAnalysis } from '@/types/clothing'
import { generateCaption } from '@/lib/generateCaption'
import { shareCaption } from '@/lib/shareCaption'
import DescriptionAccordion from '@/components/DescriptionAccordion'

interface Props {
  analysis: ClothingAnalysis
  imageDataUrl?: string
  onNewItem: () => void
}

const CONFIDENCE_BADGE: Record<
  ClothingAnalysis['sizeConfidence'],
  { label: string; className: string }
> = {
  high: { label: 'High confidence', className: 'bg-emerald-950 text-emerald-400 border border-emerald-900/50' },
  low: { label: 'Low confidence', className: 'bg-amber-950 text-amber-400 border border-amber-900/50' },
  none: { label: 'Not detected', className: 'bg-zinc-900 text-zinc-500 border border-zinc-800' },
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
  const [priceOverride, setPriceOverride] = useState(String(analysis.estimatedPrice))
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
  const currencySymbol = analysis.currency === 'GBP' ? '£' : '₦'

  return (
    <div className="w-full flex flex-col gap-5 cloth-rise">
      {/* Item card — hierarchical */}
      <div className="w-full rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden">
        <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest mb-1.5">Detected item</p>
            <h2 className="text-xl font-bold text-zinc-50 leading-tight">{analysis.itemType}</h2>
            {analysis.brand ? (
              <p className="text-sm text-amber-400 font-semibold mt-0.5">{analysis.brand}</p>
            ) : (
              <p className="text-sm text-zinc-700 mt-0.5">Brand not detected</p>
            )}
          </div>
          {/* Price badge */}
          <div className="flex-shrink-0 rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-right">
            <p className="text-[10px] text-zinc-600 font-semibold uppercase tracking-wide leading-none mb-1">
              {analysis.currency}
            </p>
            <p className="text-lg font-black text-amber-400 leading-none">
              {currencySymbol}{analysis.estimatedPrice.toLocaleString('en-US')}
            </p>
          </div>
        </div>
        {/* Tag row */}
        <div className="px-4 pb-4 flex items-center gap-1.5 flex-wrap">
          <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700/40 text-zinc-300 font-medium">
            {analysis.color}
          </span>
          {analysis.sizeDetected && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700/40 text-zinc-300 font-medium">
              {analysis.sizeDetected}
            </span>
          )}
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${badge.className}`}>
            {badge.label}
          </span>
        </div>
      </div>

      {/* Override inputs */}
      <div className="flex gap-3">
        <div className="flex-1 flex flex-col gap-1.5">
          <label htmlFor="size-override" className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">
            Size
          </label>
          <input
            id="size-override"
            type="text"
            value={sizeOverride}
            onChange={(e) => handleSizeChange(e.target.value)}
            placeholder="L, XL, 42…"
            className="w-full h-11 rounded-xl bg-zinc-900 border border-zinc-800 px-3 text-sm text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:border-zinc-600 transition-colors duration-150"
          />
        </div>
        <div className="flex-1 flex flex-col gap-1.5">
          <label htmlFor="price-override" className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">
            Price ({currencySymbol})
          </label>
          <input
            id="price-override"
            type="number"
            min="0"
            value={priceOverride}
            onChange={(e) => handlePriceChange(e.target.value)}
            placeholder="0"
            className="w-full h-11 rounded-xl bg-zinc-900 border border-zinc-800 px-3 text-sm text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:border-zinc-600 transition-colors duration-150"
          />
        </div>
      </div>

      {/* Caption — centrepiece */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label htmlFor="caption" className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">
            Caption
          </label>
          <span className={`text-xs tabular-nums font-semibold ${overLimit ? 'text-red-400' : 'text-zinc-700'}`}>
            {charCount} / 200
          </span>
        </div>
        <textarea
          id="caption"
          value={captionText}
          onChange={(e) => setCaptionText(e.target.value)}
          rows={5}
          className={`w-full rounded-xl bg-zinc-900 border px-3 py-3 text-sm text-zinc-100 resize-none focus:outline-none leading-relaxed transition-colors duration-150 ${
            overLimit
              ? 'border-red-900 focus:border-red-700'
              : 'border-zinc-800 focus:border-zinc-600'
          }`}
        />
      </div>

      {/* Share / Copy — primary CTA */}
      <div className="relative">
        <button
          onClick={handleShare}
          disabled={sharing}
          className="w-full h-14 rounded-2xl bg-amber-400 text-zinc-950 font-bold text-base active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          {sharing ? 'Sharing…' : 'Share / Copy'}
        </button>
        {toast && (
          <div className="absolute -top-11 left-1/2 -translate-x-1/2 whitespace-nowrap bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs font-semibold px-3.5 py-2 rounded-full shadow-xl">
            {toast}
          </div>
        )}
      </div>

      {/* Secondary actions */}
      <div className="flex gap-2">
        <button
          onClick={regenerate}
          className="flex-1 h-11 rounded-xl border border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 font-medium text-sm active:scale-95 transition-all duration-150"
        >
          Regenerate
        </button>
        <button
          onClick={onNewItem}
          className="flex-1 h-11 rounded-xl border border-zinc-800 text-zinc-600 hover:text-zinc-400 font-medium text-sm active:scale-95 transition-all duration-150"
        >
          New item
        </button>
      </div>

      {/* Listing description accordion */}
      <DescriptionAccordion
        rawDescriptionDraft={analysis.rawDescriptionDraft}
        currency={analysis.currency}
      />
    </div>
  )
}
