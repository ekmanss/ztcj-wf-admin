import 'reflect-metadata'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

function getCorsOrigin(corsOrigin?: string) {
  const origins = corsOrigin
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  return origins?.length ? origins : '*'
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const config = app.get(ConfigService)

  app.enableShutdownHooks()
  app.enableCors({
    origin: getCorsOrigin(config.get<string>('CORS_ORIGIN')),
  })
  app.setGlobalPrefix('api')
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    })
  )

  const port = config.getOrThrow<number>('PORT')
  await app.listen(port)
}

void bootstrap()
