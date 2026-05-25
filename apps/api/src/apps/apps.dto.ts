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

export const APP_COLUMN_STATUSES = ['1', '0'] as const
export const APP_AD_TYPES = ['1', '2', '3'] as const
export const APP_AD_STATUSES = [1, 0] as const
export const APP_AD_POSITION_CODES = ['top_banner', 'right_card'] as const
export const APP_AD_PAGE_CODES = [
  'market',
  'ecology',
  'alpha',
  'paradise_lost',
  'dex_scan',
  'information',
  'flash_news',
  'calendar',
  'data',
  'exchange',
  'wallet',
  'crypto_detail',
  'token_detail',
  'project_detail',
  'person_detail',
  'institution_detail',
  'info_detail',
  'flash_news_detail',
  'exchange_detail',
  'wallet_detail',
  'rating',
] as const

export type AppColumnStatus = (typeof APP_COLUMN_STATUSES)[number]
export type AppAdType = (typeof APP_AD_TYPES)[number]
export type AppAdStatus = (typeof APP_AD_STATUSES)[number]
export type AppAdPositionCode = (typeof APP_AD_POSITION_CODES)[number]
export type AppAdPageCode = (typeof APP_AD_PAGE_CODES)[number]

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

export class ListAppColumnsQueryDto {
  @IsOptional()
  @IsString()
  q?: string

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => toArray(value))
  @IsArray()
  @IsIn(APP_COLUMN_STATUSES, { each: true })
  status?: AppColumnStatus[]
}

export class AppColumnPayloadDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  pid?: number

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  code!: string

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name!: string

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  nameEn!: string

  @IsOptional()
  @IsIn(APP_COLUMN_STATUSES)
  status?: AppColumnStatus

  @IsOptional()
  @IsString()
  @MaxLength(255)
  remarks?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  weigh?: number
}

export class CreateAppColumnDto extends AppColumnPayloadDto {}

export class UpdateAppColumnDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  pid?: number

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  code?: string

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  nameEn?: string

  @IsOptional()
  @IsIn(APP_COLUMN_STATUSES)
  status?: AppColumnStatus

  @IsOptional()
  @IsString()
  @MaxLength(255)
  remarks?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  weigh?: number
}

export class ListAppAdsQueryDto {
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
  name?: string

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => toArray(value))
  @IsArray()
  @IsIn(APP_AD_POSITION_CODES, { each: true })
  positionCode?: AppAdPositionCode[]

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => toArray(value))
  @IsArray()
  @IsIn(APP_AD_PAGE_CODES, { each: true })
  pageCode?: AppAdPageCode[]

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => toArray(value))
  @IsArray()
  @IsIn(APP_AD_TYPES, { each: true })
  adType?: AppAdType[]

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => toNumberArray(value))
  @IsArray()
  @IsIn(APP_AD_STATUSES, { each: true })
  status?: AppAdStatus[]
}

export class AppAdPayloadDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  adName!: string

  @IsIn(APP_AD_POSITION_CODES)
  adPositionCode!: AppAdPositionCode

  @IsIn(APP_AD_PAGE_CODES)
  adPageCode!: AppAdPageCode

  @IsString()
  @MinLength(1)
  @MaxLength(512)
  adImageCh!: string

  @IsString()
  @MinLength(1)
  @MaxLength(512)
  adImageEn!: string

  @IsString()
  @MinLength(1)
  @MaxLength(512)
  adLink!: string

  @IsIn(APP_AD_TYPES)
  adType!: AppAdType

  @IsString()
  @MinLength(1)
  @MaxLength(25)
  adEffectiveTime!: string

  @IsString()
  @MinLength(1)
  @MaxLength(25)
  adInvalidTime!: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  weigh?: number

  @IsOptional()
  @Type(() => Number)
  @IsIn(APP_AD_STATUSES)
  status?: AppAdStatus
}

export class CreateAppAdDto extends AppAdPayloadDto {}

export class UpdateAppAdDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  adName?: string

  @IsOptional()
  @IsIn(APP_AD_POSITION_CODES)
  adPositionCode?: AppAdPositionCode

  @IsOptional()
  @IsIn(APP_AD_PAGE_CODES)
  adPageCode?: AppAdPageCode

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(512)
  adImageCh?: string

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(512)
  adImageEn?: string

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(512)
  adLink?: string

  @IsOptional()
  @IsIn(APP_AD_TYPES)
  adType?: AppAdType

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(25)
  adEffectiveTime?: string

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(25)
  adInvalidTime?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  weigh?: number

  @IsOptional()
  @Type(() => Number)
  @IsIn(APP_AD_STATUSES)
  status?: AppAdStatus
}

export class BulkAppIdsDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  ids!: number[]
}

export class BulkUpdateAppColumnStatusDto extends BulkAppIdsDto {
  @IsIn(APP_COLUMN_STATUSES)
  status!: AppColumnStatus
}

export class BulkUpdateAppAdStatusDto extends BulkAppIdsDto {
  @Type(() => Number)
  @IsIn(APP_AD_STATUSES)
  status!: AppAdStatus
}
