import { type UserStatus } from './schema'

export const callTypes = new Map<UserStatus, string>([
  ['normal', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['hidden', 'bg-neutral-300/40 border-neutral-300'],
])

export const statusLabels: Record<UserStatus, string> = {
  normal: '正常',
  hidden: '隐藏',
}
