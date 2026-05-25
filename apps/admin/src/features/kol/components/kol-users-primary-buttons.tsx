import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useKolUsers } from './kol-users-provider'

export function KolUsersPrimaryButtons() {
  const { setOpen } = useKolUsers()

  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>新增会员</span>
        <UserPlus size={18} />
      </Button>
    </div>
  )
}
