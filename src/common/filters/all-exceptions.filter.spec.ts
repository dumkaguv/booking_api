import {
  type ArgumentsHost,
  BadRequestException,
  HttpStatus
} from '@nestjs/common'

import { AllExceptionsFilter } from './all-exceptions.filter'

type MockResponse = {
  json: jest.Mock
  status: jest.Mock
}

function createResponse(): MockResponse {
  const response = {
    json: jest.fn(),
    status: jest.fn()
  }

  response.status.mockReturnValue(response)

  return response
}

function createHost(response: MockResponse): ArgumentsHost {
  return {
    switchToHttp: () => ({
      getResponse: () => response
    })
  } as unknown as ArgumentsHost
}

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter

  beforeEach(() => {
    filter = new AllExceptionsFilter()
  })

  it('maps Prisma P2002 to 409 with prismaCode and fields', () => {
    const response = createResponse()
    const host = createHost(response)
    const exception = {
      code: 'P2002',
      meta: { target: ['email'] }
    }

    filter.catch(exception, host)

    expect(response.status).toHaveBeenCalledWith(HttpStatus.CONFLICT)
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Unique constraint failed',
        prismaCode: 'P2002',
        fields: ['email']
      })
    )
  })

  it('maps unknown Prisma code to 400 instead of 500', () => {
    const response = createResponse()
    const host = createHost(response)
    const exception = {
      code: 'P2999',
      meta: { modelName: 'Booking' }
    }

    filter.catch(exception, host)

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST)
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Prisma request failed',
        prismaCode: 'P2999'
      })
    )
  })

  it('maps PrismaClientValidationError-like exceptions to 400', () => {
    const response = createResponse()
    const host = createHost(response)
    const exception = {
      name: 'PrismaClientValidationError',
      message: 'Invalid prisma query'
    }

    filter.catch(exception, host)

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST)
    expect(response.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid prisma query',
      prismaCode: 'PRISMA_VALIDATION_ERROR'
    })
  })

  it('keeps ValidationPipe BadRequest response shape', () => {
    const response = createResponse()
    const host = createHost(response)
    const exception = new BadRequestException({
      message: ['email must be an email'],
      errors: { email: ['invalid'] }
    })

    filter.catch(exception, host)

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST)
    expect(response.json).toHaveBeenCalledWith({
      success: false,
      message: ['email must be an email'],
      errors: { email: ['invalid'] }
    })
  })
})
