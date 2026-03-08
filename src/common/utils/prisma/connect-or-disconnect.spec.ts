import { connectOrDisconnect } from './connect-or-disconnect'

describe('connectOrDisconnect', () => {
  it('returns disconnect payload when id is not provided', () => {
    expect(connectOrDisconnect()).toEqual({ disconnect: true })
  })

  it('returns disconnect payload when id is falsy', () => {
    expect(connectOrDisconnect(0)).toEqual({ disconnect: true })
  })

  it('returns connect payload when id is provided', () => {
    expect(connectOrDisconnect(15)).toEqual({ connect: { id: 15 } })
  })
})
