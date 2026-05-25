import { apiClient } from '@/lib/api-client'
import {
  fundingRoundSchema,
  jobChangeSchema,
  projectContractSchema,
  projectEventSchema,
  projectReportSchema,
  rootdataListSchema,
  rootdataOptionSchema,
  rootdataOrganizationSchema,
  rootdataPersonSchema,
  rootdataProjectSchema,
  teamMemberSchema,
  type FundingRound,
  type JobChange,
  type ProjectContract,
  type ProjectEvent,
  type ProjectReport,
  type RootdataEntityType,
  type RootdataOrganization,
  type RootdataOption,
  type RootdataPerson,
  type RootdataProject,
  type RootdataStatus,
  type TeamMember,
} from '../data/schema'

export type ListRootdataParams = {
  page?: number
  pageSize?: number
  q?: string
  status?: RootdataStatus[]
  active?: RootdataStatus[]
  isHot?: RootdataStatus[]
  isShow?: RootdataStatus[]
}

export type RootdataList<T> = {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export type ProjectInput = {
  projectName: string
  projectNameEn: string
  logo?: string
  tokenSymbol?: string
  establishmentDate?: string
  oneLiner?: string
  oneLinerEn?: string
  description?: string
  descriptionEn?: string
  active?: RootdataStatus
  totalFunding?: number
  tags?: string[]
  ecosystem?: string[]
  onMainNet?: string[]
  planToLaunch?: string[]
  onTestNet?: string[]
  supportExchanges?: string[]
  socialMedia?: Record<string, string>
  isHot?: RootdataStatus
  isShow?: RootdataStatus
}

export type PersonInput = {
  peopleName: string
  peopleNameEn: string
  headImg?: string
  oneLiner?: string
  oneLinerEn?: string
  introduce?: string
  introduceEn?: string
  xLink?: string
  linkedin?: string
  blogLink?: string
  heat?: string
  heatRank?: number
  influence?: string
  influenceRank?: number
  followers?: number
  following?: number
  status?: RootdataStatus
}

export type OrganizationInput = {
  orgName: string
  orgNameEn: string
  logo?: string
  orgInfo?: string
  orgInfoEn?: string
  description?: string
  descriptionEn?: string
  active?: RootdataStatus
  category?: string
  establishmentDate?: string
  region?: string
  xLink?: string
  linkedin?: string
  blogLink?: string
  heat?: string
  heatRank?: number
  influence?: string
  influenceRank?: number
  followers?: number
  following?: number
  status?: RootdataStatus
}

export type EventInput = {
  hapDate?: string
  event: string
  eventEn?: string
}

export type ReportInput = {
  title: string
  titleEn?: string
  url?: string
  site: string
  timeEast?: string
  status?: RootdataStatus
}

export type ContractInput = {
  contractPlatform: string
  contractAddress: string
}

export type TeamMemberInput = {
  personId: string
  position?: string
  positionEn?: string
  type?: number
  entryTime?: string
  leaveTime?: string
  coreMember?: RootdataStatus
}

export type JobChangeInput = {
  type: number
  companyType: 1 | 2
  companyId: string
  position?: string
  positionEn?: string
  entryTime?: string
  leaveTime?: string
  coreMember?: RootdataStatus
}

export type FundingRoundInput = {
  projectId: string
  roundName: string
  publishedTime?: string
  amount?: number
  valuation?: number
  sourceFrom?: string
  investors?: Array<{
    entityType: RootdataEntityType
    entityId: string
    leadInvestor?: RootdataStatus
  }>
}

function toSearchParams(params: ListRootdataParams) {
  const searchParams = new URLSearchParams()

  if (params.page) searchParams.set('page', String(params.page))
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize))
  if (params.q) searchParams.set('q', params.q)
  params.status?.forEach((item) => searchParams.append('status', String(item)))
  params.active?.forEach((item) => searchParams.append('active', String(item)))
  params.isHot?.forEach((item) => searchParams.append('isHot', String(item)))
  params.isShow?.forEach((item) => searchParams.append('isShow', String(item)))

  return searchParams
}

export async function listProjects(
  params: ListRootdataParams
): Promise<RootdataList<RootdataProject>> {
  const response = await apiClient.get('/rootdata/projects', {
    params: toSearchParams(params),
  })
  return rootdataListSchema(rootdataProjectSchema).parse(response.data)
}

export async function createProject(input: ProjectInput) {
  const response = await apiClient.post('/rootdata/projects', input)
  return rootdataProjectSchema.parse(response.data)
}

export async function updateProject(id: number, input: ProjectInput) {
  const response = await apiClient.patch(`/rootdata/projects/${id}`, input)
  return rootdataProjectSchema.parse(response.data)
}

