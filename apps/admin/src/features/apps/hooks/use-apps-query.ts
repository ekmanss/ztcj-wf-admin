import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createAppAd,
  createAppColumn,
  deleteAppAd,
  deleteAppAds,
  deleteAppColumn,
  deleteAppColumns,
  getAppsMeta,
  listAppAds,
  listAppColumnParents,
  listAppColumns,
  updateAppAd,
  updateAppAdStatus,
  updateAppColumn,
  updateAppColumnStatus,
  type AppAdUpsertInput,
  type AppColumnUpsertInput,
  type ListAppAdsParams,
  type ListAppColumnsParams,
} from '../api/apps-api'
import type {
  AppAdPageCode,
  AppAdPositionCode,
  AppAdStatus,
  AppAdType,
  AppColumnStatus,
} from '../data/schema'

type AppsSearch = Record<string, unknown>

export const appsQueryKeys = {
  all: ['apps'] as const,
  meta: () => [...appsQueryKeys.all, 'meta'] as const,
  columnLists: () => [...appsQueryKeys.all, 'columns', 'list'] as const,
  columnList: (params: ListAppColumnsParams) =>
    [...appsQueryKeys.columnLists(), params] as const,
  columnParents: () => [...appsQueryKeys.all, 'columns', 'parents'] as const,
  adLists: () => [...appsQueryKeys.all, 'ads', 'list'] as const,
  adList: (params: ListAppAdsParams) =>
    [...appsQueryKeys.adLists(), params] as const,
}

function toStringArray<T extends string>(value: unknown): T[] {
  return Array.isArray(value) ? (value.filter(Boolean) as T[]) : []
}

function toNumberArray<T extends number>(value: unknown): T[] {
  return Array.isArray(value)
    ? (value
        .map((item) => Number(item))
        .filter((item) => Number.isFinite(item)) as T[])
    : []
}

export function toListAppColumnsParams(
  search: AppsSearch
): ListAppColumnsParams {
  return {
    q: typeof search.q === 'string' ? search.q : undefined,
    status: toStringArray<AppColumnStatus>(search.status),
  }
}

export function toListAppAdsParams(search: AppsSearch): ListAppAdsParams {
  return {
    page: typeof search.page === 'number' ? search.page : 1,
    pageSize: typeof search.pageSize === 'number' ? search.pageSize : 10,
    name: typeof search.name === 'string' ? search.name : undefined,
    positionCode: toStringArray<AppAdPositionCode>(search.positionCode),
    pageCode: toStringArray<AppAdPageCode>(search.pageCode),
    adType: toStringArray<AppAdType>(search.adType),
    status: toNumberArray<AppAdStatus>(search.status),
  }
}

export function useAppsMetaQuery() {
  return useQuery({
    queryKey: appsQueryKeys.meta(),
    queryFn: getAppsMeta,
  })
}

export function useAppColumnsQuery(search: AppsSearch) {
  const params = toListAppColumnsParams(search)

  return useQuery({
    queryKey: appsQueryKeys.columnList(params),
    queryFn: () => listAppColumns(params),
    placeholderData: keepPreviousData,
  })
}

export function useAppColumnParentsQuery() {
  return useQuery({
    queryKey: appsQueryKeys.columnParents(),
    queryFn: listAppColumnParents,
  })
}

export function useCreateAppColumnMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: AppColumnUpsertInput) => createAppColumn(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: appsQueryKeys.all })
      toast.success('已新增 APP 栏目。')
    },
  })
}

export function useUpdateAppColumnMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: AppColumnUpsertInput }) =>
      updateAppColumn(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: appsQueryKeys.all })
      toast.success('已更新 APP 栏目。')
    },
  })
}

export function useUpdateAppColumnStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ ids, status }: { ids: number[]; status: AppColumnStatus }) =>
      updateAppColumnStatus(ids, status),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: appsQueryKeys.all })
      toast.success(`已更新 ${variables.ids.length} 个栏目的显示状态。`)
    },
  })
}

export function useDeleteAppColumnMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteAppColumn(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: appsQueryKeys.all })
      toast.success('已删除 APP 栏目。')
    },
  })
}

export function useDeleteAppColumnsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: number[]) => deleteAppColumns(ids),
    onSuccess: async (_data, ids) => {
      await queryClient.invalidateQueries({ queryKey: appsQueryKeys.all })
      toast.success(`已删除 ${ids.length} 个 APP 栏目。`)
    },
  })
}

export function useAppAdsQuery(search: AppsSearch) {
  const params = toListAppAdsParams(search)

  return useQuery({
    queryKey: appsQueryKeys.adList(params),
    queryFn: () => listAppAds(params),
    placeholderData: keepPreviousData,
  })
}

export function useCreateAppAdMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: AppAdUpsertInput) => createAppAd(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: appsQueryKeys.all })
      toast.success('已新增 APP 广告。')
    },
  })
}

export function useUpdateAppAdMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: AppAdUpsertInput }) =>
      updateAppAd(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: appsQueryKeys.all })
      toast.success('已更新 APP 广告。')
    },
  })
}

export function useUpdateAppAdStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ ids, status }: { ids: number[]; status: AppAdStatus }) =>
      updateAppAdStatus(ids, status),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: appsQueryKeys.all })
      toast.success(`已更新 ${variables.ids.length} 个广告的显示状态。`)
    },
  })
}

export function useDeleteAppAdMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteAppAd(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: appsQueryKeys.all })
      toast.success('已删除 APP 广告。')
    },
  })
}

export function useDeleteAppAdsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: number[]) => deleteAppAds(ids),
    onSuccess: async (_data, ids) => {
      await queryClient.invalidateQueries({ queryKey: appsQueryKeys.all })
      toast.success(`已删除 ${ids.length} 个 APP 广告。`)
    },
  })
}
