import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

export const userStatusEnum = pgEnum('user_status', [
  'active',
  'inactive',
  'invited',
  'suspended',
])

export const userRoleEnum = pgEnum('user_role', [
  'superadmin',
  'admin',
  'cashier',
  'manager',
])

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    username: text('username').notNull(),
    email: text('email').notNull(),
    phoneNumber: text('phone_number').notNull(),
    status: userStatusEnum('status').notNull().default('invited'),
    role: userRoleEnum('role').notNull().default('cashier'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex('users_username_unique').on(table.username),
    uniqueIndex('users_email_unique').on(table.email),
  ]
)

export type UserRow = typeof users.$inferSelect
export type NewUserRow = typeof users.$inferInsert
