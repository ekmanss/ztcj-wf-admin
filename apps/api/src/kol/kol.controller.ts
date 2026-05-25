import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import {
  BulkKolTweetIdsDto,
  BulkKolUserIdsDto,
  BulkUpdateKolTweetStatusDto,
  BulkUpdateKolUserStatusDto,
  CreateKolUserDto,
  ListKolTweetsQueryDto,
  ListKolUsersQueryDto,
  UpdateKolTweetDto,
  UpdateKolUserDto,
} from './kol.dto'
import { KolService } from './kol.service'

@Controller('kol')
export class KolController {
  constructor(private readonly kolService: KolService) {}

  @Get('users')
  listUsers(@Query() query: ListKolUsersQueryDto) {
    return this.kolService.listUsers(query)
  }

  @Post('users')
  createUser(@Body() dto: CreateKolUserDto) {
    return this.kolService.createUser(dto)
  }

  @Patch('users/bulk/status')
  updateManyUserStatus(@Body() dto: BulkUpdateKolUserStatusDto) {
    return this.kolService.updateManyUserStatus(dto.restIds, dto.status)
  }

  @Delete('users/bulk')
  deleteManyUsers(@Body() dto: BulkKolUserIdsDto) {
    return this.kolService.deleteManyUsers(dto.restIds)
  }

  @Patch('users/:restId')
  updateUser(@Param('restId') restId: string, @Body() dto: UpdateKolUserDto) {
    return this.kolService.updateUser(restId, dto)
  }

  @Delete('users/:restId')
  deleteUser(@Param('restId') restId: string) {
    return this.kolService.deleteUser(restId)
  }

  @Get('dynamics')
  listTweets(@Query() query: ListKolTweetsQueryDto) {
    return this.kolService.listTweets(query)
  }

  @Get('dynamics/:tweetRestId')
  getTweet(@Param('tweetRestId') tweetRestId: string) {
    return this.kolService.getTweet(tweetRestId)
  }

  @Patch('dynamics/bulk/status')
  updateManyTweetStatus(@Body() dto: BulkUpdateKolTweetStatusDto) {
    return this.kolService.updateManyTweetStatus(dto.tweetRestIds, dto.status)
  }

  @Delete('dynamics/bulk')
  deleteManyTweets(@Body() dto: BulkKolTweetIdsDto) {
    return this.kolService.deleteManyTweets(dto.tweetRestIds)
  }

  @Patch('dynamics/:tweetRestId')
  updateTweet(
    @Param('tweetRestId') tweetRestId: string,
    @Body() dto: UpdateKolTweetDto
  ) {
    return this.kolService.updateTweet(tweetRestId, dto)
  }

  @Delete('dynamics/:tweetRestId')
  deleteTweet(@Param('tweetRestId') tweetRestId: string) {
    return this.kolService.deleteTweet(tweetRestId)
  }
}
