/* eslint-disable react-refresh/only-export-components */
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { RootdataPersons } from '@/features/rootdata'

const rootdataPersonsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  q: z.string().optional().catch(''),
  status: z
    .array(z.union([z.literal(0), z.literal(1)]))
    .optional()
    .catch([]),
})

export const Route = createFileRoute('/_authenticated/rootdata/persons/')({
  validateSearch: rootdataPersonsSearchSchema,
  component: RootdataPersonsRoute,
})

function RootdataPersonsRoute() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  return (
    <RootdataPersons
      search={search}
      setSearch={(updater) => {
        void navigate({ search: (previous) => updater(previous) })
      }}
    />
  )
}
