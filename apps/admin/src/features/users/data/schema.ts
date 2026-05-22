import { z } from 'zod'

export const userStatusSchema = z.union([
  z.literal('normal'),
  z.literal('hidden'),
])
export type UserStatus = z.infer<typeof userStatusSchema>

export const userGroupSchema = z.object({
  id: z.number(),
  name: z.string(),
  status: userStatusSchema,
})
export type UserGroup = z.infer<typeof userGroupSchema>

export const userSchema = z.object({
  id: z.number(),
  groupId: z.number(),
  groupName: z.string(),
  username: z.string(),
  nickname: z.string(),
  email: z.string(),
  mobile: z.string(),
  avatar: z.string(),
  level: z.number(),
  gender: z.number(),
  birthday: z.string().nullable(),
  bio: z.string(),
  money: z.string(),
  score: z.number(),
  successions: z.number(),
  maxSuccessions: z.number(),
  prevTime: z.number().nullable(),
  loginTime: z.number().nullable(),
  loginIp: z.string(),
  loginFailure: z.number(),
  loginFailureTime: z.number().nullable(),
  joinIp: z.string(),
  joinTime: z.number().nullable(),
  createTime: z.number().nullable(),
  updateTime: z.number().nullable(),
  status: userStatusSchema,
})

export const usersListSchema = z.object({
  items: z.array(userSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
})

export const userGroupsSchema = z.array(userGroupSchema)

export type User = z.infer<typeof userSchema>
export type UsersList = z.infer<typeof usersListSchema>
