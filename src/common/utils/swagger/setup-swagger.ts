import { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes'

import { API_GLOBAL_PREFIX } from '@/common/constants'

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Booking API')
    .setDescription('Api documentation for booking service.')
    .setVersion('1.0.0')
    .setContact(
      'dgl',
      'https://github.com/dumkaguv',
      'dmitrii.golovicichin@gmail.com'
    )
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  const theme = new SwaggerTheme()

  SwaggerModule.setup(`/${API_GLOBAL_PREFIX}`, app, document, {
    customSiteTitle: 'Nexo API',
    jsonDocumentUrl: '/swagger.json',
    yamlDocumentUrl: '/swagger.yaml',
    swaggerOptions: {
      docExpansion: 'none',
      persistAuthorization: true,
      filter: true,
      displayRequestDuration: true,
      operationsSorter: 'alpha',
      tagsSorter: 'alpha'
    },
    explorer: true,
    customCss: theme.getBuffer(SwaggerThemeNameEnum.ONE_DARK)
  })
}
