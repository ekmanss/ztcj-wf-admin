# Apps API SPEC

## Purpose

- `apps` domain 负责旧版“APP管理”下的 APP 栏目和 APP 广告 CRUD。
- 对应旧库表 `wf_app_column`、`wf_app_ad`。

## Boundaries

- 数据库读写、两级栏目校验、广告枚举和时间区间校验放在 API。
- 前端只通过 `/api/apps/*` HTTP contract 管理数据，不直接连接数据库。
- 不在这里实现通用上传系统；广告图片字段当前保存 URL/路径字符串。

## Contracts

- API base path 是 `/apps`。
- APP 栏目只支持两级结构：`pid=0` 为一级，否则父级必须是一级栏目。
- APP 栏目 `status` 使用旧库字符串：`'1'=是`、`'0'=否`。
- 删除栏目时，如果存在未同时删除的子栏目，API 必须拒绝。
- APP 广告 `adType` 使用字符串：`'1'=广告`、`'2'=推广`、`'3'=活动`。
- APP 广告 `status` 使用数字：`1=显示`、`0=隐藏`。
- 广告位和页面 code 使用旧版固定枚举，由 `/apps/meta` 暴露给前端。
- 创建时如果 `weigh` 缺失或为 `0`，写入后用主键回填 `weigh`，保持旧版 FastAdmin 行为。

## Testing

- 修改本目录后至少运行：
  - `pnpm --filter @ztcj/api typecheck`
  - `pnpm --filter @ztcj/api lint`
  - `pnpm --filter @ztcj/api build`
