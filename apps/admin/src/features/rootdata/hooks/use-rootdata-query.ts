import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  createOrganization,
  createPerson,
  createProject,
  deleteFundingRound,
  deleteOrganization,
  deleteOrganizations,
  deletePerson,
  deletePersons,
  deletePersonJobChange,
  deleteProject,
  deleteProjectContract,
  deleteProjectEvent,
  deleteProjects,
  deleteProjectReport,
  deleteTeamMember,
  listEntityOptions,
  listFundingRoundNames,
  listFundingRounds,
  listOptions,
  listOrganizations,
  listPersonJobChanges,
  listPersons,
  listProjectContracts,
  listProjectEvents,
  listProjectFundingRounds,
  listProjectReports,
  listProjects,
  listTeamMembers,
  saveFundingRound,
  savePersonJobChange,
  saveProjectContract,
  saveProjectEvent,
  saveProjectReport,
  saveTeamMember,
  updateOrganization,
  updateOrganizationStatus,
  updatePerson,
  updatePersonStatus,
  updateProject,
  updateProjectStatus,
  type ContractInput,
  type EventInput,
  type FundingRoundInput,
  type JobChangeInput,
  type ListRootdataParams,
  type OrganizationInput,
  type PersonInput,
  type ProjectInput,
  type ReportInput,
  type TeamMemberInput,
} from '../api/rootdata-api'
import type { RootdataEntityType, RootdataStatus } from '../data/schema'

type RootdataSearch = Record<string, unknown>

export const rootdataQueryKeys = {
  all: ['rootdata'] as const,
  projects: (params: ListRootdataParams) =>
    [...rootdataQueryKeys.all, 'projects', params] as const,
  persons: (params: ListRootdataParams) =>
    [...rootdataQueryKeys.all, 'persons', params] as const,
  organizations: (params: ListRootdataParams) =>
    [...rootdataQueryKeys.all, 'organizations', params] as const,
  projectEvents: (id: number) =>
    [...rootdataQueryKeys.all, 'project-events', id] as const,
  projectReports: (id: number) =>
    [...rootdataQueryKeys.all, 'project-reports', id] as const,
  projectContracts: (id: number) =>
    [...rootdataQueryKeys.all, 'project-contracts', id] as const,
  teamMembers: (entity: 'projects' | 'organizations', id: number) =>
    [...rootdataQueryKeys.all, 'team-members', entity, id] as const,
  personJobChanges: (personId: string) =>
    [...rootdataQueryKeys.all, 'person-job-changes', personId] as const,
  projectFundingRounds: (id: number) =>
    [...rootdataQueryKeys.all, 'project-funding-rounds', id] as const,
  fundingRounds: (entityType: RootdataEntityType, entityId: string) =>
    [...rootdataQueryKeys.all, 'funding-rounds', entityType, entityId] as const,
  options: (kind: string, q: string) =>
    [...rootdataQueryKeys.all, 'options', kind, q] as const,
  entityOptions: (entityType: RootdataEntityType, q: string) =>
    [...rootdataQueryKeys.all, 'entity-options', entityType, q] as const,
  fundingRoundNames: () =>
    [...rootdataQueryKeys.all, 'funding-round-names'] as const,
}

function toNumberArray(value: unknown): RootdataStatus[] {
  return Array.isArray(value)
    ? value.map(Number).filter((item) => item === 0 || item === 1)
    : []
}

export function toListRootdataParams(
  search: RootdataSearch
): ListRootdataParams {
  return {
    page: typeof search.page === 'number' ? search.page : 1,
    pageSize: typeof search.pageSize === 'number' ? search.pageSize : 10,
    q: typeof search.q === 'string' ? search.q : undefined,
    status: toNumberArray(search.status),
    active: toNumberArray(search.active),
    isHot: toNumberArray(search.isHot),
    isShow: toNumberArray(search.isShow),
  }
}

