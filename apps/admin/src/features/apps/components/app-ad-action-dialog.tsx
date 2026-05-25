'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { SelectDropdown } from '@/components/select-dropdown'
import { adPageLabels, adPositionLabels, adTypeLabels } from '../data/data'
import type {
  AppAd,
  AppAdPageCode,
  AppAdPositionCode,
  AppAdStatus,
  AppAdType,
} from '../data/schema'
import {
  useAppsMetaQuery,
  useCreateAppAdMutation,
  useUpdateAppAdMutation,
} from '../hooks/use-apps-query'

const pageCodes = [
  'market',
  'ecology',
  'alpha',
  'paradise_lost',
  'dex_scan',
  'information',
  'flash_news',
  'calendar',
  'data',
  'exchange',
  'wallet',
  'crypto_detail',
  'token_detail',
  'project_detail',
  'person_detail',
  'institution_detail',
  'info_detail',
  'flash_news_detail',
  'exchange_detail',
  'wallet_detail',
  'rating',
] as const

const formSchema = z
  .object({
    adName: z
      .string()
      .trim()
      .min(1, '请输入广告名称。')
      .max(255, '广告名称最多 255 个字符。'),
    adPositionCode: z.enum(['top_banner', 'right_card']),
    adPageCode: z.enum(pageCodes),
    adImageCh: z
      .string()
      .trim()
      .min(1, '请输入中文广告图片。')
      .max(512, '图片地址最多 512 个字符。'),
    adImageEn: z
      .string()
      .trim()
      .min(1, '请输入英文广告图片。')
      .max(512, '图片地址最多 512 个字符。'),
    adLink: z
      .string()
      .trim()
      .min(1, '请输入跳转url。')
      .max(512, '跳转url最多 512 个字符。'),
    adType: z.enum(['1', '2', '3']),
    adEffectiveTime: z.string().trim().min(1, '请选择广告生效时间。'),
    adInvalidTime: z.string().trim().min(1, '请选择广告失效时间。'),
    weigh: z
      .string()
      .trim()
      .refine((value) => value === '' || Number.isInteger(Number(value)), {
        message: '序号必须是整数。',
      })
      .refine((value) => value === '' || Number(value) >= 0, {
        message: '序号不能小于 0。',
      }),
    status: z.enum(['1', '0']),
  })
  .refine(
    ({ adEffectiveTime, adInvalidTime }) =>
      !adEffectiveTime ||
      !adInvalidTime ||
      adInvalidTime.replace('T', ' ') >= adEffectiveTime.replace('T', ' '),
    {
      message: '失效时间不能早于生效时间。',
      path: ['adInvalidTime'],
    }
  )

type AppAdForm = z.infer<typeof formSchema>

type AppAdActionDialogProps = {
  currentRow?: AppAd
  open: boolean
  onOpenChange: (open: boolean) => void
}

function currentDateTimeLocal() {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 16)
}

function toDateTimeLocal(value: string | null) {
  if (!value) return currentDateTimeLocal()
  return value.replace(' ', 'T').slice(0, 16)
}

function toApiDateTime(value: string) {
  const normalized = value.replace('T', ' ')
  return normalized.length === 16 ? `${normalized}:00` : normalized
}

function getDefaultValues(currentRow?: AppAd): AppAdForm {
  const now = currentDateTimeLocal()

  return currentRow
    ? {
        adName: currentRow.adName,
        adPositionCode: currentRow.adPositionCode,
        adPageCode: currentRow.adPageCode,
        adImageCh: currentRow.adImageCh,
        adImageEn: currentRow.adImageEn,
        adLink: currentRow.adLink,
        adType: currentRow.adType,
        adEffectiveTime: toDateTimeLocal(currentRow.adEffectiveTime),
        adInvalidTime: toDateTimeLocal(currentRow.adInvalidTime),
        weigh: String(currentRow.weigh),
        status: String(currentRow.status) as '1' | '0',
      }
    : {
        adName: '',
        adPositionCode: 'top_banner',
        adPageCode: 'market',
        adImageCh: '',
        adImageEn: '',
        adLink: '',
        adType: '1',
        adEffectiveTime: now,
        adInvalidTime: now,
        weigh: '',
        status: '1',
      }
}

