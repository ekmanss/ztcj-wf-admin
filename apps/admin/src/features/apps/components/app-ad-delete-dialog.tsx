'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import type { AppAd } from '../data/schema'
import { useDeleteAppAdMutation } from '../hooks/use-apps-query'

type AppAdDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: AppAd
}

export function AppAdDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: AppAdDeleteDialogProps) {
  const [value, setValue] = useState('')
  const deleteMutation = useDeleteAppAdMutation()

  const handleDelete = async () => {
    if (value.trim() !== currentRow.adName) return

    try {
      await deleteMutation.mutateAsync(currentRow.adId)
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
      form='app-ad-delete-form'
      disabled={value.trim() !== currentRow.adName || deleteMutation.isPending}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          删除 APP 广告
        </span>
      }
      desc={
        <form
          id='app-ad-delete-form'
          onSubmit={(e) => {
            e.preventDefault()
            handleDelete()
          }}
          className='space-y-4'
        >
          <p className='mb-2'>
            确定要删除广告{' '}
            <span className='font-bold'>{currentRow.adName}</span>?
            <br />
            此操作会永久删除广告配置，无法撤销。
          </p>

          <Label className='my-2'>
            广告名称：
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='输入广告名称以确认删除'
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
