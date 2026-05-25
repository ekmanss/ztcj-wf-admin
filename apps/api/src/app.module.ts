import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppsModule } from './apps/apps.module'
import { AuthModule } from './auth/auth.module'
import { DbModule } from './db/db.module'
import { validateApiEnv } from './env.validation'
import { KolModule } from './kol/kol.module'
import { ParadiseLostModule } from './paradise-lost/paradise-lost.module'
import { RootdataModule } from './rootdata/rootdata.module'
import { UsersModule } from './users/users.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env', '../../.env.local', '../../.env'],
      validate: validateApiEnv,
    }),
    AuthModule,
    AppsModule,
    DbModule,
    KolModule,
    ParadiseLostModule,
    RootdataModule,
    UsersModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
