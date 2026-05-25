import { apiClient } from '@/lib/api-client'
import {
  appAdSchema,
  appAdsListSchema,
  appColumnParentSchema,
  appColumnSchema,
  appColumnsListSchema,
  appMetaSchema,
  type AppAd,
  type AppAdPageCode,
  type AppAdPositionCode,
  type AppAdStatus,
  type AppAdType,
  type AppAdsList,
  type AppColumn,
  type AppColumnParent,
  type AppColumnsList,
  type AppColumnStatus,
  type AppMeta,
} from '../data/schema'

export type ListAppColumnsParams = {
  q?: string
  status?: AppColumnStatus[]
}

export type AppColumnUpsertInput = {
  pid?: number
  code: string
  name: string
  nameEn: string
  status?: AppColumnStatus
  remarks?: string
  weigh?: number
}

export type ListAppAdsParams = {
  page?: number
  pageSize?: number
  name?: string
  positionCode?: AppAdPositionCode[]
  pageCode?: AppAdPageCode[]
  adType?: AppAdType[]
  status?: AppAdStatus[]
}

export type AppAdUpsertInput = {
  adName: string
  adPositionCode: AppAdPositionCode
  adPageCode: AppAdPageCode
  adImageCh: string
  adImageEn: string
  adLink: string
  adType: AppAdType
  adEffectiveTime: string
  adInvalidTime: string
  weigh?: number
  status?: AppAdStatus
}

function toColumnSearchParams(params: ListAppColumnsParams) {
  const searchParams = new URLSearchParams()

  if (params.q) searchParams.set('q', params.q)
  params.status?.forEach((status) => searchParams.append('status', status))

  return searchParams
}

function toAdSearchParams(params: ListAppAdsParams) {
  const searchParams = new URLSearchParams()

  if (params.page) searchParams.set('page', String(params.page))
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize))
  if (params.name) searchParams.set('name', params.name)
  params.positionCode?.forEach((value) =>
    searchParams.append('positionCode', value)
  )
  params.pageCode?.forEach((value) => searchParams.append('pageCode', value))
  params.adType?.forEach((value) => searchParams.append('adType', value))
  params.status?.forEach((value) =>
    searchParams.append('status', String(value))
  )

  return searchParams
}

export async function getAppsMeta(): Promise<AppMeta> {
  const response = await apiClient.get('/apps/meta')
  return appMetaSchema.parse(response.data)
}

export async function listAppColumns(
  params: ListAppColumnsParams
): Promise<AppColumnsList> {
  const response = await apiClient.get('/apps/columns', {
    params: toColumnSearchParams(params),
  })

  return appColumnsListSchema.parse(response.data)
}

export async function listAppColumnParents(): Promise<AppColumnParent[]> {
  const response = await apiClient.get('/apps/columns/parents')
  return appColumnParentSchema.array().parse(response.data)
}

export async function createAppColumn(
  input: AppColumnUpsertInput
): Promise<AppColumn> {
  const response = await apiClient.post('/apps/columns', input)
  return appColumnSchema.parse(response.data)
}

export async function updateAppColumn(
  id: number,
  input: AppColumnUpsertInput
): Promise<AppColumn> {
  const response = await apiClient.patch(`/apps/columns/${id}`, input)
  return appColumnSchema.parse(response.data)
}

export async function updateAppColumnStatus(
  ids: number[],
  status: AppColumnStatus
): Promise<{ count: number }> {
  const response = await apiClient.patch('/apps/columns/bulk/status', {
    ids,
    status,
  })
  return response.data as { count: number }
}

export async function deleteAppColumn(id: number): Promise<{ id: number }> {
  const response = await apiClient.delete(`/apps/columns/${id}`)
  return response.data as { id: number }
}

export async function deleteAppColumns(
  ids: number[]
): Promise<{ count: number }> {
  const response = await apiClient.delete('/apps/columns/bulk', {
    data: { ids },
  })
  return response.data as { count: number }
}

export async function listAppAds(
  params: ListAppAdsParams
): Promise<AppAdsList> {
  const response = await apiClient.get('/apps/ads', {
    params: toAdSearchParams(params),
  })

  return appAdsListSchema.parse(response.data)
}

export async function createAppAd(input: AppAdUpsertInput): Promise<AppAd> {
  const response = await apiClient.post('/apps/ads', input)
  return appAdSchema.parse(response.data)
}

export async function updateAppAd(
  id: number,
  input: AppAdUpsertInput
): Promise<AppAd> {
  const response = await apiClient.patch(`/apps/ads/${id}`, input)
  return appAdSchema.parse(response.data)
}

export async function updateAppAdStatus(
  ids: number[],
  status: AppAdStatus
): Promise<{ count: number }> {
  const response = await apiClient.patch('/apps/ads/bulk/status', {
    ids,
    status,
  })
  return response.data as { count: number }
}

export async function deleteAppAd(id: number): Promise<{ id: number }> {
  const response = await apiClient.delete(`/apps/ads/${id}`)
  return response.data as { id: number }
}

export async function deleteAppAds(ids: number[]): Promise<{ count: number }> {
  const response = await apiClient.delete('/apps/ads/bulk', {
    data: { ids },
  })
  return response.data as { count: number }
}
