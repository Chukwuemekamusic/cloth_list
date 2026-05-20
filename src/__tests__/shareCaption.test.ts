import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shareCaption } from '@/lib/shareCaption'

beforeEach(() => {
  vi.unstubAllGlobals()
})

describe('shareCaption — navigator.share available', () => {
  it('returns "shared" when share succeeds', async () => {
    const mockShare = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { share: mockShare })
    const result = await shareCaption('Test caption')
    expect(result.status).toBe('shared')
    expect(mockShare).toHaveBeenCalledWith({ text: 'Test caption' })
  })

  it('falls back to clipboard when user cancels (AbortError)', async () => {
    const abortError = Object.assign(new Error('Cancelled'), { name: 'AbortError' })
    const mockShare = vi.fn().mockRejectedValue(abortError)
    const mockWriteText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { share: mockShare, clipboard: { writeText: mockWriteText } })
    const result = await shareCaption('Test caption')
    expect(result.status).toBe('copied')
    expect(mockWriteText).toHaveBeenCalledWith('Test caption')
  })

  it('falls back to clipboard on non-abort share error', async () => {
    const mockShare = vi.fn().mockRejectedValue(new Error('Permission denied'))
    const mockWriteText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { share: mockShare, clipboard: { writeText: mockWriteText } })
    const result = await shareCaption('Test caption')
    expect(result.status).toBe('copied')
  })
})

describe('shareCaption — navigator.share unavailable', () => {
  it('returns "copied" via clipboard fallback', async () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText: mockWriteText } })
    const result = await shareCaption('Test caption')
    expect(result.status).toBe('copied')
    expect(mockWriteText).toHaveBeenCalledWith('Test caption')
  })

  it('returns "error" when clipboard write fails', async () => {
    const mockWriteText = vi.fn().mockRejectedValue(new Error('Not allowed'))
    vi.stubGlobal('navigator', { clipboard: { writeText: mockWriteText } })
    const result = await shareCaption('Test caption')
    expect(result.status).toBe('error')
  })
})

describe('shareCaption — both unavailable', () => {
  it('returns "error" when neither share nor clipboard exists', async () => {
    vi.stubGlobal('navigator', {})
    const result = await shareCaption('Test caption')
    expect(result.status).toBe('error')
    expect(result.message).toBeTruthy()
  })
})
