import { Transform, Type, type TransformFnParams } from 'class-transformer'
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator'

export const ROOTDATA_ENTITY_TYPES = [1, 2, 3] as const
export const ROOTDATA_BINARY_STATUSES = [0, 1] as const
export const ROOTDATA_JOB_TYPES = [1, 2, 3] as const

export type RootdataEntityType = (typeof ROOTDATA_ENTITY_TYPES)[number]
export type RootdataBinaryStatus = (typeof ROOTDATA_BINARY_STATUSES)[number]
export type RootdataJobType = (typeof ROOTDATA_JOB_TYPES)[number]

function emptyToUndefined(value: unknown): unknown {
  return value === '' ? undefined : value
}

function toNumberArray(value: unknown): unknown {
  if (value === undefined || value === null || value === '') return undefined
  const items = Array.isArray(value) ? value : String(value).split(',')

  return items
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item))
}

function toStringArray(value: unknown): unknown {
  if (value === undefined || value === null || value === '') return undefined
  if (Array.isArray(value)) return value.map(String)

  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export class ListRootdataQueryDto {
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
  q?: string

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => toNumberArray(value))
  @IsArray()
  @IsIn(ROOTDATA_BINARY_STATUSES, { each: true })
  status?: RootdataBinaryStatus[]

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => toNumberArray(value))
  @IsArray()
  @IsIn(ROOTDATA_BINARY_STATUSES, { each: true })
  active?: RootdataBinaryStatus[]

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => toNumberArray(value))
  @IsArray()
  @IsIn(ROOTDATA_BINARY_STATUSES, { each: true })
  isHot?: RootdataBinaryStatus[]

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => toNumberArray(value))
  @IsArray()
  @IsIn(ROOTDATA_BINARY_STATUSES, { each: true })
  isShow?: RootdataBinaryStatus[]
}

export class RootdataOptionQueryDto {
  @IsOptional()
  @IsString()
  q?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20
}

export class UpsertProjectDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  projectName!: string

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  projectNameEn!: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  logo?: string

  @IsOptional()
  @IsString()
  @MaxLength(50)
  tokenSymbol?: string

  @IsOptional()
  @IsString()
  @MaxLength(50)
  establishmentDate?: string

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
  @IsIn(ROOTDATA_BINARY_STATUSES)
  active?: RootdataBinaryStatus

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => emptyToUndefined(value))
  @IsNumber()
  @Type(() => Number)
  totalFunding?: number

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => toStringArray(value))
  @IsArray()
  @IsString({ each: true })
  tags?: string[]

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => toStringArray(value))
  @IsArray()
  @IsString({ each: true })
  ecosystem?: string[]

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => toStringArray(value))
  @IsArray()
  @IsString({ each: true })
  onMainNet?: string[]

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => toStringArray(value))
  @IsArray()
  @IsString({ each: true })
  planToLaunch?: string[]

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => toStringArray(value))
  @IsArray()
  @IsString({ each: true })
  onTestNet?: string[]

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => toStringArray(value))
  @IsArray()
  @IsString({ each: true })
  supportExchanges?: string[]

  @IsOptional()
  @Type(() => Number)
  @IsIn(ROOTDATA_BINARY_STATUSES)
  isHot?: RootdataBinaryStatus

  @IsOptional()
  @Type(() => Number)
  @IsIn(ROOTDATA_BINARY_STATUSES)
  isShow?: RootdataBinaryStatus

  @IsOptional()
  socialMedia?: Record<string, string>
}

export class UpsertPersonDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  peopleName!: string

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  peopleNameEn!: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  headImg?: string

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
  introduce?: string

  @IsOptional()
  @IsString()
  introduceEn?: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  xLink?: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  linkedin?: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  blogLink?: string

  @IsOptional()
  @IsString()
  @MaxLength(255)
  heat?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  heatRank?: number

  @IsOptional()
  @IsString()
  @MaxLength(255)
  influence?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  influenceRank?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  followers?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  following?: number

  @IsOptional()
  @Type(() => Number)
  @IsIn(ROOTDATA_BINARY_STATUSES)
  status?: RootdataBinaryStatus
}

export class UpsertOrganizationDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  orgName!: string

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  orgNameEn!: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  logo?: string

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
  description?: string

  @IsOptional()
  @IsString()
  descriptionEn?: string

  @IsOptional()
  @Type(() => Number)
  @IsIn(ROOTDATA_BINARY_STATUSES)
  active?: RootdataBinaryStatus

  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string

  @IsOptional()
  @IsString()
  @MaxLength(30)
  establishmentDate?: string

  @IsOptional()
  @IsString()
  @MaxLength(50)
  region?: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  xLink?: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  linkedin?: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  blogLink?: string

  @IsOptional()
  @IsString()
  @MaxLength(255)
  heat?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  heatRank?: number

  @IsOptional()
  @IsString()
  @MaxLength(255)
  influence?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  influenceRank?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  followers?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  following?: number

  @IsOptional()
  @Type(() => Number)
  @IsIn(ROOTDATA_BINARY_STATUSES)
  status?: RootdataBinaryStatus
}

