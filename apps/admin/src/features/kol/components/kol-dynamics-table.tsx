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
import type { KolTweet } from '../data/schema'
import { KolDynamicsBulkActions } from './kol-dynamics-bulk-actions'
import { kolDynamicsColumns as columns } from './kol-dynamics-columns'

const columnLabels = {
  tweetRestId: '动态 ID',
  authorName: '作者',
  isReply: '类型',
  fullText: '内容',
  platform: '平台',
  tweetCreatedAt: '发布时间',
  favoriteCount: '点赞',
  viewCount: '浏览',
  status: '状态',
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

type KolDynamicsTableProps = {
  data: KolTweet[]
  total?: number
  isLoading?: boolean
  search: Record<string, unknown>
  navigate: NavigateFn
}

function toStringArray(value: unknown) {
  return Array.isArray(value) ? value.map((item) => String(item)) : []
}

function toReplyFilterArray(value: unknown) {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => Number(item))
    .filter((item) => item === 0 || item === 1)
}

export function KolDynamicsTable({
  data,
  total,
  isLoading = false,
  search,
  navigate,
}: KolDynamicsTableProps) {
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
      { columnId: 'authorName', searchKey: 'authorName', type: 'string' },
      {
        columnId: 'platform',
        searchKey: 'platform',
        type: 'array',
        deserialize: toStringArray,
      },
      {
        columnId: 'isReply',
        searchKey: 'isReply',
        type: 'array',
        deserialize: toStringArray,
        serialize: toReplyFilterArray,
      },
      {
        columnId: 'status',
        searchKey: 'status',
        type: 'array',
        deserialize: toStringArray,
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

  return (
    <div className='flex flex-1 flex-col gap-4 max-sm:has-[div[role="toolbar"]]:mb-16'>
      <DataTableToolbar
        table={table}
        searchPlaceholder='按作者名称筛选...'
        searchKey='authorName'
        resetLabel='重置'
        facetedFilterCopy={facetedFilterCopy}
        viewOptions={{
          triggerLabel: '视图',
          toggleColumnsLabel: '切换列显示',
          columnLabels,
        }}
        filters={[
          {
            columnId: 'isReply',
            title: '类型',
            options: [
              { label: '动态', value: '0' },
              { label: '回复', value: '1' },
            ],
          },
          {
            columnId: 'platform',
            title: '平台',
            options: [
              { label: 'Twitter', value: 'twitter' },
              { label: 'Telegram', value: 'telegram' },
              { label: 'Reddit', value: 'reddit' },
              { label: 'Medium', value: 'medium' },
            ],
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
                  正在加载 KOL 动态...
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
      <KolDynamicsBulkActions table={table} />
    </div>
  )
}
