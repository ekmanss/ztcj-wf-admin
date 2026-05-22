# Routes SPEC

## Purpose

- `routes` 目录负责 TanStack Router file route 绑定。
- route 文件保持薄层，只做 auth gate、search validation、redirect 和 feature entry point 连接。

## Boundaries

- 具体页面 behavior 放在 `src/features/<feature-name>/`。
- shared layout 放在 `src/components/layout`。

## Contracts

- 受保护根路径 `/` 不直接渲染 dashboard，默认 redirect 到 `/paradise-lost`。
- `/_authenticated/<feature>/` route 只导入对应 feature entry point，不承载业务逻辑。

## Testing

- 修改 route contract 后至少运行 `pnpm --filter @ztcj/admin typecheck`。
