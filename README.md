# ZTCJ WF Admin

后台管理台 monorepo，包含：

- `apps/admin`：React、Vite、TanStack Router、TanStack Query 管理台前端。
- `apps/api`：NestJS、Drizzle ORM、MySQL 后端 API。

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
DATABASE_URL=mysql://user:password@localhost:3306/rootdata
PORT=3001
CORS_ORIGIN=http://localhost:5173
VITE_API_BASE_URL=http://localhost:3001/api
VITE_CLERK_PUBLISHABLE_KEY=
VITE_DEV_AUTH_ENABLED=false
```

`apps/admin/.env.example` 保留前端单独运行时需要的 Vite 变量。

`VITE_DEV_AUTH_ENABLED=true` 仅在前端 dev mode 生效，会注入本地预览登录态，方便
AI/设计开发直接查看受保护页面；不要在正式环境开启。

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

API 使用 Drizzle 描述 MySQL schema。运行中的 API 会通过 controller/service 执行业务数据 CRUD；仓库不提供绕过业务 API 直接修改数据库的维护脚本，不在本地执行 `db:migrate`、`db:push`、seed、批量 SQL update/delete 这类命令。

数据库表结构不通过仓库内 migration 修改。`apps/api/docs/database/ddl/` 仅保存外部数据库现状的只读参考 DDL；实际建表、改表、备份、回滚和审计由仓库外数据库流程负责。

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
