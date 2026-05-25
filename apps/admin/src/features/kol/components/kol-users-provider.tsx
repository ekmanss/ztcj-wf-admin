import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import type { KolUser } from '../data/schema'

type KolUsersDialogType = 'add' | 'edit' | 'delete'

type KolUsersContextType = {
  open: KolUsersDialogType | null
  setOpen: (str: KolUsersDialogType | null) => void
  currentRow: KolUser | null
  setCurrentRow: React.Dispatch<React.SetStateAction<KolUser | null>>
}

const KolUsersContext = React.createContext<KolUsersContextType | null>(null)

export function KolUsersProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<KolUsersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<KolUser | null>(null)

  return (
    <KolUsersContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </KolUsersContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useKolUsers = () => {
  const context = React.useContext(KolUsersContext)

  if (!context) {
    throw new Error('useKolUsers has to be used within <KolUsersProvider>')
  }

  return context
}
