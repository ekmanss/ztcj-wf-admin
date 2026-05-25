'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type ParadiseLostTag } from '../data/schema'
import { useDeleteParadiseLostTagMutation } from '../hooks/use-paradise-lost-query'

type ParadiseLostTagDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: ParadiseLostTag
}

export function ParadiseLostTagDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: ParadiseLostTagDeleteDialogProps) {
  const [value, setValue] = useState('')
  const deleteMutation = useDeleteParadiseLostTagMutation()

  const handleDelete = async () => {
    if (value.trim() !== currentRow.tagName) return

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
      onOpenChange={(state) => {
        if (!state) setValue('')
        onOpenChange(state)
      }}
      form='paradise-lost-tag-delete-form'
      disabled={value.trim() !== currentRow.tagName || deleteMutation.isPending}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          删除标签
        </span>
      }
      desc={
        <form
          id='paradise-lost-tag-delete-form'
          onSubmit={(event) => {
            event.preventDefault()
            handleDelete()
          }}
          className='space-y-4'
        >
          <p className='mb-2'>
            确定要删除 <span className='font-bold'>{currentRow.tagName}</span>?
          </p>

          <Label className='my-2'>
            中文标签：
            <Input
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder='输入中文标签以确认删除'
              autoFocus
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>警告</AlertTitle>
            <AlertDescription>
              删除后不能通过管理台恢复；仍被失乐园条目引用的标签会被 API 拦截。
            </AlertDescription>
          </Alert>
        </form>
      }
      confirmText='删除'
      destructive
    />
  )
}
