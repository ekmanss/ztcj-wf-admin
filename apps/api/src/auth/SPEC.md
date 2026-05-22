# Auth SPEC

## Purpose

- `auth` 负责管理台登录、当前登录用户读取和退出。
- 当前登录数据来自已有数据库表 `sys_admin`。

## Boundaries

- 只处理管理台登录 session 和 `sys_admin` 账号校验，不承载用户列表 CRUD。
- 不创建 migration、不 seed 数据、不直接改变表结构。
- 不在 API 返回 `password`、`salt` 等敏感字段。

## Contracts

- `POST /api/auth/login` 接收 `{ account, password }`。
- `account` 兼容旧版逻辑：邮箱走 `email`，`/^1\d{10}$/` 走 `mobile`，其余走 `username`。
- 密码校验兼容旧版 FastAdmin：`md5(md5(password) + salt)`。
- 只有 `status = "normal"` 的 `sys_admin` 可以登录。
- token 存在 `sys_admin.token`，当前阶段是单管理员单 active session；重新登录会覆盖旧 token。
- 当前阶段 token 通过 Bearer header 传递，不使用 cookie session。
- `GET /api/auth/me` 和 `POST /api/auth/logout` 从 `Authorization: Bearer <token>` 读取 token，同时兼容 `token` header。

## Testing

- 修改本目录后至少运行：
  - `pnpm --filter @ztcj/api typecheck`
  - `pnpm --filter @ztcj/api lint`
  - `pnpm --filter @ztcj/api test`

## Change Notes

- 为兼容已有管理员，第一阶段保留旧 MD5 密码算法；后续如升级密码算法，应做登录后渐进迁移。
