export interface ShareResult {
  status: 'shared' | 'copied' | 'error'
  message?: string
}

export async function shareCaption(caption: string, imageBlob?: Blob): Promise<ShareResult> {
  if (typeof navigator !== 'undefined' && 'share' in navigator) {
    try {
      const shareData: ShareData = { text: caption }
      if (imageBlob && 'canShare' in navigator) {
        const file = new File([imageBlob], 'item.jpg', { type: imageBlob.type || 'image/jpeg' })
        if (navigator.canShare({ files: [file] })) {
          shareData.files = [file]
        }
      }
      await navigator.share(shareData)
      return { status: 'shared' }
    } catch (err) {
      if (!(err instanceof Error && err.name === 'AbortError')) {
        // Non-cancel error — still try clipboard below
      }
    }
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(caption)
      return { status: 'copied' }
    } catch {
      return { status: 'error', message: 'Could not copy caption. Please copy it manually.' }
    }
  }

  return { status: 'error', message: 'Sharing is not supported on this browser.' }
}
