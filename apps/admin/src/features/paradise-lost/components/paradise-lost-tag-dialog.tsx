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
import { type ParadiseLostTag } from '../data/schema'
import {
  useCreateParadiseLostTagMutation,
  useUpdateParadiseLostTagMutation,
} from '../hooks/use-paradise-lost-query'

const formSchema = z.object({
  tagName: z.string().trim().min(1, '请输入中文标签。').max(255),
  tagNameEn: z.string().trim().max(255),
  image: z.string().trim().max(1024),
  darkImage: z.string().trim().max(1024),
  color: z.string().trim().max(255),
  darkColor: z.string().trim().max(255),
  backgroundColor: z.string().trim().max(255),
  darkBackgroundColor: z.string().trim().max(255),
  backgroundImage: z.string().trim().max(1024),
  darkBackgroundImage: z.string().trim().max(1024),
  remark: z.string().trim().max(255),
})

type TagForm = z.infer<typeof formSchema>

type ParadiseLostTagDialogProps = {
  currentRow?: ParadiseLostTag
  open: boolean
  onOpenChange: (open: boolean) => void
}

function getDefaultValues(currentRow?: ParadiseLostTag): TagForm {
  return currentRow
    ? {
        tagName: currentRow.tagName,
        tagNameEn: currentRow.tagNameEn,
        image: currentRow.image,
        darkImage: currentRow.darkImage,
        color: currentRow.color,
        darkColor: currentRow.darkColor,
        backgroundColor: currentRow.backgroundColor,
        darkBackgroundColor: currentRow.darkBackgroundColor,
        backgroundImage: currentRow.backgroundImage,
        darkBackgroundImage: currentRow.darkBackgroundImage,
        remark: currentRow.remark,
      }
    : {
        tagName: '',
        tagNameEn: '',
        image: '',
        darkImage: '',
        color: '',
        darkColor: '',
        backgroundColor: '',
        darkBackgroundColor: '',
        backgroundImage: '',
        darkBackgroundImage: '',
        remark: '',
      }
}

export function ParadiseLostTagDialog({
  currentRow,
  open,
  onOpenChange,
}: ParadiseLostTagDialogProps) {
  const isEdit = !!currentRow
  const createTagMutation = useCreateParadiseLostTagMutation()
  const updateTagMutation = useUpdateParadiseLostTagMutation()
  const form = useForm<TagForm>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(currentRow),
  })

  const onSubmit = async (values: TagForm) => {
    const input = {
      tagName: values.tagName.trim(),
      tagNameEn: values.tagNameEn.trim(),
      image: values.image.trim(),
      darkImage: values.darkImage.trim(),
      color: values.color.trim(),
      darkColor: values.darkColor.trim(),
      backgroundColor: values.backgroundColor.trim(),
      darkBackgroundColor: values.darkBackgroundColor.trim(),
      backgroundImage: values.backgroundImage.trim(),
      darkBackgroundImage: values.darkBackgroundImage.trim(),
      remark: values.remark.trim(),
    }

    try {
      if (currentRow) {
        await updateTagMutation.mutateAsync({ id: currentRow.id, input })
      } else {
        await createTagMutation.mutateAsync(input)
      }

      form.reset(getDefaultValues())
      onOpenChange(false)
    } catch {
      // Global mutation error handling shows the user-facing toast.
    }
  }

  const isSaving = createTagMutation.isPending || updateTagMutation.isPending

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
          <DialogTitle>{isEdit ? '编辑标签' : '新增标签'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? '更新专题标签的名称、样式和展示素材。'
              : '创建后会立即出现在失乐园表单中。'}
          </DialogDescription>
        </DialogHeader>
        <div className='max-h-[70vh] w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='paradise-lost-tag-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 px-0.5'
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
                  name='image'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>图片 URL/路径</FormLabel>
                      <FormControl>
                        <Input autoComplete='off' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='darkImage'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>深色图片 URL/路径</FormLabel>
                      <FormControl>
                        <Input autoComplete='off' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
                  name='darkColor'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>深色字体颜色</FormLabel>
                      <FormControl>
                        <Input placeholder='#f8fafc' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className='grid gap-4 sm:grid-cols-2'>
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
                <FormField
                  control={form.control}
                  name='darkBackgroundColor'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>深色背景颜色</FormLabel>
                      <FormControl>
                        <Input placeholder='#0f172a' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className='grid gap-4 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='backgroundImage'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>背景图 URL/路径</FormLabel>
                      <FormControl>
                        <Input autoComplete='off' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='darkBackgroundImage'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>深色背景图 URL/路径</FormLabel>
                      <FormControl>
                        <Input autoComplete='off' {...field} />
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
        </div>
        <DialogFooter>
          <Button
            type='submit'
            form='paradise-lost-tag-form'
            disabled={isSaving}
          >
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
