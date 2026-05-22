# Database DDL SPEC

## Purpose

- 专门保存已有数据库表的原始 DDL，供后续 API 开发和 AI context 加载使用。
- 每个 `.sql` 文件对应一张或一组强相关表。

## Boundaries

- 可以保存 `CREATE TABLE`、索引、表注释、字段 comment 等结构定义。
- 不保存 `INSERT`、`UPDATE`、`DELETE`、seed 数据、migration 输入或任何运行型维护脚本。

## Contracts

- 单表 DDL 文件命名使用真实表名，例如 `sys_user.sql`。
- DDL 应尽量保留数据库中的原始字段名、类型、默认值、索引、collation 和 comment。
- 如果后续 API 对外返回 camelCase，映射逻辑写在 API 层，不改这里的原始 DDL。

## Change Notes

- 当前目录只记录数据库现状，不代表仓库要自动创建或变更这些表。
