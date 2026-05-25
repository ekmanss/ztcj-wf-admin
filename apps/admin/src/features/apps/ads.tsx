import { Link, getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AppAdsDialogs } from './components/app-ads-dialogs'
import { AppAdsPrimaryButtons } from './components/app-ads-primary-buttons'
import { AppAdsProvider } from './components/app-ads-provider'
import { AppAdsTable } from './components/app-ads-table'
import { useAppAdsQuery } from './hooks/use-apps-query'

const route = getRouteApi('/_authenticated/apps/ads/')

export function AppAds() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const adsQuery = useAppAdsQuery(search)

  return (
    <AppAdsProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>APP广告</h2>
            <p className='text-muted-foreground'>
              管理移动端广告位、页面位置、图片、链接和有效期。
            </p>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            <Button variant='outline' asChild>
              <Link to='/apps/columns'>APP栏目管理</Link>
            </Button>
            <AppAdsPrimaryButtons />
          </div>
        </div>
        {adsQuery.isError && (
          <Alert variant='destructive'>
            <AlertTitle>无法加载 APP 广告</AlertTitle>
            <AlertDescription>
              请确认 API 服务已启动，且 DATABASE_URL 指向包含旧表的数据库。
            </AlertDescription>
          </Alert>
        )}
        <AppAdsTable
          data={adsQuery.data?.items ?? []}
          total={adsQuery.data?.total ?? 0}
          isLoading={adsQuery.isPending}
          search={search}
          navigate={navigate}
        />
      </Main>

      <AppAdsDialogs />
    </AppAdsProvider>
  )
}
