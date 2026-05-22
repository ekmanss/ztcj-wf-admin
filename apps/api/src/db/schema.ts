import {
  mysqlEnum,
  mysqlTable,
  timestamp,
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
