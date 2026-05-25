import { useState } from 'react'
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
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
import { DataTableToolbar } from '@/components/data-table'
import type { AppColumn } from '../data/schema'
import { AppColumnsBulkActions } from './app-columns-bulk-actions'
import { appColumnsColumns as columns } from './app-columns-columns'

const columnLabels = {
  code: '栏目CODE',
  nameEn: '英文名称',
  level: '等级',
  parentName: '父级',
  remarks: '备注',
  updateTime: '更新时间',
}
const facetedFilterCopy = {
  selectedCountLabel: (selectedCount: number) => `已选择 ${selectedCount} 项`,
  emptyLabel: '无结果。',
  clearFiltersLabel: '清除筛选',
}

type AppColumnsTableProps = {
  data: AppColumn[]
  isLoading?: boolean
  search: Record<string, unknown>
  navigate: NavigateFn
}

function toStringArray(value: unknown) {
  return Array.isArray(value) ? value.map((item) => String(item)) : []
}

export function AppColumnsTable({
  data,
  isLoading = false,
  search,
  navigate,
}: AppColumnsTableProps) {
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])

  const { columnFilters, onColumnFiltersChange } = useTableUrlState({
    search,
    navigate,
    pagination: { defaultPage: 1, defaultPageSize: 100 },
    globalFilter: { enabled: false },
    columnFilters: [
      { columnId: 'name', searchKey: 'q', type: 'string' },
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
      rowSelection,
      columnFilters,
      columnVisibility,
    },
    enableRowSelection: true,
    manualFiltering: true,
    onColumnFiltersChange,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  return (
    <div className='flex flex-1 flex-col gap-4 max-sm:has-[div[role="toolbar"]]:mb-16'>
      <DataTableToolbar
        table={table}
        searchPlaceholder='按名称或 CODE 筛选...'
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
            columnId: 'status',
            title: '显示',
            options: [
              { label: '是', value: '1' },
              { label: '否', value: '0' },
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
                  正在加载 APP 栏目...
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
      <AppColumnsBulkActions table={table} />
    </div>
  )
}
