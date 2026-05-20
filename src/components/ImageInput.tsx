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
        <div className="w-full rounded-2xl overflow-hidden aspect-[4/5] bg-zinc-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Selected clothing item"
            className="w-full h-full object-cover"
          />
        </div>
        <button
          onClick={reset}
          className="w-full h-12 rounded-2xl border border-zinc-700 text-zinc-300 font-medium text-sm active:scale-95 transition-transform"
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

      <button
        onClick={() => cameraRef.current?.click()}
        disabled={loading}
        className="w-full h-14 rounded-2xl bg-white text-zinc-950 font-semibold text-base active:scale-95 transition-transform disabled:opacity-50"
      >
        {loading ? 'Processing…' : 'Take a photo'}
      </button>

      <button
        onClick={() => galleryRef.current?.click()}
        disabled={loading}
        className="w-full h-14 rounded-2xl border border-zinc-700 text-zinc-100 font-semibold text-base active:scale-95 transition-transform disabled:opacity-50"
      >
        Upload from gallery
      </button>
    </div>
  )
}
