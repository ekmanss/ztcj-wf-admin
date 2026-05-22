import {
  bigint,
  date,
  datetime,
  decimal,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
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

export const coinAradiseLost = mysqlTable(
  'coin_aradise_lost',
  {
    id: int('id').autoincrement().primaryKey(),
    investId: varchar('invest_id', { length: 50 }),
    name: varchar('name', { length: 255 }),
    logo: varchar('logo', { length: 255 }),
    type: tinyint('type'),
    oneLiner: varchar('one_liner', { length: 255 }),
    tags: varchar('tags', { length: 255 }),
    tagsEn: varchar('tags_en', { length: 255 }),
    year: varchar('year', { length: 255 }),
    cause: text('cause'),
    causeEn: text('cause_en'),
    date: datetime('date', { mode: 'string' }),
    image: varchar('image', { length: 255 }),
    imageChoose: tinyint('image_choose'),
    status: tinyint('status'),
    desc: varchar('desc', { length: 255 }),
    createdAt: timestamp('created_at', { mode: 'string' }),
    updatedAt: timestamp('updated_at', { mode: 'string' }),
  },
  (table) => [uniqueIndex('invest_id').on(table.investId, table.type)]
)

export type CoinAradiseLostRow = typeof coinAradiseLost.$inferSelect

export const coinAradiseLostTags = mysqlTable('coin_aradise_losts_tag', {
  id: int('id').autoincrement().primaryKey(),
  image: varchar('image', { length: 1024 }).notNull(),
  darkImage: varchar('dark_image', { length: 1024 }),
  color: varchar('color', { length: 255 }),
  darkColor: varchar('dark_color', { length: 255 }),
  backgroundColor: varchar('background_color', { length: 255 }),
  darkBackgroundColor: varchar('dark_background_color', { length: 255 }),
  backgroundImage: varchar('background_image', { length: 1024 }),
  darkBackgroundImage: varchar('dark_background_image', { length: 1024 }),
  tagName: varchar('tag_name', { length: 255 }),
  tagNameEn: varchar('tag_name_en', { length: 255 }),
  remark: text('remark'),
  createTime: datetime('create_time', { mode: 'string' }).notNull(),
  updateTime: datetime('update_time', { mode: 'string' }),
})

export type CoinAradiseLostTagRow = typeof coinAradiseLostTags.$inferSelect

export const coinProjects = mysqlTable(
  'coin_projects',
  {
    autoId: bigint('auto_id', { mode: 'number', unsigned: true })
      .autoincrement()
      .primaryKey(),
    projectId: varchar('project_id', { length: 255 }).notNull(),
    projectName: varchar('project_name', { length: 255 }),
    projectNameEn: varchar('project_name_en', { length: 255 }),
    logo: varchar('logo', { length: 500 }),
    oneLiner: varchar('one_liner', { length: 500 }),
    oneLinerEn: varchar('one_liner_en', { length: 500 }),
    description: text('description'),
    descriptionEn: text('description_en'),
    active: tinyint('active'),
  },
  (table) => [
    uniqueIndex('uk_project_id').on(table.projectId),
    index('idx_project_name').on(table.projectName),
    index('idx_active').on(table.active),
  ]
)

export type CoinProjectRow = typeof coinProjects.$inferSelect

export const rootdataOrganizations = mysqlTable(
  'rootdata_organizations',
  {
    autoId: bigint('auto_id', { mode: 'number', unsigned: true })
      .autoincrement()
      .primaryKey(),
    orgId: bigint('org_id', { mode: 'number' }).notNull().default(0),
    orgName: varchar('org_name', { length: 255 }).notNull(),
    orgNameEn: varchar('org_name_en', { length: 255 }).notNull(),
    logo: varchar('logo', { length: 500 }),
    orgInfo: varchar('org_info', { length: 500 }).default(''),
    orgInfoEn: varchar('org_info_en', { length: 500 }),
    description: text('description'),
    descriptionEn: text('description_en'),
    active: tinyint('active'),
    status: tinyint('status').notNull().default(1),
  },
  (table) => [
    uniqueIndex('uk_org_id').on(table.orgId),
    index('idx_org_name').on(table.orgName),
    index('idx_active').on(table.active),
  ]
)

export type RootdataOrganizationRow = typeof rootdataOrganizations.$inferSelect

export const rootdataPersons = mysqlTable(
  'rootdata_persons',
  {
    id: varchar('id', { length: 50 }).primaryKey(),
    peopleName: varchar('people_name', { length: 255 }).notNull(),
    peopleNameEn: varchar('people_name_en', { length: 255 })
      .notNull()
      .default(''),
    introduce: text('introduce'),
    introduceEn: text('introduce_en'),
    headImg: varchar('head_img', { length: 500 }),
    oneLiner: varchar('one_liner', { length: 500 }),
    oneLinerEn: varchar('one_liner_en', { length: 500 }),
    status: tinyint('status').notNull().default(1),
  },
  (table) => [index('idx_people_name').on(table.peopleName)]
)

export type RootdataPersonRow = typeof rootdataPersons.$inferSelect

export const sysEventsTimeline = mysqlTable(
  'sys_events_timeline',
  {
    eventId: bigint('event_id', { mode: 'number' })
      .autoincrement()
      .primaryKey(),
    eventNameCn: varchar('event_name_cn', { length: 255 }).notNull(),
    eventNameEn: varchar('event_name_en', { length: 255 }).notNull(),
    eventImage160: varchar('event_image_160', { length: 512 }),
    eventSummaryCn: text('event_summary_cn'),
    eventSummaryEn: text('event_summary_en'),
    eventIntroductionCn: text('event_introduction_cn'),
    eventIntroductionEn: text('event_introduction_en'),
    eventTypes: varchar('event_types', { length: 255 }).notNull(),
    eventNatures: varchar('event_natures', { length: 255 }).notNull(),
    status: mysqlEnum('status', ['1', '0']),
  },
  (table) => [index('idx_event_name_cn').on(table.eventNameCn)]
)

export type SysEventsTimelineRow = typeof sysEventsTimeline.$inferSelect

export const sysEventsTimelineTypes = mysqlTable('sys_events_timeline_types', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  nameEn: varchar('name_en', { length: 255 }),
  remark: text('remark'),
  createTime: datetime('create_time', { mode: 'string' }).notNull(),
  updateTime: datetime('update_time', { mode: 'string' }),
})

export const sysEventsTimelineNatures = mysqlTable(
  'sys_events_timeline_natures',
  {
    id: int('id').autoincrement().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    nameEn: varchar('name_en', { length: 255 }),
    remark: text('remark'),
    createTime: datetime('create_time', { mode: 'string' }).notNull(),
    updateTime: datetime('update_time', { mode: 'string' }),
  }
)
