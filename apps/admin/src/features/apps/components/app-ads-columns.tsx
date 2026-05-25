import { type ColumnDef } from '@tanstack/react-table'
import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import {
  adStatusBadgeClass,
  adStatusLabels,
  adTypeBadgeClass,
  adTypeLabels,
} from '../data/data'
import type { AppAd } from '../data/schema'
import { AppAdRowActions } from './app-ad-row-actions'

function formatDateTime(value: string | null) {
  if (!value) return '-'
  return value.replace('T', ' ')
}

export const appAdsColumns: ColumnDef<AppAd>[] = [
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
    accessorKey: 'adId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='ID' />
    ),
    cell: ({ row }) => (
      <span className='ps-2 tabular-nums'>{row.original.adId}</span>
    ),
    meta: {
      className: 'w-20',
    },
    enableHiding: false,
  },
  {
    accessorKey: 'adImageCh',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='图片' />
    ),
    cell: ({ row }) => {
      const image = row.original.adImageCh || row.original.adImageEn

      return image ? (
        <img
          src={image}
          alt={row.original.adName}
          className='h-10 w-18 rounded border object-cover'
        />
      ) : (
        <div className='flex h-10 w-18 items-center justify-center rounded border bg-muted text-xs text-muted-foreground'>
          无图片
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'adName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='广告名称' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-44 font-medium'>
        {row.original.adName}
      </LongText>
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
    accessorKey: 'adLink',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='跳转url' />
    ),
    cell: ({ row }) => (
      <a
        href={row.original.adLink}
        target='_blank'
        rel='noreferrer'
        className='inline-flex max-w-52 items-center gap-1 text-primary hover:underline'
      >
        <LongText className='max-w-44'>{row.original.adLink}</LongText>
        <ExternalLink size={14} className='shrink-0' />
      </a>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'adPositionCode',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='广告位' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-48'>{row.original.adPositionText}</LongText>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableSorting: false,
  },
  {
    accessorKey: 'adPageCode',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='页面' />
    ),
    cell: ({ row }) => row.original.adPageCodeText,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableSorting: false,
  },
  {
    accessorKey: 'adType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='标签' />
    ),
    cell: ({ row }) => {
      const adType = row.original.adType

      return (
        <Badge variant='outline' className={cn(adTypeBadgeClass.get(adType))}>
          {adTypeLabels[adType]}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableSorting: false,
  },
  {
    accessorKey: 'adEffectiveTime',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='生效时间' />
    ),
    cell: ({ row }) => (
      <span className='text-nowrap'>
        {formatDateTime(row.original.adEffectiveTime)}
      </span>
    ),
  },
  {
    accessorKey: 'adInvalidTime',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='失效时间' />
    ),
    cell: ({ row }) => (
      <span className='text-nowrap'>
        {formatDateTime(row.original.adInvalidTime)}
      </span>
    ),
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
      <DataTableColumnHeader column={column} title='状态' />
    ),
    cell: ({ row }) => {
      const status = row.original.status

      return (
        <Badge variant='outline' className={cn(adStatusBadgeClass.get(status))}>
          {adStatusLabels[status]}
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
    cell: AppAdRowActions,
  },
]
