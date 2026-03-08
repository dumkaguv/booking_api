import type { ApiQueryOptions } from '@nestjs/swagger'

export const DEFAULT_PORT = 3000

export const ROOT_PATH = '/'
export const DEFAULT_APPLICATION_VERSION = '1'
export const API_GLOBAL_PREFIX = 'api'

export const APPLICATION_STAGES = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production'
} as const

export const ENV_KEYS = {
  NODE_ENV: 'NODE_ENV',
  DATABASE_URL: 'DATABASE_URL',
  PORT: 'PORT',
  API_URL: 'API_URL',
  FRONT_URL: 'FRONT_URL',
  CLOUDINARY_CLOUD_NAME: 'CLOUDINARY_CLOUD_NAME',
  CLOUDINARY_API_KEY: 'CLOUDINARY_API_KEY',
  CLOUDINARY_API_SECRET: 'CLOUDINARY_API_SECRET',
  JWT_REFRESH_SECRET: 'JWT_REFRESH_SECRET',
  JWT_ACCESS_SECRET: 'JWT_ACCESS_SECRET',
  JWT_REFRESH_TOKEN_TTL: 'JWT_REFRESH_TOKEN_TTL',
  JWT_ACCESS_TOKEN_TTL: 'JWT_ACCESS_TOKEN_TTL'
} as const

export const ALLOWED_HEADERS = ['Content-Type', 'Authorization']
export const ALLOWED_METHODS = ['GET', 'POST', 'PATCH', 'PUT', 'DELETE']

export const DEFAULT_PAGE = 1
export const DEFAULT_PAGE_SIZE = 10
export const MAX_PAGE_SIZE = 100

export const DEFAULT_GET_QUERY: ApiQueryOptions[] = [
  {
    name: 'page',
    type: 'integer',
    description: 'A page number within the paginated result set.',
    required: false,
    schema: {
      type: 'integer',
      default: DEFAULT_PAGE,
      minimum: DEFAULT_PAGE
    }
  },
  {
    name: 'pageSize',
    type: 'integer',
    description: `Number of results to return per page. Maximum: ${MAX_PAGE_SIZE}`,
    required: false,
    schema: {
      type: 'integer',
      default: DEFAULT_PAGE_SIZE,
      maximum: MAX_PAGE_SIZE,
      minimum: 1
    }
  },
  {
    name: 'ordering',
    type: 'string',
    description: 'Which field to use when ordering the results.',
    required: false
  },
  {
    name: 'search',
    type: 'string',
    description: 'A search term.',
    required: false
  }
] as const
