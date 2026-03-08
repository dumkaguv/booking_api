import { isPrismaException } from './is-prisma-error'

describe('isPrismaException', () => {
  it('returns true for object with string code', () => {
    expect(isPrismaException({ code: 'P2002' })).toBe(true)
  })

  it('returns false for non-prisma-like values', () => {
    expect(isPrismaException(null)).toBe(false)
    expect(isPrismaException(undefined)).toBe(false)
    expect(isPrismaException('P2002')).toBe(false)
    expect(isPrismaException({ code: 2002 })).toBe(false)
  })
})
