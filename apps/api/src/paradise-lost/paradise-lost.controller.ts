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
  BulkParadiseLostIdsDto,
  BulkUpdateParadiseLostStatusDto,
  CreateParadiseLostDto,
  CreateParadiseLostTagDto,
  ListParadiseLostQueryDto,
  ParadiseLostInvestmentQueryDto,
  UpdateParadiseLostDto,
  UpdateParadiseLostTagDto,
} from './paradise-lost.dto'
import { ParadiseLostService } from './paradise-lost.service'

@Controller('paradise-lost')
export class ParadiseLostController {
  constructor(private readonly paradiseLostService: ParadiseLostService) {}

  @Get()
  list(@Query() query: ListParadiseLostQueryDto) {
    return this.paradiseLostService.list(query)
  }

  @Post()
  create(@Body() dto: CreateParadiseLostDto) {
    return this.paradiseLostService.create(dto)
  }

  @Get('tags')
  listTags() {
    return this.paradiseLostService.listTags()
  }

  @Post('tags')
  createTag(@Body() dto: CreateParadiseLostTagDto) {
    return this.paradiseLostService.createTag(dto)
  }

  @Patch('tags/:id')
  updateTag(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateParadiseLostTagDto
  ) {
    return this.paradiseLostService.updateTag(id, dto)
  }

  @Delete('tags/:id')
  deleteTag(@Param('id', ParseIntPipe) id: number) {
    return this.paradiseLostService.deleteTag(id)
  }

  @Get('years')
  listYears() {
    return this.paradiseLostService.listYears()
  }

  @Get('event-types')
  listEventTypes() {
    return this.paradiseLostService.listEventTypes()
  }

  @Get('event-natures')
  listEventNatures() {
    return this.paradiseLostService.listEventNatures()
  }

  @Get('investments')
  listInvestments(@Query() query: ParadiseLostInvestmentQueryDto) {
    return this.paradiseLostService.listInvestments(query)
  }

  @Patch('bulk/status')
  updateManyStatus(@Body() dto: BulkUpdateParadiseLostStatusDto) {
    return this.paradiseLostService.updateManyStatus(dto.ids, dto.status)
  }

  @Delete('bulk')
  deleteMany(@Body() dto: BulkParadiseLostIdsDto) {
    return this.paradiseLostService.deleteMany(dto.ids)
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.paradiseLostService.get(id)
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateParadiseLostDto
  ) {
    return this.paradiseLostService.update(id, dto)
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.paradiseLostService.delete(id)
  }
}
