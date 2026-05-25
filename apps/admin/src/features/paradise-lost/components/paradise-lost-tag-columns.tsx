import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type ColumnDef } from '@tanstack/react-table'
import { Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { type ParadiseLostTag } from '../data/schema'

type ParadiseLostTagColumnActions = {
  onEdit: (tag: ParadiseLostTag) => void
  onDelete: (tag: ParadiseLostTag) => void
}

const columnHeaderCopy = {
  ascLabel: '升序',
  descLabel: '降序',
  hideLabel: '隐藏',
}

function formatDateTime(value: string | null) {
  if (!value) return '-'

  const date = new Date(value.replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString('zh-CN', {
    hour12: false,
  })
}

function renderTagPreview(tag: ParadiseLostTag) {
  const hasCustomStyle = tag.color || tag.backgroundColor

  return (
    <div className='flex items-center gap-3'>
      <div className='flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted'>
        {tag.image ? (
          <img
            src={tag.image}
            alt={tag.tagName}
            className='size-full object-cover'
          />
        ) : (
          <span className='text-xs font-medium text-muted-foreground'>
            {tag.tagName.slice(0, 1) || tag.id}
          </span>
        )}
      </div>
      <div className='min-w-0 space-y-1'>
        <div className='flex min-w-0 items-center gap-2'>
          <LongText className='max-w-52 font-medium'>{tag.tagName}</LongText>
          {hasCustomStyle ? (
            <Badge
              variant='outline'
              className='rounded-sm'
              style={{
                color: tag.color || undefined,
                backgroundColor: tag.backgroundColor || undefined,
              }}
            >
              样式
            </Badge>
          ) : null}
        </div>
        <LongText className='max-w-64 text-xs text-muted-foreground'>
          {tag.remark || '-'}
        </LongText>
      </div>
    </div>
  )
}

export function createParadiseLostTagColumns({
  onEdit,
  onDelete,
}: ParadiseLostTagColumnActions): ColumnDef<ParadiseLostTag>[] {
  return [
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='ID'
          copy={columnHeaderCopy}
        />
      ),
      cell: ({ row }) => (
        <span className='font-mono text-xs tabular-nums'>
          {row.original.id}
        </span>
      ),
      meta: { className: 'w-20' },
      enableHiding: false,
    },
    {
      accessorKey: 'tagName',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='中文标签'
          copy={columnHeaderCopy}
        />
      ),
      cell: ({ row }) => renderTagPreview(row.original),
      filterFn: (row, _id, value) => {
        const term = String(value).trim().toLowerCase()
        if (!term) return true

        const tag = row.original
        return [tag.tagName, tag.tagNameEn, tag.remark].some((item) =>
          item.toLowerCase().includes(term)
        )
      },
      meta: {
        className: cn(
          'min-w-72 drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
          'inset-s-0 max-md:sticky @4xl/content:table-cell @4xl/content:drop-shadow-none'
        ),
      },
      enableHiding: false,
    },
    {
      accessorKey: 'tagNameEn',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='英文标签'
          copy={columnHeaderCopy}
        />
      ),
      cell: ({ row }) => (
        <LongText className='max-w-48 text-sm'>
          {row.original.tagNameEn || '-'}
        </LongText>
      ),
    },
    {
      id: 'style',
      header: '颜色',
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <span
            className='size-5 rounded border'
            style={{ backgroundColor: row.original.color || undefined }}
          />
          <span
            className='size-5 rounded border'
            style={{
              backgroundColor: row.original.backgroundColor || undefined,
            }}
          />
          <span className='text-xs text-muted-foreground'>
            {row.original.color || row.original.backgroundColor
              ? '已配置'
              : '-'}
          </span>
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'updateTime',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='更新时间'
          copy={columnHeaderCopy}
        />
      ),
      cell: ({ row }) => (
        <span className='text-xs text-nowrap'>
          {formatDateTime(row.original.updateTime)}
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
            >
              <DotsHorizontalIcon className='h-4 w-4' />
              <span className='sr-only'>打开菜单</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-40'>
            <DropdownMenuItem onClick={() => onEdit(row.original)}>
              编辑
              <DropdownMenuShortcut>
                <Pencil size={16} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(row.original)}
              className='text-red-500!'
            >
              删除
              <DropdownMenuShortcut>
                <Trash2 size={16} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ]
}
