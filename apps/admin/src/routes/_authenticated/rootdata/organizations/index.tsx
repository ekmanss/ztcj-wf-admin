/* eslint-disable react-refresh/only-export-components */
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { RootdataOrganizations } from '@/features/rootdata'

const rootdataOrganizationsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  q: z.string().optional().catch(''),
  active: z
    .array(z.union([z.literal(0), z.literal(1)]))
    .optional()
    .catch([]),
  status: z
    .array(z.union([z.literal(0), z.literal(1)]))
    .optional()
    .catch([]),
})

export const Route = createFileRoute('/_authenticated/rootdata/organizations/')(
  {
    validateSearch: rootdataOrganizationsSearchSchema,
    component: RootdataOrganizationsRoute,
  }
)

function RootdataOrganizationsRoute() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  return (
    <RootdataOrganizations
      search={search}
      setSearch={(updater) => {
        void navigate({ search: (previous) => updater(previous) })
      }}
    />
  )
}
