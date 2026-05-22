import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AuthModule } from './auth/auth.module'
import { DbModule } from './db/db.module'
import { validateApiEnv } from './env.validation'
import { UsersModule } from './users/users.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env', '../../.env.local', '../../.env'],
      validate: validateApiEnv,
    }),
    AuthModule,
    DbModule,
    UsersModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
