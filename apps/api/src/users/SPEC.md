# Users API SPEC

## Purpose

- `users` API 负责管理台旧库会员用户 CRUD，数据源是 `sys_user`。
- 用户组下拉数据来自 `sys_user_group`。

## Boundaries

- 只处理会员用户管理，不处理管理台管理员 `sys_admin` 登录。
- 不在这里实现会员组权限树、会员组管理页面或 `rules` 编辑。
- 不直接修改余额/积分日志表；没有日志表 contract 前，避免添加 `money` / `score` 写入能力。

## Contracts

- HTTP path 使用 `/api/users`，返回 camelCase JSON。
- `id` 和批量 `ids` 都是 number，对应 `sys_user.id`。
- 状态只接受 `normal` / `hidden`；数据库里空字符串状态对外按 `normal` 返回。
- 列表查询使用 server-side pagination/filter，并通过 `LEFT JOIN sys_user_group` 返回 `groupName`，避免脏 `group_id` 丢失用户行。
- API 不返回 `password`、`salt`、`token`、`verification`。
- 新增/编辑 `password` 为空时不写入；非空时按 FastAdmin legacy hash 写入 `password` 和 `salt`。
- `GET /api/users/groups` 返回 `{ id, name, status }[]`，只作为用户表单选项，不暴露 `rules`。

## Testing

- 修改本目录后至少运行：
  - `pnpm --filter @ztcj/api typecheck`
  - `pnpm --filter @ztcj/api lint`
  - `pnpm --filter @ztcj/api test`
  - `pnpm --filter @ztcj/api build`
