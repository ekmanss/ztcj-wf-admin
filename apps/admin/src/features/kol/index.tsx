import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ThemeSwitch } from '@/components/theme-switch'
import type { NavigateFn } from '@/hooks/use-table-url-state'
import { KolDynamicsDialogs } from './components/kol-dynamics-dialogs'
import { KolDynamicsProvider } from './components/kol-dynamics-provider'
import { KolDynamicsTable } from './components/kol-dynamics-table'
import { KolUsersDialogs } from './components/kol-users-dialogs'
import { KolUsersPrimaryButtons } from './components/kol-users-primary-buttons'
import { KolUsersProvider } from './components/kol-users-provider'
import { KolUsersTable } from './components/kol-users-table'
import { useKolTweetsQuery, useKolUsersQuery } from './hooks/use-kol-query'

type KolPageProps = {
  search: Record<string, unknown>
  navigate: NavigateFn
}

export function KolUsersPage({ search, navigate }: KolPageProps) {
  const usersQuery = useKolUsersQuery(search)

  return (
    <KolUsersProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>会员管理</h2>
            <p className='text-muted-foreground'>
              管理 KOL 账号资料、同步状态和前台显示状态。
            </p>
          </div>
          <KolUsersPrimaryButtons />
        </div>
        {usersQuery.isError && (
          <Alert variant='destructive'>
            <AlertTitle>无法加载 KOL 会员</AlertTitle>
            <AlertDescription>
              请确认 API 服务已启动，且 DATABASE_URL 指向包含 x_users 的业务库。
            </AlertDescription>
          </Alert>
        )}
        <KolUsersTable
          data={usersQuery.data?.items ?? []}
          total={usersQuery.data?.total ?? 0}
          isLoading={usersQuery.isPending}
          search={search}
          navigate={navigate}
        />
      </Main>

      <KolUsersDialogs />
    </KolUsersProvider>
  )
}

export function KolDynamicsPage({ search, navigate }: KolPageProps) {
  const tweetsQuery = useKolTweetsQuery(search)

  return (
    <KolDynamicsProvider>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>KOL动态</h2>
            <p className='text-muted-foreground'>
              查看和维护 KOL 发布内容、互动数据与显示状态。
            </p>
          </div>
        </div>
        {tweetsQuery.isError && (
          <Alert variant='destructive'>
            <AlertTitle>无法加载 KOL 动态</AlertTitle>
            <AlertDescription>
              请确认 API 服务已启动，且 DATABASE_URL 指向包含 x_tweets
              的业务库。
            </AlertDescription>
          </Alert>
        )}
        <KolDynamicsTable
          data={tweetsQuery.data?.items ?? []}
          total={tweetsQuery.data?.total ?? 0}
          isLoading={tweetsQuery.isPending}
          search={search}
          navigate={navigate}
        />
      </Main>

      <KolDynamicsDialogs />
    </KolDynamicsProvider>
  )
}
