import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'

const ACCESS_TOKEN = 'ztcj_admin_access_token'

export interface AuthUser {
  id: number
  username: string
  nickname: string
  email: string
  mobile: string
  avatar: string
  status: string
  role: string[]
}

interface AuthSession {
  token: string
  user: AuthUser
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string
    setAccessToken: (accessToken: string) => void
    setSession: (session: AuthSession) => void
    resetAccessToken: () => void
    reset: () => void
  }
}

function readPersistedToken() {
  const cookieState = getCookie(ACCESS_TOKEN)
  if (!cookieState) return ''

  try {
    const parsedToken = JSON.parse(cookieState) as unknown
    return typeof parsedToken === 'string' ? parsedToken : ''
  } catch {
    return cookieState
  }
}

export const useAuthStore = create<AuthState>()((set) => {
  const initToken = readPersistedToken()
  return {
    auth: {
      user: null,
      setUser: (user) =>
        set((state) => ({ ...state, auth: { ...state.auth, user } })),
      accessToken: initToken,
      setAccessToken: (accessToken) =>
        set((state) => {
          setCookie(ACCESS_TOKEN, JSON.stringify(accessToken))
          return { ...state, auth: { ...state.auth, accessToken } }
        }),
      setSession: (session) =>
        set((state) => {
          setCookie(ACCESS_TOKEN, JSON.stringify(session.token))
          return {
            ...state,
            auth: {
              ...state.auth,
              user: session.user,
              accessToken: session.token,
            },
          }
        }),
      resetAccessToken: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          return { ...state, auth: { ...state.auth, accessToken: '' } }
        }),
      reset: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          return {
            ...state,
            auth: { ...state.auth, user: null, accessToken: '' },
          }
        }),
    },
  }
})
