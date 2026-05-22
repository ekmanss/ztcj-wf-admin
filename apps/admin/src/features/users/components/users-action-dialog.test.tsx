import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, type RenderResult } from 'vitest-browser-react'
import { type UserEvent, userEvent } from 'vitest/browser'
import { type User } from '../data/schema'
import { UsersActionDialog } from './users-action-dialog'

const mutationMocks = vi.hoisted(() => ({
  createUser: vi.fn(),
  updateUser: vi.fn(),
}))

const MOCK_USER: User = {
  id: 12,
  groupId: 1,
  groupName: '默认组',
  username: 'alex_smith',
  nickname: 'Alex',
  email: 'alex@smith.com',
  mobile: '13900000000',
  avatar: '',
  level: 1,
  gender: 1,
  birthday: '2026-01-01',
  bio: 'hello',
  money: '0.00',
  score: 10,
  successions: 1,
  maxSuccessions: 1,
  prevTime: null,
  loginTime: 1770000000,
  loginIp: '127.0.0.1',
  loginFailure: 0,
  loginFailureTime: null,
  joinIp: '127.0.0.1',
  joinTime: 1770000000,
  createTime: 1770000000,
  updateTime: 1770000000,
  status: 'normal',
}

vi.mock('../hooks/use-users-query', () => ({
  useCreateUserMutation: () => ({
    mutateAsync: mutationMocks.createUser,
    isPending: false,
  }),
  useUpdateUserMutation: () => ({
    mutateAsync: mutationMocks.updateUser,
    isPending: false,
  }),
  useUserGroupsQuery: () => ({
    data: [{ id: 1, name: '默认组', status: 'normal' }],
    isPending: false,
  }),
}))

describe('UsersActionDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mutationMocks.createUser.mockResolvedValue(MOCK_USER)
    mutationMocks.updateUser.mockResolvedValue(MOCK_USER)
  })

  it('renders the add user dialog', async () => {
    const { getByRole, getByText } = await render(
      <UsersActionDialog open onOpenChange={vi.fn()} />
    )

    await expect
      .element(getByRole('heading', { level: 2, name: /新增用户/i }))
      .toBeInTheDocument()
    await expect
      .element(getByText(/创建旧库 sys_user 用户/i))
      .toBeInTheDocument()
  })

  it('shows validation messages for required legacy fields', async () => {
    const { getByRole, getByText } = await render(
      <UsersActionDialog open onOpenChange={vi.fn()} />
    )

    await userEvent.click(getByRole('button', { name: /保存/i }))

    await expect.element(getByText(/用户名至少 3 个字符/)).toBeInTheDocument()
    await expect.element(getByText(/请输入昵称/)).toBeInTheDocument()
    await expect.element(getByText(/请输入电子邮箱/)).toBeInTheDocument()
  })

  it('creates a user with sys_user fields', async () => {
    const onOpenChange = vi.fn()
    const screen = await render(
      <UsersActionDialog open onOpenChange={onOpenChange} />
    )

    await fillRequiredFields(userEvent, screen)
    await userEvent.click(screen.getByRole('button', { name: /保存/i }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(mutationMocks.createUser).toHaveBeenCalledWith({
      groupId: 0,
      username: 'john_doe',
      nickname: 'John',
      email: 'john@example.com',
      mobile: '13800138000',
      avatar: '',
      level: 0,
      gender: 0,
      birthday: undefined,
      bio: '',
      status: 'normal',
    })
  })

  it('updates a user without changing password when password is blank', async () => {
    const onOpenChange = vi.fn()
    const screen = await render(
      <UsersActionDialog
        open
        onOpenChange={onOpenChange}
        currentRow={MOCK_USER}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: /保存/i }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(mutationMocks.updateUser).toHaveBeenCalledWith({
      id: MOCK_USER.id,
      input: {
        groupId: MOCK_USER.groupId,
        username: MOCK_USER.username,
        nickname: MOCK_USER.nickname,
        email: MOCK_USER.email,
        mobile: MOCK_USER.mobile,
        avatar: MOCK_USER.avatar,
        level: MOCK_USER.level,
        gender: MOCK_USER.gender,
        birthday: MOCK_USER.birthday,
        bio: MOCK_USER.bio,
        status: MOCK_USER.status,
      },
    })
  })

  it('requires matching confirmation when password is changed', async () => {
    const screen = await render(
      <UsersActionDialog open onOpenChange={vi.fn()} currentRow={MOCK_USER} />
    )

    await userEvent.fill(screen.getByLabelText(/^密码$/i), '123456')
    await userEvent.fill(screen.getByLabelText(/确认密码/i), '654321')
    await userEvent.click(screen.getByRole('button', { name: /保存/i }))

    await expect
      .element(screen.getByText(/两次输入的密码不一致/))
      .toBeInTheDocument()
  })
})

async function fillRequiredFields(user: UserEvent, screen: RenderResult) {
  const entries = [
    [/用户名/i, 'john_doe'],
    [/昵称/i, 'John'],
    [/电子邮箱/i, 'john@example.com'],
    [/手机号/i, '13800138000'],
  ] as const

  for (const [label, value] of entries) {
    await user.fill(screen.getByLabelText(label), value)
  }
}
