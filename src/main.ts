import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory, Reflector } from '@nestjs/core'

import compression from 'compression'
import cookieParser from 'cookie-parser'
import { Request, Response } from 'express'
import helmet from 'helmet'

import { AppModule } from './app/app.module'
import {
  ALLOWED_HEADERS,
  ALLOWED_METHODS,
  API_GLOBAL_PREFIX,
  DEFAULT_APPLICATION_VERSION,
  DEFAULT_PORT,
  ENV_KEYS,
  ROOT_PATH
} from './common/constants'
import { AllExceptionsFilter } from './common/filters'
import { ResponseInterceptor } from './common/interceptors'
import { setupSwagger } from './common/utils'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const config = app.get(ConfigService)

  app.setGlobalPrefix(API_GLOBAL_PREFIX)

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: DEFAULT_APPLICATION_VERSION
  })

  app.useGlobalInterceptors(app.get(ResponseInterceptor))

  app.useGlobalFilters(app.get(AllExceptionsFilter))

  setupSwagger(app)

  app.use(cookieParser())

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false
    })
  )

  app.use(compression())

  app.enableCors({
    origin: config.getOrThrow<string>(ENV_KEYS.FRONT_URL),
    credentials: true,
    methods: ALLOWED_METHODS,
    allowedHeaders: ALLOWED_HEADERS
  })

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      excludeExtraneousValues: true
    })
  )

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true
    })
  )

  app
    .getHttpAdapter()
    .get(ROOT_PATH, (_req: Request, res: Response) =>
      res.redirect(`${ROOT_PATH}${API_GLOBAL_PREFIX}`)
    )

  await app.listen(config.get<string>(ENV_KEYS.PORT) ?? DEFAULT_PORT)

  console.warn(
    `Server started on url http://localhost:${config.get<string>(ENV_KEYS.PORT) ?? DEFAULT_PORT}`
  )
}

void bootstrap()
