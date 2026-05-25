import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createKolUser,
  deleteKolTweet,
  deleteKolTweets,
  deleteKolUser,
  deleteKolUsers,
  getKolTweet,
  listKolTweets,
  listKolUsers,
  updateKolTweet,
  updateKolTweetsStatus,
  updateKolUser,
  updateKolUsersStatus,
  type KolUserInput,
  type ListKolTweetsParams,
  type ListKolUsersParams,
  type UpdateKolTweetInput,
} from '../api/kol-api'
import type {
  KolPlatform,
  KolSyncStatus,
  KolTweetStatus,
  KolUserStatus,
} from '../data/schema'

type KolSearch = Record<string, unknown>

export const kolQueryKeys = {
  all: ['kol'] as const,
  userLists: () => [...kolQueryKeys.all, 'users', 'list'] as const,
  userList: (params: ListKolUsersParams) =>
    [...kolQueryKeys.userLists(), params] as const,
  tweetLists: () => [...kolQueryKeys.all, 'tweets', 'list'] as const,
  tweetList: (params: ListKolTweetsParams) =>
    [...kolQueryKeys.tweetLists(), params] as const,
  tweet: (tweetRestId: string) =>
    [...kolQueryKeys.all, 'tweet', tweetRestId] as const,
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

export function toListKolUsersParams(search: KolSearch): ListKolUsersParams {
  return {
    page: typeof search.page === 'number' ? search.page : 1,
    pageSize: typeof search.pageSize === 'number' ? search.pageSize : 10,
    username: typeof search.username === 'string' ? search.username : undefined,
    name: typeof search.name === 'string' ? search.name : undefined,
    platform: toStringArray<KolPlatform>(search.platform),
    syncStatus: toStringArray<KolSyncStatus>(search.syncStatus),
    status: toStringArray<KolUserStatus>(search.status),
  }
}

export function toListKolTweetsParams(search: KolSearch): ListKolTweetsParams {
  return {
    page: typeof search.page === 'number' ? search.page : 1,
    pageSize: typeof search.pageSize === 'number' ? search.pageSize : 10,
    authorName:
      typeof search.authorName === 'string' ? search.authorName : undefined,
    authorUsername:
      typeof search.authorUsername === 'string'
        ? search.authorUsername
        : undefined,
    platform: toStringArray<KolPlatform>(search.platform),
    isReply: toNumberArray<0 | 1>(search.isReply),
    status: toStringArray<KolTweetStatus>(search.status),
  }
}

export function useKolUsersQuery(search: KolSearch) {
  const params = toListKolUsersParams(search)

  return useQuery({
    queryKey: kolQueryKeys.userList(params),
    queryFn: () => listKolUsers(params),
    placeholderData: keepPreviousData,
  })
}

export function useCreateKolUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: KolUserInput) => createKolUser(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: kolQueryKeys.userLists(),
      })
      toast.success('已新增 KOL 会员。')
    },
  })
}

export function useUpdateKolUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      restId,
      input,
    }: {
      restId: string
      input: Partial<KolUserInput>
    }) => updateKolUser(restId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: kolQueryKeys.userLists(),
      })
      toast.success('已更新 KOL 会员。')
    },
  })
}

export function useUpdateKolUsersStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      restIds,
      status,
    }: {
      restIds: string[]
      status: KolUserStatus
    }) => updateKolUsersStatus(restIds, status),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: kolQueryKeys.userLists(),
      })
      toast.success(`已更新 ${variables.restIds.length} 个 KOL 会员状态。`)
    },
  })
}

export function useDeleteKolUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (restId: string) => deleteKolUser(restId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: kolQueryKeys.userLists(),
      })
      toast.success('已删除 KOL 会员。')
    },
  })
}

export function useDeleteKolUsersMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (restIds: string[]) => deleteKolUsers(restIds),
    onSuccess: async (_data, restIds) => {
      await queryClient.invalidateQueries({
        queryKey: kolQueryKeys.userLists(),
      })
      toast.success(`已删除 ${restIds.length} 个 KOL 会员。`)
    },
  })
}

export function useKolTweetsQuery(search: KolSearch) {
  const params = toListKolTweetsParams(search)

  return useQuery({
    queryKey: kolQueryKeys.tweetList(params),
    queryFn: () => listKolTweets(params),
    placeholderData: keepPreviousData,
  })
}

export function useKolTweetQuery(tweetRestId: string, enabled: boolean) {
  return useQuery({
    queryKey: kolQueryKeys.tweet(tweetRestId),
    queryFn: () => getKolTweet(tweetRestId),
    enabled,
  })
}

export function useUpdateKolTweetMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      tweetRestId,
      input,
    }: {
      tweetRestId: string
      input: UpdateKolTweetInput
    }) => updateKolTweet(tweetRestId, input),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: kolQueryKeys.tweetLists(),
      })
      await queryClient.invalidateQueries({
        queryKey: kolQueryKeys.tweet(variables.tweetRestId),
      })
      toast.success('已更新 KOL 动态。')
    },
  })
}

export function useUpdateKolTweetsStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      tweetRestIds,
      status,
    }: {
      tweetRestIds: string[]
      status: KolTweetStatus
    }) => updateKolTweetsStatus(tweetRestIds, status),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: kolQueryKeys.tweetLists(),
      })
      toast.success(`已更新 ${variables.tweetRestIds.length} 条动态状态。`)
    },
  })
}

export function useDeleteKolTweetMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (tweetRestId: string) => deleteKolTweet(tweetRestId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: kolQueryKeys.tweetLists(),
      })
      toast.success('已删除 KOL 动态。')
    },
  })
}

export function useDeleteKolTweetsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (tweetRestIds: string[]) => deleteKolTweets(tweetRestIds),
    onSuccess: async (_data, tweetRestIds) => {
      await queryClient.invalidateQueries({
        queryKey: kolQueryKeys.tweetLists(),
      })
      toast.success(`已删除 ${tweetRestIds.length} 条 KOL 动态。`)
    },
  })
}
