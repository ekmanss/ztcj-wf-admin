import { cn } from '@/lib/utils'
import type {
  KolPlatform,
  KolSyncStatus,
  KolTweetStatus,
  KolUserStatus,
} from './schema'

export const platformLabels: Record<KolPlatform, string> = {
  twitter: 'Twitter',
  telegram: 'Telegram',
  reddit: 'Reddit',
  medium: 'Medium',
}

export const syncStatusLabels: Record<KolSyncStatus, string> = {
  '0': '同步中',
  '1': '已同步',
  '2': '同步失败',
}

export const userStatusLabels: Record<KolUserStatus, string> = {
  '1': '显示',
  '2': '隐藏',
}

export const tweetStatusLabels: Record<KolTweetStatus, string> = {
  '1': '显示',
  '0': '隐藏',
}

export const userStatusBadgeClass = new Map<KolUserStatus, string>([
  ['1', cn('border-emerald-300 bg-emerald-50 text-emerald-700')],
  ['2', cn('border-slate-300 bg-slate-50 text-slate-600')],
])

export const tweetStatusBadgeClass = new Map<KolTweetStatus, string>([
  ['1', cn('border-emerald-300 bg-emerald-50 text-emerald-700')],
  ['0', cn('border-slate-300 bg-slate-50 text-slate-600')],
])

export const syncStatusBadgeClass = new Map<KolSyncStatus, string>([
  ['0', cn('border-amber-300 bg-amber-50 text-amber-700')],
  ['1', cn('border-emerald-300 bg-emerald-50 text-emerald-700')],
  ['2', cn('border-red-300 bg-red-50 text-red-700')],
])

export function formatDateTime(value: string | null) {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString('zh-CN', {
    hour12: false,
  })
}

export function formatNumber(value: number | null) {
  if (value === null) return '-'
  return value.toLocaleString('zh-CN')
}
