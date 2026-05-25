import { Module } from '@nestjs/common'
import { DbModule } from '../db/db.module'
import { KolController } from './kol.controller'
import { KolService } from './kol.service'

@Module({
  imports: [DbModule],
  controllers: [KolController],
  providers: [KolService],
})
export class KolModule {}
