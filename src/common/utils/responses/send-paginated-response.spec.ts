import { sendPaginatedResponse } from './send-paginated-response'

class ResponseDto {
  public id: number
}

describe('sendPaginatedResponse', () => {
  it('maps paginated payload data into class instances', async () => {
    const result = await sendPaginatedResponse(
      ResponseDto,
      Promise.resolve({
        data: [{ id: 1 }, { id: 2 }],
        total: 2
      })
    )

    expect(result.total).toBe(2)
    expect(result.data).toHaveLength(2)
    expect(result.data[0]).toBeInstanceOf(ResponseDto)
    expect(result.data[1]).toBeInstanceOf(ResponseDto)
    expect(result.data).toEqual([
      expect.objectContaining({ id: 1 }),
      expect.objectContaining({ id: 2 })
    ])
  })
})
