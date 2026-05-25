import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
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
  or,
  sql,
  type SQL,
} from 'drizzle-orm'
import { DB } from '../db/db.constants'
import {
  coinEcosystems,
  coinFundingJoinProject,
  coinProjects,
  coingeckoAssetPlatformsList,
  coingeckoCoinsMarkets,
  coingeckoExchangesById,
  rootdataFundingRoundsFac,
  rootdataOrganizations,
  rootdataPersonJobChanges,
  rootdataPersons,
  rootdataTags,
  type CoinProjectRow,
  type RootdataOrganizationRow,
  type RootdataPersonRow,
} from '../db/schema'
import type { DbClient } from '../db/db.types'
import {
  type FundingInvestorDto,
  type FundingRoundsQueryDto,
  type ListRootdataQueryDto,
  type RootdataBinaryStatus,
  type RootdataEntityType,
  type RootdataJobType,
  type RootdataOptionQueryDto,
  type UpsertFundingRoundDto,
  type UpsertJobChangeDto,
  type UpsertOrganizationDto,
  type UpsertPersonDto,
  type UpsertProjectContractDto,
  type UpsertProjectDto,
  type UpsertProjectEventDto,
  type UpsertProjectReportDto,
  type UpsertTeamMemberDto,
} from './rootdata.dto'

type DbTransaction = Parameters<Parameters<DbClient['transaction']>[0]>[0]
type RootdataDb = DbClient | DbTransaction
type ProjectChanges = Partial<typeof coinProjects.$inferInsert>
type PersonChanges = Partial<typeof rootdataPersons.$inferInsert>
type OrganizationChanges = Partial<typeof rootdataOrganizations.$inferInsert>

type JsonRecord = Record<string, unknown>

const ENTITY_LABELS = {
  1: '项目',
  2: '机构',
  3: '人物',
} satisfies Record<RootdataEntityType, string>

const FUNDING_ROUNDS = [
  'Angel',
  'Community',
  'Debt Financing',
  'Financing after Listed',
  'Grant',
  'ICO',
  'IDO',
  'IEO',
  'IPO',
  'M&A',
  'OTC',
  'Post-IPO',
  'Pre-A',
  'Pre-A+',
  'Pre-B',
  'Pre-Seed',
  'Private',
  'Public Sale',
  'Seed',
  'Seed Plus',
  'Series A',
  'Series A1',
  'Series A2',
  'Series B',
  'Series B1',
  'Series B2',
  'Series C',
  'Series C1',
  'Series D',
  'Series E',
  'Series F',
  'STO',
  'Strategic',
]

const SOCIAL_MEDIA_KEYS = [
  'website',
  'X',
  'discord',
  'linkedin',
  'gitbook',
  'cmc',
  'coingecko',
  'medium',
  'defillama',
  'github',
]

function trimString(value: string | null | undefined) {
  return value?.trim() ?? ''
}

function optionalText(value: string | undefined) {
  return value?.trim() ?? ''
}

function normalizeNumber(value: number | undefined) {
  return value === undefined || Number.isNaN(value) ? undefined : String(value)
}

function nowDateTime() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ')
}

function buildWhere(filters: SQL[]) {
  return filters.length > 0 ? and(...filters) : undefined
}

function buildOr(filters: SQL[]) {
  if (filters.length === 0) return undefined
  if (filters.length === 1) return filters[0]
  return or(...filters)
}

function asRecord(value: unknown): JsonRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as JsonRecord)
    : {}
}

function jsonParse(value: string | null | undefined): unknown {
  if (!value) return undefined

  try {
    return JSON.parse(value)
  } catch {
    return undefined
  }
}

function parseJsonArray(value: string | null | undefined): unknown[] {
  const parsed = jsonParse(value)
  if (Array.isArray(parsed)) return parsed

  return []
}

function parseJsonObject(value: string | null | undefined): JsonRecord {
  return asRecord(jsonParse(value))
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value : value == null ? '' : String(value)
}

function numberValue(value: unknown, fallback: number) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function uniqueStrings(values: string[] | undefined) {
  return Array.from(
    new Set((values ?? []).map((item) => item.trim()).filter(Boolean))
  )
}

