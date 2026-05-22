import { randomUUID } from 'node:crypto'
import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { eq, type SQL } from 'drizzle-orm'
import { DB } from '../db/db.constants'
import { sysAdmins, type SysAdminRow } from '../db/schema'
import type { DbClient } from '../db/db.types'
import type { LoginDto } from './auth.dto'
import {
  resolveAccountColumn,
  toUnixSeconds,
  verifyLegacyPassword,
} from './auth.utils'

type AuthUser = {
  id: number
  username: string
  nickname: string
  email: string
  mobile: string
  avatar: string
  status: string
  role: string[]
}

type LoginUpdate = {
  token: string
  loginTime: number
  loginIp: string
  loginFailure: number
  updateTime: number
}

const LOCK_SECONDS = 24 * 60 * 60
const MAX_FAILURES = 10

function toAuthUser(user: SysAdminRow): AuthUser {
  const username = user.username ?? ''
  const nickname = user.nickname || username

  return {
    id: user.id,
    username,
    nickname,
    email: user.email ?? '',
    mobile: user.mobile ?? '',
    avatar: user.avatar ?? '',
    status: user.status ?? '',
    role: ['admin'],
  }
}

function getLoginUpdate(token: string, ip: string) {
  const now = toUnixSeconds()

  return {
    token,
    loginTime: now,
    loginIp: ip,
    loginFailure: 0,
    updateTime: now,
  } satisfies LoginUpdate
}

@Injectable()
export class AuthService {
  constructor(@Inject(DB) private readonly db: DbClient) {}

  private async findOne(where: SQL) {
    const [admin] = await this.db.select().from(sysAdmins).where(where).limit(1)
    return admin
  }

  private async findByAccount(account: string) {
    const accountColumn = resolveAccountColumn(account)

    if (accountColumn === 'email') {
      return this.findOne(eq(sysAdmins.email, account))
    }

    if (accountColumn === 'mobile') {
      return this.findOne(eq(sysAdmins.mobile, account))
    }

    return this.findOne(eq(sysAdmins.username, account))
  }

  private async findByToken(token: string) {
    if (!token) return undefined

    return this.findOne(eq(sysAdmins.token, token))
  }

  async login(dto: LoginDto, ip: string) {
    const user = await this.findByAccount(dto.account)

    if (!user) {
      throw new UnauthorizedException('Username or password is incorrect.')
    }

    if (user.status !== 'normal') {
      throw new ForbiddenException('Account is locked.')
    }

    const now = toUnixSeconds()
    const failureTime = user.updateTime ?? 0

    if (user.loginFailure >= MAX_FAILURES && now - failureTime < LOCK_SECONDS) {
      throw new ForbiddenException('Please try again after 1 day.')
    }

    const passwordMatches = verifyLegacyPassword(
      dto.password,
      user.salt ?? '',
      user.password ?? ''
    )

    if (!passwordMatches) {
      await this.db
        .update(sysAdmins)
        .set({
          loginFailure: Math.min(user.loginFailure + 1, 255),
          updateTime: now,
        })
        .where(eq(sysAdmins.id, user.id))

      throw new UnauthorizedException('Username or password is incorrect.')
    }

    const update = getLoginUpdate(randomUUID(), ip)

    await this.db.update(sysAdmins).set(update).where(eq(sysAdmins.id, user.id))

    return {
      token: update.token,
      user: toAuthUser({ ...user, ...update }),
    }
  }

  async me(token: string) {
    const user = await this.findByToken(token)

    if (!user) {
      throw new UnauthorizedException('Session expired.')
    }

    if (user.status !== 'normal') {
      throw new ForbiddenException('Account is locked.')
    }

    return { user: toAuthUser(user) }
  }

  async logout(token: string) {
    if (token) {
      await this.db
        .update(sysAdmins)
        .set({ token: '' })
        .where(eq(sysAdmins.token, token))
    }

    return { success: true }
  }
}
