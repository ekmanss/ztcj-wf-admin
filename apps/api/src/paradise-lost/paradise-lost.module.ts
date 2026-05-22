import { Module } from '@nestjs/common'
import { DbModule } from '../db/db.module'
import { ParadiseLostController } from './paradise-lost.controller'
import { ParadiseLostService } from './paradise-lost.service'

@Module({
  imports: [DbModule],
  controllers: [ParadiseLostController],
  providers: [ParadiseLostService],
})
export class ParadiseLostModule {}
