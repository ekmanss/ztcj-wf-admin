import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { KolUsersPage } from '@/features/kol'

const kolUsersSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  username: z.string().optional().catch(''),
  name: z.string().optional().catch(''),
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
  syncStatus: z
    .array(z.union([z.literal('0'), z.literal('1'), z.literal('2')]))
    .optional()
    .catch([]),
  status: z
    .array(z.union([z.literal('1'), z.literal('2')]))
    .optional()
    .catch([]),
})

export const Route = createFileRoute('/_authenticated/kol/users/')({
  validateSearch: kolUsersSearchSchema,
  component: function KolUsersRoute() {
    const search = Route.useSearch()
    const navigate = Route.useNavigate()

    return <KolUsersPage search={search} navigate={navigate} />
  },
})
