import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { and, count, desc, eq, inArray, like, or, type SQL } from 'drizzle-orm'
import { DB } from '../db/db.constants'
import { wfAppAds, wfAppColumns } from '../db/schema'
import type { DbClient } from '../db/db.types'
import {
  APP_AD_PAGE_CODES,
  APP_AD_POSITION_CODES,
  APP_AD_TYPES,
  type AppAdPageCode,
  type AppAdPositionCode,
  type AppAdStatus,
  type AppAdType,
  type AppColumnStatus,
  type CreateAppAdDto,
  type CreateAppColumnDto,
  type ListAppAdsQueryDto,
  type ListAppColumnsQueryDto,
  type UpdateAppAdDto,
  type UpdateAppColumnDto,
} from './apps.dto'

type AppColumnChanges = Partial<typeof wfAppColumns.$inferInsert>
type AppAdChanges = Partial<typeof wfAppAds.$inferInsert>
type AppColumnRow = typeof wfAppColumns.$inferSelect
type AppAdRow = typeof wfAppAds.$inferSelect

const COLUMN_STATUS_LABELS = {
  '1': '是',
  '0': '否',
} satisfies Record<AppColumnStatus, string>

const COLUMN_LEVEL_LABELS = {
  1: '一级',
  2: '二级',
} satisfies Record<number, string>

const AD_TYPE_LABELS = {
  '1': '广告',
  '2': '推广',
  '3': '活动',
} satisfies Record<AppAdType, string>

const AD_STATUS_LABELS = {
  1: '显示',
  0: '隐藏',
} satisfies Record<AppAdStatus, string>

const AD_POSITION_LABELS = {
  top_banner: '顶部轮播',
  right_card: '右侧卡片',
} satisfies Record<AppAdPositionCode, string>

const AD_PAGE_LABELS = {
  market: '市场',
  ecology: '生态',
  alpha: 'Alpha',
  paradise_lost: '失乐园',
  dex_scan: 'DexScan',
  information: '资讯',
  flash_news: '快讯',
  calendar: '日历',
  data: '数据',
  exchange: '交易所',
  wallet: '钱包',
  crypto_detail: '加密货币详情页',
  token_detail: '代币详情页',
  project_detail: '项目详情页',
  person_detail: '人物详情页',
  institution_detail: '机构详情页',
  info_detail: '资讯详情页',
  flash_news_detail: '快讯详情页',
  exchange_detail: '交易所详情页',
  wallet_detail: '钱包详情页',
  rating: '评级',
} satisfies Record<AppAdPageCode, string>

const datetimePattern = /^\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}(?::\d{2})?)?$/

function nowDateTime() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ')
}

function trimString(value: string | undefined | null) {
  return value?.trim()
}

function normalizeRequired(value: string, fieldName: string) {
  const trimmed = value.trim()

  if (!trimmed) {
    throw new BadRequestException(`${fieldName}不能为空。`)
  }

  return trimmed
}

function normalizeOptional(value: string | undefined | null) {
  return value?.trim() ?? ''
}

function normalizeDateTime(value: string, fieldName: string) {
  const trimmed = normalizeRequired(value, fieldName)

  if (!datetimePattern.test(trimmed)) {
    throw new BadRequestException(`${fieldName}格式无效。`)
  }

  const normalized = trimmed.replace('T', ' ')
  const [datePart, timePart = '00:00:00'] = normalized.split(' ')
  const [hours = '00', minutes = '00', seconds = '00'] = timePart.split(':')

  return `${datePart} ${hours}:${minutes}:${seconds}`
}

function buildWhere(filters: SQL[]) {
  return filters.length > 0 ? and(...filters) : undefined
}

function buildOr(filters: Array<SQL | undefined>) {
  const present = filters.filter(Boolean) as SQL[]

  if (present.length === 0) return undefined
  if (present.length === 1) return present[0]

  return or(...present)
}

function toPublicColumn(
  row: AppColumnRow,
  meta: { hasChildren?: boolean; depth?: number; parentName?: string } = {}
) {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    nameEn: row.nameEn,
    level: row.level,
    levelText: COLUMN_LEVEL_LABELS[row.level as 1 | 2] ?? '',
    pid: row.pid,
    parentName: meta.parentName ?? '',
    status: row.status,
    statusText: COLUMN_STATUS_LABELS[row.status],
    remarks: row.remarks ?? '',
    weigh: row.weigh,
    createTime: row.createTime,
    updateTime: row.updateTime,
    hasChildren: Boolean(meta.hasChildren),
    depth: meta.depth ?? Math.max(0, row.level - 1),
  }
}

