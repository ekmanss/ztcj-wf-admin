import * as React from 'react'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { useEffect, useMemo, useState } from 'react'
import {
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Building2,
  Edit,
  Eye,
  EyeOff,
  Flame,
  Landmark,
  Plus,
  Trash2,
  UserRound,
} from 'lucide-react'
import { ConfigDrawer } from '@/components/config-drawer'
import {
  DataTableBulkActions,
  DataTableColumnHeader,
  DataTablePagination,
  DataTableToolbar,
} from '@/components/data-table'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { type NavigateFn, useTableUrlState } from '@/hooks/use-table-url-state'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import {
  type ContractInput,
  type EventInput,
  type FundingRoundInput,
  type JobChangeInput,
  type OrganizationInput,
  type PersonInput,
  type ProjectInput,
  type ReportInput,
  type TeamMemberInput,
} from './api/rootdata-api'
import type {
  FundingRound,
  JobChange,
  ProjectContract,
  ProjectEvent,
  ProjectReport,
  RootdataEntityType,
  RootdataOrganization,
  RootdataPerson,
  RootdataProject,
  RootdataStatus,
  TeamMember,
} from './data/schema'
import {
  useDeleteFundingRoundMutation,
  useDeleteJobChangeMutation,
  useDeleteOrganizationMutation,
  useDeleteOrganizationsMutation,
  useDeletePersonMutation,
  useDeletePersonsMutation,
  useDeleteProjectContractMutation,
  useDeleteProjectEventMutation,
  useDeleteProjectMutation,
  useDeleteProjectsMutation,
  useDeleteProjectReportMutation,
  useDeleteTeamMemberMutation,
  useEntityOptionsQuery,
  useFundingRoundNamesQuery,
  useFundingRoundsQuery,
  useOrganizationStatusMutation,
  useOrganizationsQuery,
  usePersonJobChangesQuery,
  usePersonStatusMutation,
  usePersonsQuery,
  useProjectContractsQuery,
  useProjectEventsQuery,
  useProjectFundingRoundsQuery,
  useProjectReportsQuery,
  useProjectStatusMutation,
  useProjectsQuery,
  useSaveFundingRoundMutation,
  useSaveJobChangeMutation,
  useSaveOrganizationMutation,
  useSavePersonMutation,
  useSaveProjectContractMutation,
  useSaveProjectEventMutation,
  useSaveProjectMutation,
  useSaveProjectReportMutation,
  useSaveTeamMemberMutation,
  useTeamMembersQuery,
} from './hooks/use-rootdata-query'

type RootdataPageProps = {
  search: Record<string, unknown>
  setSearch: (
    updater: (previous: Record<string, unknown>) => Record<string, unknown>
  ) => void
}

type TablePageProps<T> = RootdataPageProps & {
  title: string
  description: string
  addLabel: string
  entityName: string
  icon: React.ComponentType<{ className?: string }>
  data: T[]
  total: number
  isLoading: boolean
  isError: boolean
  onAdd: () => void
  getRowId: (row: T) => string | number
  columns: ColumnDef<T>[]
  columnLabels: Record<string, string>
  filters?: Array<{
    columnId: string
    title: string
    options: { label: string; value: string }[]
  }>
  renderBulkActions: (
    ids: string[],
    clearSelection: () => void
  ) => React.ReactNode
}

type RowActionItem = {
  label: string
  icon: React.ComponentType<{ className?: string; size?: number }>
  onClick: () => void
  destructive?: boolean
  separatorBefore?: boolean
}

const paginationCopy = {
  pageLabel: (currentPage: number, totalPages: number) =>
    `第 ${currentPage} / ${totalPages} 页`,
  rowsPerPageLabel: '每页行数',
  firstPageLabel: '跳到第一页',
  previousPageLabel: '上一页',
  pageButtonLabel: (page: number) => `跳到第 ${page} 页`,
  nextPageLabel: '下一页',
  lastPageLabel: '跳到最后一页',
}

const facetedFilterCopy = {
  selectedCountLabel: (selectedCount: number) => `已选择 ${selectedCount} 项`,
  emptyLabel: '无结果。',
  clearFiltersLabel: '清除筛选',
}

const statusFilterOptions = [
  { label: '显示', value: '1' },
  { label: '隐藏', value: '0' },
]

const activeFilterOptions = [
  { label: '运营中', value: '1' },
  { label: '停止运营', value: '0' },
]

const yesNoFilterOptions = [
  { label: '是', value: '1' },
  { label: '否', value: '0' },
]

const statusLabels = {
  0: '隐藏',
  1: '显示',
} satisfies Record<RootdataStatus, string>

const jobTypeLabels: Record<number, string> = {
  1: '近期入职',
  2: '近期离职',
  3: '在职',
}

const entityTypeLabels: Record<RootdataEntityType, string> = {
  1: '项目',
  2: '机构',
  3: '人物',
}

function csv(values: string[]) {
  return values.join(', ')
}

function splitCsv(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function numberOrUndefined(value: string) {
  if (!value.trim()) return undefined
  const number = Number(value)
  return Number.isFinite(number) ? number : undefined
}

function toStatus(value: string): RootdataStatus {
  return value === '0' ? 0 : 1
}

function toStringArray(value: unknown) {
  return Array.isArray(value) ? value.map((item) => String(item)) : []
}

function toStatusArray(value: unknown) {
  return Array.isArray(value)
    ? value.map(Number).filter((item) => item === 0 || item === 1)
    : []
}

function statusBadge(value: RootdataStatus) {
  return (
    <Badge variant={value === 1 ? 'default' : 'secondary'}>
      {statusLabels[value]}
    </Badge>
  )
}

function RowActionMenu({
  items,
  contentClassName = 'w-40',
}: {
  items: RowActionItem[]
  contentClassName?: string
}) {
  return (
    <div className='flex justify-end'>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
          >
            <DotsHorizontalIcon className='h-4 w-4' />
            <span className='sr-only'>打开操作菜单</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className={contentClassName}>
          {items.map((item) => {
            const Icon = item.icon

            return (
              <React.Fragment key={item.label}>
                {item.separatorBefore && <DropdownMenuSeparator />}
                <DropdownMenuItem
                  onClick={item.onClick}
                  className={item.destructive ? 'text-red-500!' : undefined}
                >
                  {item.label}
                  <DropdownMenuShortcut>
                    <Icon size={16} />
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
              </React.Fragment>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function EntityImage({
  src,
  alt,
  shape = 'square',
  size = 'sm',
  fit = 'cover',
}: {
  src?: string | null
  alt: string
  shape?: 'square' | 'circle'
  size?: 'sm' | 'lg'
  fit?: 'cover' | 'contain'
}) {
  const [failed, setFailed] = useState(false)
  const normalizedSrc = src?.trim()
  const sizeClass = size === 'lg' ? 'size-20' : 'size-10'
  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-md'

  if (!normalizedSrc || failed) {
    return (
      <div
        className={`${sizeClass} ${shapeClass} flex shrink-0 items-center justify-center border bg-muted text-[10px] text-muted-foreground`}
      >
        无图
      </div>
    )
  }

  return (
    <div
      className={`${sizeClass} ${shapeClass} shrink-0 overflow-hidden border bg-background`}
    >
      <img
        src={normalizedSrc}
        alt={alt}
        className={`h-full w-full ${fit === 'contain' ? 'object-contain p-1' : 'object-cover'}`}
        loading='lazy'
        onError={() => setFailed(true)}
      />
    </div>
  )
}

function EntityNameCell({
  imageSrc,
  imageAlt,
  title,
  subtitle,
  imageShape,
  imageFit = 'contain',
}: {
  imageSrc?: string | null
  imageAlt: string
  title: string
  subtitle?: string
  imageShape?: 'square' | 'circle'
  imageFit?: 'cover' | 'contain'
}) {
  return (
    <div className='flex min-w-56 items-center gap-3'>
      <EntityImage
        src={imageSrc}
        alt={imageAlt}
        shape={imageShape}
        fit={imageFit}
      />
      <div className='min-w-0'>
        <div className='truncate font-medium'>{title}</div>
        <div className='truncate text-xs text-muted-foreground'>{subtitle}</div>
      </div>
    </div>
  )
}

function RootdataShell<T>({
  search,
  setSearch,
  title,
  description,
  addLabel,
  entityName,
  icon: Icon,
  data,
  total,
  isLoading,
  isError,
  onAdd,
  getRowId,
  columns,
  columnLabels,
  filters = [],
  renderBulkActions,
}: TablePageProps<T>) {
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])

  const navigate: NavigateFn = ({ search: nextSearch }) => {
    if (nextSearch === true) return

    setSearch((previous) => {
      if (typeof nextSearch === 'function') {
        return nextSearch(previous)
      }

      return nextSearch
    })
  }

  const {
    globalFilter,
    onGlobalFilterChange,
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { key: 'q' },
    columnFilters: filters.map((filter) => ({
      columnId: filter.columnId,
      searchKey: filter.columnId,
      type: 'array',
      deserialize: toStringArray,
      serialize: toStatusArray,
    })),
  })

  const selectionColumn = useMemo<ColumnDef<T>>(
    () => ({
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label='全选'
          className='translate-y-0.5'
        />
      ),
      meta: {
        className: cn('inset-s-0 z-10 rounded-tl-[inherit] max-md:sticky'),
      },
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label='选择行'
          className='translate-y-0.5'
        />
      ),
      enableSorting: false,
      enableHiding: false,
    }),
    []
  )
  const tableColumns = useMemo(
    () => [selectionColumn, ...columns],
    [columns, selectionColumn]
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      pagination,
      rowSelection,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    enableRowSelection: true,
    getRowId: (row) => String(getRowId(row)),
    onPaginationChange,
    onColumnFiltersChange,
    onGlobalFilterChange,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    manualFiltering: true,
    manualPagination: true,
    rowCount: total,
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  useEffect(() => {
    ensurePageInRange(Math.ceil(total / pagination.pageSize))
  }, [total, pagination.pageSize, ensurePageInRange])

  const selectedIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row) => row.id)

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-3'>
          <div className='flex items-start gap-3'>
            <div className='mt-1 flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary'>
              <Icon className='size-5' />
            </div>
            <div>
              <h2 className='text-2xl font-bold tracking-tight'>{title}</h2>
              <p className='text-muted-foreground'>{description}</p>
            </div>
          </div>
          <Button onClick={onAdd}>
            <Plus className='me-2 size-4' />
            {addLabel}
          </Button>
        </div>

        {isError && (
          <Alert variant='destructive'>
            <AlertTitle>无法加载资料</AlertTitle>
            <AlertDescription>
              请确认 API 服务已启动，且 DATABASE_URL 指向可用数据库。
            </AlertDescription>
          </Alert>
        )}

        <DataTableToolbar
          table={table}
          searchPlaceholder='按名称或 ID 搜索...'
          resetLabel='重置'
          facetedFilterCopy={facetedFilterCopy}
          viewOptions={{
            triggerLabel: '视图',
            toggleColumnsLabel: '切换列显示',
            columnLabels,
          }}
          filters={filters}
        />

        <div className='text-sm text-muted-foreground'>共 {total} 条</div>

        <div className='overflow-hidden rounded-md border'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className='group/row'>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                        header.column.columnDef.meta?.className,
                        header.column.columnDef.meta?.thClassName
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={tableColumns.length}
                    className='h-24 text-center'
                  >
                    正在加载...
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className='group/row'
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                          cell.column.columnDef.meta?.className,
                          cell.column.columnDef.meta?.tdClassName
                        )}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={tableColumns.length}
                    className='h-24 text-center'
                  >
                    没有结果。
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <DataTablePagination
          table={table}
          className='mt-auto'
          copy={paginationCopy}
        />
        <DataTableBulkActions
          table={table}
          entityName={entityName}
          copy={{
            selectedLabel: (selectedCount) => `已选择 ${selectedCount} 项`,
            clearSelection: '清除选择',
            toolbarLabel: (selectedCount) =>
              `${selectedCount} 个${entityName}的批量操作`,
            announcement: (selectedCount) =>
              `已选择 ${selectedCount} 个${entityName}，可使用批量操作工具栏。`,
          }}
        >
          {renderBulkActions(selectedIds, () => table.resetRowSelection())}
        </DataTableBulkActions>
      </Main>
    </>
  )
}

