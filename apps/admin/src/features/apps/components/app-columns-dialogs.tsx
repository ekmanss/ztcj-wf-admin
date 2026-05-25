import { AppColumnActionDialog } from './app-column-action-dialog'
import { AppColumnDeleteDialog } from './app-column-delete-dialog'
import { useAppColumns } from './app-columns-provider'

export function AppColumnsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useAppColumns()

  return (
    <>
      <AppColumnActionDialog
        key='app-column-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <>
          <AppColumnActionDialog
            key={`app-column-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <AppColumnDeleteDialog
            key={`app-column-delete-${currentRow.id}`}
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