function toPublicAd(row: AppAdRow) {
  const positionLabel =
    AD_POSITION_LABELS[row.adPositionCode as AppAdPositionCode] ?? ''
  const pageLabel = AD_PAGE_LABELS[row.adPageCode as AppAdPageCode] ?? ''

  return {
    adId: row.adId,
    adName: row.adName ?? '',
    adPositionCode: row.adPositionCode as AppAdPositionCode,
    adPositionCodeText: positionLabel,
    adPageCode: row.adPageCode as AppAdPageCode,
    adPageCodeText: pageLabel,
    adPositionText: [positionLabel, pageLabel].filter(Boolean).join('->'),
    adImageCh: row.adImageCh ?? '',
    adImageEn: row.adImageEn ?? '',
    adLink: row.adLink ?? '',
    adType: (row.adType ?? '1') as AppAdType,
    adTypeText: AD_TYPE_LABELS[(row.adType ?? '1') as AppAdType],
    adEffectiveTime: row.adEffectiveTime,
    adInvalidTime: row.adInvalidTime,
    weigh: row.weigh ?? 0,
    status: (row.status === 0 ? 0 : 1) as AppAdStatus,
    statusText: AD_STATUS_LABELS[(row.status === 0 ? 0 : 1) as AppAdStatus],
    createTime: row.createTime,
    updateTime: row.updateTime,
  }
}

function toColumnChanges(dto: CreateAppColumnDto | UpdateAppColumnDto) {
  const changes: AppColumnChanges = {}

  if (dto.code !== undefined)
    changes.code = normalizeRequired(dto.code, '栏目CODE')
  if (dto.name !== undefined)
    changes.name = normalizeRequired(dto.name, '栏目名称')
  if (dto.nameEn !== undefined) {
    changes.nameEn = normalizeRequired(dto.nameEn, '栏目英文名称')
  }
  if (dto.status !== undefined) changes.status = dto.status
  if (dto.remarks !== undefined)
    changes.remarks = normalizeOptional(dto.remarks)
  if (dto.weigh !== undefined) changes.weigh = dto.weigh

  return changes
}

function toAdChanges(dto: CreateAppAdDto | UpdateAppAdDto) {
  const changes: AppAdChanges = {}

  if (dto.adName !== undefined) {
    changes.adName = normalizeRequired(dto.adName, '广告名称')
  }
  if (dto.adPositionCode !== undefined) {
    changes.adPositionCode = dto.adPositionCode
  }
  if (dto.adPageCode !== undefined) changes.adPageCode = dto.adPageCode
  if (dto.adImageCh !== undefined) {
    changes.adImageCh = normalizeRequired(dto.adImageCh, '中文广告图片')
  }
  if (dto.adImageEn !== undefined) {
    changes.adImageEn = normalizeRequired(dto.adImageEn, '英文广告图片')
  }
  if (dto.adLink !== undefined) {
    changes.adLink = normalizeRequired(dto.adLink, '跳转url')
  }
  if (dto.adType !== undefined) changes.adType = dto.adType
  if (dto.adEffectiveTime !== undefined) {
    changes.adEffectiveTime = normalizeDateTime(
      dto.adEffectiveTime,
      '广告生效时间'
    )
  }
  if (dto.adInvalidTime !== undefined) {
    changes.adInvalidTime = normalizeDateTime(dto.adInvalidTime, '广告失效时间')
  }
  if (dto.weigh !== undefined) changes.weigh = dto.weigh
  if (dto.status !== undefined) changes.status = dto.status

  return changes
}

@Injectable()
export class AppsService {
  constructor(@Inject(DB) private readonly db: DbClient) {}