export function RootdataProjects({ search, setSearch }: RootdataPageProps) {
  const query = useProjectsQuery(search)
  const [formRow, setFormRow] = useState<RootdataProject | null | undefined>()
  const [detailRow, setDetailRow] = useState<RootdataProject | null>(null)
  const deleteMutation = useDeleteProjectMutation()
  const bulkDeleteMutation = useDeleteProjectsMutation()
  const statusMutation = useProjectStatusMutation()
  const columns: ColumnDef<RootdataProject>[] = [
    {
      accessorKey: 'projectId',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='ID' />
      ),
      cell: ({ row }) => (
        <span className='font-mono text-xs'>{row.original.projectId}</span>
      ),
      meta: { className: 'w-40' },
      enableHiding: false,
    },
    {
      id: 'project',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='项目' />
      ),
      cell: ({ row }) => (
        <EntityNameCell
          imageSrc={row.original.logo}
          imageAlt={`${row.original.projectName} logo`}
          title={row.original.projectName}
          subtitle={row.original.projectNameEn}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'tokenSymbol',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='代币' />
      ),
      cell: ({ row }) => row.original.tokenSymbol || '-',
      enableSorting: false,
    },
    {
      accessorKey: 'active',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='运营' />
      ),
      cell: ({ row }) => statusBadge(row.original.active),
      enableSorting: false,
    },
    {
      accessorKey: 'isHot',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='热门' />
      ),
      cell: ({ row }) => (row.original.isHot ? '是' : '否'),
      enableSorting: false,
    },
    {
      accessorKey: 'isShow',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='显示' />
      ),
      cell: ({ row }) => statusBadge(row.original.isShow),
      enableSorting: false,
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='更新时间' />
      ),
      cell: ({ row }) => (
        <span className='text-xs text-muted-foreground'>
          {row.original.updatedAt ?? '-'}
        </span>
      ),
      enableSorting: false,
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <RowActionMenu
          contentClassName='w-44'
          items={[
            {
              label: '查看详情',
              icon: Eye,
              onClick: () => setDetailRow(row.original),
            },
            {
              label: '编辑项目',
              icon: Edit,
              onClick: () => setFormRow(row.original),
            },
            {
              label: row.original.isHot === 1 ? '取消热门' : '设为热门',
              icon: Flame,
              onClick: () =>
                statusMutation.mutate({
                  ids: [row.original.autoId],
                  field: 'isHot',
                  value: row.original.isHot === 1 ? 0 : 1,
                }),
            },
            {
              label: row.original.isShow === 1 ? '设为隐藏' : '设为显示',
              icon: row.original.isShow === 1 ? EyeOff : Eye,
              onClick: () =>
                statusMutation.mutate({
                  ids: [row.original.autoId],
                  field: 'isShow',
                  value: row.original.isShow === 1 ? 0 : 1,
                }),
            },
            {
              label: '删除项目',
              icon: Trash2,
              destructive: true,
              separatorBefore: true,
              onClick: () => {
                if (
                  window.confirm(
                    `确认删除项目「${row.original.projectName}」？`
                  )
                ) {
                  deleteMutation.mutate(row.original.autoId)
                }
              },
            },
          ]}
        />
      ),
      meta: { className: 'w-16 text-right' },
      enableSorting: false,
      enableHiding: false,
    },
  ]

  return (
    <>
      <RootdataShell
        search={search}
        setSearch={setSearch}
        title='项目管理'
        description='管理项目基础资料、社交媒体、团队、融资和展示状态。'
        addLabel='新增项目'
        entityName='项目'
        icon={Landmark}
        data={query.data?.items ?? []}
        total={query.data?.total ?? 0}
        isLoading={query.isPending}
        isError={query.isError}
        onAdd={() => setFormRow(null)}
        getRowId={(row) => row.autoId}
        columns={columns}
        columnLabels={{
          projectId: 'ID',
          project: '项目',
          tokenSymbol: '代币',
          active: '运营',
          isHot: '热门',
          isShow: '显示',
          updatedAt: '更新时间',
        }}
        filters={[
          { columnId: 'active', title: '运营', options: activeFilterOptions },
          { columnId: 'isHot', title: '热门', options: yesNoFilterOptions },
          { columnId: 'isShow', title: '显示', options: statusFilterOptions },
        ]}
        renderBulkActions={(ids, clearSelection) => {
          const numericIds = ids.map(Number)
          return (
            <>
              <Button
                size='sm'
                variant='outline'
                onClick={() =>
                  statusMutation.mutate(
                    { ids: numericIds, field: 'isHot', value: 1 },
                    { onSuccess: clearSelection }
                  )
                }
              >
                设为热门
              </Button>
              <Button
                size='sm'
                variant='outline'
                onClick={() =>
                  statusMutation.mutate(
                    { ids: numericIds, field: 'isHot', value: 0 },
                    { onSuccess: clearSelection }
                  )
                }
              >
                取消热门
              </Button>
              <Button
                size='sm'
                variant='outline'
                onClick={() =>
                  statusMutation.mutate(
                    { ids: numericIds, field: 'isShow', value: 1 },
                    { onSuccess: clearSelection }
                  )
                }
              >
                显示
              </Button>
              <Button
                size='sm'
                variant='outline'
                onClick={() =>
                  statusMutation.mutate(
                    { ids: numericIds, field: 'isShow', value: 0 },
                    { onSuccess: clearSelection }
                  )
                }
              >
                隐藏
              </Button>
              <Button
                size='sm'
                variant='destructive'
                onClick={() => {
                  if (window.confirm(`确认删除选中的 ${ids.length} 个项目？`)) {
                    bulkDeleteMutation.mutate(numericIds, {
                      onSuccess: clearSelection,
                    })
                  }
                }}
              >
                删除
              </Button>
            </>
          )
        }}
      />
      {formRow !== undefined && (
        <ProjectFormDialog
          row={formRow ?? undefined}
          open
          onOpenChange={(open) => !open && setFormRow(undefined)}
        />
      )}
      <ProjectDetailDialog
        row={detailRow}
        open={detailRow !== null}
        onOpenChange={(open) => !open && setDetailRow(null)}
      />
    </>
  )
}

