import { Module } from '@nestjs/common'
import { DbModule } from '../db/db.module'
import { AppsController } from './apps.controller'
import { AppsService } from './apps.service'

@Module({
  imports: [DbModule],
  controllers: [AppsController],
  providers: [AppsService],
})
export class AppsModule {}