  getMeta() {
    return {
      adPositions: APP_AD_POSITION_CODES.map((value) => ({
        value,
        label: AD_POSITION_LABELS[value],
      })),
      adPages: APP_AD_PAGE_CODES.map((value) => ({
        value,
        label: AD_PAGE_LABELS[value],
      })),
      adTypes: APP_AD_TYPES.map((value) => ({
        value,
        label: AD_TYPE_LABELS[value],
      })),
      adStatuses: [
        { value: 1, label: AD_STATUS_LABELS[1] },
        { value: 0, label: AD_STATUS_LABELS[0] },
      ],
      columnStatuses: [
        { value: '1', label: COLUMN_STATUS_LABELS['1'] },
        { value: '0', label: COLUMN_STATUS_LABELS['0'] },
      ],
    }
  }

  private async findColumnById(id: number) {
    const [row] = await this.db
      .select()
      .from(wfAppColumns)
      .where(eq(wfAppColumns.id, id))
      .limit(1)

    return row
  }

  private async findColumnByIdOrThrow(id: number) {
    const row = await this.findColumnById(id)

    if (!row) {
      throw new NotFoundException('APP栏目不存在。')
    }

    return row
  }

  private async findAdById(id: number) {
    const [row] = await this.db
      .select()
      .from(wfAppAds)
      .where(eq(wfAppAds.adId, id))
      .limit(1)

    return row
  }

  private async findAdByIdOrThrow(id: number) {
    const row = await this.findAdById(id)

    if (!row) {
      throw new NotFoundException('APP广告不存在。')
    }

    return row
  }

  private async resolveColumnLevel(pid: number, currentId?: number) {
    if (pid === 0) return 1

    if (currentId !== undefined && pid === currentId) {
      throw new BadRequestException('父级栏目不能选择自身。')
    }

    const parent = await this.findColumnById(pid)

    if (!parent) {
      throw new BadRequestException('父级栏目不存在。')
    }

    if (parent.pid !== 0 || parent.level !== 1) {
      throw new BadRequestException('APP栏目仅支持两级结构。')
    }

    return 2
  }

  private async hasColumnChildren(id: number) {
    const [row] = await this.db
      .select({ total: count() })
      .from(wfAppColumns)
      .where(eq(wfAppColumns.pid, id))

    return Number(row?.total ?? 0) > 0
  }

  private assertAdTimeRange(row: {
    adEffectiveTime?: string | null
    adInvalidTime?: string | null
  }) {
    if (
      row.adEffectiveTime &&
      row.adInvalidTime &&
      row.adInvalidTime < row.adEffectiveTime
    ) {
      throw new BadRequestException('广告失效时间不能早于生效时间。')
    }
  }

  async listColumns(query: ListAppColumnsQueryDto) {
    const filters: SQL[] = []
    const q = trimString(query.q)

    if (q) {
      const match = buildOr([
        like(wfAppColumns.name, `%${q}%`),
        like(wfAppColumns.nameEn, `%${q}%`),
        like(wfAppColumns.code, `%${q}%`),
      ])
      if (match) filters.push(match)
    }

    if (query.status?.length) {
      filters.push(inArray(wfAppColumns.status, query.status))
    }

    const rows = await this.db
      .select()
      .from(wfAppColumns)
      .where(buildWhere(filters))

    const childrenByParent = new Map<number, AppColumnRow[]>()
    const rowById = new Map<number, AppColumnRow>()

    for (const row of rows) {
      rowById.set(row.id, row)
      const siblings = childrenByParent.get(row.pid) ?? []
      siblings.push(row)
      childrenByParent.set(row.pid, siblings)
    }

    for (const siblings of childrenByParent.values()) {
      siblings.sort((a, b) => b.weigh - a.weigh || b.id - a.id)
    }

    const flattened: ReturnType<typeof toPublicColumn>[] = []
    const visit = (row: AppColumnRow, depth: number) => {
      const children = childrenByParent.get(row.id) ?? []
      const parent = row.pid ? rowById.get(row.pid) : undefined
      flattened.push(
        toPublicColumn(row, {
          depth,
          hasChildren: children.length > 0,
          parentName: parent?.name,
        })
      )

      for (const child of children) {
        visit(child, depth + 1)
      }
    }

    for (const root of childrenByParent.get(0) ?? []) {
      visit(root, 0)
    }

    return {
      items: flattened,
      total: flattened.length,
    }
  }

