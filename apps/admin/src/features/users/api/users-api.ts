import { apiClient } from '@/lib/api-client'
import {
  userSchema,
  usersListSchema,
  type User,
  type UserRole,
  type UserStatus,
  type UsersList,
} from '../data/schema'

export type ListUsersParams = {
  page?: number
  pageSize?: number
  username?: string
  status?: UserStatus[]
  role?: UserRole[]
}

export type CreateUserInput = {
  firstName: string
  lastName: string
  username: string
  email: string
  phoneNumber: string
  role?: UserRole
  status?: UserStatus
  password?: string
}

export type UpdateUserInput = Partial<CreateUserInput>

function toSearchParams(params: ListUsersParams) {
  const searchParams = new URLSearchParams()

  if (params.page) searchParams.set('page', String(params.page))
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize))
  if (params.username) searchParams.set('username', params.username)
  params.status?.forEach((status) => searchParams.append('status', status))
  params.role?.forEach((role) => searchParams.append('role', role))

  return searchParams
}

export async function listUsers(params: ListUsersParams): Promise<UsersList> {
  const response = await apiClient.get('/users', {
    params: toSearchParams(params),
  })

  return usersListSchema.parse(response.data)
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const response = await apiClient.post('/users', input)
  return userSchema.parse(response.data)
}

export async function updateUser(
  id: string,
  input: UpdateUserInput
): Promise<User> {
  const response = await apiClient.patch(`/users/${id}`, input)
  return userSchema.parse(response.data)
}

export async function deleteUser(id: string): Promise<{ id: string }> {
  const response = await apiClient.delete(`/users/${id}`)
  return response.data as { id: string }
}

export async function updateUsersStatus(
  ids: string[],
  status: UserStatus
): Promise<{ count: number }> {
  const response = await apiClient.patch('/users/bulk/status', { ids, status })
  return response.data as { count: number }
}

export async function deleteUsers(ids: string[]): Promise<{ count: number }> {
  const response = await apiClient.delete('/users/bulk', { data: { ids } })
  return response.data as { count: number }
}