export async function deleteProject(id: number) {
  const response = await apiClient.delete(`/rootdata/projects/${id}`)
  return response.data as { id: number }
}

export async function deleteProjects(ids: number[]) {
  const response = await apiClient.delete('/rootdata/projects/bulk', {
    data: { ids },
  })
  return response.data as { count: number }
}

export async function updateProjectStatus(
  ids: number[],
  field: 'isHot' | 'isShow',
  value: RootdataStatus
) {
  const response = await apiClient.patch('/rootdata/projects/bulk/status', {
    ids,
    field,
    value,
  })
  return response.data as { count: number }
}

export async function listPersons(
  params: ListRootdataParams
): Promise<RootdataList<RootdataPerson>> {
  const response = await apiClient.get('/rootdata/persons', {
    params: toSearchParams(params),
  })
  return rootdataListSchema(rootdataPersonSchema).parse(response.data)
}

export async function createPerson(input: PersonInput) {
  const response = await apiClient.post('/rootdata/persons', input)
  return rootdataPersonSchema.parse(response.data)
}

export async function updatePerson(id: string, input: PersonInput) {
  const response = await apiClient.patch(`/rootdata/persons/${id}`, input)
  return rootdataPersonSchema.parse(response.data)
}

export async function deletePerson(id: string) {
  const response = await apiClient.delete(`/rootdata/persons/${id}`)
  return response.data as { id: string }
}

export async function deletePersons(ids: string[]) {
  const response = await apiClient.delete('/rootdata/persons/bulk', {
    data: { ids },
  })
  return response.data as { count: number }
}

export async function listOrganizations(
  params: ListRootdataParams
): Promise<RootdataList<RootdataOrganization>> {
  const response = await apiClient.get('/rootdata/organizations', {
    params: toSearchParams(params),
  })
  return rootdataListSchema(rootdataOrganizationSchema).parse(response.data)
}

export async function createOrganization(input: OrganizationInput) {
  const response = await apiClient.post('/rootdata/organizations', input)
  return rootdataOrganizationSchema.parse(response.data)
}

export async function updateOrganization(id: number, input: OrganizationInput) {
  const response = await apiClient.patch(`/rootdata/organizations/${id}`, input)
  return rootdataOrganizationSchema.parse(response.data)
}

export async function deleteOrganization(id: number) {
  const response = await apiClient.delete(`/rootdata/organizations/${id}`)
  return response.data as { id: number }
}

export async function deleteOrganizations(ids: number[]) {
  const response = await apiClient.delete('/rootdata/organizations/bulk', {
    data: { ids },
  })
  return response.data as { count: number }
}

export async function updateOrganizationStatus(
  ids: number[],
  status: RootdataStatus
) {
  const response = await apiClient.patch(
    '/rootdata/organizations/bulk/status',
    {
      ids,
      status,
    }
  )
  return response.data as { count: number }
}

export async function updatePersonStatus(
  ids: string[],
  status: RootdataStatus
) {
  const response = await apiClient.patch('/rootdata/persons/bulk/status', {
    ids,
    status,
  })
  return response.data as { count: number }
}

export async function listProjectEvents(id: number): Promise<ProjectEvent[]> {
  const response = await apiClient.get(`/rootdata/projects/${id}/events`)
  return projectEventSchema.array().parse(response.data)
}

export async function saveProjectEvent(
  projectId: number,
  input: EventInput,
  index?: number
) {
  const url =
    index === undefined
      ? `/rootdata/projects/${projectId}/events`
      : `/rootdata/projects/${projectId}/events/${index}`
  const response =
    index === undefined
      ? await apiClient.post(url, input)
      : await apiClient.patch(url, input)
  return projectEventSchema.array().parse(response.data)
}

export async function deleteProjectEvent(projectId: number, index: number) {
  const response = await apiClient.delete(
    `/rootdata/projects/${projectId}/events/${index}`
  )
  return response.data as { index: number }
}

export async function listProjectReports(id: number): Promise<ProjectReport[]> {
  const response = await apiClient.get(`/rootdata/projects/${id}/reports`)
  return projectReportSchema.array().parse(response.data)
}

export async function saveProjectReport(
  projectId: number,
  input: ReportInput,
  index?: number
) {
  const url =
    index === undefined
      ? `/rootdata/projects/${projectId}/reports`
      : `/rootdata/projects/${projectId}/reports/${index}`
  const response =
    index === undefined
      ? await apiClient.post(url, input)
      : await apiClient.patch(url, input)
  return projectReportSchema.array().parse(response.data)
}

export async function deleteProjectReport(projectId: number, index: number) {
  const response = await apiClient.delete(
    `/rootdata/projects/${projectId}/reports/${index}`
  )
  return response.data as { index: number }
}

