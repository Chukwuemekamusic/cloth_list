'use client'

import { useRef, useState } from 'react'

const MAX_BYTES = 1_000_000 // 1 MB

async function compressToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement('canvas')
      let { width, height } = img

      // Scale down iteratively until the data URL fits under MAX_BYTES
      let quality = 0.85
      let scale = 1

      const tryEncode = (): string => {
        canvas.width = Math.round(width * scale)
        canvas.height = Math.round(height * scale)
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        return canvas.toDataURL('image/jpeg', quality)
      }

      let dataUrl = tryEncode()

      // Each base64 char ~= 0.75 bytes; rough size = dataUrl.length * 0.75
      while (dataUrl.length * 0.75 > MAX_BYTES && quality > 0.1) {
        quality -= 0.1
        dataUrl = tryEncode()
      }

      if (dataUrl.length * 0.75 > MAX_BYTES) {
        // Still too big — scale down the dimensions
        scale *= 0.7
        quality = 0.75
        dataUrl = tryEncode()
      }

      resolve(dataUrl)
    }
    img.onerror = reject
    img.src = url
  })
}

interface Props {
  onImage: (base64: string) => void
}

export default function ImageInput({ onImage }: Props) {
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setLoading(true)
    try {
      const base64 = await compressToBase64(file)
      setPreview(base64)
      onImage(base64)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setPreview(null)
    if (cameraRef.current) cameraRef.current.value = ''
    if (galleryRef.current) galleryRef.current.value = ''
  }

  if (preview) {
    return (
      <div className="w-full flex flex-col gap-4">
        <div className="w-full rounded-2xl overflow-hidden aspect-[4/5] bg-zinc-900 ring-1 ring-zinc-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Selected clothing item"
            className="w-full h-full object-cover"
          />
        </div>
        <button
          onClick={reset}
          className="w-full h-12 rounded-2xl border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 font-medium text-sm active:scale-95 transition-all duration-200"
        >
          Retake / Change photo
        </button>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Hidden file inputs */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {/* Primary upload zone */}
      <button
        onClick={() => cameraRef.current?.click()}
        disabled={loading}
        className="w-full rounded-2xl border-2 border-dashed border-zinc-800 hover:border-zinc-700 active:border-zinc-600 flex flex-col items-center justify-center gap-3 py-10 transition-all duration-200 disabled:opacity-50 active:scale-[0.99]"
      >
        <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center">
          <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
          </svg>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-zinc-100 font-semibold text-sm">
            {loading ? 'Processing…' : 'Take a photo'}
          </span>
          {!loading && (
            <span className="text-zinc-600 text-xs">Point at your item and snap</span>
          )}
        </div>
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 px-1">
        <div className="h-px flex-1 bg-zinc-900" />
        <span className="text-zinc-700 text-xs font-medium tracking-wide">or</span>
        <div className="h-px flex-1 bg-zinc-900" />
      </div>

      {/* Gallery button */}
      <button
        onClick={() => galleryRef.current?.click()}
        disabled={loading}
        className="w-full h-12 rounded-2xl border border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 font-medium text-sm active:scale-95 transition-all duration-200 disabled:opacity-50"
      >
        Upload from gallery
      </button>
    </div>
  )
}
