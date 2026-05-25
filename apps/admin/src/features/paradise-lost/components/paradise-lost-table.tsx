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
import { type ParadiseLostItem } from '../data/schema'
import { ParadiseLostBulkActions } from './paradise-lost-bulk-actions'
import { paradiseLostColumns as columns } from './paradise-lost-columns'

const typeFilterValues = new Set([1, 2, 3, 5])
const statusFilterValues = new Set([0, 1])
const columnLabels = {
  type: '类型',
  tags: '标签',
  year: '年度',
  date: '入选时间',
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

type ParadiseLostTableProps = {
  data: ParadiseLostItem[]
  total?: number
  isLoading?: boolean
  search: Record<string, unknown>
  navigate: NavigateFn
}

function toStringArray(value: unknown) {
  return Array.isArray(value) ? value.map((item) => String(item)) : []
}

function toNumberFilterArray(
  value: unknown,
  allowedValues: ReadonlySet<number>
) {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => Number(item))
    .filter((item) => allowedValues.has(item))
}

export function ParadiseLostTable({
  data,
  total,
  isLoading = false,
  search,
  navigate,
}: ParadiseLostTableProps) {
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
      { columnId: 'name', searchKey: 'name', type: 'string' },
      {
        columnId: 'type',
        searchKey: 'type',
        type: 'array',
        deserialize: toStringArray,
        serialize: (value) => toNumberFilterArray(value, typeFilterValues),
      },
      {
        columnId: 'status',
        searchKey: 'status',
        type: 'array',
        deserialize: toStringArray,
        serialize: (value) => toNumberFilterArray(value, statusFilterValues),
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
        searchPlaceholder='按名称筛选...'
        searchKey='name'
        resetLabel='重置'
        facetedFilterCopy={facetedFilterCopy}
        viewOptions={{
          triggerLabel: '视图',
          toggleColumnsLabel: '切换列显示',
          columnLabels,
        }}
        filters={[
          {
            columnId: 'type',
            title: '类型',
            options: [
              { label: '项目', value: '1' },
              { label: '机构', value: '2' },
              { label: '人物', value: '3' },
              { label: '事件', value: '5' },
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
                  正在加载失乐园数据...
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
      <ParadiseLostBulkActions table={table} />
    </div>
  )
}
