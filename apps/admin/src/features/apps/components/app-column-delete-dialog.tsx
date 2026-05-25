'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import type { AppColumn } from '../data/schema'
import { useDeleteAppColumnMutation } from '../hooks/use-apps-query'

type AppColumnDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: AppColumn
}

export function AppColumnDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: AppColumnDeleteDialogProps) {
  const [value, setValue] = useState('')
  const deleteMutation = useDeleteAppColumnMutation()

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
      form='app-column-delete-form'
      disabled={value.trim() !== currentRow.name || deleteMutation.isPending}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          删除 APP 栏目
        </span>
      }
      desc={
        <form
          id='app-column-delete-form'
          onSubmit={(e) => {
            e.preventDefault()
            handleDelete()
          }}
          className='space-y-4'
        >
          <p className='mb-2'>
            确定要删除栏目 <span className='font-bold'>{currentRow.name}</span>?
            <br />
            如果该栏目仍有子栏目，API 会拒绝删除。
          </p>

          <Label className='my-2'>
            栏目名称：
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='输入栏目名称以确认删除'
              autoFocus
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>警告</AlertTitle>
            <AlertDescription>
              请谨慎操作，删除后不能通过管理台回滚。
            </AlertDescription>
          </Alert>
        </form>
      }
      confirmText='删除'
      destructive
    />
  )
}
