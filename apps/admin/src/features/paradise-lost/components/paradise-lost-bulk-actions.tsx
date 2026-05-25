import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Eye, EyeOff, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { type ParadiseLostItem, type ParadiseLostStatus } from '../data/schema'
import { useUpdateParadiseLostStatusMutation } from '../hooks/use-paradise-lost-query'
import { ParadiseLostMultiDeleteDialog } from './paradise-lost-multi-delete-dialog'

type ParadiseLostBulkActionsProps<TData> = {
  table: Table<TData>
}

const bulkActionsCopy = {
  selectedLabel: (selectedCount: number) =>
    `已选择 ${selectedCount} 个失乐园条目`,
  toolbarLabel: (selectedCount: number) =>
    `对 ${selectedCount} 个已选失乐园条目执行批量操作`,
  announcement: (selectedCount: number) =>
    `已选择 ${selectedCount} 个失乐园条目，可使用批量操作工具栏。`,
  clearSelection: '清除选择',
  clearSelectionWithShortcut: '清除选择 (Escape)',
}

export function ParadiseLostBulkActions<TData>({
  table,
}: ParadiseLostBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const updateStatusMutation = useUpdateParadiseLostStatusMutation()
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const isBulkUpdating = updateStatusMutation.isPending

  const handleBulkStatusChange = async (status: ParadiseLostStatus) => {
    const ids = selectedRows.map((row) => (row.original as ParadiseLostItem).id)

    try {
      await updateStatusMutation.mutateAsync({ ids, status })
      table.resetRowSelection()
    } catch {
      // Global mutation error handling shows the user-facing toast.
    }
  }

  return (
    <>
      <BulkActionsToolbar
        table={table}
        entityName='paradise lost item'
        copy={bulkActionsCopy}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={() => handleBulkStatusChange(1)}
              disabled={isBulkUpdating}
              className='size-8'
              aria-label='设置为显示'
              title='设置为显示'
            >
              <Eye />
              <span className='sr-only'>设置为显示</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>设置为显示</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={() => handleBulkStatusChange(0)}
              disabled={isBulkUpdating}
              className='size-8'
              aria-label='设置为隐藏'
              title='设置为隐藏'
            >
              <EyeOff />
              <span className='sr-only'>设置为隐藏</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>设置为隐藏</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isBulkUpdating}
              className='size-8'
              aria-label='删除所选条目'
              title='删除所选条目'
            >
              <Trash2 />
              <span className='sr-only'>删除所选条目</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>删除所选条目</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <ParadiseLostMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      />
    </>
  )
}
