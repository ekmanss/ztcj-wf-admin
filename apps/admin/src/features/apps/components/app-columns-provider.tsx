import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import type { AppColumn } from '../data/schema'

type AppColumnsDialogType = 'add' | 'edit' | 'delete' | 'multi-delete'

type AppColumnsContextType = {
  open: AppColumnsDialogType | null
  setOpen: (str: AppColumnsDialogType | null) => void
  currentRow: AppColumn | null
  setCurrentRow: React.Dispatch<React.SetStateAction<AppColumn | null>>
}

const AppColumnsContext = React.createContext<AppColumnsContextType | null>(
  null
)

export function AppColumnsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useDialogState<AppColumnsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<AppColumn | null>(null)

  return (
    <AppColumnsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </AppColumnsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAppColumns = () => {
  const context = React.useContext(AppColumnsContext)

  if (!context) {
    throw new Error('useAppColumns has to be used within <AppColumnsProvider>')
  }

  return context
}
