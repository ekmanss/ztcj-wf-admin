import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  formatDateTime,
  formatNumber,
  platformLabels,
  tweetStatusBadgeClass,
  tweetStatusLabels,
} from '../data/data'
import type { KolTweet } from '../data/schema'
import { useKolTweetQuery } from '../hooks/use-kol-query'

type KolDynamicDetailDialogProps = {
  currentRow: KolTweet
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KolDynamicDetailDialog({
  currentRow,
  open,
  onOpenChange,
}: KolDynamicDetailDialogProps) {
  const detailQuery = useKolTweetQuery(currentRow.tweetRestId, open)
  const tweet = detailQuery.data ?? currentRow

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-3xl'>
        <DialogHeader className='text-start'>
          <DialogTitle>KOL 动态详情</DialogTitle>
          <DialogDescription>
            查看动态正文、作者资料和互动数据。
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-5'>
          <div className='rounded-md border p-4'>
            <div className='mb-4 flex items-start gap-3'>
              <Avatar className='size-11'>
                <AvatarImage
                  src={tweet.authorAvatarUrl || undefined}
                  alt={tweet.authorName || tweet.authorUsername}
                />
                <AvatarFallback>
                  {(tweet.authorName || tweet.authorUsername || '?').slice(
                    0,
                    1
                  )}
                </AvatarFallback>
              </Avatar>
              <div className='min-w-0 flex-1'>
                <div className='flex flex-wrap items-center gap-2'>
                  <span className='font-semibold'>
                    {tweet.authorName || tweet.authorUsername || '-'}
                  </span>
                  {tweet.authorUsername && (
                    <span className='text-sm text-muted-foreground'>
                      @{tweet.authorUsername}
                    </span>
                  )}
                  <Badge variant='outline'>
                    {tweet.isReply ? '回复' : '动态'}
                  </Badge>
                  <Badge variant='outline'>
                    {platformLabels[tweet.platform]}
                  </Badge>
                  <Badge
                    variant='outline'
                    className={cn(tweetStatusBadgeClass.get(tweet.status))}
                  >
                    {tweetStatusLabels[tweet.status]}
                  </Badge>
                </div>
                <div className='mt-1 text-sm text-muted-foreground'>
                  {formatDateTime(tweet.tweetCreatedAt)}
                </div>
              </div>
              {tweet.originalUrl && (
                <Button variant='outline' size='sm' asChild>
                  <a href={tweet.originalUrl} target='_blank' rel='noreferrer'>
                    原文
                    <ExternalLink size={14} />
                  </a>
                </Button>
              )}
            </div>
            <p className='text-sm leading-6 whitespace-pre-wrap'>
              {tweet.fullText || '-'}
            </p>
          </div>

          <div className='grid gap-3 sm:grid-cols-3'>
            <Metric label='点赞' value={formatNumber(tweet.favoriteCount)} />
            <Metric label='回复' value={formatNumber(tweet.replyCount)} />
            <Metric label='转推' value={formatNumber(tweet.retweetCount)} />
            <Metric label='引用' value={formatNumber(tweet.quoteCount)} />
            <Metric label='浏览' value={formatNumber(tweet.viewCount)} />
            <Metric label='收藏' value={formatNumber(tweet.bookmarkCount)} />
          </div>

          {(tweet.replyToUsername || tweet.conversationId) && (
            <div className='grid gap-2 rounded-md border p-4 text-sm sm:grid-cols-2'>
              <div>
                <span className='text-muted-foreground'>回复对象：</span>
                {tweet.replyToUsername ? `@${tweet.replyToUsername}` : '-'}
              </div>
              <div>
                <span className='text-muted-foreground'>会话 ID：</span>
                <span className='font-mono text-xs'>
                  {tweet.conversationId || '-'}
                </span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className='rounded-md border px-3 py-2'>
      <div className='text-xs text-muted-foreground'>{label}</div>
      <div className='mt-1 text-lg font-semibold tabular-nums'>{value}</div>
    </div>
  )
}
