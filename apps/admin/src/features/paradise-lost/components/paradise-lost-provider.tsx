import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type ParadiseLostItem } from '../data/schema'

type ParadiseLostDialogType = 'add' | 'edit' | 'delete' | 'add-tag'

type ParadiseLostContextType = {
  open: ParadiseLostDialogType | null
  setOpen: (str: ParadiseLostDialogType | null) => void
  currentRow: ParadiseLostItem | null
  setCurrentRow: React.Dispatch<React.SetStateAction<ParadiseLostItem | null>>
}

const ParadiseLostContext = React.createContext<ParadiseLostContextType | null>(
  null
)

export function ParadiseLostProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useDialogState<ParadiseLostDialogType>(null)
  const [currentRow, setCurrentRow] = useState<ParadiseLostItem | null>(null)

  return (
    <ParadiseLostContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </ParadiseLostContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useParadiseLost = () => {
  const context = React.useContext(ParadiseLostContext)

  if (!context) {
    throw new Error('useParadiseLost must be used within ParadiseLostProvider')
  }

  return context
}
