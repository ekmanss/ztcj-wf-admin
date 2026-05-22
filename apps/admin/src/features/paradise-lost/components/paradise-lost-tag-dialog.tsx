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
import { useCreateParadiseLostTagMutation } from '../hooks/use-paradise-lost-query'

const formSchema = z.object({
  tagName: z.string().trim().min(1, '请输入中文标签。').max(255),
  tagNameEn: z.string().trim().max(255),
  color: z.string().trim().max(255),
  backgroundColor: z.string().trim().max(255),
  remark: z.string().trim(),
})

type TagForm = z.infer<typeof formSchema>

type ParadiseLostTagDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const defaultValues: TagForm = {
  tagName: '',
  tagNameEn: '',
  color: '',
  backgroundColor: '',
  remark: '',
}

export function ParadiseLostTagDialog({
  open,
  onOpenChange,
}: ParadiseLostTagDialogProps) {
  const createTagMutation = useCreateParadiseLostTagMutation()
  const form = useForm<TagForm>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  const onSubmit = async (values: TagForm) => {
    try {
      await createTagMutation.mutateAsync({
        tagName: values.tagName.trim(),
        tagNameEn: values.tagNameEn.trim(),
        color: values.color.trim(),
        backgroundColor: values.backgroundColor.trim(),
        remark: values.remark.trim(),
      })
      form.reset(defaultValues)
      onOpenChange(false)
    } catch {
      // Global mutation error handling shows the user-facing toast.
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset(defaultValues)
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>新增标签</DialogTitle>
          <DialogDescription>
            创建后会立即出现在失乐园表单中。
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='paradise-lost-tag-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='tagName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>中文标签</FormLabel>
                  <FormControl>
                    <Input autoComplete='off' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='tagNameEn'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>英文标签</FormLabel>
                  <FormControl>
                    <Input autoComplete='off' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='grid gap-4 sm:grid-cols-2'>
              <FormField
                control={form.control}
                name='color'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>字体颜色</FormLabel>
                    <FormControl>
                      <Input placeholder='#334155' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='backgroundColor'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>背景颜色</FormLabel>
                    <FormControl>
                      <Input placeholder='#f8fafc' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name='remark'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>备注</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button
            type='submit'
            form='paradise-lost-tag-form'
            disabled={createTagMutation.isPending}
          >
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
