'use client'

import { useMemo, useState } from 'react'
import { z } from 'zod'
import { useForm, useWatch, type UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle, Plus } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { SelectDropdown } from '@/components/select-dropdown'
import { type ParadiseLostUpsertInput } from '../api/paradise-lost-api'
import { type InvestmentOption, type ParadiseLostItem } from '../data/schema'
import {
  useCreateParadiseLostMutation,
  useEventNaturesQuery,
  useEventTypesQuery,
  useInvestmentOptionsQuery,
  useParadiseLostTagsQuery,
  useParadiseLostYearsQuery,
  useUpdateParadiseLostMutation,
} from '../hooks/use-paradise-lost-query'
import { useParadiseLost } from './paradise-lost-provider'

const formSchema = z
  .object({
    type: z.enum(['1', '2', '3', '5']),
    investId: z.string().trim().min(1, '请选择关联对象。').max(50),
    tags: z.array(z.string()),
    year: z.array(z.string()).min(1, '请选择入选年度。'),
    cause: z.string().trim(),
    causeEn: z.string().trim(),
    date: z.string().trim(),
    image: z.string().trim().max(255),
    status: z.enum(['0', '1']),
    desc: z.string().trim().max(255),
    projectName: z.string().trim(),
    projectNameEn: z.string().trim(),
    logo: z.string().trim(),
    oneLiner: z.string().trim(),
    oneLinerEn: z.string().trim(),
    description: z.string().trim(),
    descriptionEn: z.string().trim(),
    active: z.enum(['0', '1']),
    orgName: z.string().trim(),
    orgNameEn: z.string().trim(),
    orgLogo: z.string().trim(),
    orgInfo: z.string().trim(),
    orgInfoEn: z.string().trim(),
    orgDescription: z.string().trim(),
    orgDescriptionEn: z.string().trim(),
    peopleName: z.string().trim(),
    peopleNameEn: z.string().trim(),
    headImg: z.string().trim(),
    personsOneLiner: z.string().trim(),
    personsOneLinerEn: z.string().trim(),
    personsIntroduce: z.string().trim(),
    personsIntroduceEn: z.string().trim(),
    eventNameCn: z.string().trim(),
    eventNameEn: z.string().trim(),
    eventImage160: z.string().trim(),
    eventTypes: z.array(z.string()),
    eventNatures: z.array(z.string()),
    eventSummaryCn: z.string().trim(),
    eventSummaryEn: z.string().trim(),
    eventIntroductionCn: z.string().trim(),
    eventIntroductionEn: z.string().trim(),
  })
  .superRefine((values, ctx) => {
    if (values.type === '1' && !values.projectName) {
      ctx.addIssue({
        code: 'custom',
        path: ['projectName'],
        message: '请输入项目名称。',
      })
    }

    if (values.type === '2' && !values.orgName) {
      ctx.addIssue({
        code: 'custom',
        path: ['orgName'],
        message: '请输入机构名称。',
      })
    }

    if (values.type === '3' && !values.peopleName) {
      ctx.addIssue({
        code: 'custom',
        path: ['peopleName'],
        message: '请输入人物名称。',
      })
    }

    if (values.type === '5') {
      if (!values.eventNameCn) {
        ctx.addIssue({
          code: 'custom',
          path: ['eventNameCn'],
          message: '请输入事件名称。',
        })
      }

      if (!values.eventNameEn) {
        ctx.addIssue({
          code: 'custom',
          path: ['eventNameEn'],
          message: '请输入事件英文名称。',
        })
      }

      if (values.eventTypes.length === 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['eventTypes'],
          message: '请选择事件类型。',
        })
      }

      if (values.eventNatures.length === 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['eventNatures'],
          message: '请选择事件性质。',
        })
      }
    }
  })

type ParadiseLostForm = z.infer<typeof formSchema>

type ParadiseLostActionDialogProps = {
  currentRow?: ParadiseLostItem
  open: boolean
  onOpenChange: (open: boolean) => void
}