export function useProjectsQuery(search: RootdataSearch) {
  const params = toListRootdataParams(search)

  return useQuery({
    queryKey: rootdataQueryKeys.projects(params),
    queryFn: () => listProjects(params),
  })
}

export function usePersonsQuery(search: RootdataSearch) {
  const params = toListRootdataParams(search)

  return useQuery({
    queryKey: rootdataQueryKeys.persons(params),
    queryFn: () => listPersons(params),
  })
}

export function useOrganizationsQuery(search: RootdataSearch) {
  const params = toListRootdataParams(search)

  return useQuery({
    queryKey: rootdataQueryKeys.organizations(params),
    queryFn: () => listOrganizations(params),
  })
}

export function useProjectEventsQuery(projectId?: number) {
  return useQuery({
    queryKey: rootdataQueryKeys.projectEvents(projectId ?? 0),
    queryFn: () => listProjectEvents(projectId ?? 0),
    enabled: projectId !== undefined,
  })
}

export function useProjectReportsQuery(projectId?: number) {
  return useQuery({
    queryKey: rootdataQueryKeys.projectReports(projectId ?? 0),
    queryFn: () => listProjectReports(projectId ?? 0),
    enabled: projectId !== undefined,
  })
}

export function useProjectContractsQuery(projectId?: number) {
  return useQuery({
    queryKey: rootdataQueryKeys.projectContracts(projectId ?? 0),
    queryFn: () => listProjectContracts(projectId ?? 0),
    enabled: projectId !== undefined,
  })
}

export function useTeamMembersQuery(
  entity: 'projects' | 'organizations',
  id?: number
) {
  return useQuery({
    queryKey: rootdataQueryKeys.teamMembers(entity, id ?? 0),
    queryFn: () => listTeamMembers(entity, id ?? 0),
    enabled: id !== undefined,
  })
}

export function usePersonJobChangesQuery(personId?: string) {
  return useQuery({
    queryKey: rootdataQueryKeys.personJobChanges(personId ?? ''),
    queryFn: () => listPersonJobChanges(personId ?? ''),
    enabled: personId !== undefined,
  })
}

export function useProjectFundingRoundsQuery(projectId?: number) {
  return useQuery({
    queryKey: rootdataQueryKeys.projectFundingRounds(projectId ?? 0),
    queryFn: () => listProjectFundingRounds(projectId ?? 0),
    enabled: projectId !== undefined,
  })
}

export function useFundingRoundsQuery(
  entityType: RootdataEntityType,
  entityId?: string
) {
  return useQuery({
    queryKey: rootdataQueryKeys.fundingRounds(entityType, entityId ?? ''),
    queryFn: () => listFundingRounds(entityType, entityId ?? ''),
    enabled: entityId !== undefined,
  })
}

export function useRootdataOptionsQuery(kind: string, q: string) {
  return useQuery({
    queryKey: rootdataQueryKeys.options(kind, q),
    queryFn: () =>
      listOptions(
        kind as 'tags' | 'ecosystems' | 'platforms' | 'exchanges' | 'coins',
        q
      ),
  })
}

export function useEntityOptionsQuery(
  entityType: RootdataEntityType,
  q: string
) {
  return useQuery({
    queryKey: rootdataQueryKeys.entityOptions(entityType, q),
    queryFn: () => listEntityOptions(entityType, q),
  })
}

export function useFundingRoundNamesQuery() {
  return useQuery({
    queryKey: rootdataQueryKeys.fundingRoundNames(),
    queryFn: listFundingRoundNames,
  })
}

function useInvalidateRootdata() {
  const queryClient = useQueryClient()

  return () =>
    queryClient.invalidateQueries({ queryKey: rootdataQueryKeys.all })
}

export function useSaveProjectMutation(currentId?: number) {
  const invalidate = useInvalidateRootdata()

  return useMutation({
    mutationFn: (input: ProjectInput) =>
      currentId === undefined
        ? createProject(input)
        : updateProject(currentId, input),
    onSuccess: async () => {
      await invalidate()
      toast.success(currentId === undefined ? '项目已创建。' : '项目已更新。')
    },
  })
}

