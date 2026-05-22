import { randomBytes } from 'node:crypto'
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import {
  and,
  count,
  desc,
  eq,
  inArray,
  like,
  ne,
  or,
  type SQL,
} from 'drizzle-orm'
import { encryptLegacyPassword, toUnixSeconds } from '../auth/auth.utils'
import { DB } from '../db/db.constants'
import { sysUserGroups, sysUsers } from '../db/schema'
import type { DbClient } from '../db/db.types'
import {
  USER_STATUSES,
  type CreateUserDto,
  type ListUsersQueryDto,
  type UpdateUserDto,
  type UserStatus,
} from './users.dto'

type UserChanges = {
  groupId?: number
  username?: string
  nickname?: string
  email?: string
  mobile?: string
  avatar?: string
  level?: number
  gender?: number
  birthday?: string
  bio?: string
  status?: UserStatus
  password?: string
  salt?: string
  updateTime?: number
}

type UserSelectRow = {
  id: number
  groupId: number
  groupName: string | null
  username: string | null
  nickname: string | null
  email: string | null
  mobile: string | null
  avatar: string | null
  level: number
  gender: number
  birthday: string | Date | null
  bio: string | null
  money: string
  score: number
  successions: number
  maxSuccessions: number
  prevTime: number | null
  loginTime: number | null
  loginIp: string | null
  loginFailure: number
  loginFailureTime: number | null
  joinIp: string | null
  joinTime: number | null
  createTime: number | null
  updateTime: number | null
  status: string | null
}

const userSelectFields = {
  id: sysUsers.id,
  groupId: sysUsers.groupId,
  groupName: sysUserGroups.name,
  username: sysUsers.username,
  nickname: sysUsers.nickname,
  email: sysUsers.email,
  mobile: sysUsers.mobile,
  avatar: sysUsers.avatar,
  level: sysUsers.level,
  gender: sysUsers.gender,
  birthday: sysUsers.birthday,
  bio: sysUsers.bio,
  money: sysUsers.money,
  score: sysUsers.score,
  successions: sysUsers.successions,
  maxSuccessions: sysUsers.maxSuccessions,
  prevTime: sysUsers.prevTime,
  loginTime: sysUsers.loginTime,
  loginIp: sysUsers.loginIp,
  loginFailure: sysUsers.loginFailure,
  loginFailureTime: sysUsers.loginFailureTime,
  joinIp: sysUsers.joinIp,
  joinTime: sysUsers.joinTime,
  createTime: sysUsers.createTime,
  updateTime: sysUsers.updateTime,
  status: sysUsers.status,
}

function trimString(value: string | undefined) {
  return value?.trim()
}

function normalizeStatus(status: string | null): UserStatus {
  return status === 'hidden' ? 'hidden' : 'normal'
}

function formatBirthday(value: string | Date | null) {
  if (!value) return null
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return value
}

function toPublicUser(row: UserSelectRow) {
  return {
    id: row.id,
    groupId: row.groupId,
    groupName: row.groupName ?? '',
    username: row.username ?? '',
    nickname: row.nickname ?? '',
    email: row.email ?? '',
    mobile: row.mobile ?? '',
    avatar: row.avatar ?? '',
    level: row.level,
    gender: row.gender,
    birthday: formatBirthday(row.birthday),
    bio: row.bio ?? '',
    money: row.money,
    score: row.score,
    successions: row.successions,
    maxSuccessions: row.maxSuccessions,
    prevTime: row.prevTime,
    loginTime: row.loginTime,
    loginIp: row.loginIp ?? '',
    loginFailure: row.loginFailure,
    loginFailureTime: row.loginFailureTime,
    joinIp: row.joinIp ?? '',
    joinTime: row.joinTime,
    createTime: row.createTime,
    updateTime: row.updateTime,
    status: normalizeStatus(row.status),
  }
}

function randomSalt() {
  return randomBytes(24)
    .toString('base64url')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 30)
}

