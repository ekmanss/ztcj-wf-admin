import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { and, count, desc, eq, ilike, inArray, type SQL } from 'drizzle-orm'
import { DB } from '../db/db.constants'
import { users } from '../db/schema'
import type { DbClient } from '../db/db.types'
import type {
  CreateUserDto,
  ListUsersQueryDto,
  UpdateUserDto,
  UserRole,
  UserStatus,
} from './users.dto'

type UserChanges = {
  firstName?: string
  lastName?: string
  username?: string
  email?: string
  phoneNumber?: string
  status?: UserStatus
  role?: UserRole
}

function toUserChanges(dto: UpdateUserDto): UserChanges {
  const changes: UserChanges = {}

  if (dto.firstName !== undefined) changes.firstName = dto.firstName
  if (dto.lastName !== undefined) changes.lastName = dto.lastName
  if (dto.username !== undefined) changes.username = dto.username
  if (dto.email !== undefined) changes.email = dto.email
  if (dto.phoneNumber !== undefined) changes.phoneNumber = dto.phoneNumber
  if (dto.status !== undefined) changes.status = dto.status
  if (dto.role !== undefined) changes.role = dto.role

  return changes
}

function isUniqueViolation(error: unknown): error is { code: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === '23505'
  )
}

@Injectable()
export class UsersService {
  constructor(@Inject(DB) private readonly db: DbClient) {}

  async list(query: ListUsersQueryDto) {
    const page = query.page
    const pageSize = query.pageSize
    const offset = (page - 1) * pageSize
    const filters: SQL[] = []

    if (query.username?.trim()) {
      filters.push(ilike(users.username, `%${query.username.trim()}%`))
    }

    if (query.status?.length) {
      filters.push(inArray(users.status, query.status))
    }

    if (query.role?.length) {
      filters.push(inArray(users.role, query.role))
    }

    const where = filters.length > 0 ? and(...filters) : undefined

    const [items, totalRows] = await Promise.all([
      this.db
        .select()
        .from(users)
        .where(where)
        .orderBy(desc(users.createdAt))
        .limit(pageSize)
        .offset(offset),
      this.db.select({ total: count() }).from(users).where(where),
    ])

    return {
      items,
      total: Number(totalRows[0]?.total ?? 0),
      page,
      pageSize,
    }
  }

  async create(dto: CreateUserDto) {
    try {
      const [created] = await this.db
        .insert(users)
        .values({
          firstName: dto.firstName,
          lastName: dto.lastName,
          username: dto.username,
          email: dto.email,
          phoneNumber: dto.phoneNumber,
          status: dto.status,
          role: dto.role,
        })
        .returning()

      return created
    } catch (error: unknown) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('Username or email already exists.')
      }

      throw error
    }
  }

  async update(id: string, dto: UpdateUserDto) {
    try {
      const [updated] = await this.db
        .update(users)
        .set({ ...toUserChanges(dto), updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning()

      if (!updated) {
        throw new NotFoundException('User not found.')
      }

      return updated
    } catch (error: unknown) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('Username or email already exists.')
      }

      throw error
    }
  }

  async updateManyStatus(ids: string[], status: UserStatus) {
    const updated = await this.db
      .update(users)
      .set({ status, updatedAt: new Date() })
      .where(inArray(users.id, ids))
      .returning({ id: users.id })

    return { count: updated.length }
  }

  async delete(id: string) {
    const [deleted] = await this.db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id })

    if (!deleted) {
      throw new NotFoundException('User not found.')
    }

    return deleted
  }

  async deleteMany(ids: string[]) {
    const deleted = await this.db
      .delete(users)
      .where(inArray(users.id, ids))
      .returning({ id: users.id })

    return { count: deleted.length }
  }
}
