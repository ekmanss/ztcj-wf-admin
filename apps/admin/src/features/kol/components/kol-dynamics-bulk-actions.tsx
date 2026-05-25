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
import type { KolTweet, KolTweetStatus } from '../data/schema'
import { useUpdateKolTweetsStatusMutation } from '../hooks/use-kol-query'
import { KolDynamicsMultiDeleteDialog } from './kol-dynamics-multi-delete-dialog'

type KolDynamicsBulkActionsProps<TData> = {
  table: Table<TData>
}

export function KolDynamicsBulkActions<TData>({
  table,
}: KolDynamicsBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const updateStatusMutation = useUpdateKolTweetsStatusMutation()
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const isBulkUpdating = updateStatusMutation.isPending

  const handleBulkStatusChange = async (status: KolTweetStatus) => {
    const tweetRestIds = selectedRows.map(
      (row) => (row.original as KolTweet).tweetRestId
    )

    try {
      await updateStatusMutation.mutateAsync({ tweetRestIds, status })
      table.resetRowSelection()
    } catch {
      // Global mutation error handling shows the user-facing toast.
    }
  }

  return (
    <>
      <BulkActionsToolbar
        table={table}
        entityName='KOL 动态'
        copy={{
          selectedLabel: (selectedCount) => `已选择 ${selectedCount} 项`,
          clearSelection: '清除选择',
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
              onClick={() => handleBulkStatusChange('0')}
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
              aria-label='删除所选 KOL 动态'
              title='删除所选 KOL 动态'
            >
              <Trash2 />
              <span className='sr-only'>删除所选 KOL 动态</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>删除所选 KOL 动态</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <KolDynamicsMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      />
    </>
  )
}
