import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppAds } from './app-ads-provider'

export function AppAdsPrimaryButtons() {
  const { setOpen } = useAppAds()

  return (
    <Button className='space-x-1' onClick={() => setOpen('add')}>
      <span>新增广告</span>
      <Plus size={18} />
    </Button>
  )
}
