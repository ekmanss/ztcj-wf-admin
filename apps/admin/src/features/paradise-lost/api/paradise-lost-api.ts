import { apiClient } from '@/lib/api-client'
import {
  eventOptionsSchema,
  investmentOptionsListSchema,
  paradiseLostItemSchema,
  paradiseLostListSchema,
  paradiseLostTagsSchema,
  paradiseLostYearsSchema,
  type EventOption,
  type InvestmentOptionsList,
  type ParadiseLostItem,
  type ParadiseLostList,
  type ParadiseLostStatus,
  type ParadiseLostTag,
  type ParadiseLostType,
} from '../data/schema'

export type ListParadiseLostParams = {
  page?: number
  pageSize?: number
  name?: string
  type?: ParadiseLostType[]
  status?: ParadiseLostStatus[]
  year?: string
  tag?: string
}

export type ParadiseLostUpsertInput = {
  type: ParadiseLostType
  investId: string
  tags?: string[]
  year?: string[]
  cause?: string
  causeEn?: string
  date?: string
  image?: string
  status?: ParadiseLostStatus
  desc?: string
  projectName?: string
  projectNameEn?: string
  logo?: string
  oneLiner?: string
  oneLinerEn?: string
  description?: string
  descriptionEn?: string
  active?: number
  orgName?: string
  orgNameEn?: string
  orgLogo?: string
  orgInfo?: string
  orgInfoEn?: string
  orgDescription?: string
  orgDescriptionEn?: string
  peopleName?: string
  peopleNameEn?: string
  headImg?: string
  personsOneLiner?: string
  personsOneLinerEn?: string
  personsIntroduce?: string
  personsIntroduceEn?: string
  eventNameCn?: string
  eventNameEn?: string
  eventImage160?: string
  eventTypes?: string[]
  eventNatures?: string[]
  eventSummaryCn?: string
  eventSummaryEn?: string
  eventIntroductionCn?: string
  eventIntroductionEn?: string
}

export type ListInvestmentOptionsParams = {
  type: ParadiseLostType
  q?: string
  page?: number
  pageSize?: number
}

export type CreateParadiseLostTagInput = {
  tagName: string
  tagNameEn?: string
  image?: string
  color?: string
  backgroundColor?: string
  remark?: string
}

function toSearchParams(params: ListParadiseLostParams) {
  const searchParams = new URLSearchParams()

  if (params.page) searchParams.set('page', String(params.page))
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize))
  if (params.name) searchParams.set('name', params.name)
  if (params.year) searchParams.set('year', params.year)
  if (params.tag) searchParams.set('tag', params.tag)
  params.type?.forEach((type) => searchParams.append('type', String(type)))
  params.status?.forEach((status) =>
    searchParams.append('status', String(status))
  )

  return searchParams
}

function toInvestmentSearchParams(params: ListInvestmentOptionsParams) {
  const searchParams = new URLSearchParams()

  searchParams.set('type', String(params.type))
  if (params.q) searchParams.set('q', params.q)
  if (params.page) searchParams.set('page', String(params.page))
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize))

  return searchParams
}

export async function listParadiseLost(
  params: ListParadiseLostParams
): Promise<ParadiseLostList> {
  const response = await apiClient.get('/paradise-lost', {
    params: toSearchParams(params),
  })

  return paradiseLostListSchema.parse(response.data)
}

export async function createParadiseLost(
  input: ParadiseLostUpsertInput
): Promise<ParadiseLostItem> {
  const response = await apiClient.post('/paradise-lost', input)
  return paradiseLostItemSchema.parse(response.data)
}

export async function updateParadiseLost(
  id: number,
  input: ParadiseLostUpsertInput
): Promise<ParadiseLostItem> {
  const response = await apiClient.patch(`/paradise-lost/${id}`, input)
  return paradiseLostItemSchema.parse(response.data)
}

export async function deleteParadiseLost(id: number): Promise<{ id: number }> {
  const response = await apiClient.delete(`/paradise-lost/${id}`)
  return response.data as { id: number }
}

export async function updateParadiseLostStatus(
  ids: number[],
  status: ParadiseLostStatus
): Promise<{ count: number }> {
  const response = await apiClient.patch('/paradise-lost/bulk/status', {
    ids,
    status,
  })
  return response.data as { count: number }
}

export async function deleteParadiseLostItems(
  ids: number[]
): Promise<{ count: number }> {
  const response = await apiClient.delete('/paradise-lost/bulk', {
    data: { ids },
  })
  return response.data as { count: number }
}

export async function listParadiseLostTags(): Promise<ParadiseLostTag[]> {
  const response = await apiClient.get('/paradise-lost/tags')
  return paradiseLostTagsSchema.parse(response.data)
}

export async function createParadiseLostTag(
  input: CreateParadiseLostTagInput
): Promise<ParadiseLostTag> {
  const response = await apiClient.post('/paradise-lost/tags', input)
  return paradiseLostTagsSchema.element.parse(response.data)
}

export async function listParadiseLostYears(): Promise<string[]> {
  const response = await apiClient.get('/paradise-lost/years')
  return paradiseLostYearsSchema.parse(response.data)
}

export async function listEventTypes(): Promise<EventOption[]> {
  const response = await apiClient.get('/paradise-lost/event-types')
  return eventOptionsSchema.parse(response.data)
}

export async function listEventNatures(): Promise<EventOption[]> {
  const response = await apiClient.get('/paradise-lost/event-natures')
  return eventOptionsSchema.parse(response.data)
}

export async function listInvestmentOptions(
  params: ListInvestmentOptionsParams
): Promise<InvestmentOptionsList> {
  const response = await apiClient.get('/paradise-lost/investments', {
    params: toInvestmentSearchParams(params),
  })

  return investmentOptionsListSchema.parse(response.data)
}
