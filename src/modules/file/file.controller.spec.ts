import type { AuthRequest } from '@/common/types'
import { ResponseFileDto } from '@/modules/file/dto'

import { FilesController } from './file.controller'
import { FilesService } from './file.service'

type FilesServiceMock = {
  findAllForUser: jest.Mock
  findOneForUser: jest.Mock
}

describe('FilesController', () => {
  let controller: FilesController
  let service: FilesServiceMock

  beforeEach(() => {
    service = {
      findAllForUser: jest.fn(),
      findOneForUser: jest.fn()
    }

    controller = new FilesController(service as unknown as FilesService)
  })

  it('findAll delegates to service and returns mapped DTO items', async () => {
    const req = { user: { id: 77 } } as AuthRequest
    const query = { page: 1, pageSize: 10 }

    service.findAllForUser.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          targets: [{ targetId: 10, targetType: 'LISTING' }],
          type: 'image/png',
          uploadedAt: new Date('2026-03-05T00:00:00.000Z'),
          url: 'https://cdn/u-1.png'
        }
      ],
      total: 1
    })

    const result = await controller.findAll(req, query)

    expect(service.findAllForUser).toHaveBeenCalledWith(77, query)
    expect(result.total).toBe(1)
    expect(result.data[0]).toBeInstanceOf(ResponseFileDto)
    expect(result.data[0]).toMatchObject({
      id: 1,
      type: 'image/png',
      url: 'https://cdn/u-1.png'
    })
  })

  it('findOne delegates to service and returns mapped DTO', async () => {
    const req = { user: { id: 77 } } as AuthRequest

    service.findOneForUser.mockResolvedValueOnce({
      id: 5,
      targets: [{ targetId: 11, targetType: 'PROFILE_AVATAR' }],
      type: 'image/jpeg',
      uploadedAt: new Date('2026-03-05T00:00:00.000Z'),
      url: 'https://cdn/u-5.jpg'
    })

    const result = await controller.findOne(req, 5)

    expect(service.findOneForUser).toHaveBeenCalledWith(5, 77)
    expect(result).toBeInstanceOf(ResponseFileDto)
    expect(result).toMatchObject({
      id: 5,
      type: 'image/jpeg',
      url: 'https://cdn/u-5.jpg'
    })
  })
})
