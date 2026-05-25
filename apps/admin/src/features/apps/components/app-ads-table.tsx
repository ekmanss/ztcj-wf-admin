import { useEffect, useState } from 'react'
import {
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
import { cn } from '@/lib/utils'
import { type NavigateFn, useTableUrlState } from '@/hooks/use-table-url-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { adPageLabels, adPositionLabels, adTypeLabels } from '../data/data'
import type { AppAd } from '../data/schema'
import { useAppsMetaQuery } from '../hooks/use-apps-query'
import { AppAdsBulkActions } from './app-ads-bulk-actions'
import { appAdsColumns as columns } from './app-ads-columns'

const columnLabels = {
  adImageCh: '图片',
  adLink: '跳转url',
  adPositionCode: '广告位',
  adPageCode: '页面',
  adType: '标签',
  adEffectiveTime: '生效时间',
  adInvalidTime: '失效时间',
  updateTime: '更新时间',
}
const facetedFilterCopy = {
  selectedCountLabel: (selectedCount: number) => `已选择 ${selectedCount} 项`,
  emptyLabel: '无结果。',
  clearFiltersLabel: '清除筛选',
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

type AppAdsTableProps = {
  data: AppAd[]
  total?: number
  isLoading?: boolean
  search: Record<string, unknown>
  navigate: NavigateFn
}

function toStringArray(value: unknown) {
  return Array.isArray(value) ? value.map((item) => String(item)) : []
}

function toNumberFilterArray(value: unknown) {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => Number(item))
    .filter((item) => item === 0 || item === 1)
}

function fallbackOptions(labels: Record<string, string>) {
  return Object.entries(labels).map(([value, label]) => ({ value, label }))
}

export function AppAdsTable({
  data,
  total,
  isLoading = false,
  search,
  navigate,
}: AppAdsTableProps) {
  const metaQuery = useAppsMetaQuery()
  const isServerSide = total !== undefined
  const rowCount = total ?? data.length
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])

  const {
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: false },
    columnFilters: [
      { columnId: 'adName', searchKey: 'name', type: 'string' },
      {
        columnId: 'adPositionCode',
        searchKey: 'positionCode',
        type: 'array',
        deserialize: toStringArray,
      },
      {
        columnId: 'adPageCode',
        searchKey: 'pageCode',
        type: 'array',
        deserialize: toStringArray,
      },
      {
        columnId: 'adType',
        searchKey: 'adType',
        type: 'array',
        deserialize: toStringArray,
      },
      {
        columnId: 'status',
        searchKey: 'status',
        type: 'array',
        deserialize: toStringArray,
        serialize: toNumberFilterArray,
      },
    ],
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
      rowSelection,
      columnFilters,
      columnVisibility,
    },
    enableRowSelection: true,
    onPaginationChange,
    onColumnFiltersChange,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    manualFiltering: isServerSide,
    manualPagination: isServerSide,
    rowCount,
    getPaginationRowModel: getPaginationRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  useEffect(() => {
    ensurePageInRange(Math.ceil(rowCount / pagination.pageSize))
  }, [rowCount, pagination.pageSize, ensurePageInRange])

  const positionOptions =
    metaQuery.data?.adPositions ?? fallbackOptions(adPositionLabels)
  const pageOptions = metaQuery.data?.adPages ?? fallbackOptions(adPageLabels)
  const typeOptions = metaQuery.data?.adTypes ?? fallbackOptions(adTypeLabels)

  return (
    <div className='flex flex-1 flex-col gap-4 max-sm:has-[div[role="toolbar"]]:mb-16'>
      <DataTableToolbar
        table={table}
        searchPlaceholder='按广告名称筛选...'
        searchKey='adName'
        resetLabel='重置'
        facetedFilterCopy={facetedFilterCopy}
        viewOptions={{
          triggerLabel: '视图',
          toggleColumnsLabel: '切换列显示',
          columnLabels,
        }}
        filters={[
          {
            columnId: 'adPositionCode',
            title: '广告位',
            options: positionOptions,
          },
          {
            columnId: 'adPageCode',
            title: '页面',
            options: pageOptions,
          },
          {
            columnId: 'adType',
            title: '标签',
            options: typeOptions,
          },
          {
            columnId: 'status',
            title: '状态',
            options: [
              { label: '显示', value: '1' },
              { label: '隐藏', value: '0' },
            ],
          },
        ]}
      />
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
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  正在加载 APP 广告...
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
                  colSpan={columns.length}
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
      <AppAdsBulkActions table={table} />
    </div>
  )
}
