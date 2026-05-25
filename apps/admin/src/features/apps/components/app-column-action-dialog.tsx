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
import type { AppColumn, AppColumnStatus } from '../data/schema'
import {
  useAppColumnParentsQuery,
  useCreateAppColumnMutation,
  useUpdateAppColumnMutation,
} from '../hooks/use-apps-query'

const formSchema = z.object({
  pid: z.string(),
  code: z
    .string()
    .trim()
    .min(1, '请输入栏目CODE。')
    .max(255, '栏目CODE最多 255 个字符。'),
  name: z
    .string()
    .trim()
    .min(1, '请输入栏目中文名称。')
    .max(255, '栏目中文名称最多 255 个字符。'),
  nameEn: z
    .string()
    .trim()
    .min(1, '请输入栏目英文名称。')
    .max(255, '栏目英文名称最多 255 个字符。'),
  status: z.enum(['1', '0']),
  remarks: z.string().trim().max(255, '备注最多 255 个字符。'),
  weigh: z
    .string()
    .trim()
    .refine((value) => value === '' || Number.isInteger(Number(value)), {
      message: '序号必须是整数。',
    })
    .refine((value) => value === '' || Number(value) >= 0, {
      message: '序号不能小于 0。',
    }),
})

type AppColumnForm = z.infer<typeof formSchema>

type AppColumnActionDialogProps = {
  currentRow?: AppColumn
  open: boolean
  onOpenChange: (open: boolean) => void
}

function getDefaultValues(currentRow?: AppColumn): AppColumnForm {
  return currentRow
    ? {
        pid: String(currentRow.pid),
        code: currentRow.code,
        name: currentRow.name,
        nameEn: currentRow.nameEn,
        status: currentRow.status,
        remarks: currentRow.remarks,
        weigh: String(currentRow.weigh),
      }
    : {
        pid: '0',
        code: '',
        name: '',
        nameEn: '',
        status: '1',
        remarks: '',
        weigh: '',
      }
}

export function AppColumnActionDialog({
  currentRow,
  open,
  onOpenChange,
}: AppColumnActionDialogProps) {
  const isEdit = !!currentRow
  const parentsQuery = useAppColumnParentsQuery()
  const createMutation = useCreateAppColumnMutation()
  const updateMutation = useUpdateAppColumnMutation()
  const form = useForm<AppColumnForm>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(currentRow),
  })

  const parentItems = [
    { label: '无父级（一级栏目）', value: '0' },
    ...(parentsQuery.data ?? [])
      .filter((item) => item.id !== currentRow?.id)
      .map((item) => ({
        label:
          item.status === '0'
            ? `${item.name} / ${item.code}（隐藏）`
            : `${item.name} / ${item.code}`,
        value: String(item.id),
      })),
  ]

  const onSubmit = async (values: AppColumnForm) => {
    const input = {
      pid: Number(values.pid),
      code: values.code.trim(),
      name: values.name.trim(),
      nameEn: values.nameEn.trim(),
      status: values.status as AppColumnStatus,
      remarks: values.remarks.trim(),
      ...(values.weigh.trim() ? { weigh: Number(values.weigh) } : {}),
    }

    try {
      if (currentRow) {
        await updateMutation.mutateAsync({ id: currentRow.id, input })
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
            {isEdit ? '编辑 APP 栏目' : '新增 APP 栏目'}
          </DialogTitle>
          <DialogDescription>
            APP 栏目只支持两级结构；选择父级后会保存为二级栏目。
          </DialogDescription>
        </DialogHeader>
        <div className='max-h-[70vh] w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='app-column-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 px-0.5'
            >
              <FormField
                control={form.control}
                name='pid'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>父级</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='选择父级栏目'
                      className='col-span-4'
                      isPending={parentsQuery.isPending}
                      items={parentItems}
                    />
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
                      中文名称 <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        className='col-span-4'
                        placeholder='请输入栏目名称'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='nameEn'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      英文名称 <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        className='col-span-4'
                        placeholder='请输入英文名称'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='code'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      栏目CODE <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        className='col-span-4 font-mono'
                        placeholder='page_market'
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
                    <FormLabel className='col-span-2 text-end'>显示</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='选择状态'
                      className='col-span-4'
                      items={[
                        { label: '是', value: '1' },
                        { label: '否', value: '0' },
                      ]}
                    />
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
                name='remarks'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-start space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 pt-2 text-end'>
                      备注
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        className='col-span-4 min-h-20'
                        placeholder='可选'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type='submit' form='app-column-form' disabled={isSaving}>
            {isSaving ? '保存中...' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