function legacyStringArray(value: string | null | undefined) {
  const parsed = parseJsonArray(value)
  if (parsed.length > 0) return parsed.map(stringValue).filter(Boolean)

  return (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function normalizeLegacyListText(value: string | null | undefined) {
  const raw = trimString(value)
  if (!raw) return ''

  const parsed = jsonParse(raw)
  if (Array.isArray(parsed)) {
    return parsed
      .map(stringValue)
      .map((item) => item.trim())
      .filter(Boolean)
      .join(', ')
  }

  return raw
}

function toLegacyStringArray(values: string[] | undefined) {
  return JSON.stringify(uniqueStrings(values))
}

function parseSupportExchanges(value: string | null | undefined) {
  return parseJsonArray(value)
    .map((item) => {
      const record = asRecord(item)
      return stringValue(record.exchange_name ?? record.exchangeName ?? item)
    })
    .filter(Boolean)
}

function toLegacySupportExchanges(values: string[] | undefined) {
  return JSON.stringify(
    uniqueStrings(values).map((exchange) => ({
      exchange_name: exchange,
      exchange_logo: '',
    }))
  )
}

function normalizeSocialMedia(input: Record<string, string> | undefined) {
  const output: Record<string, string> = {}

  for (const key of SOCIAL_MEDIA_KEYS) {
    output[key] = trimString(input?.[key])
  }

  return output
}

function parseSocialMedia(value: string | null | undefined) {
  const record = parseJsonObject(value)
  return normalizeSocialMedia(
    Object.fromEntries(
      Object.entries(record).map(([key, item]) => [key, stringValue(item)])
    )
  )
}

function projectEvents(value: string | null | undefined, ownerId: number) {
  return parseJsonArray(value).map((item, index) => {
    const record = asRecord(item)
    return {
      id: `${ownerId}_${index}`,
      index,
      hapDate: stringValue(record.hap_date ?? record.hapDate),
      event: stringValue(record.event),
      eventEn: stringValue(record.event_en ?? record.eventEn),
    }
  })
}

function projectReports(value: string | null | undefined, ownerId: number) {
  return parseJsonArray(value).map((item, index) => {
    const record = asRecord(item)
    return {
      id: `${ownerId}_${index}`,
      index,
      title: stringValue(record.title),
      titleEn: stringValue(record.title_en ?? record.titleEn),
      url: stringValue(record.url),
      site: stringValue(record.site),
      timeEast: stringValue(record.time_east ?? record.timeEast),
      status: numberValue(record.status, 1) as RootdataBinaryStatus,
    }
  })
}

function projectContracts(value: string | null | undefined, ownerId: number) {
  return parseJsonArray(value).map((item, index) => {
    const record = asRecord(item)
    return {
      id: `${ownerId}_${index}`,
      index,
      contractPlatform: stringValue(
        record.contract_platform ?? record.contractPlatform
      ),
      contractAddress: stringValue(
        record.contract_address ?? record.contractAddress
      ),
    }
  })
}

function teamMembers(value: string | null | undefined) {
  return parseJsonArray(value).map((item) => {
    const record = asRecord(item)
    return {
      personId: stringValue(record.people_id ?? record.personId),
      headImg: stringValue(record.head_img ?? record.headImg),
      name: stringValue(record.name),
      x: stringValue(record.X ?? record.x),
      position: stringValue(record.position),
      positionEn: stringValue(record.position_en ?? record.positionEn),
      linkedin: stringValue(record.linkedin),
      entryTime: stringValue(record.entry_time ?? record.entryTime),
      leaveTime: stringValue(record.leave_time ?? record.leaveTime),
      coreMember: numberValue(record.core_member ?? record.coreMember, 0),
      type: numberValue(record.type, 1),
    }
  })
}

function toLegacyTeamMember(
  person: RootdataPersonRow,
  dto: UpsertTeamMemberDto
) {
  return {
    people_id: person.id,
    head_img: person.headImg ?? '',
    name: person.peopleName,
    X: person.xLink ?? '',
    position: optionalText(dto.position),
    position_en: optionalText(dto.positionEn),
    linkedin: person.linkedin ?? '',
    entry_time: optionalText(dto.entryTime),
    leave_time: optionalText(dto.leaveTime),
    core_member: dto.coreMember ?? 0,
    type: dto.type ?? 1,
  }
}

function toPublicProject(row: CoinProjectRow) {
  return {
    autoId: row.autoId,
    projectId: row.projectId,
    projectName: row.projectName ?? '',
    projectNameEn: row.projectNameEn ?? '',
    logo: row.logo ?? '',
    tokenSymbol: row.tokenSymbol ?? '',
    establishmentDate: row.establishmentDate ?? '',
    oneLiner: row.oneLiner ?? '',
    oneLinerEn: row.oneLinerEn ?? '',
    description: row.description ?? '',
    descriptionEn: row.descriptionEn ?? '',
    active: (row.active ?? 1) as RootdataBinaryStatus,
    totalFunding: row.totalFunding ?? '',
    tags: legacyStringArray(row.tags),
    ecosystem: legacyStringArray(row.ecosystem),
    onMainNet: legacyStringArray(row.onMainNet),
    planToLaunch: legacyStringArray(row.planToLaunch),
    onTestNet: legacyStringArray(row.onTestNet),
    supportExchanges: parseSupportExchanges(row.supportExchanges),
    socialMedia: parseSocialMedia(row.socialMedia),
    events: projectEvents(row.event, row.autoId),
    reports: projectReports(row.reports, row.autoId),
    teamMembers: teamMembers(row.teamMembers),
    contracts: projectContracts(row.contracts, row.autoId),
    heat: row.heat ?? '',
    heatRank: row.heatRank,
    influence: row.influence ?? '',
    influenceRank: row.influenceRank,
    followers: row.followers,
    following: row.following,
    isHot: (row.isHot ?? 0) as RootdataBinaryStatus,
    isShow: (row.isShow ?? 1) as RootdataBinaryStatus,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function toPublicPerson(row: RootdataPersonRow) {
  return {
    id: row.id,
    peopleName: row.peopleName,
    peopleNameEn: row.peopleNameEn,
    introduce: row.introduce ?? '',
    introduceEn: row.introduceEn ?? '',
    headImg: row.headImg ?? '',
    oneLiner: row.oneLiner ?? '',
    oneLinerEn: row.oneLinerEn ?? '',
    xLink: row.xLink ?? '',
    linkedin: row.linkedin ?? '',
    blogLink: row.blogLink ?? '',
    heat: row.heat ?? '',
    heatRank: row.heatRank,
    influence: row.influence ?? '',
    influenceRank: row.influenceRank,
    followers: row.followers,
    following: row.following,
    status: row.status as RootdataBinaryStatus,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function toPublicOrganization(row: RootdataOrganizationRow) {
  return {
    autoId: row.autoId,
    orgId: row.orgId,
    orgName: row.orgName,
    orgNameEn: row.orgNameEn,
    logo: row.logo ?? '',
    establishmentDate: row.establishmentDate ?? '',
    orgInfo: row.orgInfo ?? '',
    orgInfoEn: row.orgInfoEn ?? '',
    description: row.description ?? '',
    descriptionEn: row.descriptionEn ?? '',
    active: (row.active ?? 1) as RootdataBinaryStatus,
    category: normalizeLegacyListText(row.category),
    socialMedia: parseJsonObject(row.socialMedia),
    teamMembers: teamMembers(row.teamMembers),
    heat: row.heat ?? '',
    heatRank: row.heatRank,
    influence: row.influence ?? '',
    influenceRank: row.influenceRank,
    followers: row.followers,
    following: row.following,
    region: row.region ?? '',
    xLink: row.xLink ?? '',
    linkedin: row.linkedin ?? '',
    blogLink: row.blogLink ?? '',
    status: row.status as RootdataBinaryStatus,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function toProjectChanges(dto: UpsertProjectDto): ProjectChanges {
  return {
    projectName: dto.projectName.trim(),
    projectNameEn: dto.projectNameEn.trim(),
    logo: optionalText(dto.logo),
    tokenSymbol: optionalText(dto.tokenSymbol),
    establishmentDate: optionalText(dto.establishmentDate),
    oneLiner: optionalText(dto.oneLiner),
    oneLinerEn: optionalText(dto.oneLinerEn),
    description: optionalText(dto.description),
    descriptionEn: optionalText(dto.descriptionEn),
    active: dto.active ?? 1,
    totalFunding: normalizeNumber(dto.totalFunding),
    tags: toLegacyStringArray(dto.tags),
    ecosystem: toLegacyStringArray(dto.ecosystem),
    onMainNet: toLegacyStringArray(dto.onMainNet),
    planToLaunch: toLegacyStringArray(dto.planToLaunch),
    onTestNet: toLegacyStringArray(dto.onTestNet),
    supportExchanges: toLegacySupportExchanges(dto.supportExchanges),
    socialMedia: JSON.stringify(normalizeSocialMedia(dto.socialMedia)),
    isHot: dto.isHot ?? 0,
    isShow: dto.isShow ?? 1,
  }
}

function toPersonChanges(dto: UpsertPersonDto): PersonChanges {
  return {
    peopleName: dto.peopleName.trim(),
    peopleNameEn: dto.peopleNameEn.trim(),
    headImg: optionalText(dto.headImg),
    oneLiner: optionalText(dto.oneLiner),
    oneLinerEn: optionalText(dto.oneLinerEn),
    introduce: optionalText(dto.introduce),
    introduceEn: optionalText(dto.introduceEn),
    xLink: optionalText(dto.xLink),
    linkedin: optionalText(dto.linkedin),
    blogLink: optionalText(dto.blogLink),
    heat: optionalText(dto.heat),
    heatRank: dto.heatRank,
    influence: optionalText(dto.influence),
    influenceRank: dto.influenceRank,
    followers: dto.followers,
    following: dto.following,
    status: dto.status ?? 1,
  }
}

function toOrganizationChanges(
  dto: UpsertOrganizationDto
): OrganizationChanges {
  return {
    orgName: dto.orgName.trim(),
    orgNameEn: dto.orgNameEn.trim(),
    logo: optionalText(dto.logo),
    orgInfo: optionalText(dto.orgInfo),
    orgInfoEn: optionalText(dto.orgInfoEn),
    description: optionalText(dto.description),
    descriptionEn: optionalText(dto.descriptionEn),
    active: dto.active ?? 1,
    category: optionalText(dto.category),
    establishmentDate: optionalText(dto.establishmentDate),
    region: optionalText(dto.region),
    xLink: optionalText(dto.xLink),
    linkedin: optionalText(dto.linkedin),
    blogLink: optionalText(dto.blogLink),
    heat: optionalText(dto.heat),
    heatRank: dto.heatRank,
    influence: optionalText(dto.influence),
    influenceRank: dto.influenceRank,
    followers: dto.followers,
    following: dto.following,
    status: dto.status ?? 1,
  }
}

@Injectable()
export class RootdataService {
  constructor(@Inject(DB) private readonly db: DbClient) {}

  private async projectRowOrThrow(db: RootdataDb, autoId: number) {
    const [row] = await db
      .select()
      .from(coinProjects)
      .where(eq(coinProjects.autoId, autoId))
      .limit(1)

    if (!row) throw new NotFoundException('项目不存在。')
    return row
  }

  private async personRowOrThrow(db: RootdataDb, id: string) {
    const [row] = await db
      .select()
      .from(rootdataPersons)
      .where(eq(rootdataPersons.id, id))
      .limit(1)

    if (!row) throw new NotFoundException('人物不存在。')
    return row
  }

  private async organizationRowOrThrow(db: RootdataDb, autoId: number) {
    const [row] = await db
      .select()
      .from(rootdataOrganizations)
      .where(eq(rootdataOrganizations.autoId, autoId))
      .limit(1)

    if (!row) throw new NotFoundException('机构不存在。')
    return row
  }

  private async nextProjectId(db: RootdataDb) {
    const [row] = await db
      .select({
        maxId: sql<
          number | null
        >`MAX(CAST(SUBSTRING(${coinProjects.projectId}, 2) AS UNSIGNED))`,
      })
      .from(coinProjects)
      .where(like(coinProjects.projectId, 'p%'))

    return `p${Number(row?.maxId ?? 0) + 1}`
  }

  private async nextPersonId(db: RootdataDb) {
    const [row] = await db
      .select({
        maxId: sql<
          number | null
        >`MAX(CAST(SUBSTRING(${rootdataPersons.id}, 2) AS UNSIGNED))`,
      })
      .from(rootdataPersons)
      .where(like(rootdataPersons.id, 'p%'))

    return `p${Number(row?.maxId ?? 0) + 1}`
  }

  private async nextOrganizationId(db: RootdataDb) {
    const [row] = await db
      .select({
        minId: sql<number | null>`MIN(${rootdataOrganizations.orgId})`,
      })
      .from(rootdataOrganizations)

    return Number(row?.minId ?? 0) - 1
  }

  private async entityInfo(
    db: RootdataDb,
    entityType: RootdataEntityType,
    entityId: string
  ) {
    if (entityType === 1) {
      const [row] = await db
        .select({
          id: coinProjects.projectId,
          name: coinProjects.projectName,
          logo: coinProjects.logo,
        })
        .from(coinProjects)
        .where(eq(coinProjects.projectId, entityId))
        .limit(1)

      if (row) return { id: row.id, name: row.name ?? '', logo: row.logo ?? '' }
    }

    if (entityType === 2) {
      const orgId = Number(entityId)
      const [row] = await db
        .select({
          id: rootdataOrganizations.orgId,
          name: rootdataOrganizations.orgName,
          logo: rootdataOrganizations.logo,
        })
        .from(rootdataOrganizations)
        .where(eq(rootdataOrganizations.orgId, orgId))
        .limit(1)

      if (row) {
        return {
          id: String(row.id),
          name: row.name,
          logo: row.logo ?? '',
        }
      }
    }

    if (entityType === 3) {
      const [row] = await db
        .select({
          id: rootdataPersons.id,
          name: rootdataPersons.peopleName,
          logo: rootdataPersons.headImg,
        })
        .from(rootdataPersons)
        .where(eq(rootdataPersons.id, entityId))
        .limit(1)

      if (row) return { id: row.id, name: row.name, logo: row.logo ?? '' }
    }

    throw new NotFoundException(`${ENTITY_LABELS[entityType]}不存在。`)
  }

  private async resolveFundingInvestId(
    entityType: RootdataEntityType,
    entityId: string
  ) {
    if (entityType === 1 && !entityId.startsWith('p')) {
      const row = await this.projectRowOrThrow(this.db, Number(entityId))
      return row.projectId
    }

    if (entityType === 2) {
      const row = await this.organizationRowOrThrow(this.db, Number(entityId))
      return String(row.orgId)
    }

    return entityId
  }

  async listProjects(query: ListRootdataQueryDto) {
    const page = query.page
    const pageSize = query.pageSize
    const offset = (page - 1) * pageSize
    const filters: SQL[] = []

    if (query.q?.trim()) {
      const q = `%${query.q.trim()}%`
      const qFilter = buildOr([
        like(coinProjects.projectName, q),
        like(coinProjects.projectNameEn, q),
        like(coinProjects.projectId, q),
        like(coinProjects.tokenSymbol, q),
      ])
      if (qFilter) filters.push(qFilter)
    }

    if (query.active?.length)
      filters.push(inArray(coinProjects.active, query.active))
    if (query.isHot?.length)
      filters.push(inArray(coinProjects.isHot, query.isHot))
    if (query.isShow?.length)
      filters.push(inArray(coinProjects.isShow, query.isShow))

    const where = buildWhere(filters)
    const [items, totalRows] = await Promise.all([
      this.db
        .select()
        .from(coinProjects)
        .where(where)
        .orderBy(desc(coinProjects.updatedAt), desc(coinProjects.autoId))
        .limit(pageSize)
        .offset(offset),
      this.db.select({ total: count() }).from(coinProjects).where(where),
    ])

    return {
      items: items.map(toPublicProject),
      total: Number(totalRows[0]?.total ?? 0),
      page,
      pageSize,
    }
  }

  async getProject(autoId: number) {
    return toPublicProject(await this.projectRowOrThrow(this.db, autoId))
  }

  async createProject(dto: UpsertProjectDto) {
    const projectId = await this.nextProjectId(this.db)
    const [inserted] = await this.db
      .insert(coinProjects)
      .values({
        ...toProjectChanges(dto),
        projectId,
        createdAt: nowDateTime(),
        updatedAt: nowDateTime(),
      })
      .$returningId()

    if (!inserted) throw new NotFoundException('项目不存在。')
    return this.getProject(inserted.autoId)
  }

  async updateProject(autoId: number, dto: UpsertProjectDto) {
    await this.projectRowOrThrow(this.db, autoId)
    await this.db
      .update(coinProjects)
      .set({ ...toProjectChanges(dto), updatedAt: nowDateTime() })
      .where(eq(coinProjects.autoId, autoId))

    return this.getProject(autoId)
  }

  async updateProjectsStatus(
    ids: number[],
    field: 'isHot' | 'isShow',
    value: RootdataBinaryStatus
  ) {
    if (ids.length === 0) return { count: 0 }

    await this.db
      .update(coinProjects)
      .set({ [field]: value, updatedAt: nowDateTime() })
      .where(inArray(coinProjects.autoId, ids))

    return { count: ids.length }
  }

  async deleteProject(autoId: number) {
    const row = await this.projectRowOrThrow(this.db, autoId)
    await this.db.delete(coinProjects).where(eq(coinProjects.autoId, autoId))

    return { id: row.autoId }
  }

  async deleteProjects(ids: number[]) {
    if (ids.length > 0) {
      await this.db
        .delete(coinProjects)
        .where(inArray(coinProjects.autoId, ids))
    }

    return { count: ids.length }
  }

  async listPersons(query: ListRootdataQueryDto) {
    const page = query.page
    const pageSize = query.pageSize
    const offset = (page - 1) * pageSize
    const filters: SQL[] = []

    if (query.q?.trim()) {
      const q = `%${query.q.trim()}%`
      const qFilter = buildOr([
        like(rootdataPersons.id, q),
        like(rootdataPersons.peopleName, q),
        like(rootdataPersons.peopleNameEn, q),
      ])
      if (qFilter) filters.push(qFilter)
    }

    if (query.status?.length) {
      filters.push(inArray(rootdataPersons.status, query.status))
    }

    const where = buildWhere(filters)
    const [items, totalRows] = await Promise.all([
      this.db
        .select()
        .from(rootdataPersons)
        .where(where)
        .orderBy(desc(rootdataPersons.updatedAt), desc(rootdataPersons.id))
        .limit(pageSize)
        .offset(offset),
      this.db.select({ total: count() }).from(rootdataPersons).where(where),
    ])

    return {
      items: items.map(toPublicPerson),
      total: Number(totalRows[0]?.total ?? 0),
      page,
      pageSize,
    }
  }

  async getPerson(id: string) {
    return toPublicPerson(await this.personRowOrThrow(this.db, id))
  }

  async createPerson(dto: UpsertPersonDto) {
    const id = await this.nextPersonId(this.db)
    await this.db.insert(rootdataPersons).values({
      ...toPersonChanges(dto),
      id,
      peopleName: dto.peopleName.trim(),
      peopleNameEn: dto.peopleNameEn.trim(),
      createdAt: nowDateTime(),
      updatedAt: nowDateTime(),
    })

    return this.getPerson(id)
  }

  async updatePerson(id: string, dto: UpsertPersonDto) {
    await this.personRowOrThrow(this.db, id)
    await this.db
      .update(rootdataPersons)
      .set({ ...toPersonChanges(dto), updatedAt: nowDateTime() })
      .where(eq(rootdataPersons.id, id))

    return this.getPerson(id)
  }

  async updatePersonsStatus(ids: string[], status: RootdataBinaryStatus) {
    if (ids.length > 0) {
      await this.db
        .update(rootdataPersons)
        .set({ status, updatedAt: nowDateTime() })
        .where(inArray(rootdataPersons.id, ids))
    }

    return { count: ids.length }
  }

  async deletePerson(id: string) {
    const row = await this.personRowOrThrow(this.db, id)
    await this.db.delete(rootdataPersons).where(eq(rootdataPersons.id, id))

    return { id: row.id }
  }

  async deletePersons(ids: string[]) {
    if (ids.length > 0) {
      await this.db
        .delete(rootdataPersons)
        .where(inArray(rootdataPersons.id, ids))
    }

    return { count: ids.length }
  }

  async listOrganizations(query: ListRootdataQueryDto) {
    const page = query.page
    const pageSize = query.pageSize
    const offset = (page - 1) * pageSize
    const filters: SQL[] = []

    if (query.q?.trim()) {
      const q = `%${query.q.trim()}%`
      const qFilter = buildOr([
        like(rootdataOrganizations.orgName, q),
        like(rootdataOrganizations.orgNameEn, q),
      ])
      if (qFilter) filters.push(qFilter)
    }

    if (query.active?.length) {
      filters.push(inArray(rootdataOrganizations.active, query.active))
    }
    if (query.status?.length) {
      filters.push(inArray(rootdataOrganizations.status, query.status))
    }

    const where = buildWhere(filters)
    const [items, totalRows] = await Promise.all([
      this.db
        .select()
        .from(rootdataOrganizations)
        .where(where)
        .orderBy(
          desc(rootdataOrganizations.updatedAt),
          desc(rootdataOrganizations.autoId)
        )
        .limit(pageSize)
        .offset(offset),
      this.db
        .select({ total: count() })
        .from(rootdataOrganizations)
        .where(where),
    ])

    return {
      items: items.map(toPublicOrganization),
      total: Number(totalRows[0]?.total ?? 0),
      page,
      pageSize,
    }
  }

  async getOrganization(autoId: number) {
    return toPublicOrganization(
      await this.organizationRowOrThrow(this.db, autoId)
    )
  }

  async createOrganization(dto: UpsertOrganizationDto) {
    const orgId = await this.nextOrganizationId(this.db)
    const [inserted] = await this.db
      .insert(rootdataOrganizations)
      .values({
        ...toOrganizationChanges(dto),
        orgId,
        orgName: dto.orgName.trim(),
        orgNameEn: dto.orgNameEn.trim(),
        createdAt: nowDateTime(),
        updatedAt: nowDateTime(),
      })
      .$returningId()

    if (!inserted) throw new NotFoundException('机构不存在。')
    return this.getOrganization(inserted.autoId)
  }

  async updateOrganization(autoId: number, dto: UpsertOrganizationDto) {
    await this.organizationRowOrThrow(this.db, autoId)
    await this.db
      .update(rootdataOrganizations)
      .set({ ...toOrganizationChanges(dto), updatedAt: nowDateTime() })
      .where(eq(rootdataOrganizations.autoId, autoId))

    return this.getOrganization(autoId)
  }

  async updateOrganizationsStatus(ids: number[], status: RootdataBinaryStatus) {
    if (ids.length > 0) {
      await this.db
        .update(rootdataOrganizations)
        .set({ status, updatedAt: nowDateTime() })
        .where(inArray(rootdataOrganizations.autoId, ids))
    }

    return { count: ids.length }
  }

  async deleteOrganization(autoId: number) {
    const row = await this.organizationRowOrThrow(this.db, autoId)
    await this.db
      .delete(rootdataOrganizations)
      .where(eq(rootdataOrganizations.autoId, autoId))

    return { id: row.autoId }
  }

  async deleteOrganizations(ids: number[]) {
    if (ids.length > 0) {
      await this.db
        .delete(rootdataOrganizations)
        .where(inArray(rootdataOrganizations.autoId, ids))
    }

    return { count: ids.length }
  }

  async listProjectEvents(autoId: number) {
    const project = await this.projectRowOrThrow(this.db, autoId)
    return projectEvents(project.event, project.autoId)
  }

  async upsertProjectEvent(
    autoId: number,
    index: number | undefined,
    dto: UpsertProjectEventDto
  ) {
    const project = await this.projectRowOrThrow(this.db, autoId)
    const events = parseJsonArray(project.event).map(asRecord)
    const item = {
      hap_date: optionalText(dto.hapDate),
      event: dto.event.trim(),
      event_en: optionalText(dto.eventEn),
    }

    if (index === undefined) events.push(item)
    else if (events[index]) events[index] = item
    else throw new NotFoundException('重大事件不存在。')

    await this.db
      .update(coinProjects)
      .set({ event: JSON.stringify(events), updatedAt: nowDateTime() })
      .where(eq(coinProjects.autoId, autoId))

    return this.listProjectEvents(autoId)
  }

  async deleteProjectEvent(autoId: number, index: number) {
    const project = await this.projectRowOrThrow(this.db, autoId)
    const events = parseJsonArray(project.event).map(asRecord)
    if (!events[index]) throw new NotFoundException('重大事件不存在。')

    events.splice(index, 1)
    await this.db
      .update(coinProjects)
      .set({ event: JSON.stringify(events), updatedAt: nowDateTime() })
      .where(eq(coinProjects.autoId, autoId))

    return { index }
  }

  async listProjectReports(autoId: number) {
    const project = await this.projectRowOrThrow(this.db, autoId)
    return projectReports(project.reports, project.autoId)
  }

  async upsertProjectReport(
    autoId: number,
    index: number | undefined,
    dto: UpsertProjectReportDto
  ) {
    const project = await this.projectRowOrThrow(this.db, autoId)
    const reports = parseJsonArray(project.reports).map(asRecord)
    const item = {
      title: dto.title.trim(),
      title_en: optionalText(dto.titleEn),
      url: optionalText(dto.url),
      site: dto.site.trim(),
      time_east: optionalText(dto.timeEast),
      status: dto.status ?? 1,
    }

    if (index === undefined) reports.unshift(item)
    else if (reports[index]) reports[index] = item
    else throw new NotFoundException('新闻动态不存在。')

    await this.db
      .update(coinProjects)
      .set({ reports: JSON.stringify(reports), updatedAt: nowDateTime() })
      .where(eq(coinProjects.autoId, autoId))

    return this.listProjectReports(autoId)
  }

  async deleteProjectReport(autoId: number, index: number) {
    const project = await this.projectRowOrThrow(this.db, autoId)
    const reports = parseJsonArray(project.reports).map(asRecord)
    if (!reports[index]) throw new NotFoundException('新闻动态不存在。')

    reports.splice(index, 1)
    await this.db
      .update(coinProjects)
      .set({ reports: JSON.stringify(reports), updatedAt: nowDateTime() })
      .where(eq(coinProjects.autoId, autoId))

    return { index }
  }

  async listProjectContracts(autoId: number) {
    const project = await this.projectRowOrThrow(this.db, autoId)
    return projectContracts(project.contracts, project.autoId)
  }

  async upsertProjectContract(
    autoId: number,
    index: number | undefined,
    dto: UpsertProjectContractDto
  ) {
    const project = await this.projectRowOrThrow(this.db, autoId)
    const contracts = parseJsonArray(project.contracts).map(asRecord)
    const item = {
      contract_platform: dto.contractPlatform.trim(),
      contract_address: dto.contractAddress.trim(),
    }

    if (index === undefined) contracts.unshift(item)
    else if (contracts[index]) contracts[index] = item
    else throw new NotFoundException('合约不存在。')

    await this.db
      .update(coinProjects)
      .set({ contracts: JSON.stringify(contracts), updatedAt: nowDateTime() })
      .where(eq(coinProjects.autoId, autoId))

    return this.listProjectContracts(autoId)
  }

  async deleteProjectContract(autoId: number, index: number) {
    const project = await this.projectRowOrThrow(this.db, autoId)
    const contracts = parseJsonArray(project.contracts).map(asRecord)
    if (!contracts[index]) throw new NotFoundException('合约不存在。')

    contracts.splice(index, 1)
    await this.db
      .update(coinProjects)
      .set({ contracts: JSON.stringify(contracts), updatedAt: nowDateTime() })
      .where(eq(coinProjects.autoId, autoId))

    return { index }
  }

  async listTeamMembers(entityType: 1 | 2, ownerId: number) {
    const owner =
      entityType === 1
        ? await this.projectRowOrThrow(this.db, ownerId)
        : await this.organizationRowOrThrow(this.db, ownerId)
    const ownerMembers = teamMembers(owner.teamMembers)
    const ids = ownerMembers.map((member) => member.personId).filter(Boolean)

    if (ids.length === 0) return []

    const persons = await this.db
      .select()
      .from(rootdataPersons)
      .where(inArray(rootdataPersons.id, ids))
    const personMap = new Map(persons.map((person) => [person.id, person]))
    const companyId =
      entityType === 1
        ? (owner as CoinProjectRow).projectId
        : String((owner as RootdataOrganizationRow).orgId)
    const changes = await this.db
      .select()
      .from(rootdataPersonJobChanges)
      .where(
        and(
          inArray(rootdataPersonJobChanges.peopleId, ids),
          eq(rootdataPersonJobChanges.companyType, entityType),
          eq(rootdataPersonJobChanges.companyId, companyId)
        )
      )
    const changeMap = new Map(
      changes.map((change) => [change.peopleId, change])
    )

    return ownerMembers.map((member) => {
      const person = personMap.get(member.personId)
      const change = changeMap.get(member.personId)

      return {
        ...member,
        peopleName: person?.peopleName ?? member.name,
        peopleNameEn: person?.peopleNameEn ?? '',
        headImg: person?.headImg ?? member.headImg,
        jobChange: change
          ? {
              id: change.id,
              type: change.type,
              position: change.position ?? '',
              positionEn: change.positionEn ?? '',
              entryTime: change.entryTime ?? '',
              leaveTime: change.leaveTime ?? '',
              coreMember: change.coreMember ?? member.coreMember,
            }
          : null,
      }
    })
  }

  async upsertTeamMember(
    entityType: 1 | 2,
    ownerId: number,
    personId: string | undefined,
    dto: UpsertTeamMemberDto
  ) {
    return this.db.transaction(async (tx) => {
      const person = await this.personRowOrThrow(tx, dto.personId)
      const owner =
        entityType === 1
          ? await this.projectRowOrThrow(tx, ownerId)
          : await this.organizationRowOrThrow(tx, ownerId)
      const members = parseJsonArray(owner.teamMembers).map(asRecord)
      const existingIndex = members.findIndex(
        (member) =>
          stringValue(member.people_id ?? member.personId) ===
          (personId ?? dto.personId)
      )

      if (personId === undefined && existingIndex >= 0) {
        throw new ConflictException('该成员已存在。')
      }

      const nextMember = toLegacyTeamMember(person, dto)

      if (existingIndex >= 0) members[existingIndex] = nextMember
      else members.unshift(nextMember)

      const companyId =
        entityType === 1
          ? (owner as CoinProjectRow).projectId
          : String((owner as RootdataOrganizationRow).orgId)
      const company =
        entityType === 1
          ? ((owner as CoinProjectRow).projectName ?? '')
          : (owner as RootdataOrganizationRow).orgName

      if (entityType === 1) {
        await tx
          .update(coinProjects)
          .set({
            teamMembers: JSON.stringify(members),
            updatedAt: nowDateTime(),
          })
          .where(eq(coinProjects.autoId, ownerId))
      } else {
        await tx
          .update(rootdataOrganizations)
          .set({
            teamMembers: JSON.stringify(members),
            updatedAt: nowDateTime(),
          })
          .where(eq(rootdataOrganizations.autoId, ownerId))
      }

      await this.upsertJobChangeForMember(tx, {
        peopleId: person.id,
        type: dto.type ?? 1,
        companyType: entityType,
        companyId,
        headImg: person.headImg ?? '',
        peopleName: person.peopleName,
        company,
        position: optionalText(dto.position),
        positionEn: optionalText(dto.positionEn),
        entryTime: optionalText(dto.entryTime),
        leaveTime: optionalText(dto.leaveTime),
        coreMember: dto.coreMember ?? 0,
      })

      return this.listTeamMembers(entityType, ownerId)
    })
  }

  async deleteTeamMember(entityType: 1 | 2, ownerId: number, personId: string) {
    return this.db.transaction(async (tx) => {
      const owner =
        entityType === 1
          ? await this.projectRowOrThrow(tx, ownerId)
          : await this.organizationRowOrThrow(tx, ownerId)
      const members = parseJsonArray(owner.teamMembers).map(asRecord)
      const nextMembers = members.filter(
        (member) =>
          stringValue(member.people_id ?? member.personId) !== personId
      )
      const companyId =
        entityType === 1
          ? (owner as CoinProjectRow).projectId
          : String((owner as RootdataOrganizationRow).orgId)

      if (entityType === 1) {
        await tx
          .update(coinProjects)
          .set({
            teamMembers: JSON.stringify(nextMembers),
            updatedAt: nowDateTime(),
          })
          .where(eq(coinProjects.autoId, ownerId))
      } else {
        await tx
          .update(rootdataOrganizations)
          .set({
            teamMembers: JSON.stringify(nextMembers),
            updatedAt: nowDateTime(),
          })
          .where(eq(rootdataOrganizations.autoId, ownerId))
      }

      await tx
        .delete(rootdataPersonJobChanges)
        .where(
          and(
            eq(rootdataPersonJobChanges.peopleId, personId),
            eq(rootdataPersonJobChanges.companyType, entityType),
            eq(rootdataPersonJobChanges.companyId, companyId)
          )
        )

      return { id: personId }
    })
  }

  private async upsertJobChangeForMember(
    db: RootdataDb,
    input: {
      peopleId: string
      type: RootdataJobType
      companyType: 1 | 2
      companyId: string
      headImg: string
      peopleName: string
      company: string
      position: string
      positionEn: string
      entryTime: string
      leaveTime: string
      coreMember: RootdataBinaryStatus
    }
  ) {
    const [existing] = await db
      .select({ id: rootdataPersonJobChanges.id })
      .from(rootdataPersonJobChanges)
      .where(
        and(
          eq(rootdataPersonJobChanges.peopleId, input.peopleId),
          eq(rootdataPersonJobChanges.companyType, input.companyType),
          eq(rootdataPersonJobChanges.companyId, input.companyId)
        )
      )
      .limit(1)
    const changes = {
      type: input.type,
      companyType: input.companyType,
      companyId: input.companyId,
      headImg: input.headImg,
      peopleName: input.peopleName,
      company: input.company,
      position: input.position,
      positionEn: input.positionEn,
      entryTime: input.entryTime,
      leaveTime: input.leaveTime,
      coreMember: input.coreMember,
      jobChangeData: '{}',
      updatedAt: nowDateTime(),
    }

    if (existing) {
      await db
        .update(rootdataPersonJobChanges)
        .set(changes)
        .where(eq(rootdataPersonJobChanges.id, existing.id))
    } else {
      await db.insert(rootdataPersonJobChanges).values({
        ...changes,
        peopleId: input.peopleId,
        createdAt: nowDateTime(),
      })
    }
  }

  async listPersonJobChanges(personId: string) {
    await this.personRowOrThrow(this.db, personId)
    const rows = await this.db
      .select()
      .from(rootdataPersonJobChanges)
      .where(eq(rootdataPersonJobChanges.peopleId, personId))
      .orderBy(
        desc(rootdataPersonJobChanges.createdAt),
        desc(rootdataPersonJobChanges.id)
      )

    return rows.map((row) => ({
      id: row.id,
      peopleId: row.peopleId,
      type: row.type,
      companyType: row.companyType,
      companyId: row.companyId,
      headImg: row.headImg ?? '',
      peopleName: row.peopleName ?? '',
      company: row.company ?? '',
      position: row.position ?? '',
      positionEn: row.positionEn ?? '',
      entryTime: row.entryTime ?? '',
      leaveTime: row.leaveTime ?? '',
      coreMember: row.coreMember ?? 0,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }))
  }

  async upsertPersonJobChange(
    personId: string,
    id: number | undefined,
    dto: UpsertJobChangeDto
  ) {
    return this.db.transaction(async (tx) => {
      const person = await this.personRowOrThrow(tx, personId)
      const companyInfo =
        dto.companyType === 1
          ? await this.entityInfo(tx, 1, dto.companyId)
          : await this.entityInfo(tx, 2, dto.companyId)
      const changes = {
        peopleId: person.id,
        type: dto.type,
        companyType: dto.companyType,
        companyId: companyInfo.id,
        headImg: person.headImg ?? '',
        peopleName: person.peopleName,
        company: companyInfo.name,
        position: optionalText(dto.position),
        positionEn: optionalText(dto.positionEn),
        entryTime: optionalText(dto.entryTime),
        leaveTime: optionalText(dto.leaveTime),
        coreMember: dto.coreMember ?? 0,
        jobChangeData: '{}',
        updatedAt: nowDateTime(),
      }

      if (id === undefined) {
        await tx.insert(rootdataPersonJobChanges).values({
          ...changes,
          createdAt: nowDateTime(),
        })
      } else {
        await tx
          .update(rootdataPersonJobChanges)
          .set(changes)
          .where(eq(rootdataPersonJobChanges.id, id))
      }

      return this.listPersonJobChanges(personId)
    })
  }

  async deletePersonJobChange(personId: string, id: number) {
    await this.personRowOrThrow(this.db, personId)
    await this.db
      .delete(rootdataPersonJobChanges)
      .where(eq(rootdataPersonJobChanges.id, id))

    return { id }
  }

  async listProjectFundingRounds(autoId: number) {
    const project = await this.projectRowOrThrow(this.db, autoId)
    const rows = await this.db
      .select()
      .from(rootdataFundingRoundsFac)
      .where(eq(rootdataFundingRoundsFac.projectId, project.projectId))
      .orderBy(
        desc(rootdataFundingRoundsFac.publishedTime),
        desc(rootdataFundingRoundsFac.id)
      )

    return rows.map((row) => this.toPublicFundingRound(row, undefined))
  }

  async listFundingRounds(query: FundingRoundsQueryDto) {
    const investId = await this.resolveFundingInvestId(
      query.entityType,
      query.entityId
    )
    const rows = await this.db
      .select({
        round: rootdataFundingRoundsFac,
        leadInvestor: coinFundingJoinProject.leadInvestor,
      })
      .from(rootdataFundingRoundsFac)
      .innerJoin(
        coinFundingJoinProject,
        and(
          eq(coinFundingJoinProject.roundsId, rootdataFundingRoundsFac.id),
          eq(coinFundingJoinProject.investId, investId),
          eq(coinFundingJoinProject.type, query.entityType)
        )
      )
      .orderBy(
        desc(rootdataFundingRoundsFac.publishedTime),
        desc(rootdataFundingRoundsFac.id)
      )

    return rows.map((row) =>
      this.toPublicFundingRound(row.round, row.leadInvestor)
    )
  }

  private toPublicFundingRound(
    row: typeof rootdataFundingRoundsFac.$inferSelect,
    leadInvestor: number | null | undefined
  ) {
    return {
      id: row.id,
      projectId: row.projectId,
      projectName: row.projectName ?? '',
      logo: row.logo ?? '',
      roundName: row.roundName ?? '',
      publishedTime: row.publishedTime,
      amount: row.amount ?? '',
      valuation: row.valuation ?? '',
      sourceFrom: row.sourceFrom ?? '',
      investors: parseJsonArray(row.invests).map((item) => {
        const record = asRecord(item)
        return {
          entityType: numberValue(record.type, 1),
          entityId: stringValue(record.invest_id ?? record.entityId),
          name: stringValue(record.name),
          logo: stringValue(record.logo),
          leadInvestor: numberValue(
            record.lead_investor ?? record.leadInvestor,
            0
          ),
        }
      }),
      leadInvestor: leadInvestor ?? 0,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }

  async createFundingRound(dto: UpsertFundingRoundDto) {
    return this.db.transaction(async (tx) => {
      const target = await this.entityInfo(tx, 1, dto.projectId)
      const investors = await this.resolveFundingInvestors(
        tx,
        dto.investors ?? []
      )
      const [inserted] = await tx
        .insert(rootdataFundingRoundsFac)
        .values({
          projectId: target.id,
          projectName: target.name,
          logo: target.logo,
          roundName: dto.roundName.trim(),
          publishedTime: optionalText(dto.publishedTime) || null,
          amount: normalizeNumber(dto.amount),
          valuation: normalizeNumber(dto.valuation),
          sourceFrom: optionalText(dto.sourceFrom),
          invests: JSON.stringify(investors.map((investor) => investor.legacy)),
          createdAt: nowDateTime(),
          updatedAt: nowDateTime(),
        })
        .$returningId()

      if (!inserted) throw new BadRequestException('融资轮次创建失败。')
      await this.replaceFundingJoins(tx, inserted.id, target.id, investors)

      return this.findFundingRoundOrThrow(tx, inserted.id)
    })
  }

  async updateFundingRound(id: number, dto: UpsertFundingRoundDto) {
    return this.db.transaction(async (tx) => {
      await this.findFundingRoundOrThrow(tx, id)
      const target = await this.entityInfo(tx, 1, dto.projectId)
      const investors = await this.resolveFundingInvestors(
        tx,
        dto.investors ?? []
      )

      await tx
        .update(rootdataFundingRoundsFac)
        .set({
          projectId: target.id,
          projectName: target.name,
          logo: target.logo,
          roundName: dto.roundName.trim(),
          publishedTime: optionalText(dto.publishedTime) || null,
          amount: normalizeNumber(dto.amount),
          valuation: normalizeNumber(dto.valuation),
          sourceFrom: optionalText(dto.sourceFrom),
          invests: JSON.stringify(investors.map((investor) => investor.legacy)),
          updatedAt: nowDateTime(),
        })
        .where(eq(rootdataFundingRoundsFac.id, id))

      await this.replaceFundingJoins(tx, id, target.id, investors)

      return this.findFundingRoundOrThrow(tx, id)
    })
  }

  async deleteFundingRound(id: number) {
    await this.db.transaction(async (tx) => {
      await tx
        .delete(coinFundingJoinProject)
        .where(eq(coinFundingJoinProject.roundsId, id))
      await tx
        .delete(rootdataFundingRoundsFac)
        .where(eq(rootdataFundingRoundsFac.id, id))
    })

    return { id }
  }

  private async findFundingRoundOrThrow(db: RootdataDb, id: number) {
    const [row] = await db
      .select()
      .from(rootdataFundingRoundsFac)
      .where(eq(rootdataFundingRoundsFac.id, id))
      .limit(1)

    if (!row) throw new NotFoundException('融资轮次不存在。')
    return this.toPublicFundingRound(row, undefined)
  }

  private async resolveFundingInvestors(
    db: RootdataDb,
    investors: FundingInvestorDto[]
  ) {
    const resolved = []

    for (const investor of investors) {
      const info = await this.entityInfo(
        db,
        investor.entityType,
        investor.entityId
      )
      const leadInvestor = investor.leadInvestor ?? 0
      resolved.push({
        entityType: investor.entityType,
        entityId: info.id,
        leadInvestor,
        legacy: {
          invest_id: info.id,
          name: info.name,
          logo: info.logo,
          rootdataurl: '',
          type: investor.entityType,
          lead_investor: leadInvestor,
        },
      })
    }

    return resolved
  }

  private async replaceFundingJoins(
    db: RootdataDb,
    roundId: number,
    targetProjectId: string,
    investors: Array<{
      entityType: RootdataEntityType
      entityId: string
      leadInvestor: RootdataBinaryStatus
    }>
  ) {
    await db
      .delete(coinFundingJoinProject)
      .where(eq(coinFundingJoinProject.roundsId, roundId))

    if (investors.length === 0) return

    await db.insert(coinFundingJoinProject).values(
      investors.map((investor) => ({
        type: investor.entityType,
        roundsId: roundId,
        investId: investor.entityId,
        projectId: targetProjectId,
        leadInvestor: investor.leadInvestor,
        createdAt: nowDateTime(),
        updatedAt: nowDateTime(),
      }))
    )
  }

  async listTags(query: RootdataOptionQueryDto) {
    const q = query.q?.trim()
    const rows = await this.db
      .select({
        id: rootdataTags.id,
        name: rootdataTags.tagName,
        nameEn: rootdataTags.tagNameEn,
      })
      .from(rootdataTags)
      .where(q ? like(rootdataTags.tagName, `%${q}%`) : undefined)
      .orderBy(desc(rootdataTags.createdAt), desc(rootdataTags.id))
      .limit(query.limit)

    return rows.map((row) => ({
      id: String(row.id),
      name: row.name,
      nameEn: row.nameEn ?? '',
    }))
  }

  async listEcosystems(query: RootdataOptionQueryDto) {
    const q = query.q?.trim()
    const rows = await this.db
      .select({
        id: coinEcosystems.ecosystemName,
        name: coinEcosystems.ecosystemName,
      })
      .from(coinEcosystems)
      .where(q ? like(coinEcosystems.ecosystemName, `%${q}%`) : undefined)
      .orderBy(desc(coinEcosystems.updatedAt))
      .limit(query.limit)

    return rows.map((row) => ({ id: row.id, name: row.name }))
  }

  async listPlatforms(query: RootdataOptionQueryDto) {
    const q = query.q?.trim()
    const rows = await this.db
      .select({
        id: coingeckoAssetPlatformsList.id,
        name: coingeckoAssetPlatformsList.name,
      })
      .from(coingeckoAssetPlatformsList)
      .where(q ? like(coingeckoAssetPlatformsList.name, `%${q}%`) : undefined)
      .orderBy(asc(coingeckoAssetPlatformsList.name))
      .limit(query.limit)

    return rows.map((row) => ({ id: row.id, name: row.name ?? row.id }))
  }

  async listExchanges(query: RootdataOptionQueryDto) {
    const q = query.q?.trim()
    const rows = await this.db
      .select({
        id: coingeckoExchangesById.id,
        name: coingeckoExchangesById.name,
      })
      .from(coingeckoExchangesById)
      .where(q ? like(coingeckoExchangesById.name, `%${q}%`) : undefined)
      .orderBy(asc(coingeckoExchangesById.name))
      .limit(query.limit)

    return rows.map((row) => ({ id: row.id, name: row.name ?? row.id }))
  }

  async listCoins(query: RootdataOptionQueryDto) {
    const q = query.q?.trim()
    const qFilter = q
      ? buildOr([
          like(coingeckoCoinsMarkets.id, `%${q}%`),
          like(coingeckoCoinsMarkets.name, `%${q}%`),
          like(coingeckoCoinsMarkets.symbol, `%${q}%`),
        ])
      : undefined
    const rows = await this.db
      .select({
        id: coingeckoCoinsMarkets.id,
        name: coingeckoCoinsMarkets.name,
        symbol: coingeckoCoinsMarkets.symbol,
      })
      .from(coingeckoCoinsMarkets)
      .where(qFilter)
      .orderBy(asc(coingeckoCoinsMarkets.name))
      .limit(query.limit)

    return rows.map((row) => ({
      id: row.id,
      name: row.symbol
        ? `${row.name ?? row.id} (${row.symbol})`
        : (row.name ?? row.id),
    }))
  }

  async listEntityOptions(
    entityType: RootdataEntityType,
    query: RootdataOptionQueryDto
  ) {
    const q = query.q?.trim()

    if (entityType === 1) {
      const qFilter = q
        ? buildOr([
            like(coinProjects.projectName, `%${q}%`),
            like(coinProjects.projectNameEn, `%${q}%`),
            like(coinProjects.projectId, `%${q}%`),
          ])
        : undefined
      const rows = await this.db
        .select({
          id: coinProjects.projectId,
          autoId: coinProjects.autoId,
          name: coinProjects.projectName,
          nameEn: coinProjects.projectNameEn,
        })
        .from(coinProjects)
        .where(qFilter)
        .orderBy(asc(coinProjects.projectNameEn), asc(coinProjects.projectName))
        .limit(query.limit)

      return rows.map((row) => ({
        id: row.id,
        value: row.id,
        autoId: row.autoId,
        name: row.name ?? row.id,
        nameEn: row.nameEn ?? '',
      }))
    }

    if (entityType === 2) {
      const qFilter = q
        ? buildOr([
            like(rootdataOrganizations.orgName, `%${q}%`),
            like(rootdataOrganizations.orgNameEn, `%${q}%`),
          ])
        : undefined
      const rows = await this.db
        .select({
          id: rootdataOrganizations.orgId,
          autoId: rootdataOrganizations.autoId,
          name: rootdataOrganizations.orgName,
          nameEn: rootdataOrganizations.orgNameEn,
        })
        .from(rootdataOrganizations)
        .where(qFilter)
        .orderBy(
          asc(rootdataOrganizations.orgNameEn),
          asc(rootdataOrganizations.orgName)
        )
        .limit(query.limit)

      return rows.map((row) => ({
        id: String(row.id),
        value: String(row.id),
        autoId: row.autoId,
        name: row.name,
        nameEn: row.nameEn,
      }))
    }

    const qFilter = q
      ? buildOr([
          like(rootdataPersons.peopleName, `%${q}%`),
          like(rootdataPersons.peopleNameEn, `%${q}%`),
          like(rootdataPersons.id, `%${q}%`),
        ])
      : undefined
    const rows = await this.db
      .select({
        id: rootdataPersons.id,
        name: rootdataPersons.peopleName,
        nameEn: rootdataPersons.peopleNameEn,
      })
      .from(rootdataPersons)
      .where(qFilter)
      .orderBy(
        asc(rootdataPersons.peopleNameEn),
        asc(rootdataPersons.peopleName)
      )
      .limit(query.limit)

    return rows.map((row) => ({
      id: row.id,
      value: row.id,
      name: row.name,
      nameEn: row.nameEn,
    }))
  }

  listFundingRoundNames() {
    return FUNDING_ROUNDS
  }
}