function withPasswordChange(changes: UserChanges, password?: string) {
  const trimmedPassword = trimString(password)

  if (!trimmedPassword) return

  const salt = randomSalt()
  changes.password = encryptLegacyPassword(trimmedPassword, salt)
  changes.salt = salt
}

function toCreateValues(dto: CreateUserDto) {
  const changes: UserChanges = {
    groupId: dto.groupId ?? 0,
    username: dto.username.trim(),
    nickname: dto.nickname.trim(),
    email: dto.email.trim(),
    mobile: trimString(dto.mobile) ?? '',
    avatar: trimString(dto.avatar) ?? '',
    level: dto.level ?? 0,
    gender: dto.gender ?? 0,
    birthday: dto.birthday,
    bio: trimString(dto.bio) ?? '',
    status: dto.status ?? 'normal',
  }

  withPasswordChange(changes, dto.password)

  return changes
}

function toUserChanges(dto: UpdateUserDto): UserChanges {
  const changes: UserChanges = {}

  if (dto.groupId !== undefined) changes.groupId = dto.groupId
  if (dto.username !== undefined) changes.username = dto.username.trim()
  if (dto.nickname !== undefined) changes.nickname = dto.nickname.trim()
  if (dto.email !== undefined) changes.email = dto.email.trim()
  if (dto.mobile !== undefined) changes.mobile = dto.mobile.trim()
  if (dto.avatar !== undefined) changes.avatar = dto.avatar.trim()
  if (dto.level !== undefined) changes.level = dto.level
  if (dto.gender !== undefined) changes.gender = dto.gender
  if (dto.birthday !== undefined) changes.birthday = dto.birthday
  if (dto.bio !== undefined) changes.bio = dto.bio.trim()
  if (dto.status !== undefined) changes.status = dto.status

  withPasswordChange(changes, dto.password)

  return changes
}

@Injectable()
export class UsersService {
  constructor(@Inject(DB) private readonly db: DbClient) {}

  private async findById(id: number) {
    const [user] = await this.db
      .select(userSelectFields)
      .from(sysUsers)
      .leftJoin(sysUserGroups, eq(sysUsers.groupId, sysUserGroups.id))
      .where(eq(sysUsers.id, id))
      .limit(1)

    return user ? toPublicUser(user) : undefined
  }

  private async findByIdOrThrow(id: number) {
    const user = await this.findById(id)

    if (!user) {
      throw new NotFoundException('User not found.')
    }

    return user
  }

  private async assertNoDuplicate(
    dto: CreateUserDto | UpdateUserDto,
    excludeId?: number
  ) {
    const filters: SQL[] = []
    const username = trimString(dto.username)
    const nickname = trimString(dto.nickname)
    const email = trimString(dto.email)
    const mobile = trimString(dto.mobile)

    if (username) filters.push(eq(sysUsers.username, username))
    if (nickname) filters.push(eq(sysUsers.nickname, nickname))
    if (email) filters.push(eq(sysUsers.email, email))
    if (mobile) filters.push(eq(sysUsers.mobile, mobile))
    if (filters.length === 0) return

    const duplicateMatch = filters.length === 1 ? filters[0] : or(...filters)
    if (!duplicateMatch) return

    const where =
      excludeId === undefined
        ? duplicateMatch
        : and(duplicateMatch, ne(sysUsers.id, excludeId))

    const [existing] = await this.db
      .select({ id: sysUsers.id })
      .from(sysUsers)
      .where(where)
      .limit(1)

    if (existing) {
      throw new ConflictException(
        'Username, nickname, email or mobile already exists.'
      )
    }
  }

  async listGroups() {
    const groups = await this.db
      .select({
        id: sysUserGroups.id,
        name: sysUserGroups.name,
        status: sysUserGroups.status,
      })
      .from(sysUserGroups)
      .orderBy(desc(sysUserGroups.id))

    return groups.map((group) => ({
      id: group.id,
      name: group.name ?? '',
      status: group.status ?? 'normal',
    }))
  }

