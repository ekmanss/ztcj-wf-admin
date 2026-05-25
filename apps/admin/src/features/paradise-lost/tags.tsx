import { useCallback, useState } from 'react'
import { Plus } from 'lucide-react'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { type ParadiseLostTag } from './data/schema'
import { ParadiseLostTagDeleteDialog } from './components/paradise-lost-tag-delete-dialog'
import { ParadiseLostTagDialog } from './components/paradise-lost-tag-dialog'
import { ParadiseLostTagsTable } from './components/paradise-lost-tags-table'
import { useParadiseLostTagsQuery } from './hooks/use-paradise-lost-query'

export function ParadiseLostTags() {
  const tagsQuery = useParadiseLostTagsQuery()
  const [tagDialogOpen, setTagDialogOpen] = useState(false)
  const [currentTag, setCurrentTag] = useState<ParadiseLostTag | undefined>()
  const [deleteTag, setDeleteTag] = useState<ParadiseLostTag | undefined>()

  const openCreateDialog = () => {
    setCurrentTag(undefined)
    setTagDialogOpen(true)
  }

  const openEditDialog = useCallback((tag: ParadiseLostTag) => {
    setCurrentTag(tag)
    setTagDialogOpen(true)
  }, [])

  const openDeleteDialog = useCallback((tag: ParadiseLostTag) => {
    setDeleteTag(tag)
  }, [])

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>标签管理</h2>
            <p className='text-muted-foreground'>
              管理失乐园专题标签的名称、样式和展示素材。
            </p>
          </div>
          <Button className='gap-2' onClick={openCreateDialog}>
            <span>新增标签</span>
            <Plus size={18} />
          </Button>
        </div>

        {tagsQuery.isError && (
          <Alert variant='destructive'>
            <AlertTitle>无法加载标签数据</AlertTitle>
            <AlertDescription>
              请确认 API 服务已启动，且 DATABASE_URL 指向包含旧表的数据库。
            </AlertDescription>
          </Alert>
        )}

        <ParadiseLostTagsTable
          data={tagsQuery.data ?? []}
          isLoading={tagsQuery.isPending}
          onEdit={openEditDialog}
          onDelete={openDeleteDialog}
        />
      </Main>

      <ParadiseLostTagDialog
        key={currentTag?.id ?? 'new-tag'}
        currentRow={currentTag}
        open={tagDialogOpen}
        onOpenChange={(state) => {
          setTagDialogOpen(state)
          if (!state) {
            setTimeout(() => {
              setCurrentTag(undefined)
            }, 500)
          }
        }}
      />

      {deleteTag && (
        <ParadiseLostTagDeleteDialog
          key={deleteTag.id}
          open={!!deleteTag}
          currentRow={deleteTag}
          onOpenChange={(state) => {
            if (!state) {
              setDeleteTag(undefined)
            }
          }}
        />
      )}
    </>
  )
}
