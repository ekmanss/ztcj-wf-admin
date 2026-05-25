import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import {
  and,
  asc,
  count,
  desc,
  eq,
  inArray,
  like,
  ne,
  or,
  sql,
  type SQL,
} from 'drizzle-orm'
import { DB } from '../db/db.constants'
import {
  coinAradiseLost,
  coinAradiseLostTags,
  coinProjects,
  rootdataOrganizations,
  rootdataPersons,
  sysEventsTimeline,
  sysEventsTimelineNatures,
  sysEventsTimelineTypes,
  type CoinAradiseLostRow,
} from '../db/schema'
import type { DbClient } from '../db/db.types'
import {
  type CreateParadiseLostDto,
  type CreateParadiseLostTagDto,
  type ListParadiseLostQueryDto,
  type ParadiseLostInvestmentQueryDto,
  type ParadiseLostStatus,
  type ParadiseLostType,
  type UpdateParadiseLostDto,
} from './paradise-lost.dto'

type DbTransaction = Parameters<Parameters<DbClient['transaction']>[0]>[0]
type ParadiseLostDb = DbClient | DbTransaction
type ParadiseLostChanges = Partial<typeof coinAradiseLost.$inferInsert>
type ParadiseLostTagChanges = Partial<typeof coinAradiseLostTags.$inferInsert>
type ParadiseLostPayload = CreateParadiseLostDto | UpdateParadiseLostDto

type SourceSnapshot = {
  name: string
  avatar: string
  oneLiner: string
  fields: Record<string, unknown>
}

type PublicSourceSnapshot = SourceSnapshot & {
  sourceMissing: boolean
  sourceMissingMessage: string
}

const TYPE_LABELS = {
  1: '项目',
  2: '机构',
  3: '人物',
  5: '事件',
} satisfies Record<ParadiseLostType, string>

const STATUS_LABELS = {
  0: '隐藏',
  1: '显示',
} satisfies Record<ParadiseLostStatus, string>

const datetimePattern = /^\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}(?::\d{2})?)?$/

function trimString(value: string | undefined | null) {
  return value?.trim()
}

function requireString(value: string | undefined, fieldName: string) {
  const trimmed = value?.trim()

  if (!trimmed) {
    throw new BadRequestException(`${fieldName}不能为空。`)
  }

  return trimmed
}

function optionalString(value: string | undefined | null) {
  return value?.trim() ?? ''
}

function parseCsv(value: string | null | undefined) {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function toCsv(value: string[] | undefined) {
  if (value === undefined) return undefined

  return Array.from(
    new Set(value.map((item) => item.trim()).filter(Boolean))
  ).join(',')
}

function nowDateTime() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ')
}

function normalizeDateTime(value: string | undefined) {
  const trimmed = value?.trim()

  if (!trimmed) return null

  if (!datetimePattern.test(trimmed)) {
    throw new BadRequestException('入选时间格式无效。')
  }

  const normalized = trimmed.replace('T', ' ')
  const [datePart, timePart = '00:00:00'] = normalized.split(' ')
  const [hours = '00', minutes = '00', seconds = '00'] = timePart.split(':')

  return `${datePart} ${hours}:${minutes}:${seconds}`
}

