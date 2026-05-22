# Database Reference SPEC

## Purpose

- 保存已有数据库对象的参考资料，供后续 API 开发和 AI context 加载使用。
- 这里的 SQL 反映外部数据库现状，不代表仓库内待执行 migration。
- 多张表的原始 DDL 统一放在 `ddl/` 子目录。

## Boundaries

- 可以放置只读参考性质的字段说明、数据 contract 备注和目录索引。
- 表级 `CREATE TABLE` DDL 放在 `ddl/`，每张表一个 `.sql` 文件。
- 不放置可直接修改或派生数据库结构/数据的维护脚本、seed、批量 update/delete、migration generator 或 migration runner。

## Contracts

- 参考 SQL 应尽量保留原始表名、字段名、类型、索引、默认值和 comment。
- 如果 API 暴露 camelCase JSON，字段映射逻辑应在 API service/dto 中处理，不在参考 SQL 中改名。

## Change Notes

- `ddl/sys_user.sql` 来自 2026-05-22 用户提供的已有数据库表结构，仅作本地参考。
- `ddl/sys_admin.sql` 来自 2026-05-22 用户提供的已有数据库表结构，仅作本地参考。
- `ddl/paradise_lost.sql` 来自 2026-05-22 当前 `DATABASE_URL` 指向的已有数据库表结构，仅作本地参考。
