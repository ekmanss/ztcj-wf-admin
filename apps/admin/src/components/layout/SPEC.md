# Layout Components SPEC

## Purpose

- `components/layout` 负责后台管理台的全局 shell、sidebar、header、用户菜单和导航渲染。
- `data/sidebar-data.ts` 是 sidebar 与 command palette 共用的 navigation source。

## Boundaries

- 这里可以维护跨 feature 的布局容器和 navigation 配置。
- 具体页面 behavior 不放在 layout 目录，应放入对应 `src/features/<feature-name>/`。

## Contracts

- `sidebarData` 保留完整 nav 配置，可包含暂不展示的模板页面。
- 可见入口必须使用 `visibleSidebarData`，不要直接渲染 `sidebarData.navGroups`。
- sidebar 分区只作为 label；需要展开的入口使用 `NavItem.items`，保持与 `satnaing/shadcn-admin` 模板中 `Pages -> Auth` 相同的数据形态。
- 标记为 `isTemplate: true` 的 group 或 item 是模板页面，保留 route 配置但不展示在 sidebar 与 command palette。
- `TeamSwitcher` 仍作为 sidebar 左上角入口，但当前只展示 `Woofun Admin`；其它标记为 `isTemplate: true` 的 team 和新增 team 入口暂不展示。
- sidebar 左下角 `NavUser` 菜单暂时隐藏 `Upgrade to Pro`、`Account`、`Billing`、`Notifications`，只保留用户信息和 `Sign out`。

## Testing

- 修改 navigation 可见性后，至少运行 `pnpm --filter @ztcj/admin typecheck`。
- 如果影响 command palette，更新并运行相关 `SearchProvider`/`CommandMenu` 测试。
