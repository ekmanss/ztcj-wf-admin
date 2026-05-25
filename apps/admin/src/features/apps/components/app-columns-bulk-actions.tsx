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
import type { AppColumn, AppColumnStatus } from '../data/schema'
import { useUpdateAppColumnStatusMutation } from '../hooks/use-apps-query'
import { AppColumnsMultiDeleteDialog } from './app-columns-multi-delete-dialog'

type AppColumnsBulkActionsProps<TData> = {
  table: Table<TData>
}

export function AppColumnsBulkActions<TData>({
  table,
}: AppColumnsBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const updateStatusMutation = useUpdateAppColumnStatusMutation()
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const isBulkUpdating = updateStatusMutation.isPending

  const handleBulkStatusChange = async (status: AppColumnStatus) => {
    const ids = selectedRows.map((row) => (row.original as AppColumn).id)

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
        entityName='column'
        copy={{
          selectedLabel: (count) => `已选择 ${count} 个栏目`,
          toolbarLabel: (count) => `${count} 个 APP 栏目的批量操作`,
          announcement: (count) => `已选择 ${count} 个 APP 栏目。`,
          clearSelection: '清除选择',
          clearSelectionWithShortcut: '清除选择 (Escape)',
        }}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={() => handleBulkStatusChange('1')}
              disabled={isBulkUpdating}
              className='size-8'
              aria-label='设为显示'
              title='设为显示'
            >
              <Eye />
              <span className='sr-only'>设为显示</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>设为显示</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={() => handleBulkStatusChange('0')}
              disabled={isBulkUpdating}
              className='size-8'
              aria-label='设为隐藏'
              title='设为隐藏'
            >
              <EyeOff />
              <span className='sr-only'>设为隐藏</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>设为隐藏</p>
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
              aria-label='删除所选栏目'
              title='删除所选栏目'
            >
              <Trash2 />
              <span className='sr-only'>删除所选栏目</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>删除所选栏目</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <AppColumnsMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      />
    </>
  )
}
