# DB SPEC

## Purpose

- `db` 负责 MySQL connection lifecycle、Drizzle client provider 和数据库 schema 定义。

## Boundaries

- 数据库连接、pool token、Drizzle schema 和 DB 类型放在这里。
- 业务查询、权限判断和 HTTP response shape 不放在这里。
- 不添加 migration generator/runner、seed、批量维护脚本，或任何会直接修改/派生数据库结构与数据的命令。

## Contracts

- `DATABASE_URL` 缺失时 API 必须 fail fast。
- `DB_POOL` 暴露 `mysql2/promise` `Pool`，供底层 health check 或特殊场景使用。
- `DB` 暴露绑定 schema 的 Drizzle client，业务 CRUD 默认注入 `DB`。
- MySQL pool 必须由 Nest lifecycle 管理，并在 application shutdown 时关闭。

## Testing

- 修改本目录后至少运行：
  - `pnpm --filter @ztcj/api typecheck`
  - `pnpm --filter @ztcj/api lint`
  - `pnpm --filter @ztcj/api test`
  - `pnpm --filter @ztcj/api build`