export function RootdataPersons({ search, setSearch }: RootdataPageProps) {
  const query = usePersonsQuery(search)
  const [formRow, setFormRow] = useState<RootdataPerson | null | undefined>()
  const [detailRow, setDetailRow] = useState<RootdataPerson | null>(null)
  const deleteMutation = useDeletePersonMutation()
  const bulkDeleteMutation = useDeletePersonsMutation()
  const statusMutation = usePersonStatusMutation()
  const columns: ColumnDef<RootdataPerson>[] = [
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='ID' />
      ),
      cell: ({ row }) => (
        <span className='font-mono text-xs'>{row.original.id}</span>
      ),
      meta: { className: 'w-40' },
      enableHiding: false,
    },
    {
      id: 'person',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='人物' />
      ),
      cell: ({ row }) => (
        <EntityNameCell
          imageSrc={row.original.headImg}
          imageAlt={`${row.original.peopleName} 头像`}
          title={row.original.peopleName}
          subtitle={row.original.peopleNameEn}
          imageShape='circle'
          imageFit='cover'
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'heat',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='X 热度' />
      ),
      cell: ({ row }) => row.original.heat || '-',
      enableSorting: false,
    },
    {
      accessorKey: 'influence',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='X 影响力' />
      ),
      cell: ({ row }) => row.original.influence || '-',
      enableSorting: false,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='状态' />
      ),
      cell: ({ row }) => statusBadge(row.original.status),
      enableSorting: false,
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='更新时间' />
      ),
      cell: ({ row }) => (
        <span className='text-xs text-muted-foreground'>
          {row.original.updatedAt ?? '-'}
        </span>
      ),
      enableSorting: false,
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <RowActionMenu
          items={[
            {
              label: '查看详情',
              icon: Eye,
              onClick: () => setDetailRow(row.original),
            },
            {
              label: '编辑人物',
              icon: Edit,
              onClick: () => setFormRow(row.original),
            },
            {
              label: row.original.status === 1 ? '设为隐藏' : '设为显示',
              icon: row.original.status === 1 ? EyeOff : Eye,
              onClick: () =>
                statusMutation.mutate({
                  ids: [row.original.id],
                  status: row.original.status === 1 ? 0 : 1,
                }),
            },
            {
              label: '删除人物',
              icon: Trash2,
              destructive: true,
              separatorBefore: true,
              onClick: () => {
                if (
                  window.confirm(`确认删除人物「${row.original.peopleName}」？`)
                ) {
                  deleteMutation.mutate(row.original.id)
                }
              },
            },
          ]}
        />
      ),
      meta: { className: 'w-16 text-right' },
      enableSorting: false,
      enableHiding: false,
    },
  ]

  return (
    <>
      <RootdataShell
        search={search}
        setSearch={setSearch}
        title='人物管理'
        description='管理人物资料、工作经历和对外投资记录。'
        addLabel='新增人物'
        entityName='人物'
        icon={UserRound}
        data={query.data?.items ?? []}
        total={query.data?.total ?? 0}
        isLoading={query.isPending}
        isError={query.isError}
        onAdd={() => setFormRow(null)}
        getRowId={(row) => row.id}
        columns={columns}
        columnLabels={{
          id: 'ID',
          person: '人物',
          heat: 'X 热度',
          influence: 'X 影响力',
          status: '状态',
          updatedAt: '更新时间',
        }}
        filters={[
          { columnId: 'status', title: '状态', options: statusFilterOptions },
        ]}
        renderBulkActions={(ids, clearSelection) => (
          <>
            <Button
              size='sm'
              variant='outline'
              onClick={() =>
                statusMutation.mutate(
                  { ids, status: 1 },
                  { onSuccess: clearSelection }
                )
              }
            >
              显示
            </Button>
            <Button
              size='sm'
              variant='outline'
              onClick={() =>
                statusMutation.mutate(
                  { ids, status: 0 },
                  { onSuccess: clearSelection }
                )
              }
            >
              隐藏
            </Button>
            <Button
              size='sm'
              variant='destructive'
              onClick={() => {
                if (window.confirm(`确认删除选中的 ${ids.length} 个人物？`)) {
                  bulkDeleteMutation.mutate(ids, { onSuccess: clearSelection })
                }
              }}
            >
              删除
            </Button>
          </>
        )}
      />
      {formRow !== undefined && (
        <PersonFormDialog
          row={formRow ?? undefined}
          open
          onOpenChange={(open) => !open && setFormRow(undefined)}
        />
      )}
      <PersonDetailDialog
        row={detailRow}
        open={detailRow !== null}
        onOpenChange={(open) => !open && setDetailRow(null)}
      />
    </>
  )
}

export function RootdataOrganizations({
  search,
  setSearch,
}: RootdataPageProps) {
  const query = useOrganizationsQuery(search)
  const [formRow, setFormRow] = useState<
    RootdataOrganization | null | undefined
  >()
  const [detailRow, setDetailRow] = useState<RootdataOrganization | null>(null)
  const deleteMutation = useDeleteOrganizationMutation()
  const bulkDeleteMutation = useDeleteOrganizationsMutation()
  const statusMutation = useOrganizationStatusMutation()
  const columns: ColumnDef<RootdataOrganization>[] = [
    {
      accessorKey: 'orgId',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='ID' />
      ),
      cell: ({ row }) => (
        <span className='font-mono text-xs'>{row.original.orgId}</span>
      ),
      meta: { className: 'w-40' },
      enableHiding: false,
    },
    {
      id: 'organization',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='机构' />
      ),
      cell: ({ row }) => (
        <EntityNameCell
          imageSrc={row.original.logo}
          imageAlt={`${row.original.orgName} logo`}
          title={row.original.orgName}
          subtitle={row.original.orgNameEn}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'category',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='分类' />
      ),
      cell: ({ row }) => row.original.category || '-',
      enableSorting: false,
    },
    {
      accessorKey: 'active',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='运营' />
      ),
      cell: ({ row }) => statusBadge(row.original.active),
      enableSorting: false,
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='状态' />
      ),
      cell: ({ row }) => statusBadge(row.original.status),
      enableSorting: false,
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='更新时间' />
      ),
      cell: ({ row }) => (
        <span className='text-xs text-muted-foreground'>
          {row.original.updatedAt ?? '-'}
        </span>
      ),
      enableSorting: false,
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <RowActionMenu
          items={[
            {
              label: '查看详情',
              icon: Eye,
              onClick: () => setDetailRow(row.original),
            },
            {
              label: '编辑机构',
              icon: Edit,
              onClick: () => setFormRow(row.original),
            },
            {
              label: row.original.status === 1 ? '设为隐藏' : '设为显示',
              icon: row.original.status === 1 ? EyeOff : Eye,
              onClick: () =>
                statusMutation.mutate({
                  ids: [row.original.autoId],
                  status: row.original.status === 1 ? 0 : 1,
                }),
            },
            {
              label: '删除机构',
              icon: Trash2,
              destructive: true,
              separatorBefore: true,
              onClick: () => {
                if (window.confirm(`确认删除机构「${row.original.orgName}」？`)) {
                  deleteMutation.mutate(row.original.autoId)
                }
              },
            },
          ]}
        />
      ),
      meta: { className: 'w-16 text-right' },
      enableSorting: false,
      enableHiding: false,
    },
  ]

  return (
    <>
      <RootdataShell
        search={search}
        setSearch={setSearch}
        title='机构管理'
        description='管理机构资料、团队成员和对外投资记录。'
        addLabel='新增机构'
        entityName='机构'
        icon={Building2}
        data={query.data?.items ?? []}
        total={query.data?.total ?? 0}
        isLoading={query.isPending}
        isError={query.isError}
        onAdd={() => setFormRow(null)}
        getRowId={(row) => row.autoId}
        columns={columns}
        columnLabels={{
          orgId: 'ID',
          organization: '机构',
          category: '分类',
          active: '运营',
          status: '状态',
          updatedAt: '更新时间',
        }}
        filters={[
          { columnId: 'active', title: '运营', options: activeFilterOptions },
          { columnId: 'status', title: '状态', options: statusFilterOptions },
        ]}
        renderBulkActions={(ids, clearSelection) => {
          const numericIds = ids.map(Number)
          return (
            <>
              <Button
                size='sm'
                variant='outline'
                onClick={() =>
                  statusMutation.mutate(
                    { ids: numericIds, status: 1 },
                    { onSuccess: clearSelection }
                  )
                }
              >
                显示
              </Button>
              <Button
                size='sm'
                variant='outline'
                onClick={() =>
                  statusMutation.mutate(
                    { ids: numericIds, status: 0 },
                    { onSuccess: clearSelection }
                  )
                }
              >
                隐藏
              </Button>
              <Button
                size='sm'
                variant='destructive'
                onClick={() => {
                  if (window.confirm(`确认删除选中的 ${ids.length} 个机构？`)) {
                    bulkDeleteMutation.mutate(numericIds, {
                      onSuccess: clearSelection,
                    })
                  }
                }}
              >
                删除
              </Button>
            </>
          )
        }}
      />
      {formRow !== undefined && (
        <OrganizationFormDialog
          row={formRow ?? undefined}
          open
          onOpenChange={(open) => !open && setFormRow(undefined)}
        />
      )}
      <OrganizationDetailDialog
        row={detailRow}
        open={detailRow !== null}
        onOpenChange={(open) => !open && setDetailRow(null)}
      />
    </>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className='grid gap-2'>
      <Label>
        {label} {required && <span className='text-destructive'>*</span>}
      </Label>
      {children}
    </div>
  )
}

function FormGrid({ children }: { children: React.ReactNode }) {
  return <div className='grid gap-4 md:grid-cols-2'>{children}</div>
}

