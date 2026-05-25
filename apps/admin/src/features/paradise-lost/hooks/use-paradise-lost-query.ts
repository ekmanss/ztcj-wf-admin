import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createParadiseLost,
  createParadiseLostTag,
  deleteParadiseLost,
  deleteParadiseLostItems,
  listEventNatures,
  listEventTypes,
  listInvestmentOptions,
  listParadiseLost,
  listParadiseLostTags,
  listParadiseLostYears,
  updateParadiseLost,
  updateParadiseLostStatus,
  type CreateParadiseLostTagInput,
  type ListInvestmentOptionsParams,
  type ListParadiseLostParams,
  type ParadiseLostUpsertInput,
} from '../api/paradise-lost-api'
import type { ParadiseLostStatus } from '../data/schema'

type ParadiseLostSearch = Record<string, unknown>

export const paradiseLostQueryKeys = {
  all: ['paradise-lost'] as const,
  lists: () => [...paradiseLostQueryKeys.all, 'list'] as const,
  list: (params: ListParadiseLostParams) =>
    [...paradiseLostQueryKeys.lists(), params] as const,
  tags: () => [...paradiseLostQueryKeys.all, 'tags'] as const,
  years: () => [...paradiseLostQueryKeys.all, 'years'] as const,
  eventTypes: () => [...paradiseLostQueryKeys.all, 'event-types'] as const,
  eventNatures: () => [...paradiseLostQueryKeys.all, 'event-natures'] as const,
  investmentPages: (params: Omit<ListInvestmentOptionsParams, 'page'>) =>
    [...paradiseLostQueryKeys.all, 'investment-pages', params] as const,
}

function toNumberArray<T extends number>(value: unknown): T[] {
  return Array.isArray(value)
    ? (value
        .map((item) => Number(item))
        .filter((item) => Number.isFinite(item)) as T[])
    : []
}

export function toListParadiseLostParams(
  search: ParadiseLostSearch
): ListParadiseLostParams {
  return {
    page: typeof search.page === 'number' ? search.page : 1,
    pageSize: typeof search.pageSize === 'number' ? search.pageSize : 10,
    name: typeof search.name === 'string' ? search.name : undefined,
    type: toNumberArray(search.type),
    status: toNumberArray(search.status),
  }
}

export function useParadiseLostQuery(search: ParadiseLostSearch) {
  const params = toListParadiseLostParams(search)

  return useQuery({
    queryKey: paradiseLostQueryKeys.list(params),
    queryFn: () => listParadiseLost(params),
    placeholderData: keepPreviousData,
  })
}

export function useParadiseLostTagsQuery() {
  return useQuery({
    queryKey: paradiseLostQueryKeys.tags(),
    queryFn: listParadiseLostTags,
  })
}

export function useParadiseLostYearsQuery() {
  return useQuery({
    queryKey: paradiseLostQueryKeys.years(),
    queryFn: listParadiseLostYears,
  })
}

export function useEventTypesQuery() {
  return useQuery({
    queryKey: paradiseLostQueryKeys.eventTypes(),
    queryFn: listEventTypes,
  })
}

export function useEventNaturesQuery() {
  return useQuery({
    queryKey: paradiseLostQueryKeys.eventNatures(),
    queryFn: listEventNatures,
  })
}

export function useInvestmentOptionsInfiniteQuery(
  params: Omit<ListInvestmentOptionsParams, 'page'>,
  enabled: boolean
) {
  return useInfiniteQuery({
    queryKey: paradiseLostQueryKeys.investmentPages(params),
    queryFn: ({ pageParam }) =>
      listInvestmentOptions({ ...params, page: pageParam }),
    enabled,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const loadedCount = lastPage.page * lastPage.pageSize
      return loadedCount < lastPage.total ? lastPage.page + 1 : undefined
    },
  })
}

export function useCreateParadiseLostMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: ParadiseLostUpsertInput) => createParadiseLost(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: paradiseLostQueryKeys.all,
      })
      toast.success('已新增失乐园条目。')
    },
  })
}

export function useUpdateParadiseLostMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: number
      input: ParadiseLostUpsertInput
    }) => updateParadiseLost(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: paradiseLostQueryKeys.all,
      })
      toast.success('已更新失乐园条目。')
    },
  })
}

export function useDeleteParadiseLostMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteParadiseLost(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: paradiseLostQueryKeys.all,
      })
      toast.success('已删除失乐园条目。')
    },
  })
}

export function useUpdateParadiseLostStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      ids,
      status,
    }: {
      ids: number[]
      status: ParadiseLostStatus
    }) => updateParadiseLostStatus(ids, status),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: paradiseLostQueryKeys.all,
      })
      toast.success(`已更新 ${variables.ids.length} 个条目的显示状态。`)
    },
  })
}

export function useDeleteParadiseLostItemsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: number[]) => deleteParadiseLostItems(ids),
    onSuccess: async (_data, ids) => {
      await queryClient.invalidateQueries({
        queryKey: paradiseLostQueryKeys.all,
      })
      toast.success(`已删除 ${ids.length} 个失乐园条目。`)
    },
  })
}

export function useCreateParadiseLostTagMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateParadiseLostTagInput) =>
      createParadiseLostTag(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: paradiseLostQueryKeys.tags(),
      })
      toast.success('已新增标签。')
    },
  })
}
