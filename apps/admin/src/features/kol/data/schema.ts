import { z } from 'zod'

export const kolPlatformSchema = z.union([
  z.literal('twitter'),
  z.literal('telegram'),
  z.literal('reddit'),
  z.literal('medium'),
])
export type KolPlatform = z.infer<typeof kolPlatformSchema>

export const kolSyncStatusSchema = z.union([
  z.literal('0'),
  z.literal('1'),
  z.literal('2'),
])
export type KolSyncStatus = z.infer<typeof kolSyncStatusSchema>

export const kolUserStatusSchema = z.union([z.literal('1'), z.literal('2')])
export type KolUserStatus = z.infer<typeof kolUserStatusSchema>

export const kolTweetStatusSchema = z.union([z.literal('0'), z.literal('1')])
export type KolTweetStatus = z.infer<typeof kolTweetStatusSchema>

export const kolUserSchema = z.object({
  restId: z.string(),
  requestedUsername: z.string(),
  username: z.string(),
  name: z.string(),
  description: z.string(),
  accountCreatedAt: z.string().nullable(),
  avatarUrl: z.string(),
  avatarS3Key: z.string(),
  avatarS3Url: z.string(),
  displayAvatarUrl: z.string(),
  profileBannerUrl: z.string(),
  location: z.string(),
  followersCount: z.number().nullable(),
  friendsCount: z.number().nullable(),
  favouritesCount: z.number().nullable(),
  statusesCount: z.number().nullable(),
  listedCount: z.number().nullable(),
  mediaCount: z.number().nullable(),
  isProtected: z.boolean().nullable(),
  isBlueVerified: z.boolean().nullable(),
  isVerified: z.boolean().nullable(),
  syncedAt: z.string().nullable(),
  platform: kolPlatformSchema,
  syncStatus: kolSyncStatusSchema,
  status: kolUserStatusSchema,
  linkUrl: z.string(),
  displayLinkUrl: z.string(),
  keywords: z.string(),
  remark: z.string(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
})
export type KolUser = z.infer<typeof kolUserSchema>

export const kolUsersListSchema = z.object({
  items: z.array(kolUserSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
})
export type KolUsersList = z.infer<typeof kolUsersListSchema>

export const kolTweetSchema = z.object({
  tweetRestId: z.string(),
  authorRestId: z.string(),
  authorUsername: z.string(),
  authorName: z.string(),
  authorAvatarUrl: z.string(),
  tweetCreatedAt: z.string().nullable(),
  fullText: z.string(),
  lang: z.string(),
  conversationId: z.string(),
  replyToTweetId: z.string(),
  replyToUsername: z.string(),
  quotedTweetId: z.string(),
  retweetedTweetId: z.string(),
  articleRestId: z.string(),
  isReply: z.union([z.literal(0), z.literal(1)]),
  isQuote: z.boolean(),
  isRetweet: z.boolean(),
  hasArticle: z.boolean(),
  hasNoteTweet: z.boolean(),
  favoriteCount: z.number().nullable(),
  replyCount: z.number().nullable(),
  retweetCount: z.number().nullable(),
  quoteCount: z.number().nullable(),
  viewCount: z.number().nullable(),
  bookmarkCount: z.number().nullable(),
  syncedAt: z.string().nullable(),
  platform: kolPlatformSchema,
  status: kolTweetStatusSchema,
  originalUrl: z.string(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
})
export type KolTweet = z.infer<typeof kolTweetSchema>

export const kolTweetsListSchema = z.object({
  items: z.array(kolTweetSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
})
export type KolTweetsList = z.infer<typeof kolTweetsListSchema>
