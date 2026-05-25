'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import type { KolUser } from '../data/schema'
import { useDeleteKolUserMutation } from '../hooks/use-kol-query'

type KolUserDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: KolUser
}

export function KolUserDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: KolUserDeleteDialogProps) {
  const [value, setValue] = useState('')
  const deleteMutation = useDeleteKolUserMutation()
  const confirmValue = currentRow.username

  const handleDelete = async () => {
    if (value.trim() !== confirmValue) return

    try {
      await deleteMutation.mutateAsync(currentRow.restId)
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
      form='kol-user-delete-form'
      disabled={value.trim() !== confirmValue || deleteMutation.isPending}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          删除 KOL 会员
        </span>
      }
      desc={
        <form
          id='kol-user-delete-form'
          onSubmit={(event) => {
            event.preventDefault()
            handleDelete()
          }}
          className='space-y-4'
        >
          <p className='mb-2'>
            确定要删除{' '}
            <span className='font-bold'>
              {currentRow.name || currentRow.username}
            </span>
            ?
            <br />
            此操作会删除 `x_users` 中的账号资料，无法通过管理台撤销。
          </p>

          <Label className='my-2'>
            用户名：
            <Input
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder='输入用户名以确认删除'
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
