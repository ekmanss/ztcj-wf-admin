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

export const PARADISE_LOST_TYPES = [1, 2, 3, 5] as const
export const PARADISE_LOST_STATUSES = [0, 1] as const

export type ParadiseLostType = (typeof PARADISE_LOST_TYPES)[number]
export type ParadiseLostStatus = (typeof PARADISE_LOST_STATUSES)[number]

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

export class ListParadiseLostQueryDto {
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
  @Transform(({ value }: TransformFnParams) => toNumberArray(value))
  @IsArray()
  @IsIn(PARADISE_LOST_TYPES, { each: true })
  type?: ParadiseLostType[]

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => toNumberArray(value))
  @IsArray()
  @IsIn(PARADISE_LOST_STATUSES, { each: true })
  status?: ParadiseLostStatus[]

  @IsOptional()
  @IsString()
  year?: string

  @IsOptional()
  @IsString()
  tag?: string
}

export class ParadiseLostInvestmentQueryDto {
  @Type(() => Number)
  @IsIn(PARADISE_LOST_TYPES)
  type!: ParadiseLostType

  @IsOptional()
  @IsString()
  q?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize = 20
}

class ParadiseLostPayloadDto {
  @Type(() => Number)
  @IsIn(PARADISE_LOST_TYPES)
  type!: ParadiseLostType

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  investId!: string

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => toArray(value))
  @IsArray()
  @IsString({ each: true })
  tags?: string[]

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => toArray(value))
  @IsArray()
  @IsString({ each: true })
  year?: string[]

  @IsOptional()
  @IsString()
  cause?: string

  @IsOptional()
  @IsString()
  causeEn?: string

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => emptyToUndefined(value))
  @IsString()
  @MaxLength(25)
  date?: string

  @IsOptional()
  @IsString()
  @MaxLength(255)
  image?: string

  @IsOptional()
  @Type(() => Number)
  @IsIn(PARADISE_LOST_STATUSES)
  status?: ParadiseLostStatus

  @IsOptional()
  @IsString()
  @MaxLength(255)
  desc?: string

  @IsOptional()
  @IsString()
  @MaxLength(255)
  projectName?: string

  @IsOptional()
  @IsString()
  @MaxLength(255)
  projectNameEn?: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  logo?: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  oneLiner?: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  oneLinerEn?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  descriptionEn?: string

  @IsOptional()
  @Type(() => Number)
  @IsIn([0, 1])
  active?: number

  @IsOptional()
  @IsString()
  @MaxLength(255)
  orgName?: string

  @IsOptional()
  @IsString()
  @MaxLength(255)
  orgNameEn?: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  orgLogo?: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  orgInfo?: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  orgInfoEn?: string

  @IsOptional()
  @IsString()
  orgDescription?: string

  @IsOptional()
  @IsString()
  orgDescriptionEn?: string

  @IsOptional()
  @IsString()
  @MaxLength(255)
  peopleName?: string

  @IsOptional()
  @IsString()
  @MaxLength(255)
  peopleNameEn?: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  headImg?: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  personsOneLiner?: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  personsOneLinerEn?: string

  @IsOptional()
  @IsString()
  personsIntroduce?: string

  @IsOptional()
  @IsString()
  personsIntroduceEn?: string

  @IsOptional()
  @IsString()
  @MaxLength(255)
  eventNameCn?: string

  @IsOptional()
  @IsString()
  @MaxLength(255)
  eventNameEn?: string

  @IsOptional()
  @IsString()
  @MaxLength(512)
  eventImage160?: string

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => toArray(value))
  @IsArray()
  @IsString({ each: true })
  eventTypes?: string[]

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => toArray(value))
  @IsArray()
  @IsString({ each: true })
  eventNatures?: string[]

  @IsOptional()
  @IsString()
  eventSummaryCn?: string

  @IsOptional()
  @IsString()
  eventSummaryEn?: string

  @IsOptional()
  @IsString()
  eventIntroductionCn?: string

  @IsOptional()
  @IsString()
  eventIntroductionEn?: string
}

export class CreateParadiseLostDto extends ParadiseLostPayloadDto {}

export class UpdateParadiseLostDto extends ParadiseLostPayloadDto {}

export class BulkParadiseLostIdsDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  ids!: number[]
}

export class BulkUpdateParadiseLostStatusDto extends BulkParadiseLostIdsDto {
  @IsIn(PARADISE_LOST_STATUSES)
  status!: ParadiseLostStatus
}

export class CreateParadiseLostTagDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  tagName!: string

  @IsOptional()
  @IsString()
  @MaxLength(255)
  tagNameEn?: string

  @IsOptional()
  @IsString()
  @MaxLength(1024)
  image?: string

  @IsOptional()
  @IsString()
  @MaxLength(255)
  color?: string

  @IsOptional()
  @IsString()
  @MaxLength(255)
  backgroundColor?: string

  @IsOptional()
  @IsString()
  remark?: string
}
