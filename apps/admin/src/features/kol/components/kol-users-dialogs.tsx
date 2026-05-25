import { KolUserActionDialog } from './kol-user-action-dialog'
import { KolUserDeleteDialog } from './kol-user-delete-dialog'
import { useKolUsers } from './kol-users-provider'

export function KolUsersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useKolUsers()

  return (
    <>
      <KolUserActionDialog
        key='kol-user-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <>
          <KolUserActionDialog
            key={`kol-user-edit-${currentRow.restId}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <KolUserDeleteDialog
            key={`kol-user-delete-${currentRow.restId}`}
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
