import { apiClient } from '@/lib/api-client'
import {
  userGroupsSchema,
  userSchema,
  usersListSchema,
  type User,
  type UserGroup,
  type UserStatus,
  type UsersList,
} from '../data/schema'

export type ListUsersParams = {
  page?: number
  pageSize?: number
  username?: string
  nickname?: string
  email?: string
  mobile?: string
  status?: UserStatus[]
}

export type CreateUserInput = {
  groupId?: number
  username: string
  nickname: string
  email: string
  mobile?: string
  avatar?: string
  level?: number
  gender?: number
  birthday?: string
  bio?: string
  status?: UserStatus
  password?: string
}

export type UpdateUserInput = Partial<CreateUserInput>

function toSearchParams(params: ListUsersParams) {
  const searchParams = new URLSearchParams()

  if (params.page) searchParams.set('page', String(params.page))
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize))
  if (params.username) searchParams.set('username', params.username)
  if (params.nickname) searchParams.set('nickname', params.nickname)
  if (params.email) searchParams.set('email', params.email)
  if (params.mobile) searchParams.set('mobile', params.mobile)
  params.status?.forEach((status) => searchParams.append('status', status))

  return searchParams
}

export async function listUsers(params: ListUsersParams): Promise<UsersList> {
  const response = await apiClient.get('/users', {
    params: toSearchParams(params),
  })

  return usersListSchema.parse(response.data)
}

export async function listUserGroups(): Promise<UserGroup[]> {
  const response = await apiClient.get('/users/groups')
  return userGroupsSchema.parse(response.data)
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const response = await apiClient.post('/users', input)
  return userSchema.parse(response.data)
}

export async function updateUser(
  id: number,
  input: UpdateUserInput
): Promise<User> {
  const response = await apiClient.patch(`/users/${id}`, input)
  return userSchema.parse(response.data)
}

export async function deleteUser(id: number): Promise<{ id: number }> {
  const response = await apiClient.delete(`/users/${id}`)
  return response.data as { id: number }
}

export async function updateUsersStatus(
  ids: number[],
  status: UserStatus
): Promise<{ count: number }> {
  const response = await apiClient.patch('/users/bulk/status', { ids, status })
  return response.data as { count: number }
}

export async function deleteUsers(ids: number[]): Promise<{ count: number }> {
  const response = await apiClient.delete('/users/bulk', { data: { ids } })
  return response.data as { count: number }
}
