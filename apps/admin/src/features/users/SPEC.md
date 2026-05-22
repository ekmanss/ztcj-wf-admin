# Users SPEC

## Purpose

- `users` feature 负责旧库会员用户的列表、筛选、分页、创建、编辑、删除和批量状态操作。

## Boundaries

- 用户相关 API 封装放在 `api/`。
- 用户相关 TanStack Query hook 放在 `hooks/`。
- 只把通用请求 client 放到 `src/lib`，不要把 users mutation 抽到 shared。

## Contracts

- `User` shape 与 API `/users` 响应保持一致，字段来自旧库 `sys_user`，使用 camelCase。
- `id` 是 `number`，对应 `sys_user.id`，不是 UUID。
- 用户状态只使用旧版 `normal` / `hidden`。
- 用户组通过 API `/users/groups` 读取，前端只展示/选择 `groupId` 与 `groupName`，不处理会员组 `rules`。
- 列表使用 server-side pagination/filter，URL search state 是查询参数来源。
- 新增/编辑表单中的 `password` 留空表示不修改；非空时由 API 按 FastAdmin legacy hash 写入。
- `money`、`score` 当前在列表展示但不在表单中修改，避免缺少余额/积分日志表时破坏审计链。

## UI/UX Rules

- mutation 期间提交按钮应 disabled，并给出 toast 结果。
- 删除操作必须保留明确确认步骤。

## Testing

- 修改 users feature 后运行 `pnpm --filter @ztcj/admin test`。

## Change Notes

- faker 静态数据只可作为开发 fallback 或测试 fixture，不再作为页面主数据源。
- 不恢复模板中的邀请用户/role UI；旧版会员管理使用用户组和 `normal`/`hidden` 状态。
