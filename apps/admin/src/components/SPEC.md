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
- `DataTableBulkActions` 默认保留英文 demo 文案；中文 feature 使用 `copy` 覆盖 visible、aria 和 live-region 文案，不在 shared component 内硬编码具体业务名。
- shared table controls 默认保留英文 demo 文案；中文 feature 使用 `copy`、`resetLabel`、`viewOptions`、`facetedFilterCopy` 等 props 覆盖可见文案、aria 文案和列名。

## Testing

- 修改 shared component 后至少运行 `pnpm --filter @ztcj/admin typecheck`。
