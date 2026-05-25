import { z } from 'zod'

export const appColumnStatusSchema = z.union([z.literal('1'), z.literal('0')])
export type AppColumnStatus = z.infer<typeof appColumnStatusSchema>

export const appAdTypeSchema = z.union([
  z.literal('1'),
  z.literal('2'),
  z.literal('3'),
])
export type AppAdType = z.infer<typeof appAdTypeSchema>

export const appAdStatusSchema = z.union([z.literal(1), z.literal(0)])
export type AppAdStatus = z.infer<typeof appAdStatusSchema>

export const appAdPositionCodeSchema = z.union([
  z.literal('top_banner'),
  z.literal('right_card'),
])
export type AppAdPositionCode = z.infer<typeof appAdPositionCodeSchema>

export const appAdPageCodeSchema = z.union([
  z.literal('market'),
  z.literal('ecology'),
  z.literal('alpha'),
  z.literal('paradise_lost'),
  z.literal('dex_scan'),
  z.literal('information'),
  z.literal('flash_news'),
  z.literal('calendar'),
  z.literal('data'),
  z.literal('exchange'),
  z.literal('wallet'),
  z.literal('crypto_detail'),
  z.literal('token_detail'),
  z.literal('project_detail'),
  z.literal('person_detail'),
  z.literal('institution_detail'),
  z.literal('info_detail'),
  z.literal('flash_news_detail'),
  z.literal('exchange_detail'),
  z.literal('wallet_detail'),
  z.literal('rating'),
])
export type AppAdPageCode = z.infer<typeof appAdPageCodeSchema>

export const appColumnSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
  nameEn: z.string(),
  level: z.number(),
  levelText: z.string(),
  pid: z.number(),
  parentName: z.string(),
  status: appColumnStatusSchema,
  statusText: z.string(),
  remarks: z.string(),
  weigh: z.number(),
  createTime: z.string(),
  updateTime: z.string().nullable(),
  hasChildren: z.boolean(),
  depth: z.number(),
})
export type AppColumn = z.infer<typeof appColumnSchema>

export const appColumnsListSchema = z.object({
  items: z.array(appColumnSchema),
  total: z.number(),
})
export type AppColumnsList = z.infer<typeof appColumnsListSchema>

export const appColumnParentSchema = z.object({
  id: z.number(),
  name: z.string(),
  nameEn: z.string(),
  code: z.string(),
  status: appColumnStatusSchema,
})
export type AppColumnParent = z.infer<typeof appColumnParentSchema>

export const appAdSchema = z.object({
  adId: z.number(),
  adName: z.string(),
  adPositionCode: appAdPositionCodeSchema,
  adPositionCodeText: z.string(),
  adPageCode: appAdPageCodeSchema,
  adPageCodeText: z.string(),
  adPositionText: z.string(),
  adImageCh: z.string(),
  adImageEn: z.string(),
  adLink: z.string(),
  adType: appAdTypeSchema,
  adTypeText: z.string(),
  adEffectiveTime: z.string().nullable(),
  adInvalidTime: z.string().nullable(),
  weigh: z.number(),
  status: appAdStatusSchema,
  statusText: z.string(),
  createTime: z.string(),
  updateTime: z.string().nullable(),
})
export type AppAd = z.infer<typeof appAdSchema>

export const appAdsListSchema = z.object({
  items: z.array(appAdSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
})
export type AppAdsList = z.infer<typeof appAdsListSchema>

const metaStringOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
})

const metaNumberOptionSchema = z.object({
  value: z.number(),
  label: z.string(),
})

export const appMetaSchema = z.object({
  adPositions: z.array(metaStringOptionSchema),
  adPages: z.array(metaStringOptionSchema),
  adTypes: z.array(metaStringOptionSchema),
  adStatuses: z.array(metaNumberOptionSchema),
  columnStatuses: z.array(metaStringOptionSchema),
})
export type AppMeta = z.infer<typeof appMetaSchema>