function ProjectFormDialog({
  row,
  open,
  onOpenChange,
}: {
  row?: RootdataProject
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const mutation = useSaveProjectMutation(row?.autoId)
  const [form, setForm] = useState(() => ({
    projectName: row?.projectName ?? '',
    projectNameEn: row?.projectNameEn ?? '',
    logo: row?.logo ?? '',
    tokenSymbol: row?.tokenSymbol ?? '',
    establishmentDate: row?.establishmentDate ?? '',
    oneLiner: row?.oneLiner ?? '',
    oneLinerEn: row?.oneLinerEn ?? '',
    description: row?.description ?? '',
    descriptionEn: row?.descriptionEn ?? '',
    active: String(row?.active ?? 1),
    totalFunding: row?.totalFunding ?? '',
    tags: csv(row?.tags ?? []),
    ecosystem: csv(row?.ecosystem ?? []),
    onMainNet: csv(row?.onMainNet ?? []),
    planToLaunch: csv(row?.planToLaunch ?? []),
    onTestNet: csv(row?.onTestNet ?? []),
    supportExchanges: csv(row?.supportExchanges ?? []),
    isHot: String(row?.isHot ?? 0),
    isShow: String(row?.isShow ?? 1),
    website: row?.socialMedia.website ?? '',
    X: row?.socialMedia.X ?? '',
    discord: row?.socialMedia.discord ?? '',
    linkedin: row?.socialMedia.linkedin ?? '',
    gitbook: row?.socialMedia.gitbook ?? '',
    cmc: row?.socialMedia.cmc ?? '',
    coingecko: row?.socialMedia.coingecko ?? '',
    medium: row?.socialMedia.medium ?? '',
    defillama: row?.socialMedia.defillama ?? '',
    github: row?.socialMedia.github ?? '',
  }))

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((current) => ({ ...current, [key]: value }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[86vh] overflow-y-auto sm:max-w-5xl'>
        <DialogHeader>
          <DialogTitle>{row ? '编辑项目' : '新增项目'}</DialogTitle>
          <DialogDescription>
            项目 ID 由后端按旧规则生成；编辑不会重生成项目 ID。
          </DialogDescription>
        </DialogHeader>
        <form
          className='space-y-6'
          onSubmit={async (event) => {
            event.preventDefault()
            const input: ProjectInput = {
              projectName: form.projectName,
              projectNameEn: form.projectNameEn,
              logo: form.logo,
              tokenSymbol: form.tokenSymbol,
              establishmentDate: form.establishmentDate,
              oneLiner: form.oneLiner,
              oneLinerEn: form.oneLinerEn,
              description: form.description,
              descriptionEn: form.descriptionEn,
              active: toStatus(form.active),
              totalFunding: numberOrUndefined(form.totalFunding),
              tags: splitCsv(form.tags),
              ecosystem: splitCsv(form.ecosystem),
              onMainNet: splitCsv(form.onMainNet),
              planToLaunch: splitCsv(form.planToLaunch),
              onTestNet: splitCsv(form.onTestNet),
              supportExchanges: splitCsv(form.supportExchanges),
              isHot: toStatus(form.isHot),
              isShow: toStatus(form.isShow),
              socialMedia: {
                website: form.website,
                X: form.X,
                discord: form.discord,
                linkedin: form.linkedin,
                gitbook: form.gitbook,
                cmc: form.cmc,
                coingecko: form.coingecko,
                medium: form.medium,
                defillama: form.defillama,
                github: form.github,
              },
            }
            await mutation.mutateAsync(input)
            onOpenChange(false)
          }}
        >
          <FormGrid>
            <Field label='中文名称' required>
              <Input
                value={form.projectName}
                onChange={(event) => set('projectName')(event.target.value)}
                required
              />
            </Field>
            <Field label='英文名称' required>
              <Input
                value={form.projectNameEn}
                onChange={(event) => set('projectNameEn')(event.target.value)}
                required
              />
            </Field>
            <Field label='Logo'>
              <Input
                value={form.logo}
                onChange={(event) => set('logo')(event.target.value)}
              />
            </Field>
            <Field label='代币符号'>
              <Input
                value={form.tokenSymbol}
                onChange={(event) => set('tokenSymbol')(event.target.value)}
              />
            </Field>
            <Field label='成立时间'>
              <Input
                value={form.establishmentDate}
                onChange={(event) =>
                  set('establishmentDate')(event.target.value)
                }
              />
            </Field>
            <Field label='融资总额'>
              <Input
                type='number'
                value={form.totalFunding}
                onChange={(event) => set('totalFunding')(event.target.value)}
              />
            </Field>
            <Field label='运营状态'>
              <select
                className='h-9 rounded-md border bg-background px-3 text-sm'
                value={form.active}
                onChange={(event) => set('active')(event.target.value)}
              >
                <option value='1'>运营中</option>
                <option value='0'>停止运营</option>
              </select>
            </Field>
            <Field label='显示状态'>
              <select
                className='h-9 rounded-md border bg-background px-3 text-sm'
                value={form.isShow}
                onChange={(event) => set('isShow')(event.target.value)}
              >
                <option value='1'>显示</option>
                <option value='0'>隐藏</option>
              </select>
            </Field>
            <Field label='项目标签'>
              <Input
                value={form.tags}
                onChange={(event) => set('tags')(event.target.value)}
              />
            </Field>
            <Field label='所属生态'>
              <Input
                value={form.ecosystem}
                onChange={(event) => set('ecosystem')(event.target.value)}
              />
            </Field>
            <Field label='已上线主网'>
              <Input
                value={form.onMainNet}
                onChange={(event) => set('onMainNet')(event.target.value)}
              />
            </Field>
            <Field label='计划上线生态'>
              <Input
                value={form.planToLaunch}
                onChange={(event) => set('planToLaunch')(event.target.value)}
              />
            </Field>
            <Field label='已上线测试网'>
              <Input
                value={form.onTestNet}
                onChange={(event) => set('onTestNet')(event.target.value)}
              />
            </Field>
            <Field label='支持交易所'>
              <Input
                value={form.supportExchanges}
                onChange={(event) =>
                  set('supportExchanges')(event.target.value)
                }
              />
            </Field>
          </FormGrid>
          <FormGrid>
            <Field label='一句话介绍'>
              <Input
                value={form.oneLiner}
                onChange={(event) => set('oneLiner')(event.target.value)}
              />
            </Field>
            <Field label='一句话介绍 EN'>
              <Input
                value={form.oneLinerEn}
                onChange={(event) => set('oneLinerEn')(event.target.value)}
              />
            </Field>
            <Field label='详细介绍'>
              <Textarea
                value={form.description}
                onChange={(event) => set('description')(event.target.value)}
              />
            </Field>
            <Field label='详细介绍 EN'>
              <Textarea
                value={form.descriptionEn}
                onChange={(event) => set('descriptionEn')(event.target.value)}
              />
            </Field>
          </FormGrid>
          <FormGrid>
            {(
              [
                'website',
                'X',
                'discord',
                'linkedin',
                'gitbook',
                'cmc',
                'coingecko',
                'medium',
                'defillama',
                'github',
              ] as const
            ).map((key) => (
              <Field key={key} label={key}>
                <Input
                  value={form[key]}
                  onChange={(event) => set(key)(event.target.value)}
                />
              </Field>
            ))}
          </FormGrid>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button type='submit' disabled={mutation.isPending}>
              保存
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function PersonFormDialog({
  row,
  open,
  onOpenChange,
}: {
  row?: RootdataPerson
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const mutation = useSavePersonMutation(row?.id)
  const [form, setForm] = useState(() => ({
    peopleName: row?.peopleName ?? '',
    peopleNameEn: row?.peopleNameEn ?? '',
    headImg: row?.headImg ?? '',
    oneLiner: row?.oneLiner ?? '',
    oneLinerEn: row?.oneLinerEn ?? '',
    introduce: row?.introduce ?? '',
    introduceEn: row?.introduceEn ?? '',
    xLink: row?.xLink ?? '',
    linkedin: row?.linkedin ?? '',
    blogLink: row?.blogLink ?? '',
    heat: row?.heat ?? '',
    heatRank: row?.heatRank == null ? '' : String(row.heatRank),
    influence: row?.influence ?? '',
    influenceRank: row?.influenceRank == null ? '' : String(row.influenceRank),
    followers: row?.followers == null ? '' : String(row.followers),
    following: row?.following == null ? '' : String(row.following),
    status: String(row?.status ?? 1),
  }))

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((current) => ({ ...current, [key]: value }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[86vh] overflow-y-auto sm:max-w-4xl'>
        <DialogHeader>
          <DialogTitle>{row ? '编辑人物' : '新增人物'}</DialogTitle>
        </DialogHeader>
        <form
          className='space-y-6'
          onSubmit={async (event) => {
            event.preventDefault()
            const input: PersonInput = {
              peopleName: form.peopleName,
              peopleNameEn: form.peopleNameEn,
              headImg: form.headImg,
              oneLiner: form.oneLiner,
              oneLinerEn: form.oneLinerEn,
              introduce: form.introduce,
              introduceEn: form.introduceEn,
              xLink: form.xLink,
              linkedin: form.linkedin,
              blogLink: form.blogLink,
              heat: form.heat,
              heatRank: numberOrUndefined(form.heatRank),
              influence: form.influence,
              influenceRank: numberOrUndefined(form.influenceRank),
              followers: numberOrUndefined(form.followers),
              following: numberOrUndefined(form.following),
              status: toStatus(form.status),
            }
            await mutation.mutateAsync(input)
            onOpenChange(false)
          }}
        >
          <FormGrid>
            <Field label='中文名称' required>
              <Input
                value={form.peopleName}
                onChange={(event) => set('peopleName')(event.target.value)}
                required
              />
            </Field>
            <Field label='英文名称' required>
              <Input
                value={form.peopleNameEn}
                onChange={(event) => set('peopleNameEn')(event.target.value)}
                required
              />
            </Field>
            <Field label='头像'>
              <Input
                value={form.headImg}
                onChange={(event) => set('headImg')(event.target.value)}
              />
            </Field>
            <Field label='状态'>
              <select
                className='h-9 rounded-md border bg-background px-3 text-sm'
                value={form.status}
                onChange={(event) => set('status')(event.target.value)}
              >
                <option value='1'>显示</option>
                <option value='0'>隐藏</option>
              </select>
            </Field>
            <Field label='一句话介绍'>
              <Input
                value={form.oneLiner}
                onChange={(event) => set('oneLiner')(event.target.value)}
              />
            </Field>
            <Field label='一句话介绍 EN'>
              <Input
                value={form.oneLinerEn}
                onChange={(event) => set('oneLinerEn')(event.target.value)}
              />
            </Field>
            <Field label='人物介绍'>
              <Textarea
                value={form.introduce}
                onChange={(event) => set('introduce')(event.target.value)}
              />
            </Field>
            <Field label='人物介绍 EN'>
              <Textarea
                value={form.introduceEn}
                onChange={(event) => set('introduceEn')(event.target.value)}
              />
            </Field>
            {(
              [
                'xLink',
                'linkedin',
                'blogLink',
                'heat',
                'heatRank',
                'influence',
                'influenceRank',
                'followers',
                'following',
              ] as const
            ).map((key) => (
              <Field key={key} label={key}>
                <Input
                  value={form[key]}
                  onChange={(event) => set(key)(event.target.value)}
                />
              </Field>
            ))}
          </FormGrid>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button type='submit' disabled={mutation.isPending}>
              保存
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function OrganizationFormDialog({
  row,
  open,
  onOpenChange,
}: {
  row?: RootdataOrganization
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const mutation = useSaveOrganizationMutation(row?.autoId)
  const [form, setForm] = useState(() => ({
    orgName: row?.orgName ?? '',
    orgNameEn: row?.orgNameEn ?? '',
    logo: row?.logo ?? '',
    orgInfo: row?.orgInfo ?? '',
    orgInfoEn: row?.orgInfoEn ?? '',
    description: row?.description ?? '',
    descriptionEn: row?.descriptionEn ?? '',
    active: String(row?.active ?? 1),
    category: row?.category ?? '',
    establishmentDate: row?.establishmentDate ?? '',
    region: row?.region ?? '',
    xLink: row?.xLink ?? '',
    linkedin: row?.linkedin ?? '',
    blogLink: row?.blogLink ?? '',
    heat: row?.heat ?? '',
    heatRank: row?.heatRank == null ? '' : String(row.heatRank),
    influence: row?.influence ?? '',
    influenceRank: row?.influenceRank == null ? '' : String(row.influenceRank),
    followers: row?.followers == null ? '' : String(row.followers),
    following: row?.following == null ? '' : String(row.following),
    status: String(row?.status ?? 1),
  }))

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((current) => ({ ...current, [key]: value }))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[86vh] overflow-y-auto sm:max-w-4xl'>
        <DialogHeader>
          <DialogTitle>{row ? '编辑机构' : '新增机构'}</DialogTitle>
        </DialogHeader>
        <form
          className='space-y-6'
          onSubmit={async (event) => {
            event.preventDefault()
            const input: OrganizationInput = {
              orgName: form.orgName,
              orgNameEn: form.orgNameEn,
              logo: form.logo,
              orgInfo: form.orgInfo,
              orgInfoEn: form.orgInfoEn,
              description: form.description,
              descriptionEn: form.descriptionEn,
              active: toStatus(form.active),
              category: form.category,
              establishmentDate: form.establishmentDate,
              region: form.region,
              xLink: form.xLink,
              linkedin: form.linkedin,
              blogLink: form.blogLink,
              heat: form.heat,
              heatRank: numberOrUndefined(form.heatRank),
              influence: form.influence,
              influenceRank: numberOrUndefined(form.influenceRank),
              followers: numberOrUndefined(form.followers),
              following: numberOrUndefined(form.following),
              status: toStatus(form.status),
            }
            await mutation.mutateAsync(input)
            onOpenChange(false)
          }}
        >
          <FormGrid>
            <Field label='中文名称' required>
              <Input
                value={form.orgName}
                onChange={(event) => set('orgName')(event.target.value)}
                required
              />
            </Field>
            <Field label='英文名称' required>
              <Input
                value={form.orgNameEn}
                onChange={(event) => set('orgNameEn')(event.target.value)}
                required
              />
            </Field>
            <Field label='Logo'>
              <Input
                value={form.logo}
                onChange={(event) => set('logo')(event.target.value)}
              />
            </Field>
            <Field label='分类'>
              <Input
                value={form.category}
                onChange={(event) => set('category')(event.target.value)}
              />
            </Field>
            <Field label='成立时间'>
              <Input
                value={form.establishmentDate}
                onChange={(event) =>
                  set('establishmentDate')(event.target.value)
                }
              />
            </Field>
            <Field label='所在地'>
              <Input
                value={form.region}
                onChange={(event) => set('region')(event.target.value)}
              />
            </Field>
            <Field label='运营状态'>
              <select
                className='h-9 rounded-md border bg-background px-3 text-sm'
                value={form.active}
                onChange={(event) => set('active')(event.target.value)}
              >
                <option value='1'>运营中</option>
                <option value='0'>停止运营</option>
              </select>
            </Field>
            <Field label='显示状态'>
              <select
                className='h-9 rounded-md border bg-background px-3 text-sm'
                value={form.status}
                onChange={(event) => set('status')(event.target.value)}
              >
                <option value='1'>正常</option>
                <option value='0'>隐藏</option>
              </select>
            </Field>
            <Field label='机构简介'>
              <Input
                value={form.orgInfo}
                onChange={(event) => set('orgInfo')(event.target.value)}
              />
            </Field>
            <Field label='机构简介 EN'>
              <Input
                value={form.orgInfoEn}
                onChange={(event) => set('orgInfoEn')(event.target.value)}
              />
            </Field>
            <Field label='详细介绍'>
              <Textarea
                value={form.description}
                onChange={(event) => set('description')(event.target.value)}
              />
            </Field>
            <Field label='详细介绍 EN'>
              <Textarea
                value={form.descriptionEn}
                onChange={(event) => set('descriptionEn')(event.target.value)}
              />
            </Field>
            {(
              [
                'xLink',
                'linkedin',
                'blogLink',
                'heat',
                'heatRank',
                'influence',
                'influenceRank',
                'followers',
                'following',
              ] as const
            ).map((key) => (
              <Field key={key} label={key}>
                <Input
                  value={form[key]}
                  onChange={(event) => set(key)(event.target.value)}
                />
              </Field>
            ))}
          </FormGrid>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button type='submit' disabled={mutation.isPending}>
              保存
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ProjectDetailDialog({
  row,
  open,
  onOpenChange,
}: {
  row: RootdataProject | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const events = useProjectEventsQuery(row?.autoId)
  const reports = useProjectReportsQuery(row?.autoId)
  const contracts = useProjectContractsQuery(row?.autoId)
  const members = useTeamMembersQuery('projects', row?.autoId)
  const projectRounds = useProjectFundingRoundsQuery(row?.autoId)
  const externalRounds = useFundingRoundsQuery(
    1,
    row ? String(row.autoId) : undefined
  )
  const [eventRow, setEventRow] = useState<ProjectEvent | null | undefined>()
  const [reportRow, setReportRow] = useState<ProjectReport | null | undefined>()
  const [contractRow, setContractRow] = useState<
    ProjectContract | null | undefined
  >()
  const [memberRow, setMemberRow] = useState<TeamMember | null | undefined>()
  const [roundRow, setRoundRow] = useState<FundingRound | null | undefined>()
  const [externalRoundRow, setExternalRoundRow] = useState<
    FundingRound | null | undefined
  >()

  if (!row) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-h-[88vh] overflow-y-auto sm:max-w-6xl'>
          <DialogHeader>
            <DialogTitle>{row.projectName}</DialogTitle>
            <DialogDescription>{row.projectId}</DialogDescription>
          </DialogHeader>
          <Tabs defaultValue='basic'>
            <TabsList className='flex h-auto flex-wrap justify-start'>
              <TabsTrigger value='basic'>基础信息</TabsTrigger>
              <TabsTrigger value='rounds'>投资轮次</TabsTrigger>
              <TabsTrigger value='events'>重大事件</TabsTrigger>
              <TabsTrigger value='reports'>新闻动态</TabsTrigger>
              <TabsTrigger value='members'>团队成员</TabsTrigger>
              <TabsTrigger value='external'>对外投资</TabsTrigger>
              <TabsTrigger value='contracts'>合约</TabsTrigger>
            </TabsList>
            <TabsContent value='basic' className='space-y-4'>
              <InfoGrid
                rows={[
                  [
                    'Logo',
                    <EntityImage
                      key='project-logo'
                      src={row.logo}
                      alt={`${row.projectName} logo`}
                      size='lg'
                      fit='contain'
                    />,
                  ],
                  ['项目名称', `${row.projectName} / ${row.projectNameEn}`],
                  ['代币', row.tokenSymbol || '-'],
                  ['成立时间', row.establishmentDate || '-'],
                  ['一句话介绍', row.oneLiner || '-'],
                  ['项目标签', csv(row.tags) || '-'],
                  ['所属生态', csv(row.ecosystem) || '-'],
                  ['主网', csv(row.onMainNet) || '-'],
                  ['测试网', csv(row.onTestNet) || '-'],
                  ['交易所', csv(row.supportExchanges) || '-'],
                  ['官网', row.socialMedia.website || '-'],
                  ['X', row.socialMedia.X || '-'],
                ]}
              />
            </TabsContent>
            <TabsContent value='rounds'>
              <CollectionSection
                title='投资轮次'
                onAdd={() => setRoundRow(null)}
                headers={['轮次', '金额', '日期', '投资方', '操作']}
                rows={(projectRounds.data ?? []).map((item) => [
                  item.roundName,
                  item.amount || '-',
                  item.publishedTime ?? '-',
                  item.investors.map((investor) => investor.name).join(', ') ||
                    '-',
                  <FundingRoundActions
                    key={item.id}
                    item={item}
                    onEdit={() => setRoundRow(item)}
                  />,
                ])}
              />
            </TabsContent>
            <TabsContent value='events'>
              <CollectionSection
                title='重大事件'
                onAdd={() => setEventRow(null)}
                headers={['日期', '中文内容', '英文内容', '操作']}
                rows={(events.data ?? []).map((item) => [
                  item.hapDate || '-',
                  item.event,
                  item.eventEn || '-',
                  <ProjectEventActions
                    key={item.id}
                    projectId={row.autoId}
                    item={item}
                    onEdit={() => setEventRow(item)}
                  />,
                ])}
              />
            </TabsContent>
            <TabsContent value='reports'>
              <CollectionSection
                title='新闻动态'
                onAdd={() => setReportRow(null)}
                headers={['标题', '来源', '时间', '状态', '操作']}
                rows={(reports.data ?? []).map((item) => [
                  item.title,
                  item.site,
                  item.timeEast || '-',
                  statusLabels[item.status],
                  <ProjectReportActions
                    key={item.id}
                    projectId={row.autoId}
                    item={item}
                    onEdit={() => setReportRow(item)}
                  />,
                ])}
              />
            </TabsContent>
            <TabsContent value='members'>
              <CollectionSection
                title='团队成员'
                onAdd={() => setMemberRow(null)}
                headers={['成员', '职位', '状态', '核心', '操作']}
                rows={(members.data ?? []).map((item) => [
                  item.peopleName ?? item.name,
                  item.position || '-',
                  jobTypeLabels[item.type] ?? '-',
                  item.coreMember === 1 ? '是' : '否',
                  <TeamMemberActions
                    key={item.personId}
                    entity='projects'
                    ownerId={row.autoId}
                    item={item}
                    onEdit={() => setMemberRow(item)}
                  />,
                ])}
              />
            </TabsContent>
            <TabsContent value='external'>
              <CollectionSection
                title='对外投资'
                onAdd={() => setExternalRoundRow(null)}
                headers={['项目', '轮次', '金额', '日期', '领投', '操作']}
                rows={(externalRounds.data ?? []).map((item) => [
                  item.projectName,
                  item.roundName,
                  item.amount || '-',
                  item.publishedTime ?? '-',
                  item.leadInvestor === 1 ? '是' : '否',
                  <FundingRoundActions
                    key={item.id}
                    item={item}
                    onEdit={() => setExternalRoundRow(item)}
                  />,
                ])}
              />
            </TabsContent>
            <TabsContent value='contracts'>
              <CollectionSection
                title='合约'
                onAdd={() => setContractRow(null)}
                headers={['平台', '地址', '操作']}
                rows={(contracts.data ?? []).map((item) => [
                  item.contractPlatform,
                  item.contractAddress,
                  <ProjectContractActions
                    key={item.id}
                    projectId={row.autoId}
                    item={item}
                    onEdit={() => setContractRow(item)}
                  />,
                ])}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      {eventRow !== undefined && (
        <ProjectEventDialog
          projectId={row.autoId}
          row={eventRow ?? undefined}
          open
          onOpenChange={(next) => !next && setEventRow(undefined)}
        />
      )}
      {reportRow !== undefined && (
        <ProjectReportDialog
          projectId={row.autoId}
          row={reportRow ?? undefined}
          open
          onOpenChange={(next) => !next && setReportRow(undefined)}
        />
      )}
      {contractRow !== undefined && (
        <ProjectContractDialog
          projectId={row.autoId}
          row={contractRow ?? undefined}
          open
          onOpenChange={(next) => !next && setContractRow(undefined)}
        />
      )}
      {memberRow !== undefined && (
        <TeamMemberDialog
          entity='projects'
          ownerId={row.autoId}
          row={memberRow ?? undefined}
          open
          onOpenChange={(next) => !next && setMemberRow(undefined)}
        />
      )}
      {roundRow !== undefined && (
        <FundingRoundDialog
          row={roundRow ?? undefined}
          open
          fixedInvestor={undefined}
          defaultProjectId={row.projectId}
          onOpenChange={(next) => !next && setRoundRow(undefined)}
        />
      )}
      {externalRoundRow !== undefined && (
        <FundingRoundDialog
          row={externalRoundRow ?? undefined}
          open
          fixedInvestor={{ entityType: 1, entityId: row.projectId }}
          onOpenChange={(next) => !next && setExternalRoundRow(undefined)}
        />
      )}
    </>
  )
}

function PersonDetailDialog({
  row,
  open,
  onOpenChange,
}: {
  row: RootdataPerson | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const jobChanges = usePersonJobChangesQuery(row?.id)
  const externalRounds = useFundingRoundsQuery(3, row?.id)
  const [jobRow, setJobRow] = useState<JobChange | null | undefined>()
  const [roundRow, setRoundRow] = useState<FundingRound | null | undefined>()

  if (!row) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-h-[88vh] overflow-y-auto sm:max-w-5xl'>
          <DialogHeader>
            <DialogTitle>{row.peopleName}</DialogTitle>
            <DialogDescription>{row.id}</DialogDescription>
          </DialogHeader>
          <Tabs defaultValue='basic'>
            <TabsList>
              <TabsTrigger value='basic'>基础信息</TabsTrigger>
              <TabsTrigger value='jobs'>工作经历</TabsTrigger>
              <TabsTrigger value='external'>对外投资</TabsTrigger>
            </TabsList>
            <TabsContent value='basic'>
              <InfoGrid
                rows={[
                  [
                    '头像',
                    <EntityImage
                      key='person-image'
                      src={row.headImg}
                      alt={`${row.peopleName} 头像`}
                      shape='circle'
                      size='lg'
                    />,
                  ],
                  ['人物名称', `${row.peopleName} / ${row.peopleNameEn}`],
                  ['一句话介绍', row.oneLiner || '-'],
                  ['X', row.xLink || '-'],
                  ['LinkedIn', row.linkedin || '-'],
                  ['Blog', row.blogLink || '-'],
                  ['热度', row.heat || '-'],
                  ['影响力', row.influence || '-'],
                ]}
              />
            </TabsContent>
            <TabsContent value='jobs'>
              <CollectionSection
                title='工作经历'
                onAdd={() => setJobRow(null)}
                headers={['公司', '类型', '职位', '时间', '核心', '操作']}
                rows={(jobChanges.data ?? []).map((item) => [
                  item.company,
                  `${entityTypeLabels[item.companyType as RootdataEntityType] ?? '-'} / ${jobTypeLabels[item.type] ?? '-'}`,
                  item.position || '-',
                  `${item.entryTime || '-'} - ${item.leaveTime || '-'}`,
                  item.coreMember === 1 ? '是' : '否',
                  <JobChangeActions
                    key={item.id}
                    personId={row.id}
                    item={item}
                    onEdit={() => setJobRow(item)}
                  />,
                ])}
              />
            </TabsContent>
            <TabsContent value='external'>
              <CollectionSection
                title='对外投资'
                onAdd={() => setRoundRow(null)}
                headers={['项目', '轮次', '金额', '日期', '领投', '操作']}
                rows={(externalRounds.data ?? []).map((item) => [
                  item.projectName,
                  item.roundName,
                  item.amount || '-',
                  item.publishedTime ?? '-',
                  item.leadInvestor === 1 ? '是' : '否',
                  <FundingRoundActions
                    key={item.id}
                    item={item}
                    onEdit={() => setRoundRow(item)}
                  />,
                ])}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      {jobRow !== undefined && (
        <JobChangeDialog
          personId={row.id}
          row={jobRow ?? undefined}
          open
          onOpenChange={(next) => !next && setJobRow(undefined)}
        />
      )}
      {roundRow !== undefined && (
        <FundingRoundDialog
          row={roundRow ?? undefined}
          open
          fixedInvestor={{ entityType: 3, entityId: row.id }}
          onOpenChange={(next) => !next && setRoundRow(undefined)}
        />
      )}
    </>
  )
}

function OrganizationDetailDialog({
  row,
  open,
  onOpenChange,
}: {
  row: RootdataOrganization | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const members = useTeamMembersQuery('organizations', row?.autoId)
  const externalRounds = useFundingRoundsQuery(
    2,
    row ? String(row.autoId) : undefined
  )
  const [memberRow, setMemberRow] = useState<TeamMember | null | undefined>()
  const [roundRow, setRoundRow] = useState<FundingRound | null | undefined>()

  if (!row) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-h-[88vh] overflow-y-auto sm:max-w-5xl'>
          <DialogHeader>
            <DialogTitle>{row.orgName}</DialogTitle>
            <DialogDescription>{row.orgId}</DialogDescription>
          </DialogHeader>
          <Tabs defaultValue='basic'>
            <TabsList>
              <TabsTrigger value='basic'>基础信息</TabsTrigger>
              <TabsTrigger value='members'>团队成员</TabsTrigger>
              <TabsTrigger value='external'>对外投资</TabsTrigger>
            </TabsList>
            <TabsContent value='basic'>
              <InfoGrid
                rows={[
                  [
                    'Logo',
                    <EntityImage
                      key='organization-logo'
                      src={row.logo}
                      alt={`${row.orgName} logo`}
                      size='lg'
                      fit='contain'
                    />,
                  ],
                  ['机构名称', `${row.orgName} / ${row.orgNameEn}`],
                  ['分类', row.category || '-'],
                  ['成立时间', row.establishmentDate || '-'],
                  ['所在地', row.region || '-'],
                  ['简介', row.orgInfo || '-'],
                  ['X', row.xLink || '-'],
                  ['LinkedIn', row.linkedin || '-'],
                  ['Blog', row.blogLink || '-'],
                ]}
              />
            </TabsContent>
            <TabsContent value='members'>
              <CollectionSection
                title='团队成员'
                onAdd={() => setMemberRow(null)}
                headers={['成员', '职位', '状态', '核心', '操作']}
                rows={(members.data ?? []).map((item) => [
                  item.peopleName ?? item.name,
                  item.position || '-',
                  jobTypeLabels[item.type] ?? '-',
                  item.coreMember === 1 ? '是' : '否',
                  <TeamMemberActions
                    key={item.personId}
                    entity='organizations'
                    ownerId={row.autoId}
                    item={item}
                    onEdit={() => setMemberRow(item)}
                  />,
                ])}
              />
            </TabsContent>
            <TabsContent value='external'>
              <CollectionSection
                title='对外投资'
                onAdd={() => setRoundRow(null)}
                headers={['项目', '轮次', '金额', '日期', '领投', '操作']}
                rows={(externalRounds.data ?? []).map((item) => [
                  item.projectName,
                  item.roundName,
                  item.amount || '-',
                  item.publishedTime ?? '-',
                  item.leadInvestor === 1 ? '是' : '否',
                  <FundingRoundActions
                    key={item.id}
                    item={item}
                    onEdit={() => setRoundRow(item)}
                  />,
                ])}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      {memberRow !== undefined && (
        <TeamMemberDialog
          entity='organizations'
          ownerId={row.autoId}
          row={memberRow ?? undefined}
          open
          onOpenChange={(next) => !next && setMemberRow(undefined)}
        />
      )}
      {roundRow !== undefined && (
        <FundingRoundDialog
          row={roundRow ?? undefined}
          open
          fixedInvestor={{ entityType: 2, entityId: String(row.orgId) }}
          onOpenChange={(next) => !next && setRoundRow(undefined)}
        />
      )}
    </>
  )
}

function InfoGrid({ rows }: { rows: Array<[string, React.ReactNode]> }) {
  return (
    <div className='overflow-hidden rounded-md border'>
      <Table>
        <TableBody>
          {rows.map(([label, value]) => (
            <TableRow key={label}>
              <TableCell className='w-36 bg-muted/40 font-medium'>
                {label}
              </TableCell>
              <TableCell>{value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function CollectionSection({
  title,
  onAdd,
  headers,
  rows,
}: {
  title: string
  onAdd: () => void
  headers: string[]
  rows: Array<Array<React.ReactNode>>
}) {
  return (
    <div className='space-y-3'>
      <div className='flex items-center justify-between'>
        <h3 className='text-base font-semibold'>{title}</h3>
        <Button size='sm' onClick={onAdd}>
          <Plus className='me-2 size-4' />
          新增
        </Button>
      </div>
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((header) => (
                <TableHead
                  key={header}
                  className={header === '操作' ? 'w-16 text-right' : undefined}
                >
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((cells, index) => (
                <TableRow key={index}>
                  {cells.map((cell, cellIndex) => (
                    <TableCell key={cellIndex}>{cell}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={headers.length}
                  className='h-20 text-center'
                >
                  没有记录。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function RowActions({
  onEdit,
  onDelete,
}: {
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <RowActionMenu
      items={[
        {
          label: '编辑',
          icon: Edit,
          onClick: onEdit,
        },
        {
          label: '删除',
          icon: Trash2,
          destructive: true,
          separatorBefore: true,
          onClick: onDelete,
        },
      ]}
    />
  )
}

function FundingRoundActions({
  item,
  onEdit,
}: {
  item: FundingRound
  onEdit: () => void
}) {
  const mutation = useDeleteFundingRoundMutation()
  return (
    <RowActions
      onEdit={onEdit}
      onDelete={() => {
        if (window.confirm('确认删除该融资轮次？')) mutation.mutate(item.id)
      }}
    />
  )
}

function ProjectEventActions({
  projectId,
  item,
  onEdit,
}: {
  projectId: number
  item: ProjectEvent
  onEdit: () => void
}) {
  const mutation = useDeleteProjectEventMutation(projectId)
  return (
    <RowActions
      onEdit={onEdit}
      onDelete={() => {
        if (window.confirm('确认删除该重大事件？')) mutation.mutate(item.index)
      }}
    />
  )
}

function ProjectReportActions({
  projectId,
  item,
  onEdit,
}: {
  projectId: number
  item: ProjectReport
  onEdit: () => void
}) {
  const mutation = useDeleteProjectReportMutation(projectId)
  return (
    <RowActions
      onEdit={onEdit}
      onDelete={() => {
        if (window.confirm('确认删除该新闻动态？')) mutation.mutate(item.index)
      }}
    />
  )
}

function ProjectContractActions({
  projectId,
  item,
  onEdit,
}: {
  projectId: number
  item: ProjectContract
  onEdit: () => void
}) {
  const mutation = useDeleteProjectContractMutation(projectId)
  return (
    <RowActions
      onEdit={onEdit}
      onDelete={() => {
        if (window.confirm('确认删除该合约？')) mutation.mutate(item.index)
      }}
    />
  )
}

function TeamMemberActions({
  entity,
  ownerId,
  item,
  onEdit,
}: {
  entity: 'projects' | 'organizations'
  ownerId: number
  item: TeamMember
  onEdit: () => void
}) {
  const mutation = useDeleteTeamMemberMutation(entity, ownerId)
  return (
    <RowActions
      onEdit={onEdit}
      onDelete={() => {
        if (window.confirm('确认删除该团队成员？'))
          mutation.mutate(item.personId)
      }}
    />
  )
}

function JobChangeActions({
  personId,
  item,
  onEdit,
}: {
  personId: string
  item: JobChange
  onEdit: () => void
}) {
  const mutation = useDeleteJobChangeMutation(personId)
  return (
    <RowActions
      onEdit={onEdit}
      onDelete={() => {
        if (window.confirm('确认删除该工作经历？')) mutation.mutate(item.id)
      }}
    />
  )
}

function ProjectEventDialog({
  projectId,
  row,
  open,
  onOpenChange,
}: {
  projectId: number
  row?: ProjectEvent
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const mutation = useSaveProjectEventMutation(projectId, row?.index)
  const [form, setForm] = useState<EventInput>(() => ({
    hapDate: row?.hapDate ?? '',
    event: row?.event ?? '',
    eventEn: row?.eventEn ?? '',
  }))

  return (
    <SimpleDialog
      title={row ? '编辑重大事件' : '新增重大事件'}
      open={open}
      onOpenChange={onOpenChange}
      isSaving={mutation.isPending}
      onSubmit={async () => {
        await mutation.mutateAsync(form)
        onOpenChange(false)
      }}
    >
      <Field label='日期'>
        <Input
          value={form.hapDate ?? ''}
          onChange={(event) =>
            setForm((current) => ({ ...current, hapDate: event.target.value }))
          }
        />
      </Field>
      <Field label='中文内容' required>
        <Textarea
          value={form.event}
          onChange={(event) =>
            setForm((current) => ({ ...current, event: event.target.value }))
          }
          required
        />
      </Field>
      <Field label='英文内容'>
        <Textarea
          value={form.eventEn ?? ''}
          onChange={(event) =>
            setForm((current) => ({ ...current, eventEn: event.target.value }))
          }
        />
      </Field>
    </SimpleDialog>
  )
}

function ProjectReportDialog({
  projectId,
  row,
  open,
  onOpenChange,
}: {
  projectId: number
  row?: ProjectReport
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const mutation = useSaveProjectReportMutation(projectId, row?.index)
  const [form, setForm] = useState<ReportInput>(() => ({
    title: row?.title ?? '',
    titleEn: row?.titleEn ?? '',
    url: row?.url ?? '',
    site: row?.site ?? '',
    timeEast: row?.timeEast ?? '',
    status: row?.status ?? 1,
  }))

  return (
    <SimpleDialog
      title={row ? '编辑新闻动态' : '新增新闻动态'}
      open={open}
      onOpenChange={onOpenChange}
      isSaving={mutation.isPending}
      onSubmit={async () => {
        await mutation.mutateAsync(form)
        onOpenChange(false)
      }}
    >
      <FormGrid>
        <Field label='中文标题' required>
          <Input
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({ ...current, title: event.target.value }))
            }
            required
          />
        </Field>
        <Field label='英文标题'>
          <Input
            value={form.titleEn ?? ''}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                titleEn: event.target.value,
              }))
            }
          />
        </Field>
        <Field label='链接'>
          <Input
            value={form.url ?? ''}
            onChange={(event) =>
              setForm((current) => ({ ...current, url: event.target.value }))
            }
          />
        </Field>
        <Field label='来源' required>
          <Input
            value={form.site}
            onChange={(event) =>
              setForm((current) => ({ ...current, site: event.target.value }))
            }
            required
          />
        </Field>
        <Field label='发布时间'>
          <Input
            value={form.timeEast ?? ''}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                timeEast: event.target.value,
              }))
            }
          />
        </Field>
        <Field label='状态'>
          <select
            className='h-9 rounded-md border bg-background px-3 text-sm'
            value={String(form.status ?? 1)}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                status: toStatus(event.target.value),
              }))
            }
          >
            <option value='1'>显示</option>
            <option value='0'>隐藏</option>
          </select>
        </Field>
      </FormGrid>
    </SimpleDialog>
  )
}

function ProjectContractDialog({
  projectId,
  row,
  open,
  onOpenChange,
}: {
  projectId: number
  row?: ProjectContract
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const mutation = useSaveProjectContractMutation(projectId, row?.index)
  const [form, setForm] = useState<ContractInput>(() => ({
    contractPlatform: row?.contractPlatform ?? '',
    contractAddress: row?.contractAddress ?? '',
  }))

  return (
    <SimpleDialog
      title={row ? '编辑合约' : '新增合约'}
      open={open}
      onOpenChange={onOpenChange}
      isSaving={mutation.isPending}
      onSubmit={async () => {
        await mutation.mutateAsync(form)
        onOpenChange(false)
      }}
    >
      <Field label='合约平台' required>
        <Input
          value={form.contractPlatform}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              contractPlatform: event.target.value,
            }))
          }
          required
        />
      </Field>
      <Field label='合约地址' required>
        <Input
          value={form.contractAddress}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              contractAddress: event.target.value,
            }))
          }
          required
        />
      </Field>
    </SimpleDialog>
  )
}

function TeamMemberDialog({
  entity,
  ownerId,
  row,
  open,
  onOpenChange,
}: {
  entity: 'projects' | 'organizations'
  ownerId: number
  row?: TeamMember
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const mutation = useSaveTeamMemberMutation(entity, ownerId, row?.personId)
  const [personSearch, setPersonSearch] = useState(row?.name ?? '')
  const options = useEntityOptionsQuery(3, personSearch)
  const [form, setForm] = useState<TeamMemberInput>(() => ({
    personId: row?.personId ?? '',
    position: row?.position ?? '',
    positionEn: row?.positionEn ?? '',
    type: row?.type ?? 1,
    entryTime: row?.entryTime ?? '',
    leaveTime: row?.leaveTime ?? '',
    coreMember: row?.coreMember === 1 ? 1 : 0,
  }))

  return (
    <SimpleDialog
      title={row ? '编辑团队成员' : '新增团队成员'}
      open={open}
      onOpenChange={onOpenChange}
      isSaving={mutation.isPending}
      onSubmit={async () => {
        await mutation.mutateAsync(form)
        onOpenChange(false)
      }}
    >
      <FormGrid>
        <Field label='人物搜索'>
          <Input
            value={personSearch}
            onChange={(event) => setPersonSearch(event.target.value)}
          />
        </Field>
        <Field label='人物' required>
          <select
            className='h-9 rounded-md border bg-background px-3 text-sm'
            value={form.personId}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                personId: event.target.value,
              }))
            }
            required
          >
            <option value=''>选择人物</option>
            {options.data?.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name} {option.nameEn ? `/ ${option.nameEn}` : ''}
              </option>
            ))}
            {form.personId &&
              !options.data?.some((option) => option.id === form.personId) && (
                <option value={form.personId}>{form.personId}</option>
              )}
          </select>
        </Field>
        <Field label='职位'>
          <Input
            value={form.position ?? ''}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                position: event.target.value,
              }))
            }
          />
        </Field>
        <Field label='职位 EN'>
          <Input
            value={form.positionEn ?? ''}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                positionEn: event.target.value,
              }))
            }
          />
        </Field>
        <Field label='状态'>
          <select
            className='h-9 rounded-md border bg-background px-3 text-sm'
            value={String(form.type ?? 1)}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                type: Number(event.target.value),
              }))
            }
          >
            <option value='1'>近期入职</option>
            <option value='2'>近期离职</option>
            <option value='3'>在职</option>
          </select>
        </Field>
        <Field label='核心成员'>
          <select
            className='h-9 rounded-md border bg-background px-3 text-sm'
            value={String(form.coreMember ?? 0)}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                coreMember: toStatus(event.target.value),
              }))
            }
          >
            <option value='1'>是</option>
            <option value='0'>否</option>
          </select>
        </Field>
        <Field label='入职时间'>
          <Input
            value={form.entryTime ?? ''}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                entryTime: event.target.value,
              }))
            }
          />
        </Field>
        <Field label='离职时间'>
          <Input
            value={form.leaveTime ?? ''}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                leaveTime: event.target.value,
              }))
            }
          />
        </Field>
      </FormGrid>
    </SimpleDialog>
  )
}

