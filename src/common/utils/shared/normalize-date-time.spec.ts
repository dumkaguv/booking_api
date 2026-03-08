import { normalizeDateTime } from './normalize-date-time'

describe('normalizeDateTime', () => {
  it('returns undefined and null as is', () => {
    expect(normalizeDateTime(undefined)).toBeUndefined()
    expect(normalizeDateTime(null)).toBeNull()
  })

  it('normalizes YYYY-MM-DD into UTC midnight', () => {
    const result = normalizeDateTime('2026-03-08')

    expect(result).toBeInstanceOf(Date)
    expect(result?.toISOString()).toBe('2026-03-08T00:00:00.000Z')
  })

  it('keeps full ISO datetime value', () => {
    const result = normalizeDateTime('2026-03-08T15:30:00.000Z')

    expect(result).toBeInstanceOf(Date)
    expect(result?.toISOString()).toBe('2026-03-08T15:30:00.000Z')
  })
})
