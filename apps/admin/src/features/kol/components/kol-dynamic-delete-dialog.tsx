'use client'

import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import type { KolTweet } from '../data/schema'
import { useDeleteKolTweetMutation } from '../hooks/use-kol-query'

type KolDynamicDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: KolTweet
}

export function KolDynamicDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: KolDynamicDeleteDialogProps) {
  const [value, setValue] = useState('')
  const deleteMutation = useDeleteKolTweetMutation()

  const handleDelete = async () => {
    if (value.trim() !== currentRow.tweetRestId) return

    try {
      await deleteMutation.mutateAsync(currentRow.tweetRestId)
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
      form='kol-dynamic-delete-form'
      disabled={
        value.trim() !== currentRow.tweetRestId || deleteMutation.isPending
      }
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          删除 KOL 动态
        </span>
      }
      desc={
        <form
          id='kol-dynamic-delete-form'
          onSubmit={(event) => {
            event.preventDefault()
            handleDelete()
          }}
          className='space-y-4'
        >
          <p className='mb-2'>
            确定要删除动态{' '}
            <span className='font-mono font-bold'>
              {currentRow.tweetRestId}
            </span>
            ?
            <br />
            此操作会删除 `x_tweets` 中的动态，无法通过管理台撤销。
          </p>

          <Label className='my-2'>
            动态 ID：
            <Input
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder='输入动态 ID 以确认删除'
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
