import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { callTypes, statusLabels } from '../data/data'
import { type User } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

function formatUnixTime(value: number | null) {
  if (!value) return '-'

  return new Date(value * 1000).toLocaleString('zh-CN', {
    hour12: false,
  })
}

export const usersColumns: ColumnDef<User>[] = [
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
    accessorKey: 'username',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='用户名' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-36 ps-3'>{row.original.username}</LongText>
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
    accessorKey: 'nickname',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='昵称' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-36'>{row.original.nickname}</LongText>
    ),
  },
  {
    accessorKey: 'groupName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='组别' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-32'>
        {row.original.groupName || `#${row.original.groupId}`}
      </LongText>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='电子邮箱' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-52'>{row.original.email}</LongText>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'mobile',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='手机号' />
    ),
    cell: ({ row }) => (
      <span className='text-nowrap'>{row.original.mobile || '-'}</span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'avatar',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='头像' />
    ),
    cell: ({ row }) => (
      <Avatar className='size-8'>
        <AvatarImage
          src={row.original.avatar || undefined}
          alt={row.original.nickname}
        />
        <AvatarFallback>
          {row.original.nickname.slice(0, 1) ||
            row.original.username.slice(0, 1)}
        </AvatarFallback>
      </Avatar>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'level',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='等级' />
    ),
    cell: ({ row }) => (
      <span className='tabular-nums'>{row.original.level}</span>
    ),
  },
  {
    accessorKey: 'score',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='积分' />
    ),
    cell: ({ row }) => (
      <span className='tabular-nums'>{row.original.score}</span>
    ),
  },
  {
    accessorKey: 'loginTime',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='登录时间' />
    ),
    cell: ({ row }) => (
      <span className='text-nowrap'>
        {formatUnixTime(row.original.loginTime)}
      </span>
    ),
  },
  {
    accessorKey: 'loginIp',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='登录 IP' />
    ),
    cell: ({ row }) => (
      <span className='text-nowrap'>{row.original.loginIp || '-'}</span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'joinTime',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='加入时间' />
    ),
    cell: ({ row }) => (
      <span className='text-nowrap'>
        {formatUnixTime(row.original.joinTime)}
      </span>
    ),
  },
  {
    accessorKey: 'joinIp',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='加入 IP' />
    ),
    cell: ({ row }) => (
      <span className='text-nowrap'>{row.original.joinIp || '-'}</span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='状态' />
    ),
    cell: ({ row }) => {
      const status = row.original.status
      const badgeColor = callTypes.get(status)

      return (
        <Badge variant='outline' className={cn(badgeColor)}>
          {statusLabels[status]}
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
    id: 'actions',
    cell: DataTableRowActions,
  },
]
