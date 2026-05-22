import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { ParadiseLost } from '@/features/paradise-lost'

const paradiseLostSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  name: z.string().optional().catch(''),
  type: z
    .array(z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(5)]))
    .optional()
    .catch([]),
  status: z
    .array(z.union([z.literal(0), z.literal(1)]))
    .optional()
    .catch([]),
})

export const Route = createFileRoute('/_authenticated/paradise-lost/')({
  validateSearch: paradiseLostSearchSchema,
  component: ParadiseLost,
})
