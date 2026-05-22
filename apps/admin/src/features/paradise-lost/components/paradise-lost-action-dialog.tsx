'use client'

import { useMemo, useState, type ReactNode } from 'react'
import { z } from 'zod'
import { useForm, useWatch, type UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  AlertTriangle,
  Check,
  ChevronsUpDown,
  Loader2,
  Plus,
  Search,
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Dialog,
  DialogClose,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { type ParadiseLostUpsertInput } from '../api/paradise-lost-api'
import { type InvestmentOption, type ParadiseLostItem } from '../data/schema'
import { typeLabels } from '../data/data'
import {
  useCreateParadiseLostMutation,
  useEventNaturesQuery,
  useEventTypesQuery,
  useInvestmentOptionsQuery,
  useParadiseLostTagsQuery,
  useParadiseLostYearsQuery,
  useUpdateParadiseLostMutation,
} from '../hooks/use-paradise-lost-query'
import { ParadiseLostTagDialog } from './paradise-lost-tag-dialog'

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

    if (values.type === '1' && !values.projectNameEn) {
      ctx.addIssue({
        code: 'custom',
        path: ['projectNameEn'],
        message: '请输入项目英文名称。',
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

    if (values.type === '3' && !values.peopleNameEn) {
      ctx.addIssue({
        code: 'custom',
        path: ['peopleNameEn'],
        message: '请输入人物英文名称。',
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

const typeOptions = [
  { value: '1', label: '项目', description: '项目资料与运营状态' },
  { value: '2', label: '机构', description: '机构信息与简介' },
  { value: '3', label: '人物', description: '人物资料与介绍' },
  { value: '5', label: '事件', description: '事件类型与性质' },
] satisfies Array<{
  value: ParadiseLostForm['type']
  label: string
  description: string
}>

function getFallbackName(value: string) {
  return value.trim().slice(0, 1) || '?'
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

function RequiredLabel({ children }: { children: ReactNode }) {
  return (
    <span className='inline-flex items-center gap-1.5'>
      <span>{children}</span>
      <span
        className='rounded-sm bg-destructive/10 px-1.5 py-0.5 text-[10px] leading-none font-medium text-destructive'
        aria-label='必填'
      >
        必填
      </span>
    </span>
  )
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
  const [investmentKeyword, setInvestmentKeyword] = useState('')
  const [tagDialogOpen, setTagDialogOpen] = useState(false)
  const form = useForm<ParadiseLostForm>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(currentRow),
  })
  const type = useWatch({ control: form.control, name: 'type' })
  const investmentQuery = useInvestmentOptionsQuery(
    {
      type: Number(type) as ParadiseLostUpsertInput['type'],
      q: investmentKeyword.trim() || undefined,
      pageSize: 20,
    },
    open
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
    <>
      <Dialog
        open={open}
        onOpenChange={(state) => {
          form.reset(getDefaultValues(currentRow))
          setInvestmentKeyword('')
          onOpenChange(state)
        }}
      >
        <DialogContent className='grid max-h-[calc(100vh-2rem)] gap-0 overflow-hidden p-0 sm:max-w-5xl'>
          <DialogHeader className='border-b px-6 py-5 text-start'>
            <DialogTitle>{isEdit ? '编辑失乐园' : '新增失乐园'}</DialogTitle>
            <DialogDescription>
              先选择入选类型和关联对象，再维护该类型的源资料与专题展示信息。带“必填”标记的字段需要填写。
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              id='paradise-lost-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='contents'
            >
              <div className='max-h-[calc(100vh-12.5rem)] overflow-y-auto px-6 py-5'>
                <div className='space-y-5'>
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

                  <TypeSelector
                    form={form}
                    onTypeChange={() => setInvestmentKeyword('')}
                  />

                  <AssociationSection
                    form={form}
                    currentRow={currentRow}
                    type={type}
                    keyword={investmentKeyword}
                    onKeywordChange={setInvestmentKeyword}
                    investmentItems={investmentItems}
                    isFetching={investmentQuery.isFetching}
                    total={investmentQuery.data?.total ?? 0}
                  />

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

                  <TopicFieldsSection
                    form={form}
                    tags={tagsQuery.data ?? []}
                    tagsLoading={tagsQuery.isFetching}
                    years={yearsQuery.data ?? ['2026']}
                    onAddTag={() => setTagDialogOpen(true)}
                  />
                </div>
              </div>
              <DialogFooter className='border-t bg-muted/20 px-6 py-4'>
                <DialogClose asChild>
                  <Button type='button' variant='outline'>
                    取消
                  </Button>
                </DialogClose>
                <Button type='submit' disabled={isSaving}>
                  {isSaving && <Loader2 className='animate-spin' />}
                  {isSaving ? '保存中...' : '保存'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ParadiseLostTagDialog
        open={tagDialogOpen}
        onOpenChange={setTagDialogOpen}
      />
    </>
  )
}

function FormSection({
  title,
  description,
  children,
  className,
  action,
}: {
  title: string
  description?: string
  children: ReactNode
  className?: string
  action?: ReactNode
}) {
  return (
    <section
      className={cn('rounded-lg border bg-card p-4 shadow-xs', className)}
    >
      <div className='mb-4 flex flex-wrap items-start justify-between gap-3'>
        <div className='space-y-1'>
          <h3 className='text-sm font-semibold'>{title}</h3>
          {description && (
            <p className='text-xs leading-5 text-muted-foreground'>
              {description}
            </p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

function TypeSelector({
  form,
  onTypeChange,
}: {
  form: UseFormReturn<ParadiseLostForm>
  onTypeChange: () => void
}) {
  return (
    <FormSection
      title='入选类型'
      description='不同类型对应不同的源表和编辑字段，切换后需要重新选择关联对象。'
      className='bg-muted/20'
    >
      <FormField
        control={form.control}
        name='type'
        render={({ field }) => (
          <FormItem>
            <Tabs
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value)
                form.setValue('investId', '', {
                  shouldDirty: true,
                  shouldValidate: false,
                })
                form.clearErrors('investId')
                onTypeChange()
              }}
            >
              <TabsList className='grid h-auto w-full grid-cols-2 gap-1 rounded-md p-1 sm:grid-cols-4'>
                {typeOptions.map((option) => (
                  <TabsTrigger
                    key={option.value}
                    value={option.value}
                    className='h-auto flex-col items-start gap-1 px-3 py-2 text-start'
                  >
                    <span className='text-sm font-semibold'>
                      {option.label}
                    </span>
                    <span className='text-xs font-normal text-muted-foreground'>
                      {option.description}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <FormMessage />
          </FormItem>
        )}
      />
    </FormSection>
  )
}

function AssociationSection({
  form,
  currentRow,
  type,
  keyword,
  onKeywordChange,
  investmentItems,
  isFetching,
  total,
}: {
  form: UseFormReturn<ParadiseLostForm>
  currentRow?: ParadiseLostItem
  type: ParadiseLostForm['type']
  keyword: string
  onKeywordChange: (value: string) => void
  investmentItems: InvestmentOption[]
  isFetching: boolean
  total: number
}) {
  const [pickerOpen, setPickerOpen] = useState(false)
  const investId = useWatch({ control: form.control, name: 'investId' })
  const numericType = Number(type) as InvestmentOption['type']
  const typeText = typeLabels[numericType]
  const selectedFromItems = investmentItems.find((item) => item.id === investId)
  const selectedFromCurrentRow =
    currentRow &&
    currentRow.investId === investId &&
    currentRow.type === numericType
      ? {
          id: currentRow.investId,
          name: currentRow.name,
          avatar: currentRow.avatar,
          type: currentRow.type,
        }
      : undefined
  const selectedSource = selectedFromItems ?? selectedFromCurrentRow

  return (
    <FormSection
      title='关联对象'
      description={`从已有${typeText}中选择，或输入 ID / 名称搜索后再选择。选择后会把源表字段填入下方编辑区。`}
    >
      <div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,360px)]'>
        <FormField
          control={form.control}
          name='investId'
          render={({ field }) => (
            <FormItem className='space-y-2'>
              <FormLabel>
                <RequiredLabel>选择{typeText}</RequiredLabel>
              </FormLabel>
              <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      type='button'
                      variant='outline'
                      role='combobox'
                      aria-expanded={pickerOpen}
                      aria-required='true'
                      className='h-11 w-full justify-between'
                    >
                      <span className='min-w-0 truncate text-start'>
                        {selectedSource
                          ? `${selectedSource.name || selectedSource.id} (${selectedSource.id})`
                          : `从已有${typeText}中选择`}
                      </span>
                      <ChevronsUpDown className='opacity-50' />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent
                  align='start'
                  className='w-100 max-w-[calc(100vw-3rem)] p-0'
                >
                  <Command shouldFilter={false}>
                    <CommandInput
                      value={keyword}
                      onValueChange={onKeywordChange}
                      placeholder={`搜索${typeText} ID 或名称`}
                    />
                    <CommandList className='max-h-80'>
                      {isFetching && (
                        <div className='flex items-center gap-2 px-3 py-3 text-sm text-muted-foreground'>
                          <Loader2 className='size-4 animate-spin' />
                          正在加载可选{typeText}...
                        </div>
                      )}
                      {!isFetching && investmentItems.length === 0 && (
                        <CommandEmpty>
                          {keyword.trim()
                            ? '没有匹配的关联对象。'
                            : `暂无可选择的${typeText}。`}
                        </CommandEmpty>
                      )}
                      {investmentItems.length > 0 && (
                        <CommandGroup
                          heading={
                            keyword.trim() ? '搜索结果' : `最近可选${typeText}`
                          }
                        >
                          {investmentItems.map((item) => (
                            <CommandItem
                              key={item.id}
                              value={`${item.id} ${item.name}`}
                              className='cursor-pointer items-start gap-3 py-2'
                              onSelect={() => {
                                field.onChange(item.id)
                                applyInvestmentToForm(form, item)
                                setPickerOpen(false)
                              }}
                            >
                              <Avatar className='mt-0.5 size-8 rounded-md'>
                                <AvatarImage
                                  src={item.avatar || undefined}
                                  alt={item.name}
                                />
                                <AvatarFallback className='rounded-md text-xs'>
                                  {getFallbackName(item.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className='min-w-0 flex-1'>
                                <div className='truncate font-medium'>
                                  {item.name || item.id}
                                </div>
                                <div className='font-mono text-xs text-muted-foreground'>
                                  {item.id}
                                </div>
                              </div>
                              {field.value === item.id && (
                                <Check className='mt-1 size-4 text-primary' />
                              )}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                <Search className='size-3.5' />
                {keyword.trim()
                  ? `按“${keyword.trim()}”筛选，找到 ${total} 条`
                  : `默认展示最近 ${investmentItems.length} 条，可直接选择或输入关键词搜索`}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='rounded-md border bg-muted/30 p-3'>
          <div className='mb-2 flex items-center justify-between gap-2'>
            <span className='text-xs font-medium text-muted-foreground'>
              当前关联
            </span>
            <Badge variant='outline'>{typeText}</Badge>
          </div>
          {selectedSource ? (
            <div className='flex items-center gap-3'>
              <Avatar className='size-10 rounded-md'>
                <AvatarImage
                  src={selectedSource.avatar || undefined}
                  alt={selectedSource.name}
                />
                <AvatarFallback className='rounded-md text-xs'>
                  {getFallbackName(selectedSource.name)}
                </AvatarFallback>
              </Avatar>
              <div className='min-w-0'>
                <div className='truncate text-sm font-semibold'>
                  {selectedSource.name || selectedSource.id}
                </div>
                <div className='font-mono text-xs text-muted-foreground'>
                  {selectedSource.id}
                </div>
              </div>
            </div>
          ) : (
            <div className='rounded-md border border-dashed bg-background/60 px-3 py-4 text-sm text-muted-foreground'>
              尚未选择关联对象。
            </div>
          )}
        </div>
      </div>
    </FormSection>
  )
}

function TopicFieldsSection({
  form,
  tags,
  tagsLoading,
  years,
  onAddTag,
}: {
  form: UseFormReturn<ParadiseLostForm>
  tags: { id: number; tagName: string }[]
  tagsLoading: boolean
  years: string[]
  onAddTag: () => void
}) {
  return (
    <FormSection
      title='专题信息'
      description='这些字段只影响失乐园专题中的展示、筛选和发布状态。'
      action={
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='gap-2'
          onClick={onAddTag}
        >
          <Plus size={16} />
          新增标签
        </Button>
      }
    >
      <div className='grid gap-4 md:grid-cols-2'>
        <FormField
          control={form.control}
          name='tags'
          render={({ field }) => (
            <FormItem className='space-y-3 md:col-span-2'>
              <div className='flex items-center justify-between gap-2'>
                <FormLabel>标签</FormLabel>
                <span className='text-xs text-muted-foreground'>
                  已选 {field.value.length} 个
                </span>
              </div>
              <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-4'>
                {tagsLoading && tags.length === 0 ? (
                  <div className='col-span-full flex items-center gap-2 rounded-md border border-dashed px-3 py-3 text-sm text-muted-foreground'>
                    <Loader2 className='size-4 animate-spin' />
                    正在加载标签...
                  </div>
                ) : (
                  tags.map((tag) => (
                    <Label
                      key={tag.id}
                      className='flex min-h-9 cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-muted/60'
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
                  ))
                )}
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
              <div className='flex items-center justify-between gap-2'>
                <FormLabel>
                  <RequiredLabel>入选年度</RequiredLabel>
                </FormLabel>
                <span className='text-xs text-muted-foreground'>
                  至少选择 1 个
                </span>
              </div>
              <div className='grid gap-2 sm:grid-cols-4 lg:grid-cols-6'>
                {years.map((year) => (
                  <Label
                    key={year}
                    className='flex min-h-9 cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-muted/60'
                  >
                    <Checkbox
                      checked={field.value.includes(year)}
                      onCheckedChange={(checked) =>
                        field.onChange(
                          toggleValue(field.value, year, checked === true)
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
              <Select value={field.value} onValueChange={field.onChange}>
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
    </FormSection>
  )
}

function InputField({
  form,
  name,
  label,
  type = 'text',
  required = false,
}: {
  form: UseFormReturn<ParadiseLostForm>
  name: keyof ParadiseLostForm
  label: string
  type?: string
  required?: boolean
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={fieldClassName()}>
          <FormLabel>
            {required ? <RequiredLabel>{label}</RequiredLabel> : label}
          </FormLabel>
          <FormControl>
            <Input
              type={type}
              value={String(field.value ?? '')}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
              aria-required={required}
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
  required = false,
}: {
  form: UseFormReturn<ParadiseLostForm>
  name: keyof ParadiseLostForm
  label: string
  rows?: number
  required?: boolean
}) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={fieldClassName()}>
          <FormLabel>
            {required ? <RequiredLabel>{label}</RequiredLabel> : label}
          </FormLabel>
          <FormControl>
            <Textarea
              rows={rows}
              value={String(field.value ?? '')}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
              aria-required={required}
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
    <FormSection
      title='项目资料'
      description='选择项目后会自动填充，可在保存时同步回项目源表。'
    >
      <div className='grid gap-4 md:grid-cols-2'>
        <InputField
          form={form}
          name='projectName'
          label='项目名称（中）'
          required
        />
        <InputField
          form={form}
          name='projectNameEn'
          label='项目名称（英）'
          required
        />
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
        <TextAreaField
          form={form}
          name='descriptionEn'
          label='详细介绍（英）'
        />
      </div>
    </FormSection>
  )
}

function OrganizationFields({
  form,
}: {
  form: UseFormReturn<ParadiseLostForm>
}) {
  return (
    <FormSection
      title='机构资料'
      description='选择机构后会自动填充，可在保存时同步回机构源表。'
    >
      <div className='grid gap-4 md:grid-cols-2'>
        <InputField
          form={form}
          name='orgName'
          label='机构名称（中）'
          required
        />
        <InputField form={form} name='orgNameEn' label='机构名称（英）' />
        <InputField form={form} name='orgLogo' label='机构 LOGO URL' />
        <InputField form={form} name='orgInfo' label='机构简介（中）' />
        <InputField form={form} name='orgInfoEn' label='机构简介（英）' />
        <TextAreaField
          form={form}
          name='orgDescription'
          label='详细介绍（中）'
        />
        <TextAreaField
          form={form}
          name='orgDescriptionEn'
          label='详细介绍（英）'
        />
      </div>
    </FormSection>
  )
}

function PersonFields({ form }: { form: UseFormReturn<ParadiseLostForm> }) {
  return (
    <FormSection
      title='人物资料'
      description='选择人物后会自动填充，可在保存时同步回人物源表。'
    >
      <div className='grid gap-4 md:grid-cols-2'>
        <InputField
          form={form}
          name='peopleName'
          label='人物名称（中）'
          required
        />
        <InputField
          form={form}
          name='peopleNameEn'
          label='人物名称（英）'
          required
        />
        <InputField form={form} name='headImg' label='人物头像 URL' />
        <InputField form={form} name='personsOneLiner' label='人物简介（中）' />
        <InputField
          form={form}
          name='personsOneLinerEn'
          label='人物简介（英）'
        />
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
    </FormSection>
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
    <FormSection
      title='事件资料'
      description='选择事件后会自动填充，事件类型和性质为必选项。'
    >
      <div className='grid gap-4 md:grid-cols-2'>
        <InputField
          form={form}
          name='eventNameCn'
          label='事件名称（中）'
          required
        />
        <InputField
          form={form}
          name='eventNameEn'
          label='事件名称（英）'
          required
        />
        <InputField form={form} name='eventImage160' label='事件配图 URL' />
        <FormField
          control={form.control}
          name='eventTypes'
          render={({ field }) => (
            <FormItem className='space-y-3'>
              <FormLabel>
                <RequiredLabel>事件类型</RequiredLabel>
              </FormLabel>
              <div
                className='grid gap-2 sm:grid-cols-2'
                role='group'
                aria-required='true'
              >
                {eventTypes.map((type) => (
                  <Label
                    key={type.id}
                    className='flex min-h-9 cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-muted/60'
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
              <FormLabel>
                <RequiredLabel>事件性质</RequiredLabel>
              </FormLabel>
              <div
                className='grid gap-2 sm:grid-cols-2'
                role='group'
                aria-required='true'
              >
                {eventNatures.map((nature) => (
                  <Label
                    key={nature.id}
                    className='flex min-h-9 cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-muted/60'
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
    </FormSection>
  )
}
