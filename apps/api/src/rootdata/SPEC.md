# Rootdata API SPEC

## Purpose

- `rootdata` 负责旧版“资料管理”的 HTTP API。
- 覆盖项目、人物、机构三个菜单入口，以及详情页内团队成员、任职经历、融资轮次、事件、新闻、合约等子资源。

## Boundaries

- 数据库读写、旧 JSON/text 字段转换、跨表同步和 transaction 放在 API 层。
- 前端只使用本模块 HTTP contract，不直接拼 SQL 或保存数据库 credential。
- 不引入通用 CRUD factory；旧表的 JSON 字段和跨表副作用较多，先保持显式 service。

## Contracts

- 对外 JSON 使用 camelCase；数据库字段保持旧库原名并在 service/schema 中映射。
- 实体类型使用 `1=项目`、`2=机构`、`3=人物`。
- 显示/状态类字段使用旧库 `1=显示/正常/是`、`0=隐藏/否`。
- 项目 `event`、`reports`、`team_members`、`contracts` 仍写回旧表 JSON/text 字段。
- 项目/机构团队成员变更必须同步 `rootdata_person_job_changes`。
- 融资轮次变更必须同步 `rootdata_funding_rounds_fac` 与 `coin_funding_join_project`。
- 新项目 ID 使用旧规则 `pN`；新人物 ID 使用旧规则 `pN`；新机构 `org_id` 使用旧规则递减负数。
- 编辑已有项目、人物、机构不得重生成业务 ID，避免破坏关联数据。

## Testing

- 修改本目录后至少运行：
  - `pnpm --filter @ztcj/api typecheck`
  - `pnpm --filter @ztcj/api lint`
  - `pnpm --filter @ztcj/api build`

## Change Notes

- 当前阶段支持图片 URL/路径字段，不复刻旧版 FastAdmin 上传/选择弹窗。
- 旧版存在硬编码 URL 和编辑项目时重生成 `project_id` 的风险行为；本模块不复刻这些缺陷。
