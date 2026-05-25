/* eslint-disable react-refresh/only-export-components */
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { RootdataProjects } from '@/features/rootdata'

const rootdataProjectsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  q: z.string().optional().catch(''),
  active: z
    .array(z.union([z.literal(0), z.literal(1)]))
    .optional()
    .catch([]),
  isHot: z
    .array(z.union([z.literal(0), z.literal(1)]))
    .optional()
    .catch([]),
  isShow: z
    .array(z.union([z.literal(0), z.literal(1)]))
    .optional()
    .catch([]),
})

export const Route = createFileRoute('/_authenticated/rootdata/projects/')({
  validateSearch: rootdataProjectsSearchSchema,
  component: RootdataProjectsRoute,
})

function RootdataProjectsRoute() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  return (
    <RootdataProjects
      search={search}
      setSearch={(updater) => {
        void navigate({ search: (previous) => updater(previous) })
      }}
    />
  )
}