export async function listProjectContracts(
  id: number
): Promise<ProjectContract[]> {
  const response = await apiClient.get(`/rootdata/projects/${id}/contracts`)
  return projectContractSchema.array().parse(response.data)
}

export async function saveProjectContract(
  projectId: number,
  input: ContractInput,
  index?: number
) {
  const url =
    index === undefined
      ? `/rootdata/projects/${projectId}/contracts`
      : `/rootdata/projects/${projectId}/contracts/${index}`
  const response =
    index === undefined
      ? await apiClient.post(url, input)
      : await apiClient.patch(url, input)
  return projectContractSchema.array().parse(response.data)
}

export async function deleteProjectContract(projectId: number, index: number) {
  const response = await apiClient.delete(
    `/rootdata/projects/${projectId}/contracts/${index}`
  )
  return response.data as { index: number }
}

export async function listTeamMembers(
  entity: 'projects' | 'organizations',
  id: number
): Promise<TeamMember[]> {
  const response = await apiClient.get(`/rootdata/${entity}/${id}/members`)
  return teamMemberSchema.array().parse(response.data)
}

export async function saveTeamMember(
  entity: 'projects' | 'organizations',
  id: number,
  input: TeamMemberInput,
  currentPersonId?: string
) {
  const url =
    currentPersonId === undefined
      ? `/rootdata/${entity}/${id}/members`
      : `/rootdata/${entity}/${id}/members/${currentPersonId}`
  const response =
    currentPersonId === undefined
      ? await apiClient.post(url, input)
      : await apiClient.patch(url, input)
  return teamMemberSchema.array().parse(response.data)
}

export async function deleteTeamMember(
  entity: 'projects' | 'organizations',
  id: number,
  personId: string
) {
  const response = await apiClient.delete(
    `/rootdata/${entity}/${id}/members/${personId}`
  )
  return response.data as { id: string }
}

export async function listPersonJobChanges(
  personId: string
): Promise<JobChange[]> {
  const response = await apiClient.get(
    `/rootdata/persons/${personId}/job-changes`
  )
  return jobChangeSchema.array().parse(response.data)
}

export async function savePersonJobChange(
  personId: string,
  input: JobChangeInput,
  id?: number
) {
  const url =
    id === undefined
      ? `/rootdata/persons/${personId}/job-changes`
      : `/rootdata/persons/${personId}/job-changes/${id}`
  const response =
    id === undefined
      ? await apiClient.post(url, input)
      : await apiClient.patch(url, input)
  return jobChangeSchema.array().parse(response.data)
}

export async function deletePersonJobChange(personId: string, id: number) {
  const response = await apiClient.delete(
    `/rootdata/persons/${personId}/job-changes/${id}`
  )
  return response.data as { id: number }
}

export async function listProjectFundingRounds(
  projectAutoId: number
): Promise<FundingRound[]> {
  const response = await apiClient.get(
    `/rootdata/projects/${projectAutoId}/funding-rounds`
  )
  return fundingRoundSchema.array().parse(response.data)
}

export async function listFundingRounds(
  entityType: RootdataEntityType,
  entityId: string
): Promise<FundingRound[]> {
  const response = await apiClient.get('/rootdata/funding-rounds', {
    params: { entityType, entityId },
  })
  return fundingRoundSchema.array().parse(response.data)
}

export async function saveFundingRound(input: FundingRoundInput, id?: number) {
  const response =
    id === undefined
      ? await apiClient.post('/rootdata/funding-rounds', input)
      : await apiClient.patch(`/rootdata/funding-rounds/${id}`, input)
  return fundingRoundSchema.parse(response.data)
}

export async function deleteFundingRound(id: number) {
  const response = await apiClient.delete(`/rootdata/funding-rounds/${id}`)
  return response.data as { id: number }
}

export async function listOptions(
  kind: 'tags' | 'ecosystems' | 'platforms' | 'exchanges' | 'coins',
  q = '',
  limit = 20
): Promise<RootdataOption[]> {
  const response = await apiClient.get(`/rootdata/options/${kind}`, {
    params: { q, limit },
  })
  return rootdataOptionSchema.array().parse(response.data)
}

export async function listEntityOptions(
  entityType: RootdataEntityType,
  q = '',
  limit = 20
): Promise<RootdataOption[]> {
  const response = await apiClient.get(
    `/rootdata/options/entities/${entityType}`,
    { params: { q, limit } }
  )
  return rootdataOptionSchema.array().parse(response.data)
}

export async function listFundingRoundNames(): Promise<string[]> {
  const response = await apiClient.get('/rootdata/options/funding-rounds')
  return zStringArray(response.data)
}

function zStringArray(value: unknown) {
  return value instanceof Array ? value.map(String) : []
}
