# Shared Components SPEC

## Purpose

- `components` 放跨 feature 复用的管理台 UI 组件。
- `components/ui` 保持 shadcn/Radix primitives 和薄包装。

## Boundaries

- feature-specific component 应放在对应 `src/features/<feature-name>/components`。
- 全局 layout shell 放在 `components/layout`。

## Contracts

- `ProfileDropdown` 是页面 header 右上角用户入口的 shared component；当前暂时不渲染，用于隐藏右上角用户按钮。

## Testing

- 修改 shared component 后至少运行 `pnpm --filter @ztcj/admin typecheck`。
