import { z } from 'zod'
import { apiClient } from '@/lib/api-client'

const authUserSchema = z.object({
  id: z.number(),
  username: z.string(),
  nickname: z.string(),
  email: z.string(),
  mobile: z.string(),
  avatar: z.string(),
  status: z.string(),
  role: z.array(z.string()),
})

const authSessionSchema = z.object({
  token: z.string(),
  user: authUserSchema,
})

const currentUserResponseSchema = z.object({
  user: authUserSchema,
})

export type AuthSession = z.infer<typeof authSessionSchema>

export type LoginInput = {
  account: string
  password: string
}

export async function login(input: LoginInput): Promise<AuthSession> {
  const response = await apiClient.post('/auth/login', input)
  return authSessionSchema.parse(response.data)
}

export async function getCurrentSession() {
  const response = await apiClient.get('/auth/me')
  return currentUserResponseSchema.parse(response.data)
}

export async function logoutSession() {
  await apiClient.post('/auth/logout')
}
