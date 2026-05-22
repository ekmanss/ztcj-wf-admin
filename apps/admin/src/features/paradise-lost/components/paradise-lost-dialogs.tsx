import { ParadiseLostActionDialog } from './paradise-lost-action-dialog'
import { ParadiseLostDeleteDialog } from './paradise-lost-delete-dialog'
import { ParadiseLostTagDialog } from './paradise-lost-tag-dialog'
import { useParadiseLost } from './paradise-lost-provider'

export function ParadiseLostDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useParadiseLost()

  return (
    <>
      <ParadiseLostActionDialog
        key='paradise-lost-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      <ParadiseLostTagDialog
        open={open === 'add-tag'}
        onOpenChange={() => setOpen('add-tag')}
      />

      {currentRow && (
        <>
          <ParadiseLostActionDialog
            key={`paradise-lost-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <ParadiseLostDeleteDialog
            key={`paradise-lost-delete-${currentRow.id}`}
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