export function AppAdActionDialog({
  currentRow,
  open,
  onOpenChange,
}: AppAdActionDialogProps) {
  const isEdit = !!currentRow
  const metaQuery = useAppsMetaQuery()
  const createMutation = useCreateAppAdMutation()
  const updateMutation = useUpdateAppAdMutation()
  const form = useForm<AppAdForm>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(currentRow),
  })

  const positionItems =
    metaQuery.data?.adPositions ??
    Object.entries(adPositionLabels).map(([value, label]) => ({ value, label }))
  const pageItems =
    metaQuery.data?.adPages ??
    Object.entries(adPageLabels).map(([value, label]) => ({ value, label }))
  const typeItems =
    metaQuery.data?.adTypes ??
    Object.entries(adTypeLabels).map(([value, label]) => ({ value, label }))

  const onSubmit = async (values: AppAdForm) => {
    const input = {
      adName: values.adName.trim(),
      adPositionCode: values.adPositionCode as AppAdPositionCode,
      adPageCode: values.adPageCode as AppAdPageCode,
      adImageCh: values.adImageCh.trim(),
      adImageEn: values.adImageEn.trim(),
      adLink: values.adLink.trim(),
      adType: values.adType as AppAdType,
      adEffectiveTime: toApiDateTime(values.adEffectiveTime),
      adInvalidTime: toApiDateTime(values.adInvalidTime),
      status: Number(values.status) as AppAdStatus,
      ...(values.weigh.trim() ? { weigh: Number(values.weigh) } : {}),
    }

    try {
      if (currentRow) {
        await updateMutation.mutateAsync({ id: currentRow.adId, input })
      } else {
        await createMutation.mutateAsync(input)
      }

      form.reset(getDefaultValues())
      onOpenChange(false)
    } catch {
      // Global mutation error handling shows the user-facing toast.
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset(getDefaultValues(currentRow))
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-3xl'>
        <DialogHeader className='text-start'>
          <DialogTitle>
            {isEdit ? '编辑 APP 广告' : '新增 APP 广告'}
          </DialogTitle>
          <DialogDescription>
            图片字段当前保存 URL 或路径；上传能力后续单独接入。
          </DialogDescription>
        </DialogHeader>
        <div className='max-h-[72vh] w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='app-ad-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 px-0.5'
            >
              <FormField
                control={form.control}
                name='adName'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      广告名称 <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input className='col-span-4' {...field} />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='adPositionCode'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      广告位
                    </FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='选择广告位'
                      className='col-span-4'
                      isPending={metaQuery.isPending}
                      items={positionItems}
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='adPageCode'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      具体位置
                    </FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='选择页面'
                      className='col-span-4'
                      isPending={metaQuery.isPending}
                      items={pageItems}
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='adImageCh'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      中文图片 <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input className='col-span-4' {...field} />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='adImageEn'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      英文图片 <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input className='col-span-4' {...field} />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='adLink'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      跳转url <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input className='col-span-4' {...field} />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='adType'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>标签</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='选择标签'
                      className='col-span-4'
                      isPending={metaQuery.isPending}
                      items={typeItems}
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='adEffectiveTime'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      生效时间 <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        className='col-span-4'
                        type='datetime-local'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='adInvalidTime'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      失效时间 <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        className='col-span-4'
                        type='datetime-local'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='weigh'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>序号</FormLabel>
                    <FormControl>
                      <Input
                        className='col-span-4'
                        type='number'
                        min={0}
                        placeholder='留空则自动使用新增 ID'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>状态</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='选择状态'
                      className='col-span-4'
                      items={[
                        { label: '显示', value: '1' },
                        { label: '隐藏', value: '0' },
                      ]}
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type='submit' form='app-ad-form' disabled={isSaving}>
            {isSaving ? '保存中...' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
