import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import {
  formatDateTime,
  formatNumber,
  platformLabels,
  tweetStatusBadgeClass,
  tweetStatusLabels,
} from '../data/data'
import type { KolTweet } from '../data/schema'
import { KolDynamicRowActions } from './kol-dynamic-row-actions'

export const kolDynamicsColumns: ColumnDef<KolTweet>[] = [
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
    accessorKey: 'tweetRestId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='动态 ID' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-40 ps-2 font-mono text-xs'>
        {row.original.tweetRestId}
      </LongText>
    ),
    meta: { className: 'w-44' },
    enableHiding: false,
  },
  {
    accessorKey: 'authorName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='作者' />
    ),
    cell: ({ row }) => (
      <div className='flex min-w-44 items-center gap-2'>
        <Avatar className='size-8'>
          <AvatarImage
            src={row.original.authorAvatarUrl || undefined}
            alt={row.original.authorName || row.original.authorUsername}
          />
          <AvatarFallback>
            {(
              row.original.authorName ||
              row.original.authorUsername ||
              '?'
            ).slice(0, 1)}
          </AvatarFallback>
        </Avatar>
        <div className='min-w-0'>
          <LongText className='max-w-36 font-medium'>
            {row.original.authorName || '-'}
          </LongText>
          <LongText className='max-w-36 text-xs text-muted-foreground'>
            {row.original.authorUsername
              ? `@${row.original.authorUsername}`
              : '-'}
          </LongText>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'isReply',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='类型' />
    ),
    cell: ({ row }) => (
      <Badge variant='outline'>{row.original.isReply ? '回复' : '动态'}</Badge>
    ),
    filterFn: (row, id, value) => value.includes(String(row.getValue(id))),
    enableSorting: false,
  },
  {
    accessorKey: 'fullText',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='内容' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-[28rem]'>{row.original.fullText}</LongText>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'platform',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='平台' />
    ),
    cell: ({ row }) => (
      <Badge variant='outline'>{platformLabels[row.original.platform]}</Badge>
    ),
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    enableSorting: false,
  },
  {
    accessorKey: 'tweetCreatedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='发布时间' />
    ),
    cell: ({ row }) => (
      <span className='text-nowrap'>
        {formatDateTime(row.original.tweetCreatedAt)}
      </span>
    ),
  },
  {
    accessorKey: 'favoriteCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='点赞' />
    ),
    cell: ({ row }) => (
      <span className='tabular-nums'>
        {formatNumber(row.original.favoriteCount)}
      </span>
    ),
  },
  {
    accessorKey: 'viewCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='浏览' />
    ),
    cell: ({ row }) => (
      <span className='tabular-nums'>
        {formatNumber(row.original.viewCount)}
      </span>
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
        <Badge
          variant='outline'
          className={cn(tweetStatusBadgeClass.get(status))}
        >
          {tweetStatusLabels[status]}
        </Badge>
      )
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    enableHiding: false,
    enableSorting: false,
  },
  {
    id: 'actions',
    cell: KolDynamicRowActions,
  },
]
