import { cn } from '@/lib/utils'
import type { ParadiseLostStatus, ParadiseLostType } from './schema'

export const typeLabels = {
  1: '项目',
  2: '机构',
  3: '人物',
  5: '事件',
} satisfies Record<ParadiseLostType, string>

export const statusLabels = {
  0: '隐藏',
  1: '显示',
} satisfies Record<ParadiseLostStatus, string>

export const statusStyles = new Map<ParadiseLostStatus, string>([
  [0, cn('border-zinc-300 bg-zinc-100 text-zinc-700 dark:bg-zinc-900')],
  [1, cn('border-emerald-300 bg-emerald-50 text-emerald-700')],
])

export const typeStyles = new Map<ParadiseLostType, string>([
  [1, cn('border-sky-300 bg-sky-50 text-sky-700')],
  [2, cn('border-indigo-300 bg-indigo-50 text-indigo-700')],
  [3, cn('border-amber-300 bg-amber-50 text-amber-700')],
  [5, cn('border-rose-300 bg-rose-50 text-rose-700')],
])
