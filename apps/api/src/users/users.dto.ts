import { Transform, Type, type TransformFnParams } from 'class-transformer'
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator'
export const USER_STATUSES = [
  'active',
  'inactive',
  'invited',
  'suspended',
] as const

export const USER_ROLES = ['superadmin', 'admin', 'cashier', 'manager'] as const

export type UserStatus = (typeof USER_STATUSES)[number]
export type UserRole = (typeof USER_ROLES)[number]

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
  @Transform(({ value }: TransformFnParams) => toArray(value))
  @IsArray()
  @IsIn(USER_STATUSES, { each: true })
  status?: UserStatus[]

  @IsOptional()
  @Transform(({ value }: TransformFnParams) => toArray(value))
  @IsArray()
  @IsIn(USER_ROLES, { each: true })
  role?: UserRole[]
}

export class CreateUserDto {
  @IsString()
  firstName!: string

  @IsString()
  lastName!: string

  @IsString()
  username!: string

  @IsEmail()
  email!: string

  @IsString()
  phoneNumber!: string

  @IsOptional()
  @IsIn(USER_STATUSES)
  status?: UserStatus

  @IsOptional()
  @IsIn(USER_ROLES)
  role?: UserRole

  @IsOptional()
  @IsString()
  password?: string
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstName?: string

  @IsOptional()
  @IsString()
  lastName?: string

  @IsOptional()
  @IsString()
  username?: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  phoneNumber?: string

  @IsOptional()
  @IsIn(USER_STATUSES)
  status?: UserStatus

  @IsOptional()
  @IsIn(USER_ROLES)
  role?: UserRole

  @IsOptional()
  @IsString()
  password?: string
}

export class BulkUserIdsDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  ids!: string[]
}

export class BulkUpdateUserStatusDto extends BulkUserIdsDto {
  @IsIn(USER_STATUSES)
  status!: UserStatus
}
