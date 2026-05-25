import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import type { AppAd } from '../data/schema'

type AppAdsDialogType = 'add' | 'edit' | 'delete' | 'multi-delete'

type AppAdsContextType = {
  open: AppAdsDialogType | null
  setOpen: (str: AppAdsDialogType | null) => void
  currentRow: AppAd | null
  setCurrentRow: React.Dispatch<React.SetStateAction<AppAd | null>>
}

const AppAdsContext = React.createContext<AppAdsContextType | null>(null)

export function AppAdsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<AppAdsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<AppAd | null>(null)

  return (
    <AppAdsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </AppAdsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAppAds = () => {
  const context = React.useContext(AppAdsContext)

  if (!context) {
    throw new Error('useAppAds has to be used within <AppAdsProvider>')
  }

  return context
}
