import { type ColumnDef } from '@tanstack/react-table'
import { ExternalLink } from 'lucide-react'
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
  syncStatusBadgeClass,
  syncStatusLabels,
  userStatusBadgeClass,
  userStatusLabels,
} from '../data/data'
import type { KolUser } from '../data/schema'
import { KolUserRowActions } from './kol-user-row-actions'

export const kolUsersColumns: ColumnDef<KolUser>[] = [
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
    accessorKey: 'restId',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='唯一 ID' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-40 ps-2 font-mono text-xs'>
        {row.original.restId}
      </LongText>
    ),
    meta: { className: 'w-44' },
    enableHiding: false,
  },
  {
    accessorKey: 'displayAvatarUrl',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='头像' />
    ),
    cell: ({ row }) => (
      <Avatar className='size-8'>
        <AvatarImage
          src={row.original.displayAvatarUrl || undefined}
          alt={row.original.name || row.original.username}
        />
        <AvatarFallback>
          {(row.original.name || row.original.username).slice(0, 1)}
        </AvatarFallback>
      </Avatar>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'username',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='用户名' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-36'>@{row.original.username}</LongText>
    ),
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='显示名称' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-44'>{row.original.name || '-'}</LongText>
    ),
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
    accessorKey: 'syncStatus',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='同步状态' />
    ),
    cell: ({ row }) => {
      const status = row.original.syncStatus

      return (
        <Badge
          variant='outline'
          className={cn(syncStatusBadgeClass.get(status))}
        >
          {syncStatusLabels[status]}
        </Badge>
      )
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    enableSorting: false,
  },
  {
    accessorKey: 'followersCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='粉丝数' />
    ),
    cell: ({ row }) => (
      <span className='tabular-nums'>
        {formatNumber(row.original.followersCount)}
      </span>
    ),
  },
  {
    accessorKey: 'statusesCount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='推文数' />
    ),
    cell: ({ row }) => (
      <span className='tabular-nums'>
        {formatNumber(row.original.statusesCount)}
      </span>
    ),
  },
  {
    accessorKey: 'displayLinkUrl',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='链接' />
    ),
    cell: ({ row }) =>
      row.original.displayLinkUrl ? (
        <a
          href={row.original.displayLinkUrl}
          target='_blank'
          rel='noreferrer'
          className='inline-flex items-center gap-1 text-sm text-primary hover:underline'
        >
          打开
          <ExternalLink size={14} />
        </a>
      ) : (
        '-'
      ),
    enableSorting: false,
  },
  {
    accessorKey: 'syncedAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='同步时间' />
    ),
    cell: ({ row }) => (
      <span className='text-nowrap'>
        {formatDateTime(row.original.syncedAt)}
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
          className={cn(userStatusBadgeClass.get(status))}
        >
          {userStatusLabels[status]}
        </Badge>
      )
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    enableHiding: false,
    enableSorting: false,
  },
  {
    id: 'actions',
    cell: KolUserRowActions,
  },
]
