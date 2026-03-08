import { sendResponse } from './send-response'

class ResponseDto {
  public id: number
  public name: string
}

describe('sendResponse', () => {
  it('resolves promise and maps plain object to class instance', async () => {
    const result = await sendResponse(
      ResponseDto,
      Promise.resolve({ id: 1, name: 'alpha' })
    )

    expect(result).toBeInstanceOf(ResponseDto)
    expect(result).toEqual(
      expect.objectContaining({
        id: 1,
        name: 'alpha'
      })
    )
  })
})
