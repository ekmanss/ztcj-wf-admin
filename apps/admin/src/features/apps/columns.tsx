import { Link, getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AppColumnsDialogs } from './components/app-columns-dialogs'
import { AppColumnsPrimaryButtons } from './components/app-columns-primary-buttons'
import { AppColumnsProvider } from './components/app-columns-provider'
import { AppColumnsTable } from './components/app-columns-table'
import { useAppColumnsQuery } from './hooks/use-apps-query'

const route = getRouteApi('/_authenticated/apps/columns/')

export function AppColumns() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const columnsQuery = useAppColumnsQuery(search)

  return (
    <AppColumnsProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>APP栏目管理</h2>
            <p className='text-muted-foreground'>
              管理移动端页面栏目、两级结构、显示状态和排序。
            </p>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            <Button variant='outline' asChild>
              <Link to='/apps/ads'>APP广告</Link>
            </Button>
            <AppColumnsPrimaryButtons />
          </div>
        </div>
        {columnsQuery.isError && (
          <Alert variant='destructive'>
            <AlertTitle>无法加载 APP 栏目</AlertTitle>
            <AlertDescription>
              请确认 API 服务已启动，且 DATABASE_URL 指向包含旧表的数据库。
            </AlertDescription>
          </Alert>
        )}
        <AppColumnsTable
          data={columnsQuery.data?.items ?? []}
          isLoading={columnsQuery.isPending}
          search={search}
          navigate={navigate}
        />
      </Main>

      <AppColumnsDialogs />
    </AppColumnsProvider>
  )
}
