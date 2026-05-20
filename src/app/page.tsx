'use client'

import { useState } from 'react'
import ImageInput from '@/components/ImageInput'
import ListingReview from '@/components/ListingReview'
import type { ClothingAnalysis, Currency } from '@/types/clothing'

type Phase = 'input' | 'loading' | 'review' | 'error'

export default function Home() {
  const [phase, setPhase] = useState<Phase>('input')
  const [analysis, setAnalysis] = useState<ClothingAnalysis | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [currency, setCurrencyState] = useState<Currency>(() => {
    if (typeof window === 'undefined') return 'GBP'
    const saved = localStorage.getItem('clothlist_currency')
    return saved === 'NGN' ? 'NGN' : 'GBP'
  })
  const [pendingCurrency, setPendingCurrency] = useState<Currency | null>(null)

  const applyCurrency = (c: Currency) => {
    setCurrencyState(c)
    localStorage.setItem('clothlist_currency', c)
  }

  const handleCurrencyClick = (c: Currency) => {
    if (c === currency) return
    if (analysis !== null) {
      setPendingCurrency(c)
    } else {
      applyCurrency(c)
    }
  }

  const confirmReanalyse = () => {
    if (!pendingCurrency || !imageBase64) return
    applyCurrency(pendingCurrency)
    setPendingCurrency(null)
    setAnalysis(null)
    runAnalysis(imageBase64, pendingCurrency)
  }

  const cancelReanalyse = () => {
    setPendingCurrency(null)
  }

  const runAnalysis = async (base64: string, overrideCurrency?: Currency) => {
    const activeCurrency = overrideCurrency ?? currency
    if (!navigator.onLine) {
      setErrorMsg('No connection — AI analysis requires internet.')
      setPhase('error')
      return
    }
    setImageBase64(base64)
    setPhase('loading')
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, currency: activeCurrency }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error ?? 'Something went wrong. Please try again.')
        setPhase('error')
        return
      }
      setAnalysis(data as ClothingAnalysis)
      setPhase('review')
    } catch {
      setErrorMsg('Could not connect. Check your internet and try again.')
      setPhase('error')
    }
  }

  const reset = () => {
    setPhase('input')
    setAnalysis(null)
    setImageBase64(null)
    setErrorMsg(null)
    setPendingCurrency(null)
  }

  const CurrencyToggle = () => (
    <div className="flex justify-center">
      <div className="flex rounded-xl bg-zinc-900 border border-zinc-800 p-1 gap-1">
        {(['GBP', 'NGN'] as Currency[]).map((c) => (
          <button
            key={c}
            onClick={() => handleCurrencyClick(c)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              currency === c
                ? 'bg-amber-400 text-zinc-950'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {c === 'GBP' ? '£ GBP' : '₦ NGN'}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <main className="flex flex-1 flex-col items-center px-5 py-10 min-h-screen">
      <div className="w-full max-w-sm flex flex-col gap-7">

        {phase === 'input' && (
          <>
            {/* Hero wordmark */}
            <div className="cloth-rise flex flex-col gap-2 pt-6">
              <div className="flex items-baseline">
                <h1 className="text-[2.75rem] font-black tracking-tight text-zinc-50 leading-none">cloth</h1>
                <span className="text-[2.75rem] font-black tracking-tight text-amber-400 leading-none">list</span>
              </div>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Snap a photo — get a caption — sell faster.
              </p>
              <div className="w-7 h-0.5 bg-amber-400 rounded-full" />
            </div>

            <div className="cloth-rise cloth-rise-1">
              <CurrencyToggle />
            </div>

            <div className="cloth-rise cloth-rise-2">
              <ImageInput onImage={(b) => runAnalysis(b)} />
            </div>
          </>
        )}

        {phase === 'loading' && (
          <div className="flex flex-col items-center gap-10 py-20">
            {/* Ghost wordmark */}
            <div className="flex items-baseline">
              <span className="text-2xl font-black tracking-tight text-zinc-800 leading-none">cloth</span>
              <span className="text-2xl font-black tracking-tight text-zinc-800 leading-none">list</span>
            </div>
            {/* Equalizer bars */}
            <div className="flex items-end gap-[4px]" style={{ height: '40px' }}>
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="w-[3px] rounded-full bg-amber-400 origin-bottom"
                  style={{
                    height: '40px',
                    animation: 'equalizer 0.8s ease-in-out infinite',
                    animationDelay: `${i * 0.11}s`,
                  }}
                />
              ))}
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <p className="text-zinc-200 text-sm font-semibold">Analysing your item</p>
              <p className="text-zinc-600 text-xs">Claude is reading the details…</p>
            </div>
          </div>
        )}

        {phase === 'review' && analysis && (
          <>
            <CurrencyToggle />
            {pendingCurrency && (
              <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 flex flex-col gap-3">
                <p className="text-sm text-zinc-300 leading-relaxed">
                  Switching to {pendingCurrency === 'GBP' ? '£ GBP' : '₦ NGN'} requires a fresh analysis — re-analyse now?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={confirmReanalyse}
                    className="flex-1 h-10 rounded-xl bg-amber-400 text-zinc-950 font-bold text-sm active:scale-95 transition-transform"
                  >
                    Re-analyse
                  </button>
                  <button
                    onClick={cancelReanalyse}
                    className="flex-1 h-10 rounded-xl border border-zinc-700 text-zinc-400 font-medium text-sm active:scale-95 transition-transform"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            <ListingReview analysis={analysis} imageDataUrl={imageBase64 ?? undefined} onNewItem={reset} />
          </>
        )}

        {phase === 'error' && (
          <div className="cloth-rise flex flex-col items-center gap-6 text-center py-16">
            <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-[240px]">{errorMsg}</p>
            <div className="flex flex-col gap-3 w-full">
              {imageBase64 && (
                <button
                  onClick={() => runAnalysis(imageBase64)}
                  className="w-full h-12 rounded-2xl bg-amber-400 text-zinc-950 font-bold text-sm active:scale-95 transition-transform"
                >
                  Try again
                </button>
              )}
              <button
                onClick={reset}
                className="text-zinc-600 text-sm underline underline-offset-4 active:opacity-70"
              >
                Start over
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
