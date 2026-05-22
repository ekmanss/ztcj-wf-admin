import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, type RenderResult } from 'vitest-browser-react'
import { type Locator, userEvent } from 'vitest/browser'
import { UserAuthForm } from './user-auth-form'

const FORM_MESSAGES = {
  accountEmpty: 'Please enter your account.',
  passwordEmpty: 'Please enter your password.',
} as const

const navigate = vi.fn()
const { loginMock, setSessionMock, handleServerErrorMock } = vi.hoisted(() => ({
  loginMock: vi.fn(),
  setSessionMock: vi.fn(),
  handleServerErrorMock: vi.fn(),
}))

const session = {
  token: 'mock-access-token',
  user: {
    id: 1,
    username: 'admin',
    nickname: 'Admin',
    email: 'admin@example.com',
    mobile: '',
    avatar: '',
    status: 'normal',
    role: ['user'],
  },
}

vi.mock('@/features/auth/api/auth-api', () => ({
  login: loginMock,
}))

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: () => ({
    auth: {
      setSession: setSessionMock,
    },
  }),
}))

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
    useNavigate: () => navigate,
    Link: ({
      children,
      to,
      className,
      ...rest
    }: {
      children?: React.ReactNode
      to: string
      className?: string
    }) => (
      <a href={to} className={className} {...rest}>
        {children}
      </a>
    ),
  }
})

vi.mock('@/lib/handle-server-error', () => ({
  handleServerError: handleServerErrorMock,
}))

describe('UserAuthForm', () => {
  describe('Rendering without redirectTo', () => {
    let screen: RenderResult
    let accountInput: Locator
    let passwordInput: Locator
    let signInButton: Locator

    beforeEach(async () => {
      vi.clearAllMocks()
      loginMock.mockResolvedValue(session)
      screen = await render(<UserAuthForm />)
      accountInput = screen.getByRole('textbox', { name: /^Account$/i })
      passwordInput = screen.getByLabelText(/^Password$/i)
      signInButton = screen.getByRole('button', { name: /^Sign in$/i })
    })

    it('renders fields and submit button', async () => {
      await expect.element(accountInput).toBeInTheDocument()
      await expect.element(passwordInput).toBeInTheDocument()
      await expect.element(signInButton).toBeInTheDocument()
    })

    it('shows validation messages when submitting empty form', async () => {
      await userEvent.click(signInButton)

      await expect
        .element(screen.getByText(FORM_MESSAGES.accountEmpty))
        .toBeInTheDocument()
      await expect
        .element(screen.getByText(FORM_MESSAGES.passwordEmpty))
        .toBeInTheDocument()
    })

    it('authenticates and navigates to default route on success', async () => {
      await userEvent.fill(accountInput, 'admin')
      await userEvent.fill(passwordInput, '123456')

      await userEvent.click(signInButton)

      await vi.waitFor(() => expect(loginMock).toHaveBeenCalledOnce())
      expect(loginMock).toHaveBeenCalledWith({
        account: 'admin',
        password: '123456',
      })
      expect(setSessionMock).toHaveBeenCalledWith(session)

      await vi.waitFor(() =>
        expect(navigate).toHaveBeenCalledWith({ to: '/', replace: true })
      )
    })

    it('passes API errors to the shared error handler', async () => {
      const error = new Error('bad credentials')
      loginMock.mockRejectedValue(error)

      await userEvent.fill(accountInput, 'admin')
      await userEvent.fill(passwordInput, 'wrong')
      await userEvent.click(signInButton)

      await vi.waitFor(() =>
        expect(handleServerErrorMock).toHaveBeenCalledWith(error)
      )
      expect(setSessionMock).not.toHaveBeenCalled()
      expect(navigate).not.toHaveBeenCalled()
    })
  })

  it('navigates to redirectTo when provided', async () => {
    vi.clearAllMocks()
    loginMock.mockResolvedValue(session)

    const { getByRole, getByLabelText } = await render(
      <UserAuthForm redirectTo='/settings' />
    )

    await userEvent.fill(getByRole('textbox', { name: /Account/i }), 'admin')
    await userEvent.fill(getByLabelText('Password'), '123456')

    await userEvent.click(getByRole('button', { name: /Sign in/i }))

    await vi.waitFor(() => expect(setSessionMock).toHaveBeenCalledOnce())

    await vi.waitFor(() =>
      expect(navigate).toHaveBeenCalledWith({
        to: '/settings',
        replace: true,
      })
    )
  })
})
