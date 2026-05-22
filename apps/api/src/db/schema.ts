import {
  bigint,
  date,
  decimal,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  timestamp,
  tinyint,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core'

export const users = mysqlTable(
  'users',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    firstName: varchar('first_name', { length: 120 }).notNull(),
    lastName: varchar('last_name', { length: 120 }).notNull(),
    username: varchar('username', { length: 120 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    phoneNumber: varchar('phone_number', { length: 64 }).notNull(),
    status: mysqlEnum('status', ['active', 'inactive', 'invited', 'suspended'])
      .notNull()
      .default('invited'),
    role: mysqlEnum('role', ['superadmin', 'admin', 'cashier', 'manager'])
      .notNull()
      .default('cashier'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('users_username_unique').on(table.username),
    uniqueIndex('users_email_unique').on(table.email),
  ]
)

export type UserRow = typeof users.$inferSelect
export type NewUserRow = typeof users.$inferInsert

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
    birthday: date('birthday'),
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