function JobChangeDialog({
  personId,
  row,
  open,
  onOpenChange,
}: {
  personId: string
  row?: JobChange
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const mutation = useSaveJobChangeMutation(personId, row?.id)
  const initialCompanyType = row?.companyType === 2 ? 2 : 1
  const [entityType, setEntityType] = useState<1 | 2>(initialCompanyType)
  const [entitySearch, setEntitySearch] = useState(row?.company ?? '')
  const options = useEntityOptionsQuery(entityType, entitySearch)
  const [form, setForm] = useState<JobChangeInput>(() => ({
    type: row?.type ?? 1,
    companyType: initialCompanyType,
    companyId: row?.companyId ?? '',
    position: row?.position ?? '',
    positionEn: row?.positionEn ?? '',
    entryTime: row?.entryTime ?? '',
    leaveTime: row?.leaveTime ?? '',
    coreMember: row?.coreMember === 1 ? 1 : 0,
  }))

  return (
    <SimpleDialog
      title={row ? '编辑工作经历' : '新增工作经历'}
      open={open}
      onOpenChange={onOpenChange}
      isSaving={mutation.isPending}
      onSubmit={async () => {
        await mutation.mutateAsync(form)
        onOpenChange(false)
      }}
    >
      <FormGrid>
        <Field label='公司类型'>
          <select
            className='h-9 rounded-md border bg-background px-3 text-sm'
            value={String(entityType)}
            onChange={(event) => {
              const next = Number(event.target.value) as 1 | 2
              setEntityType(next)
              setForm((current) => ({
                ...current,
                companyType: next,
                companyId: '',
              }))
            }}
          >
            <option value='1'>项目</option>
            <option value='2'>机构</option>
          </select>
        </Field>
        <Field label='公司搜索'>
          <Input
            value={entitySearch}
            onChange={(event) => setEntitySearch(event.target.value)}
          />
        </Field>
        <Field label='公司' required>
          <select
            className='h-9 rounded-md border bg-background px-3 text-sm'
            value={form.companyId}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                companyId: event.target.value,
              }))
            }
            required
          >
            <option value=''>选择公司</option>
            {options.data?.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name} {option.nameEn ? `/ ${option.nameEn}` : ''}
              </option>
            ))}
            {form.companyId &&
              !options.data?.some((option) => option.id === form.companyId) && (
                <option value={form.companyId}>{form.companyId}</option>
              )}
          </select>
        </Field>
        <Field label='任职状态'>
          <select
            className='h-9 rounded-md border bg-background px-3 text-sm'
            value={String(form.type)}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                type: Number(event.target.value),
              }))
            }
          >
            <option value='1'>近期入职</option>
            <option value='2'>近期离职</option>
            <option value='3'>在职</option>
          </select>
        </Field>
        <Field label='职位'>
          <Input
            value={form.position ?? ''}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                position: event.target.value,
              }))
            }
          />
        </Field>
        <Field label='职位 EN'>
          <Input
            value={form.positionEn ?? ''}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                positionEn: event.target.value,
              }))
            }
          />
        </Field>
        <Field label='入职时间'>
          <Input
            value={form.entryTime ?? ''}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                entryTime: event.target.value,
              }))
            }
          />
        </Field>
        <Field label='离职时间'>
          <Input
            value={form.leaveTime ?? ''}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                leaveTime: event.target.value,
              }))
            }
          />
        </Field>
      </FormGrid>
    </SimpleDialog>
  )
}

