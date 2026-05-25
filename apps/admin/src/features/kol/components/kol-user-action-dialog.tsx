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
import { Textarea } from '@/components/ui/textarea'
import { SelectDropdown } from '@/components/select-dropdown'
import type {
  KolPlatform,
  KolSyncStatus,
  KolUser,
  KolUserStatus,
} from '../data/schema'
import {
  useCreateKolUserMutation,
  useUpdateKolUserMutation,
} from '../hooks/use-kol-query'

const formSchema = z.object({
  restId: z.string().trim().max(64, '唯一 ID 最多 64 个字符。'),
  username: z
    .string()
    .trim()
    .min(1, '请输入用户名。')
    .max(191, '用户名最多 191 个字符。'),
  requestedUsername: z.string().trim().max(191, '请求用户名最多 191 个字符。'),
  name: z.string().trim().max(191, '显示名称最多 191 个字符。'),
  description: z.string().trim(),
  avatarUrl: z.string().trim().max(512, '头像 URL 最多 512 个字符。'),
  linkUrl: z.string().trim().max(512, '链接地址最多 512 个字符。'),
  platform: z.enum(['twitter', 'telegram', 'reddit', 'medium']),
  syncStatus: z.enum(['0', '1', '2']),
  status: z.enum(['1', '2']),
  keywords: z.string().trim().max(255, '关键词最多 255 个字符。'),
  remark: z.string().trim().max(255, '备注最多 255 个字符。'),
})

type KolUserForm = z.infer<typeof formSchema>

type KolUserActionDialogProps = {
  currentRow?: KolUser
  open: boolean
  onOpenChange: (open: boolean) => void
}

function getDefaultValues(currentRow?: KolUser): KolUserForm {
  return currentRow
    ? {
        restId: currentRow.restId,
        username: currentRow.username,
        requestedUsername: currentRow.requestedUsername,
        name: currentRow.name,
        description: currentRow.description,
        avatarUrl: currentRow.avatarUrl,
        linkUrl: currentRow.linkUrl,
        platform: currentRow.platform,
        syncStatus: currentRow.syncStatus,
        status: currentRow.status,
        keywords: currentRow.keywords,
        remark: currentRow.remark,
      }
    : {
        restId: '',
        username: '',
        requestedUsername: '',
        name: '',
        description: '',
        avatarUrl: '',
        linkUrl: '',
        platform: 'twitter',
        syncStatus: '0',
        status: '1',
        keywords: '',
        remark: '',
      }
}

export function KolUserActionDialog({
  currentRow,
  open,
  onOpenChange,
}: KolUserActionDialogProps) {
  const isEdit = !!currentRow
  const createMutation = useCreateKolUserMutation()
  const updateMutation = useUpdateKolUserMutation()
  const form = useForm<KolUserForm>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(currentRow),
  })

  const onSubmit = async (values: KolUserForm) => {
    const input = {
      ...(values.restId.trim() ? { restId: values.restId.trim() } : {}),
      username: values.username.trim(),
      requestedUsername: values.requestedUsername.trim(),
      name: values.name.trim(),
      description: values.description.trim(),
      avatarUrl: values.avatarUrl.trim(),
      linkUrl: values.linkUrl.trim(),
      platform: values.platform as KolPlatform,
      syncStatus: values.syncStatus as KolSyncStatus,
      status: values.status as KolUserStatus,
      keywords: values.keywords.trim(),
      remark: values.remark.trim(),
    }

    try {
      if (currentRow) {
        await updateMutation.mutateAsync({
          restId: currentRow.restId,
          input,
        })
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
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader className='text-start'>
          <DialogTitle>
            {isEdit ? '编辑 KOL 会员' : '新增 KOL 会员'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? '更新 KOL 账号资料、同步状态和显示状态。'
              : '创建手动维护的 KOL 账号；唯一 ID 留空时由 API 生成。'}
          </DialogDescription>
        </DialogHeader>
        <div className='max-h-[70vh] w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='kol-user-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 px-0.5'
            >
              <FormField
                control={form.control}
                name='restId'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      唯一 ID
                    </FormLabel>
                    <FormControl>
                      <Input
                        className='col-span-4'
                        disabled={isEdit}
                        placeholder='留空自动生成'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='username'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      用户名
                    </FormLabel>
                    <FormControl>
                      <Input
                        className='col-span-4'
                        placeholder='不带 @ 的 X handle'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      显示名称
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
                name='requestedUsername'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      请求用户名
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
                name='avatarUrl'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      头像 URL
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
                name='linkUrl'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      链接地址
                    </FormLabel>
                    <FormControl>
                      <Input
                        className='col-span-4'
                        placeholder='留空使用 https://x.com/<username>'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='platform'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>平台</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='选择平台'
                      className='col-span-4'
                      items={[
                        { label: 'Twitter', value: 'twitter' },
                        { label: 'Telegram', value: 'telegram' },
                        { label: 'Reddit', value: 'reddit' },
                        { label: 'Medium', value: 'medium' },
                      ]}
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='syncStatus'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      同步状态
                    </FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='选择同步状态'
                      className='col-span-4'
                      items={[
                        { label: '同步中', value: '0' },
                        { label: '已同步', value: '1' },
                        { label: '同步失败', value: '2' },
                      ]}
                    />
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
                        { label: '隐藏', value: '2' },
                      ]}
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='keywords'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      关键词
                    </FormLabel>
                    <FormControl>
                      <Input
                        className='col-span-4'
                        placeholder='多个关键词用逗号分隔'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-start space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 pt-2 text-end'>
                      简介
                    </FormLabel>
                    <FormControl>
                      <Textarea className='col-span-4 min-h-20' {...field} />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='remark'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-start space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 pt-2 text-end'>
                      备注
                    </FormLabel>
                    <FormControl>
                      <Textarea className='col-span-4 min-h-20' {...field} />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type='submit' form='kol-user-form' disabled={isSaving}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
