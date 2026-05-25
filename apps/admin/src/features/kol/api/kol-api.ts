import { apiClient } from '@/lib/api-client'
import {
  kolTweetSchema,
  kolTweetsListSchema,
  kolUserSchema,
  kolUsersListSchema,
  type KolPlatform,
  type KolSyncStatus,
  type KolTweet,
  type KolTweetStatus,
  type KolTweetsList,
  type KolUser,
  type KolUserStatus,
  type KolUsersList,
} from '../data/schema'

export type ListKolUsersParams = {
  page?: number
  pageSize?: number
  username?: string
  name?: string
  platform?: KolPlatform[]
  syncStatus?: KolSyncStatus[]
  status?: KolUserStatus[]
}

export type KolUserInput = {
  restId?: string
  username: string
  requestedUsername?: string
  name?: string
  description?: string
  avatarUrl?: string
  linkUrl?: string
  platform?: KolPlatform
  syncStatus?: KolSyncStatus
  status?: KolUserStatus
  keywords?: string
  remark?: string
}

export type ListKolTweetsParams = {
  page?: number
  pageSize?: number
  authorName?: string
  authorUsername?: string
  platform?: KolPlatform[]
  isReply?: Array<0 | 1>
  status?: KolTweetStatus[]
}

export type UpdateKolTweetInput = {
  fullText?: string
  status?: KolTweetStatus
}

function toKolUsersSearchParams(params: ListKolUsersParams) {
  const searchParams = new URLSearchParams()

  if (params.page) searchParams.set('page', String(params.page))
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize))
  if (params.username) searchParams.set('username', params.username)
  if (params.name) searchParams.set('name', params.name)
  params.platform?.forEach((platform) =>
    searchParams.append('platform', platform)
  )
  params.syncStatus?.forEach((status) =>
    searchParams.append('syncStatus', status)
  )
  params.status?.forEach((status) => searchParams.append('status', status))

  return searchParams
}

function toKolTweetsSearchParams(params: ListKolTweetsParams) {
  const searchParams = new URLSearchParams()

  if (params.page) searchParams.set('page', String(params.page))
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize))
  if (params.authorName) searchParams.set('authorName', params.authorName)
  if (params.authorUsername) {
    searchParams.set('authorUsername', params.authorUsername)
  }
  params.platform?.forEach((platform) =>
    searchParams.append('platform', platform)
  )
  params.isReply?.forEach((type) =>
    searchParams.append('isReply', String(type))
  )
  params.status?.forEach((status) => searchParams.append('status', status))

  return searchParams
}

export async function listKolUsers(
  params: ListKolUsersParams
): Promise<KolUsersList> {
  const response = await apiClient.get('/kol/users', {
    params: toKolUsersSearchParams(params),
  })

  return kolUsersListSchema.parse(response.data)
}

export async function createKolUser(input: KolUserInput): Promise<KolUser> {
  const response = await apiClient.post('/kol/users', input)
  return kolUserSchema.parse(response.data)
}

export async function updateKolUser(
  restId: string,
  input: Partial<KolUserInput>
): Promise<KolUser> {
  const response = await apiClient.patch(`/kol/users/${restId}`, input)
  return kolUserSchema.parse(response.data)
}

export async function deleteKolUser(
  restId: string
): Promise<{ restId: string }> {
  const response = await apiClient.delete(`/kol/users/${restId}`)
  return response.data as { restId: string }
}

export async function updateKolUsersStatus(
  restIds: string[],
  status: KolUserStatus
): Promise<{ count: number }> {
  const response = await apiClient.patch('/kol/users/bulk/status', {
    restIds,
    status,
  })
  return response.data as { count: number }
}

export async function deleteKolUsers(
  restIds: string[]
): Promise<{ count: number }> {
  const response = await apiClient.delete('/kol/users/bulk', {
    data: { restIds },
  })
  return response.data as { count: number }
}

export async function listKolTweets(
  params: ListKolTweetsParams
): Promise<KolTweetsList> {
  const response = await apiClient.get('/kol/dynamics', {
    params: toKolTweetsSearchParams(params),
  })

  return kolTweetsListSchema.parse(response.data)
}

export async function getKolTweet(tweetRestId: string): Promise<KolTweet> {
  const response = await apiClient.get(`/kol/dynamics/${tweetRestId}`)
  return kolTweetSchema.parse(response.data)
}

export async function updateKolTweet(
  tweetRestId: string,
  input: UpdateKolTweetInput
): Promise<KolTweet> {
  const response = await apiClient.patch(`/kol/dynamics/${tweetRestId}`, input)
  return kolTweetSchema.parse(response.data)
}

export async function deleteKolTweet(
  tweetRestId: string
): Promise<{ tweetRestId: string }> {
  const response = await apiClient.delete(`/kol/dynamics/${tweetRestId}`)
  return response.data as { tweetRestId: string }
}

export async function updateKolTweetsStatus(
  tweetRestIds: string[],
  status: KolTweetStatus
): Promise<{ count: number }> {
  const response = await apiClient.patch('/kol/dynamics/bulk/status', {
    tweetRestIds,
    status,
  })
  return response.data as { count: number }
}

export async function deleteKolTweets(
  tweetRestIds: string[]
): Promise<{ count: number }> {
  const response = await apiClient.delete('/kol/dynamics/bulk', {
    data: { tweetRestIds },
  })
  return response.data as { count: number }
}