export class BulkRootdataIdsDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  ids!: number[]
}

export class BulkRootdataStringIdsDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  ids!: string[]
}

export class BulkProjectStatusDto extends BulkRootdataIdsDto {
  @IsIn(['isHot', 'isShow'])
  field!: 'isHot' | 'isShow'

  @IsIn(ROOTDATA_BINARY_STATUSES)
  value!: RootdataBinaryStatus
}

export class BulkBinaryStatusDto extends BulkRootdataIdsDto {
  @IsIn(ROOTDATA_BINARY_STATUSES)
  status!: RootdataBinaryStatus
}

export class BulkPersonStatusDto extends BulkRootdataStringIdsDto {
  @IsIn(ROOTDATA_BINARY_STATUSES)
  status!: RootdataBinaryStatus
}

export class UpsertProjectEventDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  hapDate?: string

  @IsString()
  @MinLength(1)
  event!: string

  @IsOptional()
  @IsString()
  eventEn?: string
}

export class UpsertProjectReportDto {
  @IsString()
  @MinLength(1)
  title!: string

  @IsOptional()
  @IsString()
  titleEn?: string

  @IsOptional()
  @IsString()
  @MaxLength(1024)
  url?: string

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  site!: string

  @IsOptional()
  @IsString()
  @MaxLength(30)
  timeEast?: string

  @IsOptional()
  @Type(() => Number)
  @IsIn(ROOTDATA_BINARY_STATUSES)
  status?: RootdataBinaryStatus
}

export class UpsertProjectContractDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  contractPlatform!: string

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  contractAddress!: string
}

export class UpsertTeamMemberDto {
  @IsString()
  @MinLength(1)
  personId!: string

  @IsOptional()
  @IsString()
  @MaxLength(255)
  position?: string

  @IsOptional()
  @IsString()
  @MaxLength(255)
  positionEn?: string

  @IsOptional()
  @Type(() => Number)
  @IsIn(ROOTDATA_JOB_TYPES)
  type?: RootdataJobType

  @IsOptional()
  @IsString()
  @MaxLength(255)
  entryTime?: string

  @IsOptional()
  @IsString()
  @MaxLength(255)
  leaveTime?: string

  @IsOptional()
  @Type(() => Number)
  @IsIn(ROOTDATA_BINARY_STATUSES)
  coreMember?: RootdataBinaryStatus
}

export class UpsertJobChangeDto {
  @IsOptional()
  @IsString()
  peopleId?: string

  @Type(() => Number)
  @IsIn(ROOTDATA_JOB_TYPES)
  type!: RootdataJobType

  @Type(() => Number)
  @IsIn([1, 2])
  companyType!: 1 | 2

  @IsString()
  @MinLength(1)
  companyId!: string

  @IsOptional()
  @IsString()
  @MaxLength(255)
  position?: string

  @IsOptional()
  @IsString()
  @MaxLength(255)
  positionEn?: string

  @IsOptional()
  @IsString()
  @MaxLength(255)
  entryTime?: string

  @IsOptional()
  @IsString()
  @MaxLength(255)
  leaveTime?: string

  @IsOptional()
  @Type(() => Number)
  @IsIn(ROOTDATA_BINARY_STATUSES)
  coreMember?: RootdataBinaryStatus
}

export class FundingInvestorDto {
  @Type(() => Number)
  @IsIn(ROOTDATA_ENTITY_TYPES)
  entityType!: RootdataEntityType

  @IsString()
  @MinLength(1)
  entityId!: string

  @IsOptional()
  @Type(() => Number)
  @IsIn(ROOTDATA_BINARY_STATUSES)
  leadInvestor?: RootdataBinaryStatus
}

export class UpsertFundingRoundDto {
  @IsString()
  @MinLength(1)
  projectId!: string

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  roundName!: string

  @IsOptional()
  @IsString()
  publishedTime?: string

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => emptyToUndefined(value))
  @IsNumber()
  @Type(() => Number)
  amount?: number

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => emptyToUndefined(value))
  @IsNumber()
  @Type(() => Number)
  valuation?: number

  @IsOptional()
  @IsString()
  @MaxLength(1024)
  sourceFrom?: string

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FundingInvestorDto)
  @IsArray()
  investors?: FundingInvestorDto[]
}

export class FundingRoundsQueryDto {
  @Type(() => Number)
  @IsIn(ROOTDATA_ENTITY_TYPES)
  entityType!: RootdataEntityType

  @IsString()
  @MinLength(1)
  entityId!: string
}
