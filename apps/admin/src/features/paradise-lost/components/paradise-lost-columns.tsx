import { type ColumnDef } from '@tanstack/react-table'
import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import {
  statusLabels,
  statusStyles,
  typeLabels,
  typeStyles,
} from '../data/data'
import { type ParadiseLostItem } from '../data/schema'
import { ParadiseLostRowActions } from './paradise-lost-row-actions'

function formatDateTime(value: string | null) {
  if (!value) return '-'

  return new Date(value).toLocaleString('zh-CN', {
    hour12: false,
  })
}

function getFallbackName(row: ParadiseLostItem) {
  return row.name.slice(0, 1) || String(row.id).slice(0, 1)
}

export const paradiseLostColumns: ColumnDef<ParadiseLostItem>[] = [
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
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='选择行'
        className='translate-y-0.5'
      />
    ),
    meta: {
      className: cn('inset-s-0 z-10 rounded-tl-[inherit] max-md:sticky'),
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ID' />
    ),
    cell: ({ row }) => (
      <span className='ps-2 font-mono text-xs tabular-nums'>
        {row.original.id}
      </span>
    ),
    meta: { className: 'w-20' },
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='名称' />
    ),
    cell: ({ row }) => (
      <div className='flex min-w-56 items-center gap-3 ps-3'>
        <Avatar className='size-9 rounded-md'>
          <AvatarImage
            src={row.original.avatar || undefined}
            alt={row.original.name}
          />
          <AvatarFallback className='rounded-md text-xs'>
            {getFallbackName(row.original)}
          </AvatarFallback>
        </Avatar>
        <div className='min-w-0 space-y-1'>
          <div className='flex min-w-0 items-center gap-2'>
            <LongText className='max-w-48 font-medium'>
              {row.original.name || '-'}
            </LongText>
            {row.original.sourceMissing && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant='outline'
                    className='border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200'
                  >
                    <AlertTriangle />
                    来源缺失
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {row.original.sourceMissingMessage ||
                      '来源对象不存在或不可用。'}
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <div className='font-mono text-xs text-muted-foreground'>
            {row.original.investId}
          </div>
        </div>
      </div>
    ),
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
        'inset-s-6 ps-0.5 max-md:sticky @4xl/content:table-cell @4xl/content:drop-shadow-none'
      ),
    },
    enableHiding: false,
  },
  {
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='类型' />
    ),
    cell: ({ row }) => (
      <Badge
        variant='outline'
        className={cn(typeStyles.get(row.original.type))}
      >
        {typeLabels[row.original.type]}
      </Badge>
    ),
    filterFn: (row, id, value) => {
      return (value as string[]).includes(String(row.getValue(id)))
    },
    enableSorting: false,
  },
  {
    accessorKey: 'tags',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='标签' />
    ),
    cell: ({ row }) => (
      <div className='flex max-w-64 flex-wrap gap-1'>
        {row.original.tagsText.length > 0 ? (
          row.original.tagsText.slice(0, 3).map((tag) => (
            <Badge key={tag} variant='secondary' className='rounded-sm'>
              {tag}
            </Badge>
          ))
        ) : (
          <span className='text-muted-foreground'>-</span>
        )}
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'year',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='年度' />
    ),
    cell: ({ row }) => (
      <span className='font-mono text-xs text-nowrap'>
        {row.original.year.join(', ') || '-'}
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='入选时间' />
    ),
    cell: ({ row }) => (
      <span className='text-xs text-nowrap'>
        {formatDateTime(row.original.date)}
      </span>
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='状态' />
    ),
    cell: ({ row }) => (
      <Badge
        variant='outline'
        className={cn(statusStyles.get(row.original.status))}
      >
        {statusLabels[row.original.status]}
      </Badge>
    ),
    filterFn: (row, id, value) => {
      return (value as string[]).includes(String(row.getValue(id)))
    },
    enableHiding: false,
    enableSorting: false,
  },
  {
    id: 'actions',
    cell: ParadiseLostRowActions,
  },
]