const emptyDefaults: ParadiseLostForm = {
  type: '1',
  investId: '',
  tags: [],
  year: ['2026'],
  cause: '',
  causeEn: '',
  date: '',
  image: '',
  status: '1',
  desc: '',
  projectName: '',
  projectNameEn: '',
  logo: '',
  oneLiner: '',
  oneLinerEn: '',
  description: '',
  descriptionEn: '',
  active: '1',
  orgName: '',
  orgNameEn: '',
  orgLogo: '',
  orgInfo: '',
  orgInfoEn: '',
  orgDescription: '',
  orgDescriptionEn: '',
  peopleName: '',
  peopleNameEn: '',
  headImg: '',
  personsOneLiner: '',
  personsOneLinerEn: '',
  personsIntroduce: '',
  personsIntroduceEn: '',
  eventNameCn: '',
  eventNameEn: '',
  eventImage160: '',
  eventTypes: [],
  eventNatures: [],
  eventSummaryCn: '',
  eventSummaryEn: '',
  eventIntroductionCn: '',
  eventIntroductionEn: '',
}

function toDateTimeLocal(value: string | null) {
  if (!value) return ''
  return value.replace(' ', 'T').slice(0, 16)
}

function getDefaultValues(currentRow?: ParadiseLostItem): ParadiseLostForm {
  if (!currentRow) return emptyDefaults

  return {
    type: String(currentRow.type) as ParadiseLostForm['type'],
    investId: currentRow.investId,
    tags: currentRow.tags,
    year: currentRow.year.length ? currentRow.year : ['2026'],
    cause: currentRow.cause,
    causeEn: currentRow.causeEn,
    date: toDateTimeLocal(currentRow.date),
    image: currentRow.image,
    status: String(currentRow.status) as ParadiseLostForm['status'],
    desc: currentRow.desc,
    projectName: currentRow.projectName,
    projectNameEn: currentRow.projectNameEn,
    logo: currentRow.logo,
    oneLiner: currentRow.oneLiner,
    oneLinerEn: currentRow.oneLinerEn,
    description: currentRow.description,
    descriptionEn: currentRow.descriptionEn,
    active: String(currentRow.active ?? 1) as ParadiseLostForm['active'],
    orgName: currentRow.orgName,
    orgNameEn: currentRow.orgNameEn,
    orgLogo: currentRow.orgLogo,
    orgInfo: currentRow.orgInfo,
    orgInfoEn: currentRow.orgInfoEn,
    orgDescription: currentRow.orgDescription,
    orgDescriptionEn: currentRow.orgDescriptionEn,
    peopleName: currentRow.peopleName,
    peopleNameEn: currentRow.peopleNameEn,
    headImg: currentRow.headImg,
    personsOneLiner: currentRow.personsOneLiner,
    personsOneLinerEn: currentRow.personsOneLinerEn,
    personsIntroduce: currentRow.personsIntroduce,
    personsIntroduceEn: currentRow.personsIntroduceEn,
    eventNameCn: currentRow.eventNameCn,
    eventNameEn: currentRow.eventNameEn,
    eventImage160: currentRow.eventImage160,
    eventTypes: currentRow.eventTypes,
    eventNatures: currentRow.eventNatures,
    eventSummaryCn: currentRow.eventSummaryCn,
    eventSummaryEn: currentRow.eventSummaryEn,
    eventIntroductionCn: currentRow.eventIntroductionCn,
    eventIntroductionEn: currentRow.eventIntroductionEn,
  }
}

function toggleValue(values: string[], value: string, checked: boolean) {
  if (checked) return Array.from(new Set([...values, value]))
  return values.filter((item) => item !== value)
}

function fieldClassName(className?: string) {
  return cn('space-y-2', className)
}

