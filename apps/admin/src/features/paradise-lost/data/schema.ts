import { z } from 'zod'

export const paradiseLostTypeSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(5),
])
export type ParadiseLostType = z.infer<typeof paradiseLostTypeSchema>

export const paradiseLostStatusSchema = z.union([z.literal(0), z.literal(1)])
export type ParadiseLostStatus = z.infer<typeof paradiseLostStatusSchema>

const sourceFieldsSchema = z.object({
  projectName: z.string().optional().default(''),
  projectNameEn: z.string().optional().default(''),
  logo: z.string().optional().default(''),
  oneLiner: z.string().optional().default(''),
  oneLinerEn: z.string().optional().default(''),
  description: z.string().optional().default(''),
  descriptionEn: z.string().optional().default(''),
  active: z.number().optional().default(1),
  orgName: z.string().optional().default(''),
  orgNameEn: z.string().optional().default(''),
  orgLogo: z.string().optional().default(''),
  orgInfo: z.string().optional().default(''),
  orgInfoEn: z.string().optional().default(''),
  orgDescription: z.string().optional().default(''),
  orgDescriptionEn: z.string().optional().default(''),
  peopleName: z.string().optional().default(''),
  peopleNameEn: z.string().optional().default(''),
  headImg: z.string().optional().default(''),
  personsOneLiner: z.string().optional().default(''),
  personsOneLinerEn: z.string().optional().default(''),
  personsIntroduce: z.string().optional().default(''),
  personsIntroduceEn: z.string().optional().default(''),
  eventNameCn: z.string().optional().default(''),
  eventNameEn: z.string().optional().default(''),
  eventImage160: z.string().optional().default(''),
  eventTypes: z.array(z.string()).optional().default([]),
  eventNatures: z.array(z.string()).optional().default([]),
  eventSummaryCn: z.string().optional().default(''),
  eventSummaryEn: z.string().optional().default(''),
  eventIntroductionCn: z.string().optional().default(''),
  eventIntroductionEn: z.string().optional().default(''),
})

export const paradiseLostItemSchema = z
  .object({
    id: z.number(),
    investId: z.string(),
    name: z.string(),
    avatar: z.string(),
    type: paradiseLostTypeSchema,
    typeText: z.string(),
    tags: z.array(z.string()),
    tagsText: z.array(z.string()),
    tagsEn: z.string(),
    year: z.array(z.string()),
    cause: z.string(),
    causeEn: z.string(),
    date: z.string().nullable(),
    image: z.string(),
    status: paradiseLostStatusSchema,
    statusText: z.string(),
    desc: z.string(),
    createdAt: z.string().nullable(),
    updatedAt: z.string().nullable(),
    sourceMissing: z.boolean().optional().default(false),
    sourceMissingMessage: z.string().optional().default(''),
  })
  .merge(sourceFieldsSchema)

export type ParadiseLostItem = z.infer<typeof paradiseLostItemSchema>

export const paradiseLostListSchema = z.object({
  items: z.array(paradiseLostItemSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
})

export type ParadiseLostList = z.infer<typeof paradiseLostListSchema>

export const paradiseLostTagSchema = z.object({
  id: z.number(),
  tagName: z.string(),
  tagNameEn: z.string(),
  image: z.string(),
  color: z.string(),
  backgroundColor: z.string(),
  remark: z.string(),
  createTime: z.string(),
  updateTime: z.string().nullable(),
})

export type ParadiseLostTag = z.infer<typeof paradiseLostTagSchema>

export const paradiseLostTagsSchema = z.array(paradiseLostTagSchema)
export const paradiseLostYearsSchema = z.array(z.string())

export const eventOptionSchema = z.object({
  id: z.number(),
  name: z.string(),
  nameEn: z.string(),
})

export type EventOption = z.infer<typeof eventOptionSchema>
export const eventOptionsSchema = z.array(eventOptionSchema)

export const investmentOptionSchema = z
  .object({
    type: paradiseLostTypeSchema,
    id: z.string(),
    name: z.string(),
    avatar: z.string(),
  })
  .merge(sourceFieldsSchema)

export type InvestmentOption = z.infer<typeof investmentOptionSchema>

export const investmentOptionsListSchema = z.object({
  items: z.array(investmentOptionSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
})

export type InvestmentOptionsList = z.infer<typeof investmentOptionsListSchema>
