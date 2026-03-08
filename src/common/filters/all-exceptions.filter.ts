import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger
} from '@nestjs/common'

import { isPrismaException } from '../utils'

import type { Response } from 'express'

type PrismaKnownErrorMapping = {
  message: string
  status: HttpStatus
}

const PRISMA_KNOWN_ERROR_MAP: Record<string, PrismaKnownErrorMapping> = {
  P2000: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Provided value is too long'
  },
  P2001: {
    status: HttpStatus.NOT_FOUND,
    message: 'Record does not exist'
  },
  P2002: {
    status: HttpStatus.CONFLICT,
    message: 'Unique constraint failed'
  },
  P2003: {
    status: HttpStatus.CONFLICT,
    message: 'Foreign key constraint failed'
  },
  P2004: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Constraint failed on the database'
  },
  P2011: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Null constraint violation'
  },
  P2012: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Missing a required value'
  },
  P2013: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Missing a required argument'
  },
  P2014: {
    status: HttpStatus.CONFLICT,
    message: 'Invalid relation operation'
  },
  P2015: {
    status: HttpStatus.NOT_FOUND,
    message: 'Related record not found'
  },
  P2016: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Query interpretation error'
  },
  P2017: {
    status: HttpStatus.NOT_FOUND,
    message: 'Records are not connected'
  },
  P2018: {
    status: HttpStatus.NOT_FOUND,
    message: 'Required connected records were not found'
  },
  P2019: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Input error'
  },
  P2020: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Value out of range for database type'
  },
  P2021: {
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    message: 'Table does not exist in current database'
  },
  P2022: {
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    message: 'Column does not exist in current database'
  },
  P2024: {
    status: HttpStatus.SERVICE_UNAVAILABLE,
    message: 'Database operation timed out'
  },
  P2025: {
    status: HttpStatus.NOT_FOUND,
    message: 'Resource not found'
  },
  P2028: {
    status: HttpStatus.CONFLICT,
    message: 'Transaction API error'
  },
  P2029: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Query parameter limit exceeded'
  },
  P2033: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Numeric conversion error'
  },
  P2034: {
    status: HttpStatus.CONFLICT,
    message: 'Transaction conflict, please retry'
  },
  P2037: {
    status: HttpStatus.SERVICE_UNAVAILABLE,
    message: 'Too many database connections'
  }
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  public catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    if (this.handlePrismaException(exception, response)) {
      return
    }

    /* ValidationPipe */
    if (exception instanceof BadRequestException) {
      const res = exception.getResponse()

      let message: string | string[]
      let errors: unknown = null

      if (typeof res === 'string') {
        message = res
      } else if (typeof res === 'object' && res !== null) {
        const r = res as { message?: string | string[]; errors?: unknown }

        message = r.message ?? 'Validation failed'
        errors = r.errors ?? null
      } else {
        message = 'Validation failed'
      }

      this.logger.warn('Validation failed', exception)

      response.status(400).json({
        success: false,
        message,
        errors
      })

      return
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus()
      const message = exception.message

      this.logger.error(message, exception)

      response.status(status).json({
        success: false,
        message
      })

      return
    }

    this.logger.error('Internal server error', exception)

    response.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }

  private handlePrismaException(
    exception: unknown,
    response: Response
  ): boolean {
    if (hasErrorName(exception, 'PrismaClientValidationError')) {
      this.logger.warn('Prisma validation error', exception)

      response.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: getErrorMessage(exception, 'Prisma validation error'),
        prismaCode: 'PRISMA_VALIDATION_ERROR'
      })

      return true
    }

    if (hasErrorName(exception, 'PrismaClientInitializationError')) {
      this.logger.error('Prisma initialization error', exception)

      response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        success: false,
        message: 'Database initialization error',
        prismaCode: 'PRISMA_INITIALIZATION_ERROR'
      })

      return true
    }

    if (hasErrorName(exception, 'PrismaClientRustPanicError')) {
      this.logger.error('Prisma engine panic error', exception)

      response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        success: false,
        message: 'Database engine panic error',
        prismaCode: 'PRISMA_ENGINE_PANIC'
      })

      return true
    }

    if (hasErrorName(exception, 'PrismaClientUnknownRequestError')) {
      this.logger.error('Prisma unknown request error', exception)

      response.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: getErrorMessage(exception, 'Prisma request failed'),
        prismaCode: 'PRISMA_UNKNOWN_REQUEST_ERROR'
      })

      return true
    }

    if (!isPrismaException(exception)) {
      return false
    }

    const knownMapping = PRISMA_KNOWN_ERROR_MAP[exception.code]
    const status = knownMapping?.status ?? HttpStatus.BAD_REQUEST
    const message = knownMapping?.message ?? 'Prisma request failed'

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(message, exception)
    } else {
      this.logger.warn(message, exception)
    }

    response.status(status).json({
      success: false,
      message,
      prismaCode: exception.code,
      ...(exception.code === 'P2002' ? { fields: exception.meta?.target } : {}),
      ...(exception.meta ? { meta: exception.meta } : {})
    })

    return true
  }
}

function hasErrorName(exception: unknown, name: string) {
  if (typeof exception !== 'object' || exception === null) {
    return false
  }

  return 'name' in exception && (exception as { name?: string }).name === name
}

function getErrorMessage(exception: unknown, fallback: string) {
  if (
    typeof exception === 'object' &&
    exception !== null &&
    'message' in exception &&
    typeof (exception as { message: unknown }).message === 'string'
  ) {
    return (exception as { message: string }).message
  }

  return fallback
}
