import { type ColumnDef } from '@tanstack/react-table'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { columnStatusBadgeClass, columnStatusLabels } from '../data/data'
import type { AppColumn } from '../data/schema'
import { AppColumnRowActions } from './app-column-row-actions'

function formatDateTime(value: string | null) {
  if (!value) return '-'
  return value.replace('T', ' ')
}

export const appColumnsColumns: ColumnDef<AppColumn>[] = [
  {
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
  },
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ID' />
    ),
    cell: ({ row }) => (
      <span className='ps-2 tabular-nums'>{row.original.id}</span>
    ),
    meta: {
      className: 'w-20',
    },
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='栏目名称' />
    ),
    cell: ({ row }) => {
      const depth = row.original.depth

      return (
        <div
          className='flex min-w-48 items-center gap-2'
          style={{ paddingInlineStart: `${depth * 1.25}rem` }}
        >
          <ChevronRight
            size={16}
            className={cn(
              'shrink-0 text-muted-foreground',
              row.original.hasChildren ? 'rotate-90' : 'opacity-0'
            )}
          />
          <LongText className='max-w-48 font-medium'>
            {row.original.name}
          </LongText>
        </div>
      )
    },
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
        'inset-s-6 ps-0.5 max-md:sticky @4xl/content:table-cell @4xl/content:drop-shadow-none'
      ),
    },
    enableHiding: false,
  },
  {
    accessorKey: 'code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='栏目CODE' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-40 font-mono text-xs'>
        {row.original.code}
      </LongText>
    ),
  },
  {
    accessorKey: 'nameEn',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='英文名称' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-44'>{row.original.nameEn}</LongText>
    ),
  },
  {
    accessorKey: 'level',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='等级' />
    ),
    cell: ({ row }) => (
      <Badge variant='secondary'>{row.original.levelText}</Badge>
    ),
    filterFn: (row, id, value) => {
      return value.includes(String(row.getValue(id)))
    },
  },
  {
    accessorKey: 'parentName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='父级' />
    ),
    cell: ({ row }) => row.original.parentName || '-',
    enableSorting: false,
  },
  {
    accessorKey: 'weigh',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='序号' />
    ),
    cell: ({ row }) => (
      <span className='tabular-nums'>{row.original.weigh}</span>
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='显示' />
    ),
    cell: ({ row }) => {
      const status = row.original.status

      return (
        <Badge
          variant='outline'
          className={cn(columnStatusBadgeClass.get(status))}
        >
          {columnStatusLabels[status]}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableHiding: false,
    enableSorting: false,
  },
  {
    accessorKey: 'remarks',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='备注' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-52'>{row.original.remarks || '-'}</LongText>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'updateTime',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='更新时间' />
    ),
    cell: ({ row }) => (
      <span className='text-nowrap'>
        {formatDateTime(row.original.updateTime)}
      </span>
    ),
  },
  {
    id: 'actions',
    cell: AppColumnRowActions,
  },
]
