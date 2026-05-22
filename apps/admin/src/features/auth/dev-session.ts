import { type AuthUser, useAuthStore } from '@/stores/auth-store'

const DEV_AUTH_TOKEN = 'dev-auth-token'

const devAuthUser: AuthUser = {
  id: 1,
  username: 'dev',
  nickname: '开发预览账号',
  email: 'dev@example.com',
  mobile: '',
  avatar: '',
  status: 'normal',
  role: ['admin'],
}

export function isDevAuthEnabled() {
  return (
    Boolean(import.meta.env.DEV) &&
    import.meta.env.VITE_DEV_AUTH_ENABLED === 'true'
  )
}

export function ensureDevAuthSession() {
  if (!isDevAuthEnabled()) return false

  const { auth } = useAuthStore.getState()

  if (!auth.accessToken || !auth.user) {
    auth.setSession({
      token: DEV_AUTH_TOKEN,
      user: devAuthUser,
    })
  }

  return true
}
