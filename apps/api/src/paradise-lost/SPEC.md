# Paradise Lost API SPEC

## Purpose

- `paradise-lost` 负责旧版“专题数据 / 失乐园”的 HTTP API。
- 数据来自旧库 `coin_aradise_lost`，并按旧版行为同步关联的项目、机构、人物或事件源表。

## Boundaries

- 数据库读写、唯一性校验、transaction 和跨表同步只放在 API 层。
- 前端只调用本模块 API，不直接连接数据库或拼 SQL。
- 不在本模块引入通用 CRUD factory；该页面有明确跨表副作用。

## Contracts

- 对外 JSON 使用 camelCase；数据库字段名保持旧库原名并在 service/schema 中映射。
- `type` 只允许 `1=项目`、`2=机构`、`3=人物`、`5=事件`。
- `status` 只允许 `0=隐藏`、`1=显示`。
- `tags`、`year`、`eventTypes`、`eventNatures` 对外是数组，入库前转换为英文逗号分隔字符串。
- 列表和详情返回 `sourceMissing` / `sourceMissingMessage`，用于标记旧专题条目引用的来源对象缺失。
- 创建和编辑必须验证 `type + investId` 唯一，编辑时排除当前记录。
- 创建和编辑必须在同一个 transaction 内更新源表和 `coin_aradise_lost`。
- `/paradise-lost/investments` 支持 `page` / `pageSize` 分页搜索，默认按英文名优先、名称兜底的字母升序返回。
- 事件源表真实表名是 `sys_events_timeline`，不是旧代码里的未加前缀 `events_timeline`。

## Testing

- 修改本目录后至少运行：
  - `pnpm --filter @ztcj/api typecheck`
  - `pnpm --filter @ztcj/api lint`
  - `pnpm --filter @ztcj/api build`

## Change Notes

- 当前阶段支持图片 URL/路径字段，不实现旧版上传弹窗。
- 标签管理只提供失乐园表单所需的查询和快速新增，不复刻独立 FastAdmin 标签管理页。
