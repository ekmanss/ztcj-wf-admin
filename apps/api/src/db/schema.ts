import {
  bigint,
  date,
  decimal,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  tinyint,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core'

export const sysUsers = mysqlTable(
  'sys_user',
  {
    id: int('id', { unsigned: true }).autoincrement().primaryKey(),
    groupId: int('group_id', { unsigned: true }).notNull().default(0),
    username: varchar('username', { length: 32 }).default(''),
    nickname: varchar('nickname', { length: 50 }).default(''),
    password: varchar('password', { length: 32 }).default(''),
    salt: varchar('salt', { length: 30 }).default(''),
    email: varchar('email', { length: 100 }).default(''),
    mobile: varchar('mobile', { length: 11 }).default(''),
    avatar: varchar('avatar', { length: 255 }).default(''),
    level: tinyint('level', { unsigned: true }).notNull().default(0),
    gender: tinyint('gender', { unsigned: true }).notNull().default(0),
    birthday: date('birthday', { mode: 'string' }),
    bio: varchar('bio', { length: 100 }).default(''),
    money: decimal('money', { precision: 10, scale: 2 })
      .notNull()
      .default('0.00'),
    score: int('score').notNull().default(0),
    successions: int('successions', { unsigned: true }).notNull().default(1),
    maxSuccessions: int('maxsuccessions', { unsigned: true })
      .notNull()
      .default(1),
    prevTime: bigint('prevtime', { mode: 'number' }),
    loginTime: bigint('logintime', { mode: 'number' }),
    loginIp: varchar('loginip', { length: 50 }).default(''),
    loginFailure: tinyint('loginfailure', { unsigned: true })
      .notNull()
      .default(0),
    loginFailureTime: bigint('loginfailuretime', { mode: 'number' }),
    joinIp: varchar('joinip', { length: 50 }).default(''),
    joinTime: bigint('jointime', { mode: 'number' }),
    createTime: bigint('createtime', { mode: 'number' }),
    updateTime: bigint('updatetime', { mode: 'number' }),
    token: varchar('token', { length: 50 }).default(''),
    status: varchar('status', { length: 30 }).default(''),
    verification: varchar('verification', { length: 255 }).default(''),
  },
  (table) => [
    index('username').on(table.username),
    index('email').on(table.email),
    index('mobile').on(table.mobile),
  ]
)

export type SysUserRow = typeof sysUsers.$inferSelect

export const sysUserGroups = mysqlTable('sys_user_group', {
  id: int('id', { unsigned: true }).autoincrement().primaryKey(),
  name: varchar('name', { length: 50 }).default(''),
  rules: text('rules'),
  createTime: bigint('createtime', { mode: 'number' }),
  updateTime: bigint('updatetime', { mode: 'number' }),
  status: mysqlEnum('status', ['normal', 'hidden']),
})

export type SysUserGroupRow = typeof sysUserGroups.$inferSelect

export const sysAdmins = mysqlTable(
  'sys_admin',
  {
    id: int('id', { unsigned: true }).autoincrement().primaryKey(),
    username: varchar('username', { length: 20 }).default(''),
    nickname: varchar('nickname', { length: 50 }).default(''),
    password: varchar('password', { length: 32 }).default(''),
    salt: varchar('salt', { length: 30 }).default(''),
    avatar: varchar('avatar', { length: 255 }).default(''),
    email: varchar('email', { length: 100 }).default(''),
    mobile: varchar('mobile', { length: 11 }).default(''),
    loginFailure: tinyint('loginfailure', { unsigned: true })
      .notNull()
      .default(0),
    loginTime: bigint('logintime', { mode: 'number' }),
    loginIp: varchar('loginip', { length: 50 }),
    createTime: bigint('createtime', { mode: 'number' }),
    updateTime: bigint('updatetime', { mode: 'number' }),
    token: varchar('token', { length: 59 }).default(''),
    status: varchar('status', { length: 30 }).notNull().default('normal'),
  },
  (table) => [uniqueIndex('username').on(table.username)]
)

export type SysAdminRow = typeof sysAdmins.$inferSelect