function normalizeNumberId(value: string, fieldName: string) {
  const id = Number(value)

  if (!Number.isSafeInteger(id)) {
    throw new BadRequestException(`${fieldName}必须是数字 ID。`)
  }

  return id
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

function toPublicTag(row: typeof coinAradiseLostTags.$inferSelect) {
  return {
    id: row.id,
    tagName: row.tagName ?? '',
    tagNameEn: row.tagNameEn ?? '',
    image: row.image,
    darkImage: row.darkImage ?? '',
    color: row.color ?? '',
    darkColor: row.darkColor ?? '',
    backgroundColor: row.backgroundColor ?? '',
    darkBackgroundColor: row.darkBackgroundColor ?? '',
    backgroundImage: row.backgroundImage ?? '',
    darkBackgroundImage: row.darkBackgroundImage ?? '',
    remark: row.remark ?? '',
    createTime: row.createTime,
    updateTime: row.updateTime,
  }
}

function getYears() {
  const startYear = Math.max(new Date().getFullYear(), 2026)
  const years: string[] = []

  for (let year = startYear; year >= 2015; year -= 1) {
    years.push(String(year))
  }

  return years
}

function eventOption(row: { id: number; name: string; nameEn: string | null }) {
  return {
    id: row.id,
    name: row.name,
    nameEn: row.nameEn ?? '',
  }
}

@Injectable()
export class ParadiseLostService {
  private readonly logger = new Logger(ParadiseLostService.name)

  constructor(@Inject(DB) private readonly db: DbClient) {}

  private async assertUnique(
    db: ParadiseLostDb,
    type: ParadiseLostType,
    investId: string,
    excludeId?: number
  ) {
    const duplicateFilter =
      excludeId === undefined
        ? and(
            eq(coinAradiseLost.investId, investId),
            eq(coinAradiseLost.type, type)
          )
        : and(
            eq(coinAradiseLost.investId, investId),
            eq(coinAradiseLost.type, type),
            ne(coinAradiseLost.id, excludeId)
          )

    const [existing] = await db
      .select({ id: coinAradiseLost.id })
      .from(coinAradiseLost)
      .where(duplicateFilter)
      .limit(1)

    if (existing) {
      throw new ConflictException('当前类型下的项目/机构/人物/事件已存在。')
    }
  }

  private async getProjectSource(db: ParadiseLostDb, investId: string) {
    const [project] = await db
      .select({
        projectId: coinProjects.projectId,
        projectName: coinProjects.projectName,
        projectNameEn: coinProjects.projectNameEn,
        logo: coinProjects.logo,
        oneLiner: coinProjects.oneLiner,
        oneLinerEn: coinProjects.oneLinerEn,
        description: coinProjects.description,
        descriptionEn: coinProjects.descriptionEn,
        active: coinProjects.active,
      })
      .from(coinProjects)
      .where(eq(coinProjects.projectId, investId))
      .limit(1)

    return project
  }

  private async getOrganizationSource(db: ParadiseLostDb, investId: string) {
    const orgId = normalizeNumberId(investId, '机构 ID')
    const [organization] = await db
      .select({
        orgId: rootdataOrganizations.orgId,
        orgName: rootdataOrganizations.orgName,
        orgNameEn: rootdataOrganizations.orgNameEn,
        logo: rootdataOrganizations.logo,
        orgInfo: rootdataOrganizations.orgInfo,
        orgInfoEn: rootdataOrganizations.orgInfoEn,
        description: rootdataOrganizations.description,
        descriptionEn: rootdataOrganizations.descriptionEn,
        active: rootdataOrganizations.active,
      })
      .from(rootdataOrganizations)
      .where(eq(rootdataOrganizations.orgId, orgId))
      .limit(1)

    return organization
  }

  private async getPersonSource(db: ParadiseLostDb, investId: string) {
    const [person] = await db
      .select({
        id: rootdataPersons.id,
        peopleName: rootdataPersons.peopleName,
        peopleNameEn: rootdataPersons.peopleNameEn,
        headImg: rootdataPersons.headImg,
        oneLiner: rootdataPersons.oneLiner,
        oneLinerEn: rootdataPersons.oneLinerEn,
        introduce: rootdataPersons.introduce,
        introduceEn: rootdataPersons.introduceEn,
      })
      .from(rootdataPersons)
      .where(eq(rootdataPersons.id, investId))
      .limit(1)

    return person
  }

  private async getEventSource(db: ParadiseLostDb, investId: string) {
    const eventId = normalizeNumberId(investId, '事件 ID')
    const [event] = await db
      .select({
        eventId: sysEventsTimeline.eventId,
        eventNameCn: sysEventsTimeline.eventNameCn,
        eventNameEn: sysEventsTimeline.eventNameEn,
        eventImage160: sysEventsTimeline.eventImage160,
        eventTypes: sysEventsTimeline.eventTypes,
        eventNatures: sysEventsTimeline.eventNatures,
        eventSummaryCn: sysEventsTimeline.eventSummaryCn,
        eventSummaryEn: sysEventsTimeline.eventSummaryEn,
        eventIntroductionCn: sysEventsTimeline.eventIntroductionCn,
        eventIntroductionEn: sysEventsTimeline.eventIntroductionEn,
      })
      .from(sysEventsTimeline)
      .where(eq(sysEventsTimeline.eventId, eventId))
      .limit(1)

    return event
  }

  private async readSource(
    db: ParadiseLostDb,
    type: ParadiseLostType,
    investId: string
  ): Promise<SourceSnapshot> {
    if (type === 1) {
      const project = await this.getProjectSource(db, investId)

      if (!project) throw new BadRequestException('项目不存在。')

      return {
        name: project.projectName ?? '',
        avatar: project.logo ?? '',
        oneLiner: project.oneLiner ?? '',
        fields: {
          projectName: project.projectName ?? '',
          projectNameEn: project.projectNameEn ?? '',
          logo: project.logo ?? '',
          oneLiner: project.oneLiner ?? '',
          oneLinerEn: project.oneLinerEn ?? '',
          description: project.description ?? '',
          descriptionEn: project.descriptionEn ?? '',
          active: project.active ?? 1,
        },
      }
    }

    if (type === 2) {
      const organization = await this.getOrganizationSource(db, investId)

      if (!organization) throw new BadRequestException('机构不存在。')

      return {
        name: organization.orgName,
        avatar: organization.logo ?? '',
        oneLiner: organization.orgInfo ?? '',
        fields: {
          orgName: organization.orgName,
          orgNameEn: organization.orgNameEn,
          orgLogo: organization.logo ?? '',
          orgInfo: organization.orgInfo ?? '',
          orgInfoEn: organization.orgInfoEn ?? '',
          orgDescription: organization.description ?? '',
          orgDescriptionEn: organization.descriptionEn ?? '',
          active: organization.active ?? 1,
        },
      }
    }

    if (type === 3) {
      const person = await this.getPersonSource(db, investId)

      if (!person) throw new BadRequestException('人物不存在。')

      return {
        name: person.peopleName,
        avatar: person.headImg ?? '',
        oneLiner: person.oneLiner ?? '',
        fields: {
          peopleName: person.peopleName,
          peopleNameEn: person.peopleNameEn,
          headImg: person.headImg ?? '',
          personsOneLiner: person.oneLiner ?? '',
          personsOneLinerEn: person.oneLinerEn ?? '',
          personsIntroduce: person.introduce ?? '',
          personsIntroduceEn: person.introduceEn ?? '',
        },
      }
    }

    const event = await this.getEventSource(db, investId)

    if (!event) throw new BadRequestException('事件不存在。')

    return {
      name: event.eventNameCn,
      avatar: event.eventImage160 ?? '',
      oneLiner: event.eventSummaryCn ?? '',
      fields: {
        eventNameCn: event.eventNameCn,
        eventNameEn: event.eventNameEn,
        eventImage160: event.eventImage160 ?? '',
        eventTypes: parseCsv(event.eventTypes),
        eventNatures: parseCsv(event.eventNatures),
        eventSummaryCn: event.eventSummaryCn ?? '',
        eventSummaryEn: event.eventSummaryEn ?? '',
        eventIntroductionCn: event.eventIntroductionCn ?? '',
        eventIntroductionEn: event.eventIntroductionEn ?? '',
      },
    }
  }

  private async syncSource(
    db: ParadiseLostDb,
    dto: ParadiseLostPayload
  ): Promise<SourceSnapshot> {
    const investId = dto.investId.trim()

    if (dto.type === 1) {
      const projectName = requireString(dto.projectName, '项目名称')
      const existing = await this.getProjectSource(db, investId)

      if (!existing) throw new BadRequestException('项目不存在。')

      const changes = {
        projectName,
        projectNameEn: optionalString(dto.projectNameEn),
        logo: optionalString(dto.logo),
        oneLiner: optionalString(dto.oneLiner),
        oneLinerEn: optionalString(dto.oneLinerEn),
        description: optionalString(dto.description),
        descriptionEn: optionalString(dto.descriptionEn),
        ...(dto.active === undefined ? {} : { active: dto.active }),
      }

      await db
        .update(coinProjects)
        .set(changes)
        .where(eq(coinProjects.projectId, investId))

      return {
        name: projectName,
        avatar: changes.logo,
        oneLiner: changes.oneLiner,
        fields: {
          ...changes,
          active: dto.active ?? existing.active ?? 1,
        },
      }
    }

    if (dto.type === 2) {
      const orgId = normalizeNumberId(investId, '机构 ID')
      const orgName = requireString(dto.orgName, '机构名称')
      const existing = await this.getOrganizationSource(db, investId)

      if (!existing) throw new BadRequestException('机构不存在。')

      const changes = {
        orgName,
        orgNameEn: optionalString(dto.orgNameEn),
        logo: optionalString(dto.orgLogo),
        orgInfo: optionalString(dto.orgInfo),
        orgInfoEn: optionalString(dto.orgInfoEn),
        description: optionalString(dto.orgDescription),
        descriptionEn: optionalString(dto.orgDescriptionEn),
        ...(dto.active === undefined ? {} : { active: dto.active }),
      }

      await db
        .update(rootdataOrganizations)
        .set(changes)
        .where(eq(rootdataOrganizations.orgId, orgId))

      return {
        name: orgName,
        avatar: changes.logo,
        oneLiner: changes.orgInfo,
        fields: {
          orgName: changes.orgName,
          orgNameEn: changes.orgNameEn,
          orgLogo: changes.logo,
          orgInfo: changes.orgInfo,
          orgInfoEn: changes.orgInfoEn,
          orgDescription: changes.description,
          orgDescriptionEn: changes.descriptionEn,
          active: dto.active ?? existing.active ?? 1,
        },
      }
    }

    if (dto.type === 3) {
      const peopleName = requireString(dto.peopleName, '人物名称')
      const existing = await this.getPersonSource(db, investId)

      if (!existing) throw new BadRequestException('人物不存在。')

      const changes = {
        peopleName,
        peopleNameEn: optionalString(dto.peopleNameEn),
        headImg: optionalString(dto.headImg),
        oneLiner: optionalString(dto.personsOneLiner),
        oneLinerEn: optionalString(dto.personsOneLinerEn),
        introduce: optionalString(dto.personsIntroduce),
        introduceEn: optionalString(dto.personsIntroduceEn),
      }

      await db
        .update(rootdataPersons)
        .set(changes)
        .where(eq(rootdataPersons.id, investId))

      return {
        name: peopleName,
        avatar: changes.headImg,
        oneLiner: changes.oneLiner,
        fields: {
          peopleName: changes.peopleName,
          peopleNameEn: changes.peopleNameEn,
          headImg: changes.headImg,
          personsOneLiner: changes.oneLiner,
          personsOneLinerEn: changes.oneLinerEn,
          personsIntroduce: changes.introduce,
          personsIntroduceEn: changes.introduceEn,
        },
      }
    }

    const eventId = normalizeNumberId(investId, '事件 ID')
    const eventNameCn = requireString(dto.eventNameCn, '事件名称')
    const eventNameEn = requireString(dto.eventNameEn, '事件英文名称')
    const eventTypes = toCsv(dto.eventTypes)
    const eventNatures = toCsv(dto.eventNatures)
    const existing = await this.getEventSource(db, investId)

    if (!existing) throw new BadRequestException('事件不存在。')
    if (!eventTypes) throw new BadRequestException('请选择事件类型。')
    if (!eventNatures) throw new BadRequestException('请选择事件性质。')

    const changes = {
      eventNameCn,
      eventNameEn,
      eventImage160: optionalString(dto.eventImage160),
      eventTypes,
      eventNatures,
      eventSummaryCn: optionalString(dto.eventSummaryCn),
      eventSummaryEn: optionalString(dto.eventSummaryEn),
      eventIntroductionCn: optionalString(dto.eventIntroductionCn),
      eventIntroductionEn: optionalString(dto.eventIntroductionEn),
    }

    await db
      .update(sysEventsTimeline)
      .set(changes)
      .where(eq(sysEventsTimeline.eventId, eventId))

    return {
      name: eventNameCn,
      avatar: changes.eventImage160,
      oneLiner: changes.eventSummaryCn,
      fields: {
        eventNameCn: changes.eventNameCn,
        eventNameEn: changes.eventNameEn,
        eventImage160: changes.eventImage160,
        eventTypes: parseCsv(changes.eventTypes),
        eventNatures: parseCsv(changes.eventNatures),
        eventSummaryCn: changes.eventSummaryCn,
        eventSummaryEn: changes.eventSummaryEn,
        eventIntroductionCn: changes.eventIntroductionCn,
        eventIntroductionEn: changes.eventIntroductionEn,
      },
    }
  }

  private fallbackSource(
    row: CoinAradiseLostRow,
    sourceMissingMessage = ''
  ): PublicSourceSnapshot {
    return {
      name: row.name ?? '',
      avatar: row.logo ?? '',
      oneLiner: row.oneLiner ?? '',
      fields: {},
      sourceMissing: sourceMissingMessage !== '',
      sourceMissingMessage,
    }
  }

  private async readSourceOrFallback(
    row: CoinAradiseLostRow,
    type: ParadiseLostType
  ): Promise<PublicSourceSnapshot> {
    const typeLabel = TYPE_LABELS[type] ?? '对象'

    if (!row.investId) {
      return this.fallbackSource(row, `未记录来源${typeLabel} ID。`)
    }

    try {
      return {
        ...(await this.readSource(this.db, type, row.investId)),
        sourceMissing: false,
        sourceMissingMessage: '',
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        const sourceMissingMessage = `来源${typeLabel}不存在或不可用：${row.investId}`
        this.logger.warn(
          `Paradise lost item ${row.id} references missing source: type=${type}, investId=${row.investId}`
        )
        return this.fallbackSource(row, sourceMissingMessage)
      }

      throw error
    }
  }

  private async toPublicLost(
    row: CoinAradiseLostRow,
    tagMap?: Map<string, string>
  ) {
    const type = row.type as ParadiseLostType
    const status = (row.status ?? 0) as ParadiseLostStatus
    const source = await this.readSourceOrFallback(row, type)
    const resolvedTagMap = tagMap ?? (await this.getTagMap())
    const tags = parseCsv(row.tags)

    return {
      id: row.id,
      investId: row.investId ?? '',
      name: source.name || row.name || '',
      avatar: source.avatar || row.logo || '',
      type,
      typeText: TYPE_LABELS[type] ?? '',
      tags,
      tagsText: tags.map((tag) => resolvedTagMap.get(tag) ?? tag),
      tagsEn: row.tagsEn ?? '',
      year: parseCsv(row.year),
      cause: row.cause ?? '',
      causeEn: row.causeEn ?? '',
      date: row.date,
      image: row.image ?? '',
      status,
      statusText: STATUS_LABELS[status] ?? '',
      desc: row.desc ?? '',
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      sourceMissing: source.sourceMissing,
      sourceMissingMessage: source.sourceMissingMessage,
      ...source.fields,
    }
  }

  private async getTagMap() {
    const tags = await this.db
      .select({
        id: coinAradiseLostTags.id,
        tagName: coinAradiseLostTags.tagName,
      })
      .from(coinAradiseLostTags)
      .orderBy(asc(coinAradiseLostTags.id))

    return new Map(tags.map((tag) => [String(tag.id), tag.tagName ?? '']))
  }

  async listTags() {
    const tags = await this.db
      .select()
      .from(coinAradiseLostTags)
      .orderBy(asc(coinAradiseLostTags.id))

    return tags.map(toPublicTag)
  }

  async createTag(dto: CreateParadiseLostTagDto) {
    const now = nowDateTime()
    const [inserted] = await this.db
      .insert(coinAradiseLostTags)
      .values({
        tagName: dto.tagName.trim(),
        tagNameEn: trimString(dto.tagNameEn) ?? '',
        image: trimString(dto.image) ?? '',
        darkImage: trimString(dto.darkImage) ?? '',
        color: trimString(dto.color) ?? '',
        darkColor: trimString(dto.darkColor) ?? '',
        backgroundColor: trimString(dto.backgroundColor) ?? '',
        darkBackgroundColor: trimString(dto.darkBackgroundColor) ?? '',
        backgroundImage: trimString(dto.backgroundImage) ?? '',
        darkBackgroundImage: trimString(dto.darkBackgroundImage) ?? '',
        remark: trimString(dto.remark) ?? '',
        createTime: now,
        updateTime: now,
      })
      .$returningId()

    if (!inserted) {
      throw new NotFoundException('Tag not found.')
    }

    const [tag] = await this.db
      .select()
      .from(coinAradiseLostTags)
      .where(eq(coinAradiseLostTags.id, inserted.id))
      .limit(1)

    if (!tag) throw new NotFoundException('Tag not found.')

    return toPublicTag(tag)
  }

  async updateTag(id: number, dto: CreateParadiseLostTagDto) {
    await this.findTagByIdOrThrow(id)

    const changes: ParadiseLostTagChanges = {
      tagName: dto.tagName.trim(),
      tagNameEn: trimString(dto.tagNameEn) ?? '',
      image: trimString(dto.image) ?? '',
      darkImage: trimString(dto.darkImage) ?? '',
      color: trimString(dto.color) ?? '',
      darkColor: trimString(dto.darkColor) ?? '',
      backgroundColor: trimString(dto.backgroundColor) ?? '',
      darkBackgroundColor: trimString(dto.darkBackgroundColor) ?? '',
      backgroundImage: trimString(dto.backgroundImage) ?? '',
      darkBackgroundImage: trimString(dto.darkBackgroundImage) ?? '',
      remark: trimString(dto.remark) ?? '',
      updateTime: nowDateTime(),
    }

    await this.db
      .update(coinAradiseLostTags)
      .set(changes)
      .where(eq(coinAradiseLostTags.id, id))

    return this.findTagByIdOrThrow(id)
  }

  async deleteTag(id: number) {
    const tag = await this.findTagByIdOrThrow(id)
    const [reference] = await this.db
      .select({ total: count() })
      .from(coinAradiseLost)
      .where(sql`find_in_set(${String(id)}, ${coinAradiseLost.tags}) > 0`)

    if (Number(reference?.total ?? 0) > 0) {
      throw new ConflictException('该标签仍被失乐园条目引用，不能删除。')
    }

    await this.db
      .delete(coinAradiseLostTags)
      .where(eq(coinAradiseLostTags.id, id))

    return { id: tag.id }
  }

  async listYears() {
    return getYears()
  }

  async listEventTypes() {
    const rows = await this.db
      .select({
        id: sysEventsTimelineTypes.id,
        name: sysEventsTimelineTypes.name,
        nameEn: sysEventsTimelineTypes.nameEn,
      })
      .from(sysEventsTimelineTypes)
      .orderBy(
        asc(sysEventsTimelineTypes.createTime),
        asc(sysEventsTimelineTypes.id)
      )

    return rows.map(eventOption)
  }

  async listEventNatures() {
    const rows = await this.db
      .select({
        id: sysEventsTimelineNatures.id,
        name: sysEventsTimelineNatures.name,
        nameEn: sysEventsTimelineNatures.nameEn,
      })
      .from(sysEventsTimelineNatures)
      .orderBy(
        asc(sysEventsTimelineNatures.createTime),
        asc(sysEventsTimelineNatures.id)
      )

    return rows.map(eventOption)
  }

  async listInvestments(query: ParadiseLostInvestmentQueryDto) {
    const page = query.page
    const pageSize = query.pageSize
    const offset = (page - 1) * pageSize
    const keyword = query.q?.trim()

    if (query.type === 1) {
      const where = keyword
        ? buildOr([
            eq(coinProjects.projectId, keyword),
            like(coinProjects.projectName, `%${keyword}%`),
            like(coinProjects.projectNameEn, `%${keyword}%`),
          ])
        : undefined

      const [items, totalRows] = await Promise.all([
        this.db
          .select({
            id: coinProjects.projectId,
            name: coinProjects.projectName,
            nameEn: coinProjects.projectNameEn,
            logo: coinProjects.logo,
            oneLiner: coinProjects.oneLiner,
            oneLinerEn: coinProjects.oneLinerEn,
            description: coinProjects.description,
            descriptionEn: coinProjects.descriptionEn,
            active: coinProjects.active,
          })
          .from(coinProjects)
          .where(where)
          .orderBy(
            asc(
              sql`lower(coalesce(nullif(${coinProjects.projectNameEn}, ''), nullif(${coinProjects.projectName}, ''), ${coinProjects.projectId}))`
            ),
            asc(coinProjects.projectId)
          )
          .limit(pageSize)
          .offset(offset),
        this.db.select({ total: count() }).from(coinProjects).where(where),
      ])

      return {
        items: items.map((item) => ({
          type: query.type,
          id: item.id,
          name: item.name ?? '',
          avatar: item.logo ?? '',
          projectName: item.name ?? '',
          projectNameEn: item.nameEn ?? '',
          logo: item.logo ?? '',
          oneLiner: item.oneLiner ?? '',
          oneLinerEn: item.oneLinerEn ?? '',
          description: item.description ?? '',
          descriptionEn: item.descriptionEn ?? '',
          active: item.active ?? 1,
        })),
        total: Number(totalRows[0]?.total ?? 0),
        page,
        pageSize,
      }
    }

    if (query.type === 2) {
      const numericKeyword =
        keyword && /^\d+$/.test(keyword) ? Number(keyword) : undefined
      const where = keyword
        ? buildOr([
            numericKeyword === undefined
              ? undefined
              : eq(rootdataOrganizations.orgId, numericKeyword),
            like(rootdataOrganizations.orgName, `%${keyword}%`),
            like(rootdataOrganizations.orgNameEn, `%${keyword}%`),
          ])
        : undefined

      const [items, totalRows] = await Promise.all([
        this.db
          .select({
            id: rootdataOrganizations.orgId,
            name: rootdataOrganizations.orgName,
            nameEn: rootdataOrganizations.orgNameEn,
            logo: rootdataOrganizations.logo,
            orgInfo: rootdataOrganizations.orgInfo,
            orgInfoEn: rootdataOrganizations.orgInfoEn,
            description: rootdataOrganizations.description,
            descriptionEn: rootdataOrganizations.descriptionEn,
            active: rootdataOrganizations.active,
          })
          .from(rootdataOrganizations)
          .where(where)
          .orderBy(
            asc(
              sql`lower(coalesce(nullif(${rootdataOrganizations.orgNameEn}, ''), ${rootdataOrganizations.orgName}))`
            ),
            asc(rootdataOrganizations.orgId)
          )
          .limit(pageSize)
          .offset(offset),
        this.db
          .select({ total: count() })
          .from(rootdataOrganizations)
          .where(where),
      ])

      return {
        items: items.map((item) => ({
          type: query.type,
          id: String(item.id),
          name: item.name,
          avatar: item.logo ?? '',
          orgName: item.name,
          orgNameEn: item.nameEn,
          orgLogo: item.logo ?? '',
          orgInfo: item.orgInfo ?? '',
          orgInfoEn: item.orgInfoEn ?? '',
          orgDescription: item.description ?? '',
          orgDescriptionEn: item.descriptionEn ?? '',
          active: item.active ?? 1,
        })),
        total: Number(totalRows[0]?.total ?? 0),
        page,
        pageSize,
      }
    }

    if (query.type === 3) {
      const where = keyword
        ? buildOr([
            eq(rootdataPersons.id, keyword),
            like(rootdataPersons.peopleName, `%${keyword}%`),
            like(rootdataPersons.peopleNameEn, `%${keyword}%`),
          ])
        : undefined

      const [items, totalRows] = await Promise.all([
        this.db
          .select({
            id: rootdataPersons.id,
            name: rootdataPersons.peopleName,
            nameEn: rootdataPersons.peopleNameEn,
            headImg: rootdataPersons.headImg,
            oneLiner: rootdataPersons.oneLiner,
            oneLinerEn: rootdataPersons.oneLinerEn,
            introduce: rootdataPersons.introduce,
            introduceEn: rootdataPersons.introduceEn,
          })
          .from(rootdataPersons)
          .where(where)
          .orderBy(
            asc(
              sql`lower(coalesce(nullif(${rootdataPersons.peopleNameEn}, ''), ${rootdataPersons.peopleName}))`
            ),
            asc(rootdataPersons.id)
          )
          .limit(pageSize)
          .offset(offset),
        this.db.select({ total: count() }).from(rootdataPersons).where(where),
      ])

      return {
        items: items.map((item) => ({
          type: query.type,
          id: item.id,
          name: item.name,
          avatar: item.headImg ?? '',
          peopleName: item.name,
          peopleNameEn: item.nameEn,
          headImg: item.headImg ?? '',
          personsOneLiner: item.oneLiner ?? '',
          personsOneLinerEn: item.oneLinerEn ?? '',
          personsIntroduce: item.introduce ?? '',
          personsIntroduceEn: item.introduceEn ?? '',
        })),
        total: Number(totalRows[0]?.total ?? 0),
        page,
        pageSize,
      }
    }

    const numericKeyword =
      keyword && /^\d+$/.test(keyword) ? Number(keyword) : undefined
    const where = keyword
      ? buildOr([
          numericKeyword === undefined
            ? undefined
            : eq(sysEventsTimeline.eventId, numericKeyword),
          like(sysEventsTimeline.eventNameCn, `%${keyword}%`),
          like(sysEventsTimeline.eventNameEn, `%${keyword}%`),
        ])
      : undefined

    const [items, totalRows] = await Promise.all([
      this.db
        .select({
          id: sysEventsTimeline.eventId,
          name: sysEventsTimeline.eventNameCn,
          nameEn: sysEventsTimeline.eventNameEn,
          eventImage160: sysEventsTimeline.eventImage160,
          eventTypes: sysEventsTimeline.eventTypes,
          eventNatures: sysEventsTimeline.eventNatures,
          eventSummaryCn: sysEventsTimeline.eventSummaryCn,
          eventSummaryEn: sysEventsTimeline.eventSummaryEn,
          eventIntroductionCn: sysEventsTimeline.eventIntroductionCn,
          eventIntroductionEn: sysEventsTimeline.eventIntroductionEn,
        })
        .from(sysEventsTimeline)
        .where(where)
        .orderBy(
          asc(
            sql`lower(coalesce(nullif(${sysEventsTimeline.eventNameEn}, ''), ${sysEventsTimeline.eventNameCn}))`
          ),
          asc(sysEventsTimeline.eventId)
        )
        .limit(pageSize)
        .offset(offset),
      this.db.select({ total: count() }).from(sysEventsTimeline).where(where),
    ])

    return {
      items: items.map((item) => ({
        type: query.type,
        id: String(item.id),
        name: item.name,
        avatar: item.eventImage160 ?? '',
        eventNameCn: item.name,
        eventNameEn: item.nameEn,
        eventImage160: item.eventImage160 ?? '',
        eventTypes: parseCsv(item.eventTypes),
        eventNatures: parseCsv(item.eventNatures),
        eventSummaryCn: item.eventSummaryCn ?? '',
        eventSummaryEn: item.eventSummaryEn ?? '',
        eventIntroductionCn: item.eventIntroductionCn ?? '',
        eventIntroductionEn: item.eventIntroductionEn ?? '',
      })),
      total: Number(totalRows[0]?.total ?? 0),
      page,
      pageSize,
    }
  }

  async list(query: ListParadiseLostQueryDto) {
    const page = query.page
    const pageSize = query.pageSize
    const offset = (page - 1) * pageSize
    const filters: SQL[] = []

    if (query.name?.trim()) {
      filters.push(like(coinAradiseLost.name, `%${query.name.trim()}%`))
    }

    if (query.type?.length) {
      filters.push(inArray(coinAradiseLost.type, query.type))
    }

    if (query.status?.length) {
      filters.push(inArray(coinAradiseLost.status, query.status))
    }

    if (query.year?.trim()) {
      filters.push(like(coinAradiseLost.year, `%${query.year.trim()}%`))
    }

    if (query.tag?.trim()) {
      filters.push(
        sql`find_in_set(${query.tag.trim()}, ${coinAradiseLost.tags}) > 0`
      )
    }

    const where = buildWhere(filters)
    const [items, totalRows] = await Promise.all([
      this.db
        .select()
        .from(coinAradiseLost)
        .where(where)
        .orderBy(desc(coinAradiseLost.id))
        .limit(pageSize)
        .offset(offset),
      this.db.select({ total: count() }).from(coinAradiseLost).where(where),
    ])

    const tagMap = await this.getTagMap()

    return {
      items: await Promise.all(
        items.map((item) => this.toPublicLost(item, tagMap))
      ),
      total: Number(totalRows[0]?.total ?? 0),
      page,
      pageSize,
    }
  }

  async get(id: number) {
    return this.findByIdOrThrow(id)
  }

  async create(dto: CreateParadiseLostDto) {
    const id = await this.db.transaction(async (tx) => {
      const investId = dto.investId.trim()
      await this.assertUnique(tx, dto.type, investId)
      const source = await this.syncSource(tx, dto)
      const now = nowDateTime()
      const [inserted] = await tx
        .insert(coinAradiseLost)
        .values({
          investId,
          type: dto.type,
          name: source.name,
          logo: source.avatar,
          oneLiner: source.oneLiner,
          tags: toCsv(dto.tags) ?? '',
          year: toCsv(dto.year) ?? '',
          cause: optionalString(dto.cause),
          causeEn: optionalString(dto.causeEn),
          date: normalizeDateTime(dto.date),
          image: optionalString(dto.image),
          status: dto.status ?? 1,
          desc: optionalString(dto.desc),
          createdAt: now,
          updatedAt: now,
        })
        .$returningId()

      if (!inserted) {
        throw new NotFoundException('Paradise lost item not found.')
      }

      return inserted.id
    })

    return this.findByIdOrThrow(id)
  }

  async update(id: number, dto: UpdateParadiseLostDto) {
    await this.findByIdOrThrow(id)

    await this.db.transaction(async (tx) => {
      const investId = dto.investId.trim()
      await this.assertUnique(tx, dto.type, investId, id)
      const source = await this.syncSource(tx, dto)
      const changes: ParadiseLostChanges = {
        investId,
        type: dto.type,
        name: source.name,
        logo: source.avatar,
        oneLiner: source.oneLiner,
        tags: toCsv(dto.tags) ?? '',
        year: toCsv(dto.year) ?? '',
        cause: optionalString(dto.cause),
        causeEn: optionalString(dto.causeEn),
        date: normalizeDateTime(dto.date),
        image: optionalString(dto.image),
        status: dto.status ?? 1,
        desc: optionalString(dto.desc),
        updatedAt: nowDateTime(),
      }

      await tx
        .update(coinAradiseLost)
        .set(changes)
        .where(eq(coinAradiseLost.id, id))
    })

    return this.findByIdOrThrow(id)
  }

  async updateManyStatus(ids: number[], status: ParadiseLostStatus) {
    const rows = await this.db
      .select({ id: coinAradiseLost.id })
      .from(coinAradiseLost)
      .where(inArray(coinAradiseLost.id, ids))

    const existingIds = rows.map((row) => row.id)

    if (existingIds.length > 0) {
      await this.db
        .update(coinAradiseLost)
        .set({ status, updatedAt: nowDateTime() })
        .where(inArray(coinAradiseLost.id, existingIds))
    }

    return { count: existingIds.length }
  }

  async delete(id: number) {
    const row = await this.findByIdOrThrow(id)
    await this.db.delete(coinAradiseLost).where(eq(coinAradiseLost.id, id))

    return { id: row.id }
  }

  async deleteMany(ids: number[]) {
    const rows = await this.db
      .select({ id: coinAradiseLost.id })
      .from(coinAradiseLost)
      .where(inArray(coinAradiseLost.id, ids))

    const existingIds = rows.map((row) => row.id)

    if (existingIds.length > 0) {
      await this.db
        .delete(coinAradiseLost)
        .where(inArray(coinAradiseLost.id, existingIds))
    }

    return { count: existingIds.length }
  }

  private async findByIdOrThrow(id: number) {
    const [row] = await this.db
      .select()
      .from(coinAradiseLost)
      .where(eq(coinAradiseLost.id, id))
      .limit(1)

    if (!row) {
      throw new NotFoundException('Paradise lost item not found.')
    }

    return this.toPublicLost(row)
  }

  private async findTagByIdOrThrow(id: number) {
    const [row] = await this.db
      .select()
      .from(coinAradiseLostTags)
      .where(eq(coinAradiseLostTags.id, id))
      .limit(1)

    if (!row) {
      throw new NotFoundException('Tag not found.')
    }

    return toPublicTag(row)
  }
}
