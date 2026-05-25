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
import type { AppAd, AppAdStatus } from '../data/schema'
import { useUpdateAppAdStatusMutation } from '../hooks/use-apps-query'
import { AppAdsMultiDeleteDialog } from './app-ads-multi-delete-dialog'

type AppAdsBulkActionsProps<TData> = {
  table: Table<TData>
}

export function AppAdsBulkActions<TData>({
  table,
}: AppAdsBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const updateStatusMutation = useUpdateAppAdStatusMutation()
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const isBulkUpdating = updateStatusMutation.isPending

  const handleBulkStatusChange = async (status: AppAdStatus) => {
    const ids = selectedRows.map((row) => (row.original as AppAd).adId)

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
        entityName='ad'
        copy={{
          selectedLabel: (count) => `已选择 ${count} 个广告`,
          toolbarLabel: (count) => `${count} 个 APP 广告的批量操作`,
          announcement: (count) => `已选择 ${count} 个 APP 广告。`,
          clearSelection: '清除选择',
          clearSelectionWithShortcut: '清除选择 (Escape)',
        }}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={() => handleBulkStatusChange(1)}
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
              onClick={() => handleBulkStatusChange(0)}
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
              aria-label='删除所选广告'
              title='删除所选广告'
            >
              <Trash2 />
              <span className='sr-only'>删除所选广告</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>删除所选广告</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <AppAdsMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      />
    </>
  )
}
