# Apps Feature SPEC

## Purpose

- 实现旧版“APP管理”下的 APP 栏目管理和 APP 广告管理。
- APP 栏目页面负责两级栏目树的列表、筛选、创建、编辑、删除、批量状态。
- APP 广告页面负责广告列表、筛选、创建、编辑、删除、批量状态。

## Boundaries

- feature-specific API、query hook、schema 和组件放在本目录内。
- route 文件只绑定 TanStack Router 和 feature entry point。
- 图片上传暂不在本 feature 内实现；广告图片字段先编辑 URL/路径字符串。
- 不抽取 shared CRUD abstraction，避免把旧版 FastAdmin 页面行为泛化。

## Contracts

- API base path 是 `/apps`。
- APP 栏目只支持两级结构；父级选择只展示一级栏目。
- APP 栏目 `status` 使用旧库字符串：`'1'=是`、`'0'=否`。
- APP 广告 `adType` 使用字符串：`'1'=广告`、`'2'=推广`、`'3'=活动`。
- APP 广告 `status` 使用数字：`1=显示`、`0=隐藏`。
- 广告位、页面、标签枚举来自 `/apps/meta`，本地常量只作为渲染 fallback。
- 列表使用 server-side filter/pagination；URL search state 是查询参数来源。

## UI/UX Rules

- 删除必须二次确认。
- mutation 期间提交按钮 disabled，并通过 toast 反馈结果。
- 表单中与 API 校验一致的必填项必须有可见“必填”提示。
- 表格 pagination/filter 触发新的列表 query 时保留上一批数据，避免整表切到 loading row 造成闪动。

## Testing

- 修改本目录后至少运行：
  - `pnpm --filter @ztcj/admin typecheck`
  - `pnpm --filter @ztcj/admin lint`

## Change Notes

- 第一版不复刻旧版 FastAdmin 上传/选择弹窗；图片字段保持 URL/路径输入。
- `/apps` 顶层 route 仅 redirect 到 `/apps/columns`，实际 behavior 在子页面。
