# Auth Feature SPEC

## Purpose

- `auth` feature 负责管理台登录、认证状态恢复和认证相关页面。

## Boundaries

- 登录 API 封装放在 `api/`。
- 登录表单和认证页面留在本 feature 内。
- 全局 token 存储状态放在 `src/stores/auth-store.ts`，请求拦截器放在 `src/lib/api-client.ts`。

## Contracts

- 登录表单提交 `{ account, password }` 到 `POST /api/auth/login`。
- 登录成功后保存 `token`，并把 API 返回的 `user` 写入 `auth-store`。
- 当前阶段只使用 Bearer token，不使用 cookie session 或跨域 credentials。
- 受保护 route 进入前，如果本地有 token 但没有 user，需要调用 `GET /api/auth/me` 恢复 session。
- 退出登录调用 `POST /api/auth/logout`，即使远端失败也要清理本地 session。

## UI/UX Rules

- 登录失败展示 API 错误，不保留 mock 登录或第三方登录入口。
- 登录期间 submit button disabled，并显示 loading icon。

## Testing

- 修改本目录后运行 `pnpm --filter @ztcj/admin test`。

## Change Notes

- 当前阶段只实现 `sys_user` 登录闭环，不实现注册、找回密码、OAuth 或 RBAC。
