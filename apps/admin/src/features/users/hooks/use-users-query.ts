import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createUser,
  deleteUser,
  deleteUsers,
  listUsers,
  updateUser,
  updateUsersStatus,
  type CreateUserInput,
  type ListUsersParams,
  type UpdateUserInput,
} from '../api/users-api'
import type { UserRole, UserStatus } from '../data/schema'

type UsersSearch = Record<string, unknown>

export const usersQueryKeys = {
  all: ['users'] as const,
  lists: () => [...usersQueryKeys.all, 'list'] as const,
  list: (params: ListUsersParams) =>
    [...usersQueryKeys.lists(), params] as const,
}

function toStringArray<T extends string>(value: unknown): T[] {
  return Array.isArray(value) ? (value.filter(Boolean) as T[]) : []
}

export function toListUsersParams(search: UsersSearch): ListUsersParams {
  return {
    page: typeof search.page === 'number' ? search.page : 1,
    pageSize: typeof search.pageSize === 'number' ? search.pageSize : 10,
    username: typeof search.username === 'string' ? search.username : undefined,
    status: toStringArray<UserStatus>(search.status),
    role: toStringArray<UserRole>(search.role),
  }
}

export function useUsersQuery(search: UsersSearch) {
  const params = toListUsersParams(search)

  return useQuery({
    queryKey: usersQueryKeys.list(params),
    queryFn: () => listUsers(params),
  })
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateUserInput) => createUser(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: usersQueryKeys.all })
      toast.success('User created.')
    },
  })
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserInput }) =>
      updateUser(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: usersQueryKeys.all })
      toast.success('User updated.')
    },
  })
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: usersQueryKeys.all })
      toast.success('User deleted.')
    },
  })
}

export function useUpdateUsersStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ ids, status }: { ids: string[]; status: UserStatus }) =>
      updateUsersStatus(ids, status),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: usersQueryKeys.all })
      toast.success(
        `${variables.status === 'active' ? 'Activated' : 'Updated'} ${variables.ids.length} user${variables.ids.length > 1 ? 's' : ''}.`
      )
    },
  })
}

export function useDeleteUsersMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => deleteUsers(ids),
    onSuccess: async (_data, ids) => {
      await queryClient.invalidateQueries({ queryKey: usersQueryKeys.all })
      toast.success(`Deleted ${ids.length} user${ids.length > 1 ? 's' : ''}.`)
    },
  })
}
