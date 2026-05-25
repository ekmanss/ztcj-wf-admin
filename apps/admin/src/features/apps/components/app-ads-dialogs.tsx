import { AppAdActionDialog } from './app-ad-action-dialog'
import { AppAdDeleteDialog } from './app-ad-delete-dialog'
import { useAppAds } from './app-ads-provider'

export function AppAdsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useAppAds()

  return (
    <>
      <AppAdActionDialog
        key='app-ad-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <>
          <AppAdActionDialog
            key={`app-ad-edit-${currentRow.adId}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <AppAdDeleteDialog
            key={`app-ad-delete-${currentRow.adId}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
