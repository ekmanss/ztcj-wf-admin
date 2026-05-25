# KOL API SPEC

## Purpose

- `kol` 负责管理 KOL 账号资料和 KOL 动态的 HTTP API。
- 当前数据源是旧库现有表 `x_users` 与 `x_tweets`。

## Boundaries

- 本目录只放 KOL 业务查询、DTO、controller 和 service。
- 数据库表描述放在 `src/db/schema.ts`。
- 前端 UI 类型不放在这里。

## Contracts

- API namespace 使用 `/api/kol`。
- `x_users.rest_id` 是 KOL 会员主键，前端显示为“唯一id”。
- `x_tweets.tweet_rest_id` 是 KOL 动态主键。
- `x_users.status` 按真实 enum 处理：`1=显示`，`2=隐藏`。
- `x_tweets.status` 按真实 enum 处理：`1=显示`，`0=隐藏`。
- `x_users.sync_status` 使用 `0=同步中`，`1=已同步`，`2=同步失败`。
- 会员头像展示优先使用 `https://cdn.woofunapi.com/<avatar_s3_key>`，`avatar_s3_key` 为空时降级到 `avatar_url`。
- 动态作者头像通过 `author_rest_id` 关联 `x_users` 后复用同一头像规则；关联不到时降级到 `x_tweets.author_avatar_url`。
- 会员链接优先使用 `link_url`，为空时按 `https://x.com/<username>` 生成。

## Testing

- 修改本目录后至少运行：
  - `pnpm --filter @ztcj/api typecheck`
  - `pnpm --filter @ztcj/api lint`
  - `pnpm --filter @ztcj/api build`

## Change Notes

- 不在仓库内添加 migration、seed 或直接改表脚本。
- 旧 FastAdmin 对 `x_users.status` 的 `0/1` 假设与现表冲突；本实现以现表 enum 为准。
