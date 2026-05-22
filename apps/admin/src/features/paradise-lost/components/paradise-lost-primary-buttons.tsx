import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useParadiseLost } from './paradise-lost-provider'

export function ParadiseLostPrimaryButtons() {
  const { setOpen } = useParadiseLost()

  return (
    <div className='flex gap-2'>
      <Button className='gap-2' onClick={() => setOpen('add')}>
        <span>新增条目</span>
        <Plus size={18} />
      </Button>
    </div>
  )
}
