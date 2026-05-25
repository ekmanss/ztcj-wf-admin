# KOL Feature SPEC

## Purpose

- `kol` 负责后台 `KOL管理` 下的 `会员管理` 与 `KOL动态` 页面。
- 数据通过 API `/api/kol/*` 读写旧库 `x_users` 与 `x_tweets`。

## Boundaries

- KOL 专属 table、dialog、schema、query hook 和 API client 放在本目录。
- route 文件只绑定 TanStack Router search schema 与 feature entry point。
- 不把 KOL 页面组件抽到 shared components，除非后续多个 feature 明确复用。

## Contracts

- `x_users.rest_id` 是 KOL 会员主键，前端字段名为 `restId`。
- `x_tweets.tweet_rest_id` 是 KOL 动态主键，前端字段名为 `tweetRestId`。
- 会员状态使用 `1=显示`，`2=隐藏`；这是现表 enum，不沿用旧 FastAdmin 的 `0=隐藏` 假设。
- 动态状态使用 `1=显示`，`0=隐藏`。
- 会员头像显示使用 API 返回的 `displayAvatarUrl`，其来源优先级是 `https://cdn.woofunapi.com/<avatar_s3_key>`，再降级 `avatar_url`。
- 动态作者头像使用 API 返回的 `authorAvatarUrl`，后端会优先复用关联 `x_users` 的 CDN 头像规则。
- 会员链接优先 `displayLinkUrl`。

## UI/UX Rules

- 管理台面向中文用户，页面标题、筛选、批量操作和弹窗默认中文。
- 动态详情以可读推文卡片呈现，并提供原文链接。
- 删除操作必须二次确认，批量删除使用固定确认词。

## Testing

- 修改本目录后至少运行：
  - `pnpm --filter @ztcj/admin typecheck`
  - `pnpm --filter @ztcj/admin lint`

## Change Notes

- 第一版不实现头像上传、动态导入或同步任务触发，只做管理台 CRUD/状态/详情闭环。
