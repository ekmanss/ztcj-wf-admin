'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type ParadiseLostItem } from '../data/schema'
import { useDeleteParadiseLostMutation } from '../hooks/use-paradise-lost-query'

type ParadiseLostDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: ParadiseLostItem
}

export function ParadiseLostDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: ParadiseLostDeleteDialogProps) {
  const [value, setValue] = useState('')
  const deleteMutation = useDeleteParadiseLostMutation()

  const handleDelete = async () => {
    if (value.trim() !== currentRow.name) return

    try {
      await deleteMutation.mutateAsync(currentRow.id)
      setValue('')
      onOpenChange(false)
    } catch {
      // Global mutation error handling shows the user-facing toast.
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      form='paradise-lost-delete-form'
      disabled={value.trim() !== currentRow.name || deleteMutation.isPending}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          删除失乐园条目
        </span>
      }
      desc={
        <form
          id='paradise-lost-delete-form'
          onSubmit={(event) => {
            event.preventDefault()
            handleDelete()
          }}
          className='space-y-4'
        >
          <p className='mb-2'>
            确定要删除 <span className='font-bold'>{currentRow.name}</span>?
            <br />
            此操作只删除专题条目，不会回滚源表资料。
          </p>

          <Label className='my-2'>
            名称：
            <Input
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder='输入名称以确认删除'
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
