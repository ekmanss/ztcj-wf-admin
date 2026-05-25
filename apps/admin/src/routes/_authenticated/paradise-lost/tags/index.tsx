import { createFileRoute } from '@tanstack/react-router'
import { ParadiseLostTags } from '@/features/paradise-lost/tags'

export const Route = createFileRoute('/_authenticated/paradise-lost/tags/')({
  component: ParadiseLostTags,
})
