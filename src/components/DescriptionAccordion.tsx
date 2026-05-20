'use client'

import { useState, useRef } from 'react'
import type { Currency } from '@/types/clothing'

interface Props {
  rawDescriptionDraft: string
  currency: Currency
}

export default function DescriptionAccordion({ rawDescriptionDraft, currency }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [contextNotes, setContextNotes] = useState('')
  const [descriptionText, setDescriptionText] = useState('')
  const [previousText, setPreviousText] = useState<string | null>(null)
  const [isPolishing, setIsPolishing] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2000)
  }

  const handleGenerate = () => {
    let draft = rawDescriptionDraft
    if (contextNotes.trim()) {
      draft = `${draft}\n\nSeller notes: ${contextNotes.trim()}`
    }
    setDescriptionText(draft)
  }

  const handlePolish = async () => {
    if (!descriptionText.trim() || isPolishing) return
    setIsPolishing(true)
    setPreviousText(descriptionText)
    try {
      const res = await fetch('/api/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft: descriptionText, notes: contextNotes, currency }),
      })
      const data = await res.json()
      if (!res.ok) {
        showToast('Polish failed. Try again.')
        setPreviousText(null)
        return
      }
      setDescriptionText(data.description)
    } catch {
      showToast('Could not connect. Try again.')
      setPreviousText(null)
    } finally {
      setIsPolishing(false)
    }
  }

  const handleUndo = () => {
    if (previousText !== null) {
      setDescriptionText(previousText)
      setPreviousText(null)
    }
  }

  const handleCopy = async () => {
    if (!descriptionText) return
    try {
      await navigator.clipboard.writeText(descriptionText)
      showToast('Description copied!')
    } catch {
      showToast('Could not copy.')
    }
  }

  return (
    <div className="w-full rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left"
      >
        <div className="flex items-center gap-3">
          {/* Sparkle icon */}
          <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
            <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423L16.5 15.75l.394 1.183a2.25 2.25 0 0 0 1.423 1.423L19.5 18.75l-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-100 leading-none">Listing Description</p>
            <p className="text-xs text-zinc-600 mt-0.5">eBay · Vinted · Shopify</p>
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-zinc-600 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 flex flex-col gap-3 border-t border-zinc-800">
          {/* Context notes */}
          <div className="flex flex-col gap-1.5 pt-3">
            <label className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">
              Seller notes (optional)
            </label>
            <textarea
              value={contextNotes}
              onChange={(e) => setContextNotes(e.target.value)}
              rows={3}
              placeholder="Origin, material, dyeing process, patches, measurements — anything Claude can't see."
              className="w-full rounded-xl bg-zinc-800 border border-zinc-700/50 px-3 py-2.5 text-sm text-zinc-100 resize-none placeholder:text-zinc-700 focus:outline-none focus:border-zinc-600 leading-relaxed transition-colors duration-150"
            />
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            className="w-full h-10 rounded-xl border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 font-medium text-sm active:scale-95 transition-all duration-150"
          >
            Generate description
          </button>

          {/* Description textarea */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">Description</label>
            <textarea
              value={descriptionText}
              onChange={(e) => setDescriptionText(e.target.value)}
              rows={6}
              placeholder='Tap "Generate description" above to populate.'
              className="w-full rounded-xl bg-zinc-800 border border-zinc-700/50 px-3 py-2.5 text-sm text-zinc-100 resize-none placeholder:text-zinc-700 focus:outline-none focus:border-zinc-600 leading-relaxed transition-colors duration-150"
            />
          </div>

          {/* Polish with AI */}
          <button
            onClick={handlePolish}
            disabled={isPolishing || !descriptionText.trim()}
            className="w-full h-10 rounded-xl bg-amber-400 text-zinc-950 font-bold text-sm active:scale-95 transition-transform disabled:opacity-40"
          >
            {isPolishing ? 'Polishing…' : 'Polish with AI'}
          </button>

          {/* Undo + Copy row */}
          <div className="flex items-center justify-between">
            {previousText !== null ? (
              <button
                onClick={handleUndo}
                className="text-xs text-zinc-500 underline underline-offset-2 active:opacity-70"
              >
                Undo polish
              </button>
            ) : (
              <span />
            )}

            <div className="relative">
              <button
                onClick={handleCopy}
                disabled={!descriptionText}
                className="text-xs font-semibold text-zinc-400 border border-zinc-700 px-3 py-1.5 rounded-lg hover:text-zinc-200 hover:border-zinc-600 active:scale-95 transition-all duration-150 disabled:opacity-40"
              >
                Copy description
              </button>
              {toast && (
                <div className="absolute -top-10 right-0 whitespace-nowrap bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
                  {toast}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
