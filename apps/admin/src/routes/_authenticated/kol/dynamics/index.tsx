import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { KolDynamicsPage } from '@/features/kol'

const kolDynamicsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  authorName: z.string().optional().catch(''),
  platform: z
    .array(
      z.union([
        z.literal('twitter'),
        z.literal('telegram'),
        z.literal('reddit'),
        z.literal('medium'),
      ])
    )
    .optional()
    .catch([]),
  isReply: z
    .array(z.union([z.literal(0), z.literal(1)]))
    .optional()
    .catch([]),
  status: z
    .array(z.union([z.literal('0'), z.literal('1')]))
    .optional()
    .catch([]),
})

export const Route = createFileRoute('/_authenticated/kol/dynamics/')({
  validateSearch: kolDynamicsSearchSchema,
  component: function KolDynamicsRoute() {
    const search = Route.useSearch()
    const navigate = Route.useNavigate()

    return <KolDynamicsPage search={search} navigate={navigate} />
  },
})
