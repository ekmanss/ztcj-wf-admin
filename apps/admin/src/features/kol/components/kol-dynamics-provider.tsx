import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import type { KolTweet } from '../data/schema'

type KolDynamicsDialogType = 'detail' | 'edit' | 'delete'

type KolDynamicsContextType = {
  open: KolDynamicsDialogType | null
  setOpen: (str: KolDynamicsDialogType | null) => void
  currentRow: KolTweet | null
  setCurrentRow: React.Dispatch<React.SetStateAction<KolTweet | null>>
}

const KolDynamicsContext = React.createContext<KolDynamicsContextType | null>(
  null
)

export function KolDynamicsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useDialogState<KolDynamicsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<KolTweet | null>(null)

  return (
    <KolDynamicsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </KolDynamicsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useKolDynamics = () => {
  const context = React.useContext(KolDynamicsContext)

  if (!context) {
    throw new Error(
      'useKolDynamics has to be used within <KolDynamicsProvider>'
    )
  }

  return context
}
