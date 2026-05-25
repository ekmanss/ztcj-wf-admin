import { cn } from '@/lib/utils'
import type {
  AppAdPageCode,
  AppAdPositionCode,
  AppAdStatus,
  AppAdType,
  AppColumnStatus,
} from './schema'

export const columnStatusLabels: Record<AppColumnStatus, string> = {
  '1': '是',
  '0': '否',
}

export const adStatusLabels: Record<AppAdStatus, string> = {
  1: '显示',
  0: '隐藏',
}

export const adTypeLabels: Record<AppAdType, string> = {
  '1': '广告',
  '2': '推广',
  '3': '活动',
}

export const adPositionLabels: Record<AppAdPositionCode, string> = {
  top_banner: '顶部轮播',
  right_card: '右侧卡片',
}

export const adPageLabels: Record<AppAdPageCode, string> = {
  market: '市场',
  ecology: '生态',
  alpha: 'Alpha',
  paradise_lost: '失乐园',
  dex_scan: 'DexScan',
  information: '资讯',
  flash_news: '快讯',
  calendar: '日历',
  data: '数据',
  exchange: '交易所',
  wallet: '钱包',
  crypto_detail: '加密货币详情页',
  token_detail: '代币详情页',
  project_detail: '项目详情页',
  person_detail: '人物详情页',
  institution_detail: '机构详情页',
  info_detail: '资讯详情页',
  flash_news_detail: '快讯详情页',
  exchange_detail: '交易所详情页',
  wallet_detail: '钱包详情页',
  rating: '评级',
}

export const columnStatusBadgeClass = new Map<AppColumnStatus, string>([
  ['1', 'border-emerald-200 bg-emerald-50 text-emerald-700'],
  ['0', 'border-zinc-200 bg-zinc-50 text-zinc-600'],
])

export const adStatusBadgeClass = new Map<AppAdStatus, string>([
  [1, 'border-emerald-200 bg-emerald-50 text-emerald-700'],
  [0, 'border-zinc-200 bg-zinc-50 text-zinc-600'],
])

export const adTypeBadgeClass = new Map<AppAdType, string>([
  ['1', cn('border-sky-200 bg-sky-50 text-sky-700')],
  ['2', cn('border-amber-200 bg-amber-50 text-amber-700')],
  ['3', cn('border-rose-200 bg-rose-50 text-rose-700')],
])