function applyInvestmentToForm(
  form: UseFormReturn<ParadiseLostForm>,
  option: InvestmentOption
) {
  form.setValue('investId', option.id, { shouldDirty: true })
  form.setValue('projectName', option.projectName, { shouldDirty: true })
  form.setValue('projectNameEn', option.projectNameEn, { shouldDirty: true })
  form.setValue('logo', option.logo, { shouldDirty: true })
  form.setValue('oneLiner', option.oneLiner, { shouldDirty: true })
  form.setValue('oneLinerEn', option.oneLinerEn, { shouldDirty: true })
  form.setValue('description', option.description, { shouldDirty: true })
  form.setValue('descriptionEn', option.descriptionEn, { shouldDirty: true })
  form.setValue('active', String(option.active ?? 1) as '0' | '1', {
    shouldDirty: true,
  })
  form.setValue('orgName', option.orgName, { shouldDirty: true })
  form.setValue('orgNameEn', option.orgNameEn, { shouldDirty: true })
  form.setValue('orgLogo', option.orgLogo, { shouldDirty: true })
  form.setValue('orgInfo', option.orgInfo, { shouldDirty: true })
  form.setValue('orgInfoEn', option.orgInfoEn, { shouldDirty: true })
  form.setValue('orgDescription', option.orgDescription, { shouldDirty: true })
  form.setValue('orgDescriptionEn', option.orgDescriptionEn, {
    shouldDirty: true,
  })
  form.setValue('peopleName', option.peopleName, { shouldDirty: true })
  form.setValue('peopleNameEn', option.peopleNameEn, { shouldDirty: true })
  form.setValue('headImg', option.headImg, { shouldDirty: true })
  form.setValue('personsOneLiner', option.personsOneLiner, {
    shouldDirty: true,
  })
  form.setValue('personsOneLinerEn', option.personsOneLinerEn, {
    shouldDirty: true,
  })
  form.setValue('personsIntroduce', option.personsIntroduce, {
    shouldDirty: true,
  })
  form.setValue('personsIntroduceEn', option.personsIntroduceEn, {
    shouldDirty: true,
  })
  form.setValue('eventNameCn', option.eventNameCn, { shouldDirty: true })
  form.setValue('eventNameEn', option.eventNameEn, { shouldDirty: true })
  form.setValue('eventImage160', option.eventImage160, { shouldDirty: true })
  form.setValue('eventTypes', option.eventTypes, { shouldDirty: true })
  form.setValue('eventNatures', option.eventNatures, { shouldDirty: true })
  form.setValue('eventSummaryCn', option.eventSummaryCn, { shouldDirty: true })
  form.setValue('eventSummaryEn', option.eventSummaryEn, { shouldDirty: true })
  form.setValue('eventIntroductionCn', option.eventIntroductionCn, {
    shouldDirty: true,
  })
  form.setValue('eventIntroductionEn', option.eventIntroductionEn, {
    shouldDirty: true,
  })
}

function toInput(values: ParadiseLostForm): ParadiseLostUpsertInput {
  return {
    type: Number(values.type) as ParadiseLostUpsertInput['type'],
    investId: values.investId.trim(),
    tags: values.tags,
    year: values.year,
    cause: values.cause.trim(),
    causeEn: values.causeEn.trim(),
    date: values.date.trim() || undefined,
    image: values.image.trim(),
    status: Number(values.status) as ParadiseLostUpsertInput['status'],
    desc: values.desc.trim(),
    projectName: values.projectName.trim(),
    projectNameEn: values.projectNameEn.trim(),
    logo: values.logo.trim(),
    oneLiner: values.oneLiner.trim(),
    oneLinerEn: values.oneLinerEn.trim(),
    description: values.description.trim(),
    descriptionEn: values.descriptionEn.trim(),
    active: Number(values.active),
    orgName: values.orgName.trim(),
    orgNameEn: values.orgNameEn.trim(),
    orgLogo: values.orgLogo.trim(),
    orgInfo: values.orgInfo.trim(),
    orgInfoEn: values.orgInfoEn.trim(),
    orgDescription: values.orgDescription.trim(),
    orgDescriptionEn: values.orgDescriptionEn.trim(),
    peopleName: values.peopleName.trim(),
    peopleNameEn: values.peopleNameEn.trim(),
    headImg: values.headImg.trim(),
    personsOneLiner: values.personsOneLiner.trim(),
    personsOneLinerEn: values.personsOneLinerEn.trim(),
    personsIntroduce: values.personsIntroduce.trim(),
    personsIntroduceEn: values.personsIntroduceEn.trim(),
    eventNameCn: values.eventNameCn.trim(),
    eventNameEn: values.eventNameEn.trim(),
    eventImage160: values.eventImage160.trim(),
    eventTypes: values.eventTypes,
    eventNatures: values.eventNatures,
    eventSummaryCn: values.eventSummaryCn.trim(),
    eventSummaryEn: values.eventSummaryEn.trim(),
    eventIntroductionCn: values.eventIntroductionCn.trim(),
    eventIntroductionEn: values.eventIntroductionEn.trim(),
  }
}

