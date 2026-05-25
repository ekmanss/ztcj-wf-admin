'use client'

import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import type { KolTweet } from '../data/schema'
import { useDeleteKolTweetsMutation } from '../hooks/use-kol-query'

type KolDynamicsMultiDeleteDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
}

const CONFIRM_WORD = 'DELETE'

export function KolDynamicsMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: KolDynamicsMultiDeleteDialogProps<TData>) {
  const [value, setValue] = useState('')
  const deleteMutation = useDeleteKolTweetsMutation()
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleDelete = async () => {
    if (value.trim() !== CONFIRM_WORD) {
      toast.error(`请输入 "${CONFIRM_WORD}" 以确认。`)
      return
    }

    const tweetRestIds = selectedRows.map(
      (row) => (row.original as KolTweet).tweetRestId
    )

    try {
      await deleteMutation.mutateAsync(tweetRestIds)
      setValue('')
      table.resetRowSelection()
      onOpenChange(false)
    } catch {
      // Global mutation error handling shows the user-facing toast.
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      form='kol-dynamics-multi-delete-form'
      disabled={value.trim() !== CONFIRM_WORD || deleteMutation.isPending}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          删除 {selectedRows.length} 条 KOL 动态
        </span>
      }
      desc={
        <form
          id='kol-dynamics-multi-delete-form'
          onSubmit={(event) => {
            event.preventDefault()
            handleDelete()
          }}
          className='space-y-4'
        >
          <p className='mb-2'>
            确定要删除所选 KOL 动态吗？
            <br />
            此操作无法撤销。
          </p>

          <Label className='my-4 flex flex-col items-start gap-1.5'>
            <span>输入 "{CONFIRM_WORD}" 确认：</span>
            <Input
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder={`输入 "${CONFIRM_WORD}" 确认`}
              autoFocus
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>警告</AlertTitle>
            <AlertDescription>删除后不能通过管理台恢复。</AlertDescription>
          </Alert>
        </form>
      }
      confirmText='删除'
      destructive
    />
  )
}
