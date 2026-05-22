'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import { SelectDropdown } from '@/components/select-dropdown'
import { type User, type UserStatus } from '../data/schema'
import {
  useCreateUserMutation,
  useUpdateUserMutation,
  useUserGroupsQuery,
} from '../hooks/use-users-query'

const formSchema = z
  .object({
    groupId: z.string().min(1, '请选择用户组。'),
    username: z
      .string()
      .trim()
      .min(3, '用户名至少 3 个字符。')
      .max(32, '用户名最多 32 个字符。'),
    nickname: z
      .string()
      .trim()
      .min(1, '请输入昵称。')
      .max(50, '昵称最多 50 个字符。'),
    email: z.email({
      error: (iss) => (iss.input === '' ? '请输入电子邮箱。' : undefined),
    }),
    mobile: z.string().trim().max(11, '手机号最多 11 位。'),
    avatar: z.string().trim().max(255, '头像地址最多 255 个字符。'),
    level: z
      .string()
      .trim()
      .refine((value) => Number.isInteger(Number(value)), '等级必须是整数。')
      .refine((value) => Number(value) >= 0, '等级不能小于 0。')
      .refine((value) => Number(value) <= 255, '等级不能大于 255。'),
    gender: z.enum(['0', '1']),
    birthday: z.string().trim(),
    bio: z.string().trim().max(100, '格言最多 100 个字符。'),
    status: z.enum(['normal', 'hidden']),
    password: z.string().transform((pwd) => pwd.trim()),
    confirmPassword: z.string().transform((pwd) => pwd.trim()),
  })
  .refine(
    ({ password }) => {
      return !password || (password.length >= 6 && password.length <= 30)
    },
    {
      message: '密码需为 6 到 30 个字符；不修改请留空。',
      path: ['password'],
    }
  )
  .refine(
    ({ password, confirmPassword }) => {
      return !password || password === confirmPassword
    },
    {
      message: '两次输入的密码不一致。',
      path: ['confirmPassword'],
    }
  )

type UserForm = z.infer<typeof formSchema>

type UserActionDialogProps = {
  currentRow?: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

function getDefaultValues(currentRow?: User): UserForm {
  return currentRow
    ? {
        groupId: String(currentRow.groupId),
        username: currentRow.username,
        nickname: currentRow.nickname,
        email: currentRow.email,
        mobile: currentRow.mobile,
        avatar: currentRow.avatar,
        level: String(currentRow.level),
        gender: (currentRow.gender === 1 ? '1' : '0') as '0' | '1',
        birthday: currentRow.birthday ?? '',
        bio: currentRow.bio,
        status: currentRow.status,
        password: '',
        confirmPassword: '',
      }
    : {
        groupId: '0',
        username: '',
        nickname: '',
        email: '',
        mobile: '',
        avatar: '',
        level: '0',
        gender: '0',
        birthday: '',
        bio: '',
        status: 'normal',
        password: '',
        confirmPassword: '',
      }
}

export function UsersActionDialog({
  currentRow,
  open,
  onOpenChange,
}: UserActionDialogProps) {
  const isEdit = !!currentRow
  const userGroupsQuery = useUserGroupsQuery()
  const createUserMutation = useCreateUserMutation()
  const updateUserMutation = useUpdateUserMutation()
  const form = useForm<UserForm>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(currentRow),
  })

  const groupItems = [
    { label: '未分组', value: '0' },
    ...(userGroupsQuery.data ?? []).map((group) => ({
      label: group.status === 'hidden' ? `${group.name}（隐藏）` : group.name,
      value: String(group.id),
    })),
  ]

  const onSubmit = async (values: UserForm) => {
    const password = values.password.trim()
    const input = {
      groupId: Number(values.groupId),
      username: values.username.trim(),
      nickname: values.nickname.trim(),
      email: values.email.trim(),
      mobile: values.mobile.trim(),
      avatar: values.avatar.trim(),
      level: Number(values.level),
      gender: Number(values.gender),
      birthday: values.birthday.trim() || undefined,
      bio: values.bio.trim(),
      status: values.status as UserStatus,
      ...(password ? { password } : {}),
    }

    try {
      if (currentRow) {
        await updateUserMutation.mutateAsync({ id: currentRow.id, input })
      } else {
        await createUserMutation.mutateAsync(input)
      }

      form.reset(getDefaultValues())
      onOpenChange(false)
    } catch {
      // Global mutation error handling shows the user-facing toast.
    }
  }

  const isPasswordTouched = !!form.formState.dirtyFields.password
  const isSaving = createUserMutation.isPending || updateUserMutation.isPending

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset(getDefaultValues(currentRow))
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? '编辑用户' : '新增用户'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? '更新会员资料和状态。密码留空则不修改。'
              : '创建旧库 sys_user 用户。密码可留空。'}
          </DialogDescription>
        </DialogHeader>
        <div className='max-h-[70vh] w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='user-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 px-0.5'
            >
              <FormField
                control={form.control}
                name='groupId'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>组别</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='选择用户组'
                      className='col-span-4'
                      isPending={userGroupsQuery.isPending}
                      items={groupItems}
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='username'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      用户名
                    </FormLabel>
                    <FormControl>
                      <Input
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='nickname'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>昵称</FormLabel>
                    <FormControl>
                      <Input
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      电子邮箱
                    </FormLabel>
                    <FormControl>
                      <Input className='col-span-4' {...field} />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='mobile'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      手机号
                    </FormLabel>
                    <FormControl>
                      <Input className='col-span-4' {...field} />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='avatar'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>头像</FormLabel>
                    <FormControl>
                      <Input className='col-span-4' {...field} />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='level'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>等级</FormLabel>
                    <FormControl>
                      <Input
                        className='col-span-4'
                        type='number'
                        min={0}
                        max={255}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='gender'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>性别</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='选择性别'
                      className='col-span-4'
                      items={[
                        { label: '女', value: '0' },
                        { label: '男', value: '1' },
                      ]}
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='birthday'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>生日</FormLabel>
                    <FormControl>
                      <Input className='col-span-4' type='date' {...field} />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='bio'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>格言</FormLabel>
                    <FormControl>
                      <Input className='col-span-4' {...field} />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>状态</FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='选择状态'
                      className='col-span-4'
                      items={[
                        { label: '正常', value: 'normal' },
                        { label: '隐藏', value: 'hidden' },
                      ]}
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>密码</FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder='不修改请留空'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      确认密码
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        disabled={!isPasswordTouched}
                        placeholder='再次输入密码'
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type='submit' form='user-form' disabled={isSaving}>
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
