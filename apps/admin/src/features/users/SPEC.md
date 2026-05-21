# Users SPEC

## Purpose

- `users` feature 负责用户列表、筛选、分页、创建、编辑、删除和批量操作。

## Boundaries

- 用户相关 API 封装放在 `api/`。
- 用户相关 TanStack Query hook 放在 `hooks/`。
- 只把通用请求 client 放到 `src/lib`，不要把 users mutation 抽到 shared。

## Contracts

- `User` shape 与 API `/users` 响应保持一致，日期字段在前端转换为 `Date`。
- 列表使用 server-side pagination/filter，URL search state 是查询参数来源。
- 新增/编辑表单中的 `password` 不在当前 API 中持久化，提交前只作为兼容字段传递。

## UI/UX Rules

- mutation 期间提交按钮应 disabled，并给出 toast 结果。
- 删除操作必须保留明确确认步骤。

## Testing

- 修改 users feature 后运行 `pnpm --filter @ztcj/admin test`。

## Change Notes

- faker 静态数据只可作为开发 fallback 或测试 fixture，不再作为页面主数据源。
