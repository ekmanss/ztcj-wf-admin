import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { AppAds } from '@/features/apps'

const appAdsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  name: z.string().optional().catch(''),
  positionCode: z
    .array(z.union([z.literal('top_banner'), z.literal('right_card')]))
    .optional()
    .catch([]),
  pageCode: z
    .array(
      z.union([
        z.literal('market'),
        z.literal('ecology'),
        z.literal('alpha'),
        z.literal('paradise_lost'),
        z.literal('dex_scan'),
        z.literal('information'),
        z.literal('flash_news'),
        z.literal('calendar'),
        z.literal('data'),
        z.literal('exchange'),
        z.literal('wallet'),
        z.literal('crypto_detail'),
        z.literal('token_detail'),
        z.literal('project_detail'),
        z.literal('person_detail'),
        z.literal('institution_detail'),
        z.literal('info_detail'),
        z.literal('flash_news_detail'),
        z.literal('exchange_detail'),
        z.literal('wallet_detail'),
        z.literal('rating'),
      ])
    )
    .optional()
    .catch([]),
  adType: z
    .array(z.union([z.literal('1'), z.literal('2'), z.literal('3')]))
    .optional()
    .catch([]),
  status: z
    .array(z.union([z.literal(1), z.literal(0)]))
    .optional()
    .catch([]),
})

export const Route = createFileRoute('/_authenticated/apps/ads/')({
  validateSearch: appAdsSearchSchema,
  component: AppAds,
})
