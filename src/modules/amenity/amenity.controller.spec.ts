import { AmenitiesController } from './amenity.controller'
import { AmenitiesService } from './amenity.service'
import { AmenityCodeEnum } from './constants'
import { ResponseAmenityDto } from './dto'

type AmenityServiceMock = {
  create: jest.Mock
  findAll: jest.Mock
  findOne: jest.Mock
  remove: jest.Mock
  update: jest.Mock
}

describe('AmenitiesController', () => {
  let controller: AmenitiesController
  let service: AmenityServiceMock

  beforeEach(() => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
      update: jest.fn()
    }

    controller = new AmenitiesController(service as unknown as AmenitiesService)
  })

  it('findAll delegates query and maps paginated items to DTO', async () => {
    const query = { page: 1, pageSize: 10, search: 'wi' }

    service.findAll.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          code: AmenityCodeEnum.WIFI,
          name: 'Wi-Fi',
          color: '#2563EB',
          createdAt: new Date('2026-03-08T10:00:00.000Z'),
          updatedAt: new Date('2026-03-08T10:00:00.000Z')
        }
      ],
      total: 1
    })

    const result = await controller.findAll(query)

    expect(service.findAll).toHaveBeenCalledWith(query)
    expect(result.total).toBe(1)
    expect(result.data[0]).toBeInstanceOf(ResponseAmenityDto)
    expect(result.data[0]).toMatchObject({
      id: 1,
      code: AmenityCodeEnum.WIFI,
      name: 'Wi-Fi'
    })
  })

  it('findOne delegates to service and maps response to DTO', async () => {
    service.findOne.mockResolvedValueOnce({
      id: 2,
      code: AmenityCodeEnum.PARKING,
      name: 'Parking',
      color: '#16A34A',
      createdAt: new Date('2026-03-08T10:00:00.000Z'),
      updatedAt: new Date('2026-03-08T10:00:00.000Z')
    })

    const result = await controller.findOne(2)

    expect(service.findOne).toHaveBeenCalledWith(2)
    expect(result).toBeInstanceOf(ResponseAmenityDto)
    expect(result).toMatchObject({
      id: 2,
      code: AmenityCodeEnum.PARKING,
      name: 'Parking'
    })
  })

  it('create delegates payload to service', async () => {
    const dto = {
      code: AmenityCodeEnum.KITCHEN,
      name: 'Kitchen',
      color: '#EA580C'
    }

    service.create.mockResolvedValueOnce({ id: 7, ...dto })

    const result = await controller.create(dto)

    expect(service.create).toHaveBeenCalledWith(dto)
    expect(result).toBeInstanceOf(ResponseAmenityDto)
    expect(result).toMatchObject({ id: 7, code: AmenityCodeEnum.KITCHEN })
  })

  it('update delegates amenity id and payload to service', async () => {
    const dto = { name: 'Dedicated workspace' }

    service.update.mockResolvedValueOnce({
      id: 9,
      code: AmenityCodeEnum.WORKSPACE,
      name: 'Dedicated workspace'
    })

    const result = await controller.update(9, dto)

    expect(service.update).toHaveBeenCalledWith(9, dto)
    expect(result).toBeInstanceOf(ResponseAmenityDto)
    expect(result).toMatchObject({
      id: 9,
      code: AmenityCodeEnum.WORKSPACE,
      name: 'Dedicated workspace'
    })
  })

  it('remove delegates amenity id to service', async () => {
    service.remove.mockResolvedValueOnce({ id: 4 })

    const result = await controller.remove(4)

    expect(service.remove).toHaveBeenCalledWith(4)
    expect(result).toEqual({ id: 4 })
  })
})