export function useDeleteProjectMutation() {
  const invalidate = useInvalidateRootdata()

  return useMutation({
    mutationFn: (id: number) => deleteProject(id),
    onSuccess: async () => {
      await invalidate()
      toast.success('项目已删除。')
    },
  })
}

export function useDeleteProjectsMutation() {
  const invalidate = useInvalidateRootdata()

  return useMutation({
    mutationFn: (ids: number[]) => deleteProjects(ids),
    onSuccess: async () => {
      await invalidate()
      toast.success('项目已批量删除。')
    },
  })
}

export function useProjectStatusMutation() {
  const invalidate = useInvalidateRootdata()

  return useMutation({
    mutationFn: (input: {
      ids: number[]
      field: 'isHot' | 'isShow'
      value: RootdataStatus
    }) => updateProjectStatus(input.ids, input.field, input.value),
    onSuccess: async () => {
      await invalidate()
      toast.success('项目状态已更新。')
    },
  })
}

export function useSavePersonMutation(currentId?: string) {
  const invalidate = useInvalidateRootdata()

  return useMutation({
    mutationFn: (input: PersonInput) =>
      currentId === undefined
        ? createPerson(input)
        : updatePerson(currentId, input),
    onSuccess: async () => {
      await invalidate()
      toast.success(currentId === undefined ? '人物已创建。' : '人物已更新。')
    },
  })
}

export function useDeletePersonMutation() {
  const invalidate = useInvalidateRootdata()

  return useMutation({
    mutationFn: (id: string) => deletePerson(id),
    onSuccess: async () => {
      await invalidate()
      toast.success('人物已删除。')
    },
  })
}

export function useDeletePersonsMutation() {
  const invalidate = useInvalidateRootdata()

  return useMutation({
    mutationFn: (ids: string[]) => deletePersons(ids),
    onSuccess: async () => {
      await invalidate()
      toast.success('人物已批量删除。')
    },
  })
}

export function usePersonStatusMutation() {
  const invalidate = useInvalidateRootdata()

  return useMutation({
    mutationFn: (input: { ids: string[]; status: RootdataStatus }) =>
      updatePersonStatus(input.ids, input.status),
    onSuccess: async () => {
      await invalidate()
      toast.success('人物状态已更新。')
    },
  })
}

export function useSaveOrganizationMutation(currentId?: number) {
  const invalidate = useInvalidateRootdata()

  return useMutation({
    mutationFn: (input: OrganizationInput) =>
      currentId === undefined
        ? createOrganization(input)
        : updateOrganization(currentId, input),
    onSuccess: async () => {
      await invalidate()
      toast.success(currentId === undefined ? '机构已创建。' : '机构已更新。')
    },
  })
}

export function useDeleteOrganizationMutation() {
  const invalidate = useInvalidateRootdata()

  return useMutation({
    mutationFn: (id: number) => deleteOrganization(id),
    onSuccess: async () => {
      await invalidate()
      toast.success('机构已删除。')
    },
  })
}

export function useDeleteOrganizationsMutation() {
  const invalidate = useInvalidateRootdata()

  return useMutation({
    mutationFn: (ids: number[]) => deleteOrganizations(ids),
    onSuccess: async () => {
      await invalidate()
      toast.success('机构已批量删除。')
    },
  })
}

export function useOrganizationStatusMutation() {
  const invalidate = useInvalidateRootdata()

  return useMutation({
    mutationFn: (input: { ids: number[]; status: RootdataStatus }) =>
      updateOrganizationStatus(input.ids, input.status),
    onSuccess: async () => {
      await invalidate()
      toast.success('机构状态已更新。')
    },
  })
}

