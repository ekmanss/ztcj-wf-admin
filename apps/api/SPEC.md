# API SPEC

## Purpose

- `apps/api` 是配套后台 API，负责数据库连接、数据读写、业务校验和 HTTP contract。
- 当前实现使用 NestJS、Drizzle ORM 和 MySQL。

## Boundaries

- 数据库 credential、业务 CRUD、SQL、transaction 和权限相关逻辑必须留在 API。
- 允许运行中的 API 通过 controller/service 执行业务数据 CRUD。
- 仓库不提供绕过业务 API 直接改数据库的维护命令；不要添加 `db:migrate`、`db:push`、seed、批量 SQL update/delete 等会直接修改表结构或表数据的脚本。
- 前端不得直接连接数据库，也不得保存数据库 credential。
- 不要在这里放前端 UI 类型；跨端共享 contract 稳定后再考虑 `packages/shared`。

## Contracts

- API 全局 prefix 是 `/api`。
- 数据库连接通过 `DATABASE_URL` 提供，缺失时 API fail fast。
- `users` API 返回 camelCase JSON，字段对齐管理台 `User` shape。
- 用户密码不得以明文写入当前 `users` 表；传入的 `password` 只为兼容前端表单，当前不会持久化。

## Testing

- 修改 API 后至少运行：
  - `pnpm --filter @ztcj/api typecheck`
  - `pnpm --filter @ztcj/api lint`
  - `pnpm --filter @ztcj/api build`

## Change Notes

- 初始阶段只实现 `users` 最小 CRUD，不引入通用 CRUD factory 或 shared package。
- Drizzle 只用于生成 SQL migration 文件；schema 变更的实际执行、备份、回滚和审计必须走仓库外数据库流程。
