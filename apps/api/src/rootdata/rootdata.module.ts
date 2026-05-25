import { Module } from '@nestjs/common'
import { DbModule } from '../db/db.module'
import { RootdataController } from './rootdata.controller'
import { RootdataService } from './rootdata.service'

@Module({
  imports: [DbModule],
  controllers: [RootdataController],
  providers: [RootdataService],
})
export class RootdataModule {}
