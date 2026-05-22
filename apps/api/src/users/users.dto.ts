import { Transform, Type, type TransformFnParams } from 'class-transformer'
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator'

export const USER_STATUSES = ['normal', 'hidden'] as const

export type UserStatus = (typeof USER_STATUSES)[number]

function emptyToUndefined(value: unknown): unknown {
  return value === '' ? undefined : value
}

function toArray(value: unknown): unknown {
  if (value === undefined || value === null || value === '') return undefined
  if (Array.isArray(value)) return value
  if (typeof value === 'string') return value.split(',').filter(Boolean)
  return [value]
}

export class ListUsersQueryDto {
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
  nickname?: string

  @IsOptional()
  @IsString()
  email?: string

  @IsOptional()
  @IsString()
  mobile?: string

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => toArray(value))
  @IsArray()
  @IsIn(USER_STATUSES, { each: true })
  status?: UserStatus[]
}

export class CreateUserDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  groupId?: number

  @IsString()
  @MinLength(3)
  @MaxLength(32)
  username!: string

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  nickname!: string

  @IsEmail()
  @MaxLength(100)
  email!: string

  @IsOptional()
  @IsString()
  @MaxLength(11)
  mobile?: string

  @IsOptional()
  @IsString()
  @MaxLength(255)
  avatar?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(255)
  level?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn([0, 1])
  gender?: number

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => emptyToUndefined(value))
  @IsDateString()
  birthday?: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  bio?: string

  @IsOptional()
  @IsIn(USER_STATUSES)
  status?: UserStatus

  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(30)
  password?: string
}

export class UpdateUserDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  groupId?: number

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(32)
  username?: string

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  nickname?: string

  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string

  @IsOptional()
  @IsString()
  @MaxLength(11)
  mobile?: string

  @IsOptional()
  @IsString()
  @MaxLength(255)
  avatar?: string

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(255)
  level?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn([0, 1])
  gender?: number

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => emptyToUndefined(value))
  @IsDateString()
  birthday?: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  bio?: string

  @IsOptional()
  @IsIn(USER_STATUSES)
  status?: UserStatus

  @IsOptional()
  @IsString()
  @MinLength(6)
  @MaxLength(30)
  password?: string
}

export class BulkUserIdsDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  ids!: number[]
}

export class BulkUpdateUserStatusDto extends BulkUserIdsDto {
  @IsIn(USER_STATUSES)
  status!: UserStatus
}