  async listParentColumns() {
    const rows = await this.db
      .select()
      .from(wfAppColumns)
      .where(eq(wfAppColumns.pid, 0))
      .orderBy(desc(wfAppColumns.weigh), desc(wfAppColumns.id))

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      nameEn: row.nameEn,
      code: row.code,
      status: row.status,
    }))
  }

  async createColumn(dto: CreateAppColumnDto) {
    const pid = dto.pid ?? 0
    const level = await this.resolveColumnLevel(pid)
    const now = nowDateTime()

    const [inserted] = await this.db
      .insert(wfAppColumns)
      .values({
        code: normalizeRequired(dto.code, '栏目CODE'),
        name: normalizeRequired(dto.name, '栏目名称'),
        nameEn: normalizeRequired(dto.nameEn, '栏目英文名称'),
        pid,
        level,
        remarks: normalizeOptional(dto.remarks),
        status: dto.status ?? '1',
        weigh: dto.weigh ?? 0,
        createTime: now,
        updateTime: now,
      })
      .$returningId()

    if (!inserted) {
      throw new NotFoundException('APP栏目不存在。')
    }

    if (!dto.weigh) {
      await this.db
        .update(wfAppColumns)
        .set({ weigh: inserted.id })
        .where(eq(wfAppColumns.id, inserted.id))
    }

    const row = await this.findColumnByIdOrThrow(inserted.id)
    return toPublicColumn(row)
  }

  async updateColumn(id: number, dto: UpdateAppColumnDto) {
    const current = await this.findColumnByIdOrThrow(id)
    const pid = dto.pid ?? current.pid

    if (pid !== 0 && current.pid === 0 && (await this.hasColumnChildren(id))) {
      throw new BadRequestException('已有子栏目的一级栏目不能改为二级栏目。')
    }

    const level = await this.resolveColumnLevel(pid, id)
    const changes = toColumnChanges(dto)

    await this.db
      .update(wfAppColumns)
      .set({
        ...changes,
        pid,
        level,
        updateTime: nowDateTime(),
      })
      .where(eq(wfAppColumns.id, id))

    const row = await this.findColumnByIdOrThrow(id)
    return toPublicColumn(row)
  }

  async updateColumnStatus(ids: number[], status: AppColumnStatus) {
    const existingRows = await this.db
      .select({ id: wfAppColumns.id })
      .from(wfAppColumns)
      .where(inArray(wfAppColumns.id, ids))

    const existingIds = existingRows.map((row) => row.id)

    if (existingIds.length > 0) {
      await this.db
        .update(wfAppColumns)
        .set({ status, updateTime: nowDateTime() })
        .where(inArray(wfAppColumns.id, existingIds))
    }

    return { count: existingIds.length }
  }

  async deleteColumn(id: number) {
    const row = await this.findColumnByIdOrThrow(id)

    if (await this.hasColumnChildren(id)) {
      throw new BadRequestException('该栏目仍有子栏目，不能直接删除。')
    }

    await this.db.delete(wfAppColumns).where(eq(wfAppColumns.id, id))

    return { id: row.id }
  }

  async deleteColumns(ids: number[]) {
    const existingRows = await this.db
      .select({ id: wfAppColumns.id })
      .from(wfAppColumns)
      .where(inArray(wfAppColumns.id, ids))

    const existingIds = existingRows.map((row) => row.id)

    if (existingIds.length === 0) return { count: 0 }

    const childRows = await this.db
      .select({ id: wfAppColumns.id, pid: wfAppColumns.pid })
      .from(wfAppColumns)
      .where(inArray(wfAppColumns.pid, existingIds))

    const selected = new Set(existingIds)
    const blockedChild = childRows.find((row) => !selected.has(row.id))

    if (blockedChild) {
      throw new BadRequestException('选中的栏目中存在仍有子栏目的父栏目。')
    }

    await this.db
      .delete(wfAppColumns)
      .where(inArray(wfAppColumns.id, existingIds))

    return { count: existingIds.length }
  }

  async listAds(query: ListAppAdsQueryDto) {
    const page = query.page
    const pageSize = query.pageSize
    const offset = (page - 1) * pageSize
    const filters: SQL[] = []
    const name = trimString(query.name)

    if (name) {
      filters.push(like(wfAppAds.adName, `%${name}%`))
    }

    if (query.positionCode?.length) {
      filters.push(inArray(wfAppAds.adPositionCode, query.positionCode))
    }

    if (query.pageCode?.length) {
      filters.push(inArray(wfAppAds.adPageCode, query.pageCode))
    }

    if (query.adType?.length) {
      filters.push(inArray(wfAppAds.adType, query.adType))
    }

    if (query.status?.length) {
      filters.push(inArray(wfAppAds.status, query.status))
    }

    const where = buildWhere(filters)
    const [items, totalRows] = await Promise.all([
      this.db
        .select()
        .from(wfAppAds)
        .where(where)
        .orderBy(desc(wfAppAds.weigh), desc(wfAppAds.adId))
        .limit(pageSize)
        .offset(offset),
      this.db.select({ total: count() }).from(wfAppAds).where(where),
    ])

    return {
      items: items.map(toPublicAd),
      total: Number(totalRows[0]?.total ?? 0),
      page,
      pageSize,
    }
  }

  async createAd(dto: CreateAppAdDto) {
    const now = nowDateTime()
    const candidate = {
      adName: normalizeRequired(dto.adName, '广告名称'),
      adPositionCode: dto.adPositionCode,
      adPageCode: dto.adPageCode,
      adImageCh: normalizeRequired(dto.adImageCh, '中文广告图片'),
      adImageEn: normalizeRequired(dto.adImageEn, '英文广告图片'),
      adLink: normalizeRequired(dto.adLink, '跳转url'),
      adType: dto.adType,
      adEffectiveTime: normalizeDateTime(dto.adEffectiveTime, '广告生效时间'),
      adInvalidTime: normalizeDateTime(dto.adInvalidTime, '广告失效时间'),
      status: dto.status ?? 1,
      weigh: dto.weigh ?? 0,
    }

    this.assertAdTimeRange(candidate)

    const [inserted] = await this.db
      .insert(wfAppAds)
      .values({
        ...candidate,
        createTime: now,
        updateTime: now,
      })
      .$returningId()

    if (!inserted) {
      throw new NotFoundException('APP广告不存在。')
    }

    if (!dto.weigh) {
      await this.db
        .update(wfAppAds)
        .set({ weigh: inserted.adId })
        .where(eq(wfAppAds.adId, inserted.adId))
    }

    const row = await this.findAdByIdOrThrow(inserted.adId)
    return toPublicAd(row)
  }

  async updateAd(id: number, dto: UpdateAppAdDto) {
    const current = await this.findAdByIdOrThrow(id)
    const changes = toAdChanges(dto)
    const candidate = {
      adEffectiveTime: changes.adEffectiveTime ?? current.adEffectiveTime,
      adInvalidTime: changes.adInvalidTime ?? current.adInvalidTime,
    }

    this.assertAdTimeRange(candidate)

    await this.db
      .update(wfAppAds)
      .set({
        ...changes,
        updateTime: nowDateTime(),
      })
      .where(eq(wfAppAds.adId, id))

    const row = await this.findAdByIdOrThrow(id)
    return toPublicAd(row)
  }

  async updateAdStatus(ids: number[], status: AppAdStatus) {
    const existingRows = await this.db
      .select({ adId: wfAppAds.adId })
      .from(wfAppAds)
      .where(inArray(wfAppAds.adId, ids))

    const existingIds = existingRows.map((row) => row.adId)

    if (existingIds.length > 0) {
      await this.db
        .update(wfAppAds)
        .set({ status, updateTime: nowDateTime() })
        .where(inArray(wfAppAds.adId, existingIds))
    }

    return { count: existingIds.length }
  }

  async deleteAd(id: number) {
    const row = await this.findAdByIdOrThrow(id)
    await this.db.delete(wfAppAds).where(eq(wfAppAds.adId, id))

    return { id: row.adId }
  }

  async deleteAds(ids: number[]) {
    const existingRows = await this.db
      .select({ adId: wfAppAds.adId })
      .from(wfAppAds)
      .where(inArray(wfAppAds.adId, ids))

    const existingIds = existingRows.map((row) => row.adId)

    if (existingIds.length > 0) {
      await this.db.delete(wfAppAds).where(inArray(wfAppAds.adId, existingIds))
    }

    return { count: existingIds.length }
  }
}
