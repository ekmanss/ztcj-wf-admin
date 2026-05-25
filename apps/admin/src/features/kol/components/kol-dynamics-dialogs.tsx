import { KolDynamicActionDialog } from './kol-dynamic-action-dialog'
import { KolDynamicDeleteDialog } from './kol-dynamic-delete-dialog'
import { KolDynamicDetailDialog } from './kol-dynamic-detail-dialog'
import { useKolDynamics } from './kol-dynamics-provider'

export function KolDynamicsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useKolDynamics()

  if (!currentRow) return null

  return (
    <>
      <KolDynamicDetailDialog
        key={`kol-dynamic-detail-${currentRow.tweetRestId}`}
        open={open === 'detail'}
        onOpenChange={() => {
          setOpen('detail')
          setTimeout(() => {
            setCurrentRow(null)
          }, 500)
        }}
        currentRow={currentRow}
      />

      <KolDynamicActionDialog
        key={`kol-dynamic-edit-${currentRow.tweetRestId}`}
        open={open === 'edit'}
        onOpenChange={() => {
          setOpen('edit')
          setTimeout(() => {
            setCurrentRow(null)
          }, 500)
        }}
        currentRow={currentRow}
      />

      <KolDynamicDeleteDialog
        key={`kol-dynamic-delete-${currentRow.tweetRestId}`}
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
  )
}