export function useSaveProjectEventMutation(projectId: number, index?: number) {
  const invalidate = useInvalidateRootdata()

  return useMutation({
    mutationFn: (input: EventInput) =>
      saveProjectEvent(projectId, input, index),
    onSuccess: async () => {
      await invalidate()
      toast.success('重大事件已保存。')
    },
  })
}

export function useDeleteProjectEventMutation(projectId: number) {
  const invalidate = useInvalidateRootdata()

  return useMutation({
    mutationFn: (index: number) => deleteProjectEvent(projectId, index),
    onSuccess: async () => {
      await invalidate()
      toast.success('重大事件已删除。')
    },
  })
}

export function useSaveProjectReportMutation(
  projectId: number,
  index?: number
) {
  const invalidate = useInvalidateRootdata()

  return useMutation({
    mutationFn: (input: ReportInput) =>
      saveProjectReport(projectId, input, index),
    onSuccess: async () => {
      await invalidate()
      toast.success('新闻动态已保存。')
    },
  })
}

export function useDeleteProjectReportMutation(projectId: number) {
  const invalidate = useInvalidateRootdata()

  return useMutation({
    mutationFn: (index: number) => deleteProjectReport(projectId, index),
    onSuccess: async () => {
      await invalidate()
      toast.success('新闻动态已删除。')
    },
  })
}

export function useSaveProjectContractMutation(
  projectId: number,
  index?: number
) {
  const invalidate = useInvalidateRootdata()

  return useMutation({
    mutationFn: (input: ContractInput) =>
      saveProjectContract(projectId, input, index),
    onSuccess: async () => {
      await invalidate()
      toast.success('合约已保存。')
    },
  })
}

export function useDeleteProjectContractMutation(projectId: number) {
  const invalidate = useInvalidateRootdata()

  return useMutation({
    mutationFn: (index: number) => deleteProjectContract(projectId, index),
    onSuccess: async () => {
      await invalidate()
      toast.success('合约已删除。')
    },
  })
}

export function useSaveTeamMemberMutation(
  entity: 'projects' | 'organizations',
  id: number,
  personId?: string
) {
  const invalidate = useInvalidateRootdata()

  return useMutation({
    mutationFn: (input: TeamMemberInput) =>
      saveTeamMember(entity, id, input, personId),
    onSuccess: async () => {
      await invalidate()
      toast.success('团队成员已保存。')
    },
  })
}

export function useDeleteTeamMemberMutation(
  entity: 'projects' | 'organizations',
  id: number
) {
  const invalidate = useInvalidateRootdata()

  return useMutation({
    mutationFn: (personId: string) => deleteTeamMember(entity, id, personId),
    onSuccess: async () => {
      await invalidate()
      toast.success('团队成员已删除。')
    },
  })
}

export function useSaveJobChangeMutation(personId: string, id?: number) {
  const invalidate = useInvalidateRootdata()

  return useMutation({
    mutationFn: (input: JobChangeInput) =>
      savePersonJobChange(personId, input, id),
    onSuccess: async () => {
      await invalidate()
      toast.success('工作经历已保存。')
    },
  })
}

export function useDeleteJobChangeMutation(personId: string) {
  const invalidate = useInvalidateRootdata()

  return useMutation({
    mutationFn: (id: number) => deletePersonJobChange(personId, id),
    onSuccess: async () => {
      await invalidate()
      toast.success('工作经历已删除。')
    },
  })
}

export function useSaveFundingRoundMutation(id?: number) {
  const invalidate = useInvalidateRootdata()

  return useMutation({
    mutationFn: (input: FundingRoundInput) => saveFundingRound(input, id),
    onSuccess: async () => {
      await invalidate()
      toast.success('融资轮次已保存。')
    },
  })
}

export function useDeleteFundingRoundMutation() {
  const invalidate = useInvalidateRootdata()

  return useMutation({
    mutationFn: (id: number) => deleteFundingRound(id),
    onSuccess: async () => {
      await invalidate()
      toast.success('融资轮次已删除。')
    },
  })
}