export function ParadiseLostActionDialog({
  currentRow,
  open,
  onOpenChange,
}: ParadiseLostActionDialogProps) {
  const isEdit = !!currentRow
  const { setOpen } = useParadiseLost()
  const [investmentKeyword, setInvestmentKeyword] = useState('')
  const form = useForm<ParadiseLostForm>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(currentRow),
  })
  const type = useWatch({ control: form.control, name: 'type' })
  const investmentQuery = useInvestmentOptionsQuery(
    {
      type: Number(type) as ParadiseLostUpsertInput['type'],
      q: investmentKeyword.trim(),
      pageSize: 20,
    },
    investmentKeyword.trim().length > 0
  )
  const tagsQuery = useParadiseLostTagsQuery()
  const yearsQuery = useParadiseLostYearsQuery()
  const eventTypesQuery = useEventTypesQuery()
  const eventNaturesQuery = useEventNaturesQuery()
  const createMutation = useCreateParadiseLostMutation()
  const updateMutation = useUpdateParadiseLostMutation()
  const isSaving = createMutation.isPending || updateMutation.isPending
  const investmentItems = useMemo(
    () => investmentQuery.data?.items ?? [],
    [investmentQuery.data?.items]
  )

  const investmentOptions = useMemo(
    () =>
      investmentItems.map((item) => ({
        label: `${item.name} (${item.id})`,
        value: item.id,
      })),
    [investmentItems]
  )

  const onSubmit = async (values: ParadiseLostForm) => {
    const input = toInput(values)

    try {
      if (currentRow) {
        await updateMutation.mutateAsync({ id: currentRow.id, input })
      } else {
        await createMutation.mutateAsync(input)
      }

      form.reset(getDefaultValues())
      setInvestmentKeyword('')
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
        setInvestmentKeyword('')
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-5xl'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? '编辑失乐园' : '新增失乐园'}</DialogTitle>
          <DialogDescription>
            保存后会同步更新关联源表和专题条目。
          </DialogDescription>
        </DialogHeader>
        {currentRow?.sourceMissing && (
          <Alert className='border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100'>
            <AlertTriangle />
            <AlertTitle>来源对象缺失</AlertTitle>
            <AlertDescription className='text-amber-800 dark:text-amber-200'>
              {currentRow.sourceMissingMessage ||
                '当前条目使用专题表快照展示，保存前需要重新选择有效关联对象。'}
            </AlertDescription>
          </Alert>
        )}
        <div className='max-h-[72vh] w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='paradise-lost-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-6 px-0.5'
            >
              <div className='grid gap-4 md:grid-cols-[160px_1fr_1fr]'>
                <FormField
                  control={form.control}
                  name='type'
                  render={({ field }) => (
                    <FormItem className={fieldClassName()}>
                      <FormLabel>入选类型</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value)
                          form.setValue('investId', '')
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='1'>项目</SelectItem>
                          <SelectItem value='2'>机构</SelectItem>
                          <SelectItem value='3'>人物</SelectItem>
                          <SelectItem value='5'>事件</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className={fieldClassName()}>
                  <Label htmlFor='paradise-lost-investment-search'>
                    搜索关联对象
                  </Label>
                  <Input
                    id='paradise-lost-investment-search'
                    value={investmentKeyword}
                    onChange={(event) =>
                      setInvestmentKeyword(event.target.value)
                    }
                    placeholder='输入 ID 或名称'
                    autoComplete='off'
                  />
                </div>
                <FormField
                  control={form.control}
                  name='investId'
                  render={({ field }) => (
                    <FormItem className={fieldClassName()}>
                      <FormLabel>关联对象</FormLabel>
                      <SelectDropdown
                        isControlled
                        defaultValue={field.value}
                        onValueChange={(value) => {
                          field.onChange(value)
                          const option = investmentItems.find(
                            (item) => item.id === value
                          )
                          if (option) applyInvestmentToForm(form, option)
                        }}
                        placeholder={
                          investmentKeyword.trim() ? '选择搜索结果' : '先搜索'
                        }
                        disabled={investmentOptions.length === 0}
                        isPending={investmentQuery.isFetching}
                        items={investmentOptions}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {type === '1' && <ProjectFields form={form} />}
              {type === '2' && <OrganizationFields form={form} />}
              {type === '3' && <PersonFields form={form} />}
              {type === '5' && (
                <EventFields
                  form={form}
                  eventTypes={eventTypesQuery.data ?? []}
                  eventNatures={eventNaturesQuery.data ?? []}
                />
              )}

              <div className='grid gap-4 border-t pt-5 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='tags'
                  render={({ field }) => (
                    <FormItem className='space-y-3 md:col-span-2'>
                      <div className='flex items-center justify-between gap-2'>
                        <FormLabel>标签</FormLabel>
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          className='gap-2'
                          onClick={() => setOpen('add-tag')}
                        >
                          <Plus size={16} />
                          新增标签
                        </Button>
                      </div>
                      <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-4'>
                        {(tagsQuery.data ?? []).map((tag) => (
                          <Label
                            key={tag.id}
                            className='flex min-h-9 items-center gap-2 rounded-md border px-3 py-2 text-sm'
                          >
                            <Checkbox
                              checked={field.value.includes(String(tag.id))}
                              onCheckedChange={(checked) =>
                                field.onChange(
                                  toggleValue(
                                    field.value,
                                    String(tag.id),
                                    checked === true
                                  )
                                )
                              }
                            />
                            <span className='truncate'>{tag.tagName}</span>
                          </Label>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='year'
                  render={({ field }) => (
                    <FormItem className='space-y-3 md:col-span-2'>
                      <FormLabel>入选年度</FormLabel>
                      <div className='grid gap-2 sm:grid-cols-4 lg:grid-cols-6'>
                        {(yearsQuery.data ?? ['2026']).map((year) => (
                          <Label
                            key={year}
                            className='flex min-h-9 items-center gap-2 rounded-md border px-3 py-2 text-sm'
                          >
                            <Checkbox
                              checked={field.value.includes(year)}
                              onCheckedChange={(checked) =>
                                field.onChange(
                                  toggleValue(
                                    field.value,
                                    year,
                                    checked === true
                                  )
                                )
                              }
                            />
                            <span className='font-mono'>{year}</span>
                          </Label>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <TextAreaField
                  form={form}
                  name='cause'
                  label='入选原因（中）'
                  rows={4}
                />
                <TextAreaField
                  form={form}
                  name='causeEn'
                  label='入选原因（英）'
                  rows={4}
                />
                <InputField
                  form={form}
                  name='date'
                  label='入选时间'
                  type='datetime-local'
                />
                <InputField form={form} name='image' label='背景图 URL' />
                <FormField
                  control={form.control}
                  name='status'
                  render={({ field }) => (
                    <FormItem className={fieldClassName()}>
                      <FormLabel>显示状态</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='1'>显示</SelectItem>
                          <SelectItem value='0'>隐藏</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <InputField form={form} name='desc' label='备注' />
              </div>
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type='submit' form='paradise-lost-form' disabled={isSaving}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function InputField({
  form,
  name,
  label,
  type = 'text',
}: {
  form: UseFormReturn<ParadiseLostForm>
  name: keyof ParadiseLostForm
  label: string
  type?: string
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={fieldClassName()}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type={type}
              value={String(field.value ?? '')}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
              autoComplete='off'
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function TextAreaField({
  form,
  name,
  label,
  rows = 5,
}: {
  form: UseFormReturn<ParadiseLostForm>
  name: keyof ParadiseLostForm
  label: string
  rows?: number
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={fieldClassName()}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea
              rows={rows}
              value={String(field.value ?? '')}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

function ProjectFields({ form }: { form: UseFormReturn<ParadiseLostForm> }) {
  return (
    <div className='grid gap-4 border-t pt-5 md:grid-cols-2'>
      <InputField form={form} name='projectName' label='项目名称（中）' />
      <InputField form={form} name='projectNameEn' label='项目名称（英）' />
      <InputField form={form} name='logo' label='项目 LOGO URL' />
      <FormField
        control={form.control}
        name='active'
        render={({ field }) => (
          <FormItem className={fieldClassName()}>
            <FormLabel>运营状态</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value='1'>运营中</SelectItem>
                <SelectItem value='0'>停止运营</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <InputField form={form} name='oneLiner' label='一句话介绍（中）' />
      <InputField form={form} name='oneLinerEn' label='一句话介绍（英）' />
      <TextAreaField form={form} name='description' label='详细介绍（中）' />
      <TextAreaField form={form} name='descriptionEn' label='详细介绍（英）' />
    </div>
  )
}

function OrganizationFields({
  form,
}: {
  form: UseFormReturn<ParadiseLostForm>
}) {
  return (
    <div className='grid gap-4 border-t pt-5 md:grid-cols-2'>
      <InputField form={form} name='orgName' label='机构名称（中）' />
      <InputField form={form} name='orgNameEn' label='机构名称（英）' />
      <InputField form={form} name='orgLogo' label='机构 LOGO URL' />
      <InputField form={form} name='orgInfo' label='机构简介（中）' />
      <InputField form={form} name='orgInfoEn' label='机构简介（英）' />
      <TextAreaField form={form} name='orgDescription' label='详细介绍（中）' />
      <TextAreaField
        form={form}
        name='orgDescriptionEn'
        label='详细介绍（英）'
      />
    </div>
  )
}

function PersonFields({ form }: { form: UseFormReturn<ParadiseLostForm> }) {
  return (
    <div className='grid gap-4 border-t pt-5 md:grid-cols-2'>
      <InputField form={form} name='peopleName' label='人物名称（中）' />
      <InputField form={form} name='peopleNameEn' label='人物名称（英）' />
      <InputField form={form} name='headImg' label='人物头像 URL' />
      <InputField form={form} name='personsOneLiner' label='人物简介（中）' />
      <InputField form={form} name='personsOneLinerEn' label='人物简介（英）' />
      <TextAreaField
        form={form}
        name='personsIntroduce'
        label='人物介绍（中）'
      />
      <TextAreaField
        form={form}
        name='personsIntroduceEn'
        label='人物介绍（英）'
      />
    </div>
  )
}

function EventFields({
  form,
  eventTypes,
  eventNatures,
}: {
  form: UseFormReturn<ParadiseLostForm>
  eventTypes: { id: number; name: string }[]
  eventNatures: { id: number; name: string }[]
}) {
  return (
    <div className='grid gap-4 border-t pt-5 md:grid-cols-2'>
      <InputField form={form} name='eventNameCn' label='事件名称（中）' />
      <InputField form={form} name='eventNameEn' label='事件名称（英）' />
      <InputField form={form} name='eventImage160' label='事件配图 URL' />
      <FormField
        control={form.control}
        name='eventTypes'
        render={({ field }) => (
          <FormItem className='space-y-3'>
            <FormLabel>事件类型</FormLabel>
            <div className='grid gap-2 sm:grid-cols-2'>
              {eventTypes.map((type) => (
                <Label
                  key={type.id}
                  className='flex min-h-9 items-center gap-2 rounded-md border px-3 py-2 text-sm'
                >
                  <Checkbox
                    checked={field.value.includes(String(type.id))}
                    onCheckedChange={(checked) =>
                      field.onChange(
                        toggleValue(
                          field.value,
                          String(type.id),
                          checked === true
                        )
                      )
                    }
                  />
                  <span className='truncate'>{type.name}</span>
                </Label>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name='eventNatures'
        render={({ field }) => (
          <FormItem className='space-y-3'>
            <FormLabel>事件性质</FormLabel>
            <div className='grid gap-2 sm:grid-cols-2'>
              {eventNatures.map((nature) => (
                <Label
                  key={nature.id}
                  className='flex min-h-9 items-center gap-2 rounded-md border px-3 py-2 text-sm'
                >
                  <Checkbox
                    checked={field.value.includes(String(nature.id))}
                    onCheckedChange={(checked) =>
                      field.onChange(
                        toggleValue(
                          field.value,
                          String(nature.id),
                          checked === true
                        )
                      )
                    }
                  />
                  <span className='truncate'>{nature.name}</span>
                </Label>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      <InputField form={form} name='eventSummaryCn' label='事件简介（中）' />
      <InputField form={form} name='eventSummaryEn' label='事件简介（英）' />
      <TextAreaField
        form={form}
        name='eventIntroductionCn'
        label='事件介绍（中）'
      />
      <TextAreaField
        form={form}
        name='eventIntroductionEn'
        label='事件介绍（英）'
      />
    </div>
  )
}