function FundingRoundDialog({
  row,
  open,
  fixedInvestor,
  defaultProjectId,
  onOpenChange,
}: {
  row?: FundingRound
  open: boolean
  fixedInvestor?: { entityType: RootdataEntityType; entityId: string }
  defaultProjectId?: string
  onOpenChange: (open: boolean) => void
}) {
  const mutation = useSaveFundingRoundMutation(row?.id)
  const roundNames = useFundingRoundNamesQuery()
  const [projectSearch, setProjectSearch] = useState(row?.projectName ?? '')
  const projectOptions = useEntityOptionsQuery(1, projectSearch)
  const [investorsText, setInvestorsText] = useState(
    row?.investors
      .map(
        (investor) =>
          `${investor.entityType},${investor.entityId},${investor.leadInvestor}`
      )
      .join('\n') ?? ''
  )
  const [form, setForm] = useState<FundingRoundInput>(() => ({
    projectId: row?.projectId ?? defaultProjectId ?? '',
    roundName: row?.roundName ?? '',
    publishedTime: row?.publishedTime ?? '',
    amount: numberOrUndefined(row?.amount ?? ''),
    valuation: numberOrUndefined(row?.valuation ?? ''),
    sourceFrom: row?.sourceFrom ?? '',
    investors: row?.investors.map((investor) => ({
      entityType: investor.entityType as RootdataEntityType,
      entityId: investor.entityId,
      leadInvestor: investor.leadInvestor === 1 ? 1 : 0,
    })),
  }))

  const investors = useMemo(() => {
    const parsed = investorsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [type, id, lead = '0'] = line
          .split(',')
          .map((item) => item.trim())
        return {
          entityType: Number(type) as RootdataEntityType,
          entityId: id ?? '',
          leadInvestor: toStatus(lead),
        }
      })
      .filter((item) => [1, 2, 3].includes(item.entityType) && item.entityId)

    return fixedInvestor
      ? [{ ...fixedInvestor, leadInvestor: 0 as RootdataStatus }, ...parsed]
      : parsed
  }, [fixedInvestor, investorsText])

  return (
    <SimpleDialog
      title={row ? '编辑融资轮次' : '新增融资轮次'}
      open={open}
      onOpenChange={onOpenChange}
      isSaving={mutation.isPending}
      onSubmit={async () => {
        await mutation.mutateAsync({ ...form, investors })
        onOpenChange(false)
      }}
    >
      <FormGrid>
        <Field label='项目搜索'>
          <Input
            value={projectSearch}
            onChange={(event) => setProjectSearch(event.target.value)}
          />
        </Field>
        <Field label='融资项目' required>
          <select
            className='h-9 rounded-md border bg-background px-3 text-sm'
            value={form.projectId}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                projectId: event.target.value,
              }))
            }
            required
          >
            <option value=''>选择项目</option>
            {projectOptions.data?.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name} {option.nameEn ? `/ ${option.nameEn}` : ''}
              </option>
            ))}
            {form.projectId &&
              !projectOptions.data?.some(
                (option) => option.id === form.projectId
              ) && <option value={form.projectId}>{form.projectId}</option>}
          </select>
        </Field>
        <Field label='轮次' required>
          <select
            className='h-9 rounded-md border bg-background px-3 text-sm'
            value={form.roundName}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                roundName: event.target.value,
              }))
            }
            required
          >
            <option value=''>选择轮次</option>
            {roundNames.data?.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </Field>
        <Field label='公布日期'>
          <Input
            value={form.publishedTime ?? ''}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                publishedTime: event.target.value,
              }))
            }
          />
        </Field>
        <Field label='金额'>
          <Input
            type='number'
            value={form.amount ?? ''}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                amount: numberOrUndefined(event.target.value),
              }))
            }
          />
        </Field>
        <Field label='估值'>
          <Input
            type='number'
            value={form.valuation ?? ''}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                valuation: numberOrUndefined(event.target.value),
              }))
            }
          />
        </Field>
      </FormGrid>
      <Field label='来源'>
        <Input
          value={form.sourceFrom ?? ''}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              sourceFrom: event.target.value,
            }))
          }
        />
      </Field>
      <Field label='投资方'>
        <Textarea
          value={investorsText}
          onChange={(event) => setInvestorsText(event.target.value)}
          placeholder='类型,ID,是否领投；例如 2,-1,1'
        />
      </Field>
    </SimpleDialog>
  )
}

function SimpleDialog({
  title,
  open,
  onOpenChange,
  isSaving,
  onSubmit,
  children,
}: {
  title: string
  open: boolean
  onOpenChange: (open: boolean) => void
  isSaving: boolean
  onSubmit: () => Promise<void>
  children: React.ReactNode
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[86vh] overflow-y-auto sm:max-w-3xl'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form
          className='space-y-4'
          onSubmit={async (event) => {
            event.preventDefault()
            await onSubmit()
          }}
        >
          {children}
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button type='submit' disabled={isSaving}>
              保存
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
