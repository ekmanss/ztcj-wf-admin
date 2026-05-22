import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ParadiseLostDialogs } from './components/paradise-lost-dialogs'
import { ParadiseLostPrimaryButtons } from './components/paradise-lost-primary-buttons'
import { ParadiseLostProvider } from './components/paradise-lost-provider'
import { ParadiseLostTable } from './components/paradise-lost-table'
import { useParadiseLostQuery } from './hooks/use-paradise-lost-query'

const route = getRouteApi('/_authenticated/paradise-lost/')

export function ParadiseLost() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const paradiseLostQuery = useParadiseLostQuery(search)

  return (
    <ParadiseLostProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>失乐园</h2>
            <p className='text-muted-foreground'>
              管理专题条目、入选原因、标签和显示状态。
            </p>
          </div>
          <ParadiseLostPrimaryButtons />
        </div>
        {paradiseLostQuery.isError && (
          <Alert variant='destructive'>
            <AlertTitle>无法加载失乐园数据</AlertTitle>
            <AlertDescription>
              请确认 API 服务已启动，且 DATABASE_URL 指向包含旧表的数据库。
            </AlertDescription>
          </Alert>
        )}
        <ParadiseLostTable
          data={paradiseLostQuery.data?.items ?? []}
          total={paradiseLostQuery.data?.total ?? 0}
          isLoading={paradiseLostQuery.isPending}
          search={search}
          navigate={navigate}
        />
      </Main>

      <ParadiseLostDialogs />
    </ParadiseLostProvider>
  )
}
