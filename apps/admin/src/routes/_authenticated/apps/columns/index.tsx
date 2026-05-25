import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { AppColumns } from '@/features/apps'

const appColumnsSearchSchema = z.object({
  q: z.string().optional().catch(''),
  status: z
    .array(z.union([z.literal('1'), z.literal('0')]))
    .optional()
    .catch([]),
})

export const Route = createFileRoute('/_authenticated/apps/columns/')({
  validateSearch: appColumnsSearchSchema,
  component: AppColumns,
})
