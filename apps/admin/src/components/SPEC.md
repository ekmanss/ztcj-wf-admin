# Shared Components SPEC

## Purpose

- `components` 放跨 feature 复用的管理台 UI 组件。
- `components/ui` 保持 shadcn/Radix primitives 和薄包装。

## Boundaries

- feature-specific component 应放在对应 `src/features/<feature-name>/components`。
- 全局 layout shell 放在 `components/layout`。

## Contracts

- `ProfileDropdown` 是页面 header 右上角用户入口的 shared component；当前暂时不渲染，用于隐藏右上角用户按钮。
- `PopoverContent` 默认使用 portal；当 popover 嵌套在 `Dialog` 内且内容需要滚轮滚动时，可使用 `portalled={false}` 留在 dialog DOM 内，避免被 dialog scroll lock 拦截。

## Testing

- 修改 shared component 后至少运行 `pnpm --filter @ztcj/admin typecheck`。
