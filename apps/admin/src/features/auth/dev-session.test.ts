import { clearCookies } from '@/test-utils/cookies'
import { beforeEach, describe, expect, it, vi } from 'vitest'

async function importAuthModules() {
  const [{ ensureDevAuthSession, isDevAuthEnabled }, { useAuthStore }] =
    await Promise.all([import('./dev-session'), import('@/stores/auth-store')])

  return { ensureDevAuthSession, isDevAuthEnabled, useAuthStore }
}

const existingUser = {
  id: 2,
  username: 'admin',
  nickname: 'Admin',
  email: 'admin@example.com',
  mobile: '',
  avatar: '',
  status: 'normal',
  role: ['user'],
}

describe('dev auth session', () => {
  beforeEach(() => {
    clearCookies()
    vi.resetModules()
  })

  it('stays disabled unless the explicit dev flag is enabled', async () => {
    vi.stubEnv('DEV', true)
    vi.stubEnv('VITE_DEV_AUTH_ENABLED', 'false')

    const { ensureDevAuthSession, isDevAuthEnabled, useAuthStore } =
      await importAuthModules()

    expect(isDevAuthEnabled()).toBe(false)
    expect(ensureDevAuthSession()).toBe(false)
    expect(useAuthStore.getState().auth.accessToken).toBe('')
    expect(useAuthStore.getState().auth.user).toBeNull()
  })

  it('does not enable dev auth in production mode', async () => {
    vi.stubEnv('DEV', false)
    vi.stubEnv('VITE_DEV_AUTH_ENABLED', 'true')

    const { ensureDevAuthSession, isDevAuthEnabled, useAuthStore } =
      await importAuthModules()

    expect(isDevAuthEnabled()).toBe(false)
    expect(ensureDevAuthSession()).toBe(false)
    expect(useAuthStore.getState().auth.accessToken).toBe('')
  })

  it('injects a complete local session in opt-in development mode', async () => {
    vi.stubEnv('DEV', true)
    vi.stubEnv('VITE_DEV_AUTH_ENABLED', 'true')

    const { ensureDevAuthSession, isDevAuthEnabled, useAuthStore } =
      await importAuthModules()

    expect(isDevAuthEnabled()).toBe(true)
    expect(ensureDevAuthSession()).toBe(true)

    const { auth } = useAuthStore.getState()
    expect(auth.accessToken).toBe('dev-auth-token')
    expect(auth.user).toMatchObject({
      username: 'dev',
      nickname: '开发预览账号',
      role: ['admin'],
    })
  })

  it('keeps an existing complete session when dev auth is enabled', async () => {
    vi.stubEnv('DEV', true)
    vi.stubEnv('VITE_DEV_AUTH_ENABLED', 'true')

    const { ensureDevAuthSession, useAuthStore } = await importAuthModules()

    useAuthStore.getState().auth.setSession({
      token: 'real-session-token',
      user: existingUser,
    })

    expect(ensureDevAuthSession()).toBe(true)
    expect(useAuthStore.getState().auth.accessToken).toBe('real-session-token')
    expect(useAuthStore.getState().auth.user).toEqual(existingUser)
  })
})
