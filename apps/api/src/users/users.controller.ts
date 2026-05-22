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
  BulkUpdateUserStatusDto,
  BulkUserIdsDto,
  CreateUserDto,
  ListUsersQueryDto,
  UpdateUserDto,
} from './users.dto'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  list(@Query() query: ListUsersQueryDto) {
    return this.usersService.list(query)
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto)
  }

  @Get('groups')
  listGroups() {
    return this.usersService.listGroups()
  }

  @Patch('bulk/status')
  updateManyStatus(@Body() dto: BulkUpdateUserStatusDto) {
    return this.usersService.updateManyStatus(dto.ids, dto.status)
  }

  @Delete('bulk')
  deleteMany(@Body() dto: BulkUserIdsDto) {
    return this.usersService.deleteMany(dto.ids)
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto)
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.delete(id)
  }
}
