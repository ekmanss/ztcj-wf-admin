import { randomBytes } from 'node:crypto'
import {
  BadRequestException,
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
import { DB } from '../db/db.constants'
import { xTweets, xUsers, type XTweetRow, type XUserRow } from '../db/schema'
import type { DbClient } from '../db/db.types'
import {
  type CreateKolUserDto,
  KOL_PLATFORMS,
  KOL_SYNC_STATUSES,
  KOL_TWEET_STATUSES,
  KOL_USER_STATUSES,
  type KolPlatform,
  type KolSyncStatus,
  type KolTweetStatus,
  type KolUserStatus,
  type ListKolTweetsQueryDto,
  type ListKolUsersQueryDto,
  type UpdateKolTweetDto,
  type UpdateKolUserDto,
} from './kol.dto'

type KolUserChanges = Partial<typeof xUsers.$inferInsert>
type KolTweetChanges = Partial<typeof xTweets.$inferInsert>

const DEFAULT_PLATFORM: KolPlatform = 'twitter'
const DEFAULT_SYNC_STATUS: KolSyncStatus = '0'
const DEFAULT_USER_STATUS: KolUserStatus = '1'
const AVATAR_CDN_BASE_URL = 'https://cdn.woofunapi.com/'

function trimString(value: string | undefined | null) {
  return value?.trim()
}

function optionalString(value: string | undefined | null) {
  return value?.trim() ?? ''
}

function normalizeNullableString(value: string | undefined) {
  if (value === undefined) return undefined
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function requireTrimmed(value: string | undefined, fieldName: string) {
  const trimmed = value?.trim()

  if (!trimmed) {
    throw new BadRequestException(`${fieldName}不能为空。`)
  }

  return trimmed
}

function buildWhere(filters: SQL[]) {
  return filters.length > 0 ? and(...filters) : undefined
}

function normalizeEnum<T extends string>(
  value: string | null,
  allowedValues: readonly T[],
  fallback: T
): T {
  return allowedValues.includes(value as T) ? (value as T) : fallback
}

function cdnAvatarUrl(avatarS3Key: string | null | undefined) {
  const key = avatarS3Key?.trim()

  if (!key) return ''

  return `${AVATAR_CDN_BASE_URL}${key.replace(/^\/+/, '')}`
}

function resolveAvatarUrl(
  avatarS3Key: string | null | undefined,
  fallbackUrl: string | null | undefined
) {
  return cdnAvatarUrl(avatarS3Key) || fallbackUrl?.trim() || ''
}

function userLinkUrl(row: Pick<XUserRow, 'linkUrl' | 'username'>) {
  if (row.linkUrl) return row.linkUrl
  return row.username ? `https://x.com/${row.username}` : ''
}

function tweetOriginalUrl(
  row: Pick<XTweetRow, 'authorUsername' | 'tweetRestId'>
) {
  if (!row.authorUsername) return ''
  return `https://x.com/${row.authorUsername}/status/${row.tweetRestId}`
}

function toNullableBoolean(value: number | null) {
  if (value === null) return null
  return Boolean(value)
}

function toPublicKolUser(row: XUserRow) {
  return {
    restId: row.restId,
    requestedUsername: row.requestedUsername ?? '',
    username: row.username,
    name: row.name ?? '',
    description: row.description ?? '',
    accountCreatedAt: row.accountCreatedAt,
    avatarUrl: row.avatarUrl ?? '',
    avatarS3Key: row.avatarS3Key ?? '',
    avatarS3Url: row.avatarS3Url ?? '',
    displayAvatarUrl: resolveAvatarUrl(row.avatarS3Key, row.avatarUrl),
    profileBannerUrl: row.profileBannerUrl ?? '',
    location: row.location ?? '',
    followersCount: row.followersCount,
    friendsCount: row.friendsCount,
    favouritesCount: row.favouritesCount,
    statusesCount: row.statusesCount,
    listedCount: row.listedCount,
    mediaCount: row.mediaCount,
    isProtected: toNullableBoolean(row.isProtected),
    isBlueVerified: toNullableBoolean(row.isBlueVerified),
    isVerified: toNullableBoolean(row.isVerified),
    syncedAt: row.syncedAt,
    platform: normalizeEnum(row.platform, KOL_PLATFORMS, DEFAULT_PLATFORM),
    syncStatus: normalizeEnum(
      row.syncStatus,
      KOL_SYNC_STATUSES,
      DEFAULT_SYNC_STATUS
    ),
    status: normalizeEnum(row.status, KOL_USER_STATUSES, DEFAULT_USER_STATUS),
    linkUrl: row.linkUrl ?? '',
    displayLinkUrl: userLinkUrl(row),
    keywords: row.keywords ?? '',
    remark: row.remark ?? '',
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function toPublicKolTweet(
  row: XTweetRow,
  authorAvatar?: {
    avatarS3Key: string | null
    avatarUrl: string | null
  }
) {
  return {
    tweetRestId: row.tweetRestId,
    authorRestId: row.authorRestId ?? '',
    authorUsername: row.authorUsername ?? '',
    authorName: row.authorName ?? '',
    authorAvatarUrl: resolveAvatarUrl(
      authorAvatar?.avatarS3Key,
      authorAvatar?.avatarUrl ?? row.authorAvatarUrl
    ),
    tweetCreatedAt: row.tweetCreatedAt,
    fullText: row.fullText ?? '',
    lang: row.lang ?? '',
    conversationId: row.conversationId ?? '',
    replyToTweetId: row.replyToTweetId ?? '',
    replyToUsername: row.replyToUsername ?? '',
    quotedTweetId: row.quotedTweetId ?? '',
    retweetedTweetId: row.retweetedTweetId ?? '',
    articleRestId: row.articleRestId ?? '',
    isReply: row.isReply === 1 ? 1 : 0,
    isQuote: row.isQuote === 1,
    isRetweet: row.isRetweet === 1,
    hasArticle: row.hasArticle === 1,
    hasNoteTweet: row.hasNoteTweet === 1,
    favoriteCount: row.favoriteCount,
    replyCount: row.replyCount,
    retweetCount: row.retweetCount,
    quoteCount: row.quoteCount,
    viewCount: row.viewCount,
    bookmarkCount: row.bookmarkCount,
    syncedAt: row.syncedAt,
    platform: normalizeEnum(row.platform, KOL_PLATFORMS, DEFAULT_PLATFORM),
    status: normalizeEnum(row.status, KOL_TWEET_STATUSES, '0'),
    originalUrl: tweetOriginalUrl(row),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function toKolUserCreateValues(
  dto: CreateKolUserDto
): typeof xUsers.$inferInsert {
  const username = requireTrimmed(dto.username, '用户名')

  return {
    restId:
      trimString(dto.restId) ?? `manual_${randomBytes(12).toString('hex')}`,
    username,
    requestedUsername: trimString(dto.requestedUsername) || username,
    name: normalizeNullableString(dto.name),
    description: normalizeNullableString(dto.description),
    avatarUrl: normalizeNullableString(dto.avatarUrl),
    linkUrl: normalizeNullableString(dto.linkUrl),
    platform: dto.platform ?? DEFAULT_PLATFORM,
    syncStatus: dto.syncStatus ?? DEFAULT_SYNC_STATUS,
    status: dto.status ?? DEFAULT_USER_STATUS,
    keywords: normalizeNullableString(dto.keywords),
    remark: normalizeNullableString(dto.remark),
  }
}

function toKolUserChanges(dto: UpdateKolUserDto): KolUserChanges {
  const changes: KolUserChanges = {}

  if (dto.username !== undefined) {
    changes.username = requireTrimmed(dto.username, '用户名')
  }
  if (dto.requestedUsername !== undefined) {
    changes.requestedUsername =
      normalizeNullableString(dto.requestedUsername) ?? null
  }
  if (dto.name !== undefined) changes.name = normalizeNullableString(dto.name)
  if (dto.description !== undefined) {
    changes.description = normalizeNullableString(dto.description)
  }
  if (dto.avatarUrl !== undefined) {
    changes.avatarUrl = normalizeNullableString(dto.avatarUrl)
  }
  if (dto.linkUrl !== undefined)
    changes.linkUrl = normalizeNullableString(dto.linkUrl)
  if (dto.platform !== undefined) changes.platform = dto.platform
  if (dto.syncStatus !== undefined) changes.syncStatus = dto.syncStatus
  if (dto.status !== undefined) changes.status = dto.status
  if (dto.keywords !== undefined) {
    changes.keywords = normalizeNullableString(dto.keywords)
  }
  if (dto.remark !== undefined)
    changes.remark = normalizeNullableString(dto.remark)

  return changes
}

function toKolTweetChanges(dto: UpdateKolTweetDto): KolTweetChanges {
  const changes: KolTweetChanges = {}

  if (dto.fullText !== undefined)
    changes.fullText = optionalString(dto.fullText)
  if (dto.status !== undefined) changes.status = dto.status

  return changes
}

@Injectable()
export class KolService {
  constructor(@Inject(DB) private readonly db: DbClient) {}

  private async findUserByRestId(restId: string) {
    const [user] = await this.db
      .select()
      .from(xUsers)
      .where(eq(xUsers.restId, restId))
      .limit(1)

    return user ? toPublicKolUser(user) : undefined
  }

  private async findUserByRestIdOrThrow(restId: string) {
    const user = await this.findUserByRestId(restId)

    if (!user) {
      throw new NotFoundException('KOL user not found.')
    }

    return user
  }

  private async findTweetByRestId(tweetRestId: string) {
    const [tweet] = await this.db
      .select({
        tweet: xTweets,
        authorAvatarS3Key: xUsers.avatarS3Key,
        authorAvatarUrl: xUsers.avatarUrl,
      })
      .from(xTweets)
      .leftJoin(xUsers, eq(xTweets.authorRestId, xUsers.restId))
      .where(eq(xTweets.tweetRestId, tweetRestId))
      .limit(1)

    return tweet
      ? toPublicKolTweet(tweet.tweet, {
          avatarS3Key: tweet.authorAvatarS3Key,
          avatarUrl: tweet.authorAvatarUrl,
        })
      : undefined
  }

  private async findTweetByRestIdOrThrow(tweetRestId: string) {
    const tweet = await this.findTweetByRestId(tweetRestId)

    if (!tweet) {
      throw new NotFoundException('KOL dynamic not found.')
    }

    return tweet
  }

  private async assertUserNotDuplicate(
    dto: CreateKolUserDto | UpdateKolUserDto,
    excludeRestId?: string
  ) {
    const filters: SQL[] = []
    const restId = 'restId' in dto ? trimString(dto.restId) : undefined
    const username = trimString(dto.username)

    if (restId) filters.push(eq(xUsers.restId, restId))
    if (username) filters.push(eq(xUsers.username, username))
    if (filters.length === 0) return

    const duplicateMatch = filters.length === 1 ? filters[0] : or(...filters)
    if (!duplicateMatch) return

    const where =
      excludeRestId === undefined
        ? duplicateMatch
        : and(duplicateMatch, ne(xUsers.restId, excludeRestId))

    const [existing] = await this.db
      .select({ restId: xUsers.restId })
      .from(xUsers)
      .where(where)
      .limit(1)

    if (existing) {
      throw new ConflictException('KOL rest_id or username already exists.')
    }
  }

  async listUsers(query: ListKolUsersQueryDto) {
    const page = query.page
    const pageSize = query.pageSize
    const offset = (page - 1) * pageSize
    const filters: SQL[] = []

    if (query.username?.trim()) {
      filters.push(like(xUsers.username, `%${query.username.trim()}%`))
    }

    if (query.name?.trim()) {
      filters.push(like(xUsers.name, `%${query.name.trim()}%`))
    }

    if (query.platform?.length) {
      filters.push(inArray(xUsers.platform, query.platform))
    }

    if (query.syncStatus?.length) {
      filters.push(inArray(xUsers.syncStatus, query.syncStatus))
    }

    if (query.status?.length) {
      filters.push(inArray(xUsers.status, query.status))
    }

    const where = buildWhere(filters)

    const [items, totalRows] = await Promise.all([
      this.db
        .select()
        .from(xUsers)
        .where(where)
        .orderBy(desc(xUsers.createdAt), desc(xUsers.restId))
        .limit(pageSize)
        .offset(offset),
      this.db.select({ total: count() }).from(xUsers).where(where),
    ])

    return {
      items: items.map(toPublicKolUser),
      total: Number(totalRows[0]?.total ?? 0),
      page,
      pageSize,
    }
  }

  async createUser(dto: CreateKolUserDto) {
    await this.assertUserNotDuplicate(dto)

    const values = toKolUserCreateValues(dto)
    await this.db.insert(xUsers).values(values)

    return this.findUserByRestIdOrThrow(values.restId)
  }

  async updateUser(restId: string, dto: UpdateKolUserDto) {
    await this.findUserByRestIdOrThrow(restId)
    const changes = toKolUserChanges(dto)

    await this.assertUserNotDuplicate(dto, restId)

    if (Object.keys(changes).length > 0) {
      await this.db.update(xUsers).set(changes).where(eq(xUsers.restId, restId))
    }

    return this.findUserByRestIdOrThrow(restId)
  }

  async updateManyUserStatus(restIds: string[], status: KolUserStatus) {
    const existingRows = await this.db
      .select({ restId: xUsers.restId })
      .from(xUsers)
      .where(inArray(xUsers.restId, restIds))

    const existingIds = existingRows.map((row) => row.restId)

    if (existingIds.length > 0) {
      await this.db
        .update(xUsers)
        .set({ status })
        .where(inArray(xUsers.restId, existingIds))
    }

    return { count: existingIds.length }
  }

  async deleteUser(restId: string) {
    const user = await this.findUserByRestIdOrThrow(restId)
    await this.db.delete(xUsers).where(eq(xUsers.restId, restId))

    return { restId: user.restId }
  }

  async deleteManyUsers(restIds: string[]) {
    const existingRows = await this.db
      .select({ restId: xUsers.restId })
      .from(xUsers)
      .where(inArray(xUsers.restId, restIds))

    const existingIds = existingRows.map((row) => row.restId)

    if (existingIds.length > 0) {
      await this.db.delete(xUsers).where(inArray(xUsers.restId, existingIds))
    }

    return { count: existingIds.length }
  }

  async listTweets(query: ListKolTweetsQueryDto) {
    const page = query.page
    const pageSize = query.pageSize
    const offset = (page - 1) * pageSize
    const filters: SQL[] = []

    if (query.authorName?.trim()) {
      filters.push(like(xTweets.authorName, `%${query.authorName.trim()}%`))
    }

    if (query.authorUsername?.trim()) {
      filters.push(
        like(xTweets.authorUsername, `%${query.authorUsername.trim()}%`)
      )
    }

    if (query.platform?.length) {
      filters.push(inArray(xTweets.platform, query.platform))
    }

    if (query.isReply?.length) {
      filters.push(inArray(xTweets.isReply, query.isReply))
    }

    if (query.status?.length) {
      filters.push(inArray(xTweets.status, query.status))
    }

    const where = buildWhere(filters)

    const [items, totalRows] = await Promise.all([
      this.db
        .select({
          tweet: xTweets,
          authorAvatarS3Key: xUsers.avatarS3Key,
          authorAvatarUrl: xUsers.avatarUrl,
        })
        .from(xTweets)
        .leftJoin(xUsers, eq(xTweets.authorRestId, xUsers.restId))
        .where(where)
        .orderBy(desc(xTweets.tweetCreatedAt), desc(xTweets.tweetRestId))
        .limit(pageSize)
        .offset(offset),
      this.db.select({ total: count() }).from(xTweets).where(where),
    ])

    return {
      items: items.map((item) =>
        toPublicKolTweet(item.tweet, {
          avatarS3Key: item.authorAvatarS3Key,
          avatarUrl: item.authorAvatarUrl,
        })
      ),
      total: Number(totalRows[0]?.total ?? 0),
      page,
      pageSize,
    }
  }

  async getTweet(tweetRestId: string) {
    return this.findTweetByRestIdOrThrow(tweetRestId)
  }

  async updateTweet(tweetRestId: string, dto: UpdateKolTweetDto) {
    await this.findTweetByRestIdOrThrow(tweetRestId)
    const changes = toKolTweetChanges(dto)

    if (Object.keys(changes).length > 0) {
      await this.db
        .update(xTweets)
        .set(changes)
        .where(eq(xTweets.tweetRestId, tweetRestId))
    }

    return this.findTweetByRestIdOrThrow(tweetRestId)
  }

  async updateManyTweetStatus(tweetRestIds: string[], status: KolTweetStatus) {
    const existingRows = await this.db
      .select({ tweetRestId: xTweets.tweetRestId })
      .from(xTweets)
      .where(inArray(xTweets.tweetRestId, tweetRestIds))

    const existingIds = existingRows.map((row) => row.tweetRestId)

    if (existingIds.length > 0) {
      await this.db
        .update(xTweets)
        .set({ status })
        .where(inArray(xTweets.tweetRestId, existingIds))
    }

    return { count: existingIds.length }
  }

  async deleteTweet(tweetRestId: string) {
    const tweet = await this.findTweetByRestIdOrThrow(tweetRestId)
    await this.db.delete(xTweets).where(eq(xTweets.tweetRestId, tweetRestId))

    return { tweetRestId: tweet.tweetRestId }
  }

  async deleteManyTweets(tweetRestIds: string[]) {
    const existingRows = await this.db
      .select({ tweetRestId: xTweets.tweetRestId })
      .from(xTweets)
      .where(inArray(xTweets.tweetRestId, tweetRestIds))

    const existingIds = existingRows.map((row) => row.tweetRestId)

    if (existingIds.length > 0) {
      await this.db
        .delete(xTweets)
        .where(inArray(xTweets.tweetRestId, existingIds))
    }

    return { count: existingIds.length }
  }
}
