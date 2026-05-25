import {
  Construction,
  Database,
  LayoutDashboard,
  Monitor,
  Bug,
  ListTodo,
  FileX,
  HelpCircle,
  Lock,
  Bell,
  Package,
  Palette,
  ServerOff,
  Settings,
  Tags,
  Wrench,
  UserCog,
  UserX,
  Users,
  MessagesSquare,
  ShieldCheck,
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
} from 'lucide-react'
import { ClerkLogo } from '@/assets/clerk-logo'
import { type NavItem, type SidebarData } from '../types'

function getVisibleNavItems(items: NavItem[]): NavItem[] {
  return items
    .filter((item) => !item.isTemplate)
    .map((item) => {
      if (!item.items) return item

      return {
        ...item,
        items: getVisibleNavItems(item.items),
      }
    })
    .filter((item) => !item.items || item.items.length > 0)
}

export const sidebarData: SidebarData = {
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Woofun Admin',
      logo: Command,
      plan: 'Dashboard',
    },
    // 模板 team：保留示例配置，当前 team switcher 暂不展示。
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
      isTemplate: true,
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
      isTemplate: true,
    },
  ],
  navGroups: [
    {
      title: '用户',
      items: [
        // 模板页面：保留示例 route，当前前端菜单暂不展示。
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
          isTemplate: true,
        },
        {
          title: 'Tasks',
          url: '/tasks',
          icon: ListTodo,
          isTemplate: true,
        },
        {
          title: 'Apps',
          url: '/apps',
          icon: Package,
          isTemplate: true,
        },
        {
          title: 'Chats',
          url: '/chats',
          badge: '3',
          icon: MessagesSquare,
          isTemplate: true,
        },
        {
          title: '用户管理',
          icon: Users,
          items: [
            {
              title: 'Users',
              url: '/users',
            },
          ],
        },
        {
          title: 'Secured by Clerk',
          icon: ClerkLogo,
          isTemplate: true,
          items: [
            {
              title: 'Sign In',
              url: '/clerk/sign-in',
            },
            {
              title: 'Sign Up',
              url: '/clerk/sign-up',
            },
            {
              title: 'User Management',
              url: '/clerk/user-management',
            },
          ],
        },
      ],
    },
    {
      title: '数据',
      items: [
        {
          title: 'APP管理',
          icon: Package,
          items: [
            {
              title: 'app栏目管理',
              url: '/apps/columns',
              icon: Monitor,
            },
            {
              title: 'APP广告',
              url: '/apps/ads',
              icon: Bell,
            },
          ],
        },
        {
          title: 'KOL管理',
          icon: Users,
          items: [
            {
              title: '会员管理',
              url: '/kol/users',
              icon: Users,
            },
            {
              title: 'KOL动态',
              url: '/kol/dynamics',
              icon: MessagesSquare,
            },
          ],
        },
        {
          title: '专题数据',
          icon: Database,
          items: [
            {
              title: '失乐园',
              url: '/paradise-lost',
              icon: Database,
            },
            {
              title: '标签管理',
              url: '/paradise-lost/tags',
              icon: Tags,
            },
          ],
        },
      ],
    },
    {
      title: 'Pages',
      // 模板页面分组：保留示例 route，当前前端菜单暂不展示。
      isTemplate: true,
      items: [
        {
          title: 'Auth',
          icon: ShieldCheck,
          items: [
            {
              title: 'Sign In',
              url: '/sign-in',
            },
            {
              title: 'Sign In (2 Col)',
              url: '/sign-in-2',
            },
            {
              title: 'Sign Up',
              url: '/sign-up',
            },
            {
              title: 'Forgot Password',
              url: '/forgot-password',
            },
            {
              title: 'OTP',
              url: '/otp',
            },
          ],
        },
        {
          title: 'Errors',
          icon: Bug,
          items: [
            {
              title: 'Unauthorized',
              url: '/errors/unauthorized',
              icon: Lock,
            },
            {
              title: 'Forbidden',
              url: '/errors/forbidden',
              icon: UserX,
            },
            {
              title: 'Not Found',
              url: '/errors/not-found',
              icon: FileX,
            },
            {
              title: 'Internal Server Error',
              url: '/errors/internal-server-error',
              icon: ServerOff,
            },
            {
              title: 'Maintenance Error',
              url: '/errors/maintenance-error',
              icon: Construction,
            },
          ],
        },
      ],
    },
    {
      title: 'Other',
      // 模板页面分组：保留示例 route，当前前端菜单暂不展示。
      isTemplate: true,
      items: [
        {
          title: 'Settings',
          icon: Settings,
          items: [
            {
              title: 'Profile',
              url: '/settings',
              icon: UserCog,
            },
            {
              title: 'Account',
              url: '/settings/account',
              icon: Wrench,
            },
            {
              title: 'Appearance',
              url: '/settings/appearance',
              icon: Palette,
            },
            {
              title: 'Notifications',
              url: '/settings/notifications',
              icon: Bell,
            },
            {
              title: 'Display',
              url: '/settings/display',
              icon: Monitor,
            },
          ],
        },
        {
          title: 'Help Center',
          url: '/help-center',
          icon: HelpCircle,
        },
      ],
    },
  ],
}

export const visibleSidebarData: SidebarData = {
  ...sidebarData,
  teams: sidebarData.teams.filter((team) => !team.isTemplate),
  navGroups: sidebarData.navGroups
    .filter((group) => !group.isTemplate)
    .map((group) => ({
      ...group,
      items: getVisibleNavItems(group.items),
    }))
    .filter((group) => group.items.length > 0),
}