  async list(query: ListUsersQueryDto) {
    const page = query.page
    const pageSize = query.pageSize
    const offset = (page - 1) * pageSize
    const filters: SQL[] = []

    if (query.username?.trim()) {
      filters.push(like(sysUsers.username, `%${query.username.trim()}%`))
    }

    if (query.nickname?.trim()) {
      filters.push(like(sysUsers.nickname, `%${query.nickname.trim()}%`))
    }

    if (query.email?.trim()) {
      filters.push(like(sysUsers.email, `%${query.email.trim()}%`))
    }

    if (query.mobile?.trim()) {
      filters.push(like(sysUsers.mobile, `%${query.mobile.trim()}%`))
    }

    if (query.status?.length) {
      if (query.status.length === USER_STATUSES.length) {
        filters.push(inArray(sysUsers.status, query.status))
      } else if (query.status.includes('normal')) {
        const normalStatusFilter = or(
          eq(sysUsers.status, 'normal'),
          eq(sysUsers.status, '')
        )
        if (normalStatusFilter) filters.push(normalStatusFilter)
      } else {
        filters.push(eq(sysUsers.status, 'hidden'))
      }
    }

    const where = filters.length > 0 ? and(...filters) : undefined

    const [items, totalRows] = await Promise.all([
      this.db
        .select(userSelectFields)
        .from(sysUsers)
        .leftJoin(sysUserGroups, eq(sysUsers.groupId, sysUserGroups.id))
        .where(where)
        .orderBy(desc(sysUsers.createTime), desc(sysUsers.id))
        .limit(pageSize)
        .offset(offset),
      this.db.select({ total: count() }).from(sysUsers).where(where),
    ])

    return {
      items: items.map(toPublicUser),
      total: Number(totalRows[0]?.total ?? 0),
      page,
      pageSize,
    }
  }

  async create(dto: CreateUserDto) {
    await this.assertNoDuplicate(dto)

    const now = toUnixSeconds()
    const [inserted] = await this.db
      .insert(sysUsers)
      .values({
        ...toCreateValues(dto),
        createTime: now,
        updateTime: now,
        joinTime: now,
      })
      .$returningId()

    if (!inserted) {
      throw new NotFoundException('User not found.')
    }

    return this.findByIdOrThrow(inserted.id)
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.findByIdOrThrow(id)
    const changes = toUserChanges(dto)

    await this.assertNoDuplicate(dto, user.id)

    if (Object.keys(changes).length > 0) {
      await this.db
        .update(sysUsers)
        .set({ ...changes, updateTime: toUnixSeconds() })
        .where(eq(sysUsers.id, id))
    }

    return this.findByIdOrThrow(id)
  }

  async updateManyStatus(ids: number[], status: UserStatus) {
    const existingRows = await this.db
      .select({ id: sysUsers.id })
      .from(sysUsers)
      .where(inArray(sysUsers.id, ids))

    const existingIds = existingRows.map((user) => user.id)

    if (existingIds.length > 0) {
      await this.db
        .update(sysUsers)
        .set({ status, updateTime: toUnixSeconds() })
        .where(inArray(sysUsers.id, existingIds))
    }

    return { count: existingIds.length }
  }

  async delete(id: number) {
    const user = await this.findByIdOrThrow(id)
    await this.db.delete(sysUsers).where(eq(sysUsers.id, id))

    return { id: user.id }
  }

  async deleteMany(ids: number[]) {
    const existingRows = await this.db
      .select({ id: sysUsers.id })
      .from(sysUsers)
      .where(inArray(sysUsers.id, ids))

    const existingIds = existingRows.map((user) => user.id)

    if (existingIds.length > 0) {
      await this.db.delete(sysUsers).where(inArray(sysUsers.id, existingIds))
    }

    return { count: existingIds.length }
  }
}
