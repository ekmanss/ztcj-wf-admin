# ZTCJ WF Admin

后台管理台 monorepo，包含：

- `apps/admin`：React、Vite、TanStack Router、TanStack Query 管理台前端。
- `apps/api`：NestJS、Drizzle ORM、PostgreSQL 后端 API。

## Requirements

- Node.js `>=24.0.0 <25`
- pnpm `>=11.1.3 <12`
- 推荐通过 `mise` 管理工具链。

## Environment

复制根目录示例：

```bash
cp .env.example .env
```

关键变量：

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5432/ztcj_wf_admin
PORT=3001
CORS_ORIGIN=http://localhost:5173
VITE_API_BASE_URL=http://localhost:3001/api
VITE_CLERK_PUBLISHABLE_KEY=
```

`apps/admin/.env.example` 保留前端单独运行时需要的 Vite 变量。

## Commands

```bash
mise trust
mise run install:update
mise run dev
```

常用命令：

| Command                 | Description                    |
| ----------------------- | ------------------------------ |
| `mise run dev`          | 并行启动前端和 API             |
| `mise run dev:admin`    | 只启动前端管理台               |
| `mise run dev:api`      | 只启动 NestJS API              |
| `mise run lint`         | 运行 workspace lint            |
| `mise run format:check` | 检查格式                       |
| `mise run test`         | 运行测试                       |
| `mise run build`        | 构建前端和 API                 |
| `mise run ci`           | 运行 lint、format、test、build |

## Database

API 使用 Drizzle 管理 PostgreSQL schema。

```bash
pnpm --filter @ztcj/api db:generate
pnpm --filter @ztcj/api db:migrate
pnpm --filter @ztcj/api db:seed
```

初始化 migration 位于 `apps/api/drizzle/`。

## API

API 全局 prefix 是 `/api`。

当前已实现：

- `GET /api/health`
- `GET /api/users`
- `POST /api/users`
- `PATCH /api/users/:id`
- `DELETE /api/users/:id`
- `PATCH /api/users/bulk/status`
- `DELETE /api/users/bulk`

## Notes

- 前端通过 HTTP API 读写数据，不直接连接数据库。
- 当前 `users` 表不持久化明文密码；前端表单的 `password` 字段仅为兼容现有 UI 流程。
- 跨端共享类型暂未抽到 `packages/shared`，等 contract 稳定后再做。
