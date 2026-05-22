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
import { type User, type UserStatus } from '../data/schema'
import { useUpdateUsersStatusMutation } from '../hooks/use-users-query'
import { UsersMultiDeleteDialog } from './users-multi-delete-dialog'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const updateUsersStatusMutation = useUpdateUsersStatusMutation()
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const isBulkUpdating = updateUsersStatusMutation.isPending

  const handleBulkStatusChange = async (status: UserStatus) => {
    const ids = selectedRows.map((row) => (row.original as User).id)

    try {
      await updateUsersStatusMutation.mutateAsync({ ids, status })
      table.resetRowSelection()
    } catch {
      // Global mutation error handling shows the user-facing toast.
    }
  }

  return (
    <>
      <BulkActionsToolbar table={table} entityName='user'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={() => handleBulkStatusChange('normal')}
              disabled={isBulkUpdating}
              className='size-8'
              aria-label='设置为正常'
              title='设置为正常'
            >
              <Eye />
              <span className='sr-only'>设置为正常</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>设置为正常</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={() => handleBulkStatusChange('hidden')}
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
              aria-label='删除所选用户'
              title='删除所选用户'
            >
              <Trash2 />
              <span className='sr-only'>删除所选用户</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>删除所选用户</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <UsersMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      />
    </>
  )
}
