import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import {
  BulkAppIdsDto,
  BulkUpdateAppAdStatusDto,
  BulkUpdateAppColumnStatusDto,
  CreateAppAdDto,
  CreateAppColumnDto,
  ListAppAdsQueryDto,
  ListAppColumnsQueryDto,
  UpdateAppAdDto,
  UpdateAppColumnDto,
} from './apps.dto'
import { AppsService } from './apps.service'

@Controller('apps')
export class AppsController {
  constructor(private readonly appsService: AppsService) {}

  @Get('meta')
  meta() {
    return this.appsService.getMeta()
  }

  @Get('columns')
  listColumns(@Query() query: ListAppColumnsQueryDto) {
    return this.appsService.listColumns(query)
  }

  @Post('columns')
  createColumn(@Body() dto: CreateAppColumnDto) {
    return this.appsService.createColumn(dto)
  }

  @Get('columns/parents')
  listParentColumns() {
    return this.appsService.listParentColumns()
  }

  @Patch('columns/bulk/status')
  updateColumnStatus(@Body() dto: BulkUpdateAppColumnStatusDto) {
    return this.appsService.updateColumnStatus(dto.ids, dto.status)
  }

  @Delete('columns/bulk')
  deleteColumns(@Body() dto: BulkAppIdsDto) {
    return this.appsService.deleteColumns(dto.ids)
  }

  @Patch('columns/:id')
  updateColumn(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAppColumnDto
  ) {
    return this.appsService.updateColumn(id, dto)
  }

  @Delete('columns/:id')
  deleteColumn(@Param('id', ParseIntPipe) id: number) {
    return this.appsService.deleteColumn(id)
  }

  @Get('ads')
  listAds(@Query() query: ListAppAdsQueryDto) {
    return this.appsService.listAds(query)
  }

  @Post('ads')
  createAd(@Body() dto: CreateAppAdDto) {
    return this.appsService.createAd(dto)
  }

  @Patch('ads/bulk/status')
  updateAdStatus(@Body() dto: BulkUpdateAppAdStatusDto) {
    return this.appsService.updateAdStatus(dto.ids, dto.status)
  }

  @Delete('ads/bulk')
  deleteAds(@Body() dto: BulkAppIdsDto) {
    return this.appsService.deleteAds(dto.ids)
  }

  @Patch('ads/:id')
  updateAd(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAppAdDto) {
    return this.appsService.updateAd(id, dto)
  }

  @Delete('ads/:id')
  deleteAd(@Param('id', ParseIntPipe) id: number) {
    return this.appsService.deleteAd(id)
  }
}
