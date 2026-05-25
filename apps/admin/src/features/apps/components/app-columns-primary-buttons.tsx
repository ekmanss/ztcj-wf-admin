import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppColumns } from './app-columns-provider'

export function AppColumnsPrimaryButtons() {
  const { setOpen } = useAppColumns()

  return (
    <Button className='space-x-1' onClick={() => setOpen('add')}>
      <span>新增栏目</span>
      <Plus size={18} />
    </Button>
  )
}
