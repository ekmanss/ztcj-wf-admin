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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { SelectDropdown } from '@/components/select-dropdown'
import type { KolTweet, KolTweetStatus } from '../data/schema'
import { useUpdateKolTweetMutation } from '../hooks/use-kol-query'

const formSchema = z.object({
  fullText: z.string().trim(),
  status: z.enum(['0', '1']),
})

type KolDynamicForm = z.infer<typeof formSchema>

type KolDynamicActionDialogProps = {
  currentRow: KolTweet
  open: boolean
  onOpenChange: (open: boolean) => void
}

function getDefaultValues(currentRow: KolTweet): KolDynamicForm {
  return {
    fullText: currentRow.fullText,
    status: currentRow.status,
  }
}

export function KolDynamicActionDialog({
  currentRow,
  open,
  onOpenChange,
}: KolDynamicActionDialogProps) {
  const updateMutation = useUpdateKolTweetMutation()
  const form = useForm<KolDynamicForm>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(currentRow),
  })

  const onSubmit = async (values: KolDynamicForm) => {
    try {
      await updateMutation.mutateAsync({
        tweetRestId: currentRow.tweetRestId,
        input: {
          fullText: values.fullText.trim(),
          status: values.status as KolTweetStatus,
        },
      })

      form.reset(getDefaultValues(currentRow))
      onOpenChange(false)
    } catch {
      // Global mutation error handling shows the user-facing toast.
    }
  }

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
          <DialogTitle>编辑 KOL 动态</DialogTitle>
          <DialogDescription>
            更新动态正文和显示状态。作者、发布时间和互动数据来自同步源，不在此处修改。
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='kol-dynamic-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
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
            <FormField
              control={form.control}
              name='fullText'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-start space-y-0 gap-x-4 gap-y-1'>
                  <FormLabel className='col-span-2 pt-2 text-end'>
                    正文
                  </FormLabel>
                  <Textarea
                    className='col-span-4 min-h-52 resize-y'
                    {...field}
                  />
                  <FormMessage className='col-span-4 col-start-3' />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button
            type='submit'
            form='kol-dynamic-form'
            disabled={updateMutation.isPending}
          >
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
