import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
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
  constructor(
    @Inject(UsersService) private readonly usersService: UsersService
  ) {}

  @Get()
  list(@Query() query: ListUsersQueryDto) {
    return this.usersService.list(query)
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto)
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
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto)
  }

  @Delete(':id')
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.delete(id)
  }
}
