# Paradise Lost Feature SPEC

## Purpose

- 实现旧版“专题数据 / 失乐园”相关管理页面。
- 失乐园页面负责专题条目的列表、筛选、创建、编辑、删除、批量显示状态，以及表单内标签快速新增。
- 标签管理页面负责失乐园专题标签的列表、筛选、创建、编辑和删除。

## Boundaries

- feature-specific API、query hook、schema 和组件放在本目录内。
- route 文件只绑定 TanStack Router 和 feature entry point。
- 图片上传暂不在本 feature 内实现；当前只编辑图片 URL/路径字段。
- 不抽取 shared CRUD abstraction，避免把该页面的跨表同步副作用泛化。

## Contracts

- API base path 是 `/paradise-lost`。
- `type` 使用数字：`1=项目`、`2=机构`、`3=人物`、`5=事件`。
- `status` 使用数字：`0=隐藏`、`1=显示`。
- `tags`、`year`、`eventTypes`、`eventNatures` 在 UI 中是数组，由 API 转换为旧库逗号字符串。
- `sourceMissing` 为 true 时表示旧专题条目引用的来源对象缺失，列表和编辑弹窗必须显式提示。
- 创建/编辑提交完整表单；后端会在 transaction 内同步关联源表和 `coin_aradise_lost`。
- 关联对象通过 `/paradise-lost/investments` 分页搜索；默认按名称字母升序，选择器滚动到底部继续加载下一页，选择后把源表字段填入当前表单。
- 标签 API base path 是 `/paradise-lost/tags`，对应旧库 `coin_aradise_losts_tag`。
- 标签删除必须由 API 检查 `coin_aradise_lost.tags` 引用；仍被专题条目引用时不能删除。

## UI/UX Rules

- 删除必须二次确认。
- mutation 期间提交按钮 disabled，并通过 toast 反馈结果。
- 表格保持 server-side pagination/filter；URL search state 是查询参数来源。
- 表格 pagination/filter 触发新的列表 query 时保留上一批数据，避免整表切到 loading row 造成闪动。
- 创建/编辑表单中与前端校验一致的必填项必须有可见“必填”提示。

## Testing

- 修改本目录后至少运行：
  - `pnpm --filter @ztcj/admin typecheck`
  - `pnpm --filter @ztcj/admin lint`

## Change Notes

- 第一版不复刻旧版“添加项目/机构/人物/事件”的嵌套弹窗；先选择已有源表记录。
- 标签管理已提供独立 route `/paradise-lost/tags`；表单内快速新增复用同一套标签创建逻辑。
- 图片上传暂不复刻旧版 FastAdmin 上传/选择弹窗，标签图片字段先编辑 URL/路径。
