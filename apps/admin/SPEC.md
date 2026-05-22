# Admin SPEC

## Purpose

- `apps/admin` 是 React/Vite 后台管理台。
- route 仍保持薄层，具体页面 behavior 放在 `src/features/<feature-name>/`。

## Boundaries

- 管理台通过 HTTP API 读写数据，不直接连接数据库。
- feature-specific API client、query hook 和 mutation hook 优先放在对应 feature 内。
- 只有跨 feature 复用的请求基础设施放入 `src/lib`。

## Contracts

- API base URL 由 `VITE_API_BASE_URL` 提供，默认指向 `http://localhost:3001/api`。
- 管理台 API 请求使用 `Authorization: Bearer <token>`，不发送跨域 cookie credentials。
- 远端数据进入 UI 前应通过 schema 校验或显式转换，避免让未知响应直接进入表格。

## Testing

- 修改前端后至少运行：
  - `pnpm --filter @ztcj/admin typecheck`
  - `pnpm --filter @ztcj/admin lint`
  - `pnpm --filter @ztcj/admin test`

## Change Notes

- 现有 shadcn-style UI primitives 继续留在 `src/components/ui`。
- 不要为单个 feature 过早抽取 shared abstraction。
