import { z } from 'zod'

export const rootdataStatusSchema = z.union([z.literal(0), z.literal(1)])
export type RootdataStatus = z.infer<typeof rootdataStatusSchema>

export const rootdataEntityTypeSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
])
export type RootdataEntityType = z.infer<typeof rootdataEntityTypeSchema>

export const rootdataOptionSchema = z.object({
  id: z.string(),
  value: z.string().optional(),
  autoId: z.number().optional(),
  name: z.string(),
  nameEn: z.string().optional().default(''),
})
export type RootdataOption = z.infer<typeof rootdataOptionSchema>

export const projectEventSchema = z.object({
  id: z.string(),
  index: z.number(),
  hapDate: z.string(),
  event: z.string(),
  eventEn: z.string(),
})
export type ProjectEvent = z.infer<typeof projectEventSchema>

export const projectReportSchema = z.object({
  id: z.string(),
  index: z.number(),
  title: z.string(),
  titleEn: z.string(),
  url: z.string(),
  site: z.string(),
  timeEast: z.string(),
  status: rootdataStatusSchema,
})
export type ProjectReport = z.infer<typeof projectReportSchema>

export const projectContractSchema = z.object({
  id: z.string(),
  index: z.number(),
  contractPlatform: z.string(),
  contractAddress: z.string(),
})
export type ProjectContract = z.infer<typeof projectContractSchema>

export const teamMemberSchema = z.object({
  personId: z.string(),
  headImg: z.string(),
  name: z.string(),
  x: z.string(),
  position: z.string(),
  positionEn: z.string(),
  linkedin: z.string(),
  entryTime: z.string(),
  leaveTime: z.string(),
  coreMember: z.number(),
  type: z.number(),
  peopleName: z.string().optional(),
  peopleNameEn: z.string().optional(),
  jobChange: z
    .object({
      id: z.number(),
      type: z.number(),
      position: z.string(),
      positionEn: z.string(),
      entryTime: z.string(),
      leaveTime: z.string(),
      coreMember: z.number(),
    })
    .nullable()
    .optional(),
})
export type TeamMember = z.infer<typeof teamMemberSchema>

export const fundingInvestorSchema = z.object({
  entityType: z.number(),
  entityId: z.string(),
  name: z.string(),
  logo: z.string(),
  leadInvestor: z.number(),
})
export type FundingInvestor = z.infer<typeof fundingInvestorSchema>

export const fundingRoundSchema = z.object({
  id: z.number(),
  projectId: z.string(),
  projectName: z.string(),
  logo: z.string(),
  roundName: z.string(),
  publishedTime: z.string().nullable(),
  amount: z.string(),
  valuation: z.string(),
  sourceFrom: z.string(),
  investors: z.array(fundingInvestorSchema),
  leadInvestor: z.number(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
})
export type FundingRound = z.infer<typeof fundingRoundSchema>

export const jobChangeSchema = z.object({
  id: z.number(),
  peopleId: z.string(),
  type: z.number(),
  companyType: z.number(),
  companyId: z.string(),
  headImg: z.string(),
  peopleName: z.string(),
  company: z.string(),
  position: z.string(),
  positionEn: z.string(),
  entryTime: z.string(),
  leaveTime: z.string(),
  coreMember: z.number(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
})
export type JobChange = z.infer<typeof jobChangeSchema>

export const rootdataProjectSchema = z.object({
  autoId: z.number(),
  projectId: z.string(),
  projectName: z.string(),
  projectNameEn: z.string(),
  logo: z.string(),
  tokenSymbol: z.string(),
  establishmentDate: z.string(),
  oneLiner: z.string(),
  oneLinerEn: z.string(),
  description: z.string(),
  descriptionEn: z.string(),
  active: rootdataStatusSchema,
  totalFunding: z.string(),
  tags: z.array(z.string()),
  ecosystem: z.array(z.string()),
  onMainNet: z.array(z.string()),
  planToLaunch: z.array(z.string()),
  onTestNet: z.array(z.string()),
  supportExchanges: z.array(z.string()),
  socialMedia: z.record(z.string(), z.string()),
  events: z.array(projectEventSchema),
  reports: z.array(projectReportSchema),
  teamMembers: z.array(teamMemberSchema),
  contracts: z.array(projectContractSchema),
  heat: z.string(),
  heatRank: z.number().nullable(),
  influence: z.string(),
  influenceRank: z.number().nullable(),
  followers: z.number().nullable(),
  following: z.number().nullable(),
  isHot: rootdataStatusSchema,
  isShow: rootdataStatusSchema,
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
})
export type RootdataProject = z.infer<typeof rootdataProjectSchema>

export const rootdataPersonSchema = z.object({
  id: z.string(),
  peopleName: z.string(),
  peopleNameEn: z.string(),
  introduce: z.string(),
  introduceEn: z.string(),
  headImg: z.string(),
  oneLiner: z.string(),
  oneLinerEn: z.string(),
  xLink: z.string(),
  linkedin: z.string(),
  blogLink: z.string(),
  heat: z.string(),
  heatRank: z.number().nullable(),
  influence: z.string(),
  influenceRank: z.number().nullable(),
  followers: z.number().nullable(),
  following: z.number().nullable(),
  status: rootdataStatusSchema,
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
})
export type RootdataPerson = z.infer<typeof rootdataPersonSchema>

export const rootdataOrganizationSchema = z.object({
  autoId: z.number(),
  orgId: z.number(),
  orgName: z.string(),
  orgNameEn: z.string(),
  logo: z.string(),
  establishmentDate: z.string(),
  orgInfo: z.string(),
  orgInfoEn: z.string(),
  description: z.string(),
  descriptionEn: z.string(),
  active: rootdataStatusSchema,
  category: z.string(),
  socialMedia: z.record(z.string(), z.unknown()),
  teamMembers: z.array(teamMemberSchema),
  heat: z.string(),
  heatRank: z.number().nullable(),
  influence: z.string(),
  influenceRank: z.number().nullable(),
  followers: z.number().nullable(),
  following: z.number().nullable(),
  region: z.string(),
  xLink: z.string(),
  linkedin: z.string(),
  blogLink: z.string(),
  status: rootdataStatusSchema,
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
})
export type RootdataOrganization = z.infer<typeof rootdataOrganizationSchema>

export function rootdataListSchema<T extends z.ZodType>(item: T) {
  return z.object({
    items: z.array(item),
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
  })
}
