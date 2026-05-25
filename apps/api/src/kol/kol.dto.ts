import { Transform, Type, type TransformFnParams } from 'class-transformer'
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator'

export const KOL_PLATFORMS = [
  'twitter',
  'telegram',
  'reddit',
  'medium',
] as const
export const KOL_SYNC_STATUSES = ['0', '1', '2'] as const
export const KOL_USER_STATUSES = ['1', '2'] as const
export const KOL_TWEET_STATUSES = ['0', '1'] as const
export const KOL_TWEET_REPLY_TYPES = [0, 1] as const

export type KolPlatform = (typeof KOL_PLATFORMS)[number]
export type KolSyncStatus = (typeof KOL_SYNC_STATUSES)[number]
export type KolUserStatus = (typeof KOL_USER_STATUSES)[number]
export type KolTweetStatus = (typeof KOL_TWEET_STATUSES)[number]
export type KolTweetReplyType = (typeof KOL_TWEET_REPLY_TYPES)[number]

function emptyToUndefined(value: unknown): unknown {
  return value === '' || value === null ? undefined : value
}

function toArray(value: unknown): unknown {
  if (value === undefined || value === null || value === '') return undefined
  if (Array.isArray(value)) return value
  if (typeof value === 'string') return value.split(',').filter(Boolean)
  return [value]
}

function toNumberArray(value: unknown): unknown {
  const values = toArray(value)
  if (!Array.isArray(values)) return values
  return values.map((item) => Number(item))
}

export class ListKolUsersQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize = 10

  @IsOptional()
  @IsString()
  username?: string

  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => toArray(value))
  @IsArray()
  @IsIn(KOL_PLATFORMS, { each: true })
  platform?: KolPlatform[]

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => toArray(value))
  @IsArray()
  @IsIn(KOL_SYNC_STATUSES, { each: true })
  syncStatus?: KolSyncStatus[]

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => toArray(value))
  @IsArray()
  @IsIn(KOL_USER_STATUSES, { each: true })
  status?: KolUserStatus[]
}

export class KolUserPayloadDto {
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => emptyToUndefined(value))
  @IsString()
  @MaxLength(64)
  restId?: string

  @IsString()
  @MinLength(1)
  @MaxLength(191)
  username!: string

  @IsOptional()
  @IsString()
  @MaxLength(191)
  requestedUsername?: string

  @IsOptional()
  @IsString()
  @MaxLength(191)
  name?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  @MaxLength(512)
  avatarUrl?: string

  @IsOptional()
  @IsString()
  @MaxLength(512)
  linkUrl?: string

  @IsOptional()
  @IsIn(KOL_PLATFORMS)
  platform?: KolPlatform

  @IsOptional()
  @IsIn(KOL_SYNC_STATUSES)
  syncStatus?: KolSyncStatus

  @IsOptional()
  @IsIn(KOL_USER_STATUSES)
  status?: KolUserStatus

  @IsOptional()
  @IsString()
  @MaxLength(255)
  keywords?: string

  @IsOptional()
  @IsString()
  @MaxLength(255)
  remark?: string
}

export class CreateKolUserDto extends KolUserPayloadDto {}

export class UpdateKolUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(191)
  username?: string

  @IsOptional()
  @IsString()
  @MaxLength(191)
  requestedUsername?: string

  @IsOptional()
  @IsString()
  @MaxLength(191)
  name?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  @MaxLength(512)
  avatarUrl?: string

  @IsOptional()
  @IsString()
  @MaxLength(512)
  linkUrl?: string

  @IsOptional()
  @IsIn(KOL_PLATFORMS)
  platform?: KolPlatform

  @IsOptional()
  @IsIn(KOL_SYNC_STATUSES)
  syncStatus?: KolSyncStatus

  @IsOptional()
  @IsIn(KOL_USER_STATUSES)
  status?: KolUserStatus

  @IsOptional()
  @IsString()
  @MaxLength(255)
  keywords?: string

  @IsOptional()
  @IsString()
  @MaxLength(255)
  remark?: string
}

export class ListKolTweetsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize = 10

  @IsOptional()
  @IsString()
  authorName?: string

  @IsOptional()
  @IsString()
  authorUsername?: string

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => toArray(value))
  @IsArray()
  @IsIn(KOL_PLATFORMS, { each: true })
  platform?: KolPlatform[]

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => toNumberArray(value))
  @IsArray()
  @IsIn(KOL_TWEET_REPLY_TYPES, { each: true })
  isReply?: KolTweetReplyType[]

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => toArray(value))
  @IsArray()
  @IsIn(KOL_TWEET_STATUSES, { each: true })
  status?: KolTweetStatus[]
}

export class UpdateKolTweetDto {
  @IsOptional()
  @IsString()
  fullText?: string

  @IsOptional()
  @IsIn(KOL_TWEET_STATUSES)
  status?: KolTweetStatus
}

export class BulkKolUserIdsDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  restIds!: string[]
}

export class BulkUpdateKolUserStatusDto extends BulkKolUserIdsDto {
  @IsIn(KOL_USER_STATUSES)
  status!: KolUserStatus
}

export class BulkKolTweetIdsDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  tweetRestIds!: string[]
}

export class BulkUpdateKolTweetStatusDto extends BulkKolTweetIdsDto {
  @IsIn(KOL_TWEET_STATUSES)
  status!: KolTweetStatus
}
