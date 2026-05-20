import { describe, it, expect, vi, beforeEach } from 'vitest'
import { polishDescription } from '@/lib/polishDescription'

const { mockCreate } = vi.hoisted(() => ({ mockCreate: vi.fn() }))

vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(function () {
    return { messages: { create: mockCreate } }
  }),
}))

beforeEach(() => {
  mockCreate.mockReset()
})

function makeResponse(text: string) {
  return { content: [{ type: 'text', text }] }
}

describe('polishDescription', () => {
  it('returns the polished description string on success', async () => {
    mockCreate.mockResolvedValueOnce(makeResponse('A beautifully upcycled lilac hoodie.'))

    const result = await polishDescription('rough draft here', '', 'GBP')

    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
    expect(result).toBe('A beautifully upcycled lilac hoodie.')
  })

  it('includes draft content in the prompt sent to Claude', async () => {
    mockCreate.mockResolvedValueOnce(makeResponse('polished text'))

    await polishDescription('original pink sweatshirt', '', 'GBP')

    const call = mockCreate.mock.calls[0][0]
    const prompt = call.messages[0].content as string
    expect(prompt).toContain('original pink sweatshirt')
  })

  it('includes notes in the prompt when provided', async () => {
    mockCreate.mockResolvedValueOnce(makeResponse('polished text'))

    await polishDescription('rough draft', 'hand-dyed lilac, originally a flawed sweatshirt', 'GBP')

    const call = mockCreate.mock.calls[0][0]
    const prompt = call.messages[0].content as string
    expect(prompt).toContain('hand-dyed lilac')
    expect(prompt).toContain('originally a flawed sweatshirt')
  })

  it('uses £ in the prompt for GBP currency', async () => {
    mockCreate.mockResolvedValueOnce(makeResponse('polished text'))

    await polishDescription('draft', '', 'GBP')

    const call = mockCreate.mock.calls[0][0]
    const prompt = call.messages[0].content as string
    expect(prompt).toContain('£')
  })

  it('uses ₦ in the prompt for NGN currency', async () => {
    mockCreate.mockResolvedValueOnce(makeResponse('polished text'))

    await polishDescription('draft', '', 'NGN')

    const call = mockCreate.mock.calls[0][0]
    const prompt = call.messages[0].content as string
    expect(prompt).toContain('₦')
  })

  it('throws a descriptive error when Claude API fails', async () => {
    mockCreate.mockRejectedValueOnce(new Error('API key invalid'))

    await expect(polishDescription('draft', '', 'GBP')).rejects.toThrow('API key invalid')
  })

  it('uses max_tokens of 256', async () => {
    mockCreate.mockResolvedValueOnce(makeResponse('polished text'))

    await polishDescription('draft', '', 'GBP')

    const call = mockCreate.mock.calls[0][0]
    expect(call.max_tokens).toBe(256)
  })
})
