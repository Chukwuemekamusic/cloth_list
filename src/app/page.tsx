'use client'

import { useState } from 'react'
import ImageInput from '@/components/ImageInput'
import ListingReview from '@/components/ListingReview'
import type { ClothingAnalysis } from '@/types/clothing'

type Phase = 'input' | 'loading' | 'review' | 'error'

export default function Home() {
  const [phase, setPhase] = useState<Phase>('input')
  const [analysis, setAnalysis] = useState<ClothingAnalysis | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const runAnalysis = async (base64: string) => {
    setImageBase64(base64)
    setPhase('loading')
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
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
  }

  return (
    <main className="flex flex-1 flex-col items-center px-6 py-12 min-h-screen">
      <div className="w-full max-w-sm flex flex-col gap-6">

        {phase === 'input' && (
          <>
            <div className="flex flex-col gap-2 text-center">
              <h1 className="text-3xl font-bold tracking-tight">ClothList</h1>
              <p className="text-zinc-400 text-base leading-relaxed">
                Snap a photo. Get a caption. Sell faster.
              </p>
            </div>
            <ImageInput onImage={runAnalysis} />
          </>
        )}

        {phase === 'loading' && (
          <div className="flex flex-col items-center gap-4 py-20">
            <div className="w-10 h-10 rounded-full border-2 border-zinc-700 border-t-white animate-spin" />
            <p className="text-zinc-400 text-sm">Analysing your item…</p>
          </div>
        )}

        {phase === 'review' && analysis && (
          <ListingReview analysis={analysis} imageDataUrl={imageBase64 ?? undefined} onNewItem={reset} />
        )}

        {phase === 'error' && (
          <div className="flex flex-col items-center gap-5 text-center py-12">
            <p className="text-zinc-300 text-base">{errorMsg}</p>
            {imageBase64 && (
              <button
                onClick={() => runAnalysis(imageBase64)}
                className="w-full h-12 rounded-2xl bg-white text-zinc-950 font-semibold text-sm active:scale-95 transition-transform"
              >
                Try again
              </button>
            )}
            <button
              onClick={reset}
              className="text-zinc-500 text-sm underline underline-offset-2 active:opacity-70"
            >
              Start over
            </button>
          </div>
        )}

      </div>
    </main>
  )
}
