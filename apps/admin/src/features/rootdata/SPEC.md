# Rootdata Feature SPEC

## Purpose

- 实现旧版“资料管理”的项目管理、人物管理、机构管理页面。
- 项目详情负责基础资料、社交媒体、投资轮次、重大事件、新闻动态、团队成员、对外投资和合约。
- 人物详情负责基础资料、工作经历和对外投资。
- 机构详情负责基础资料、团队成员和对外投资。

## Boundaries

- feature-specific API、schema、query hook 和页面组件放在本目录内。
- route 文件只绑定 TanStack Router search schema 与 feature entry point。
- 旧库 JSON/text 字段转换、跨表同步和唯一 ID 生成都由 API 负责，前端不直接拼 SQL。
- 图片上传暂不在本 feature 内实现；当前只编辑图片 URL/路径字段。

## Contracts

- API base path 是 `/rootdata`。
- 实体类型使用 `1=项目`、`2=机构`、`3=人物`。
- 显示/状态类字段使用 `1=显示/正常/是`、`0=隐藏/否`。
- 项目、人物、机构编辑提交完整表单；后端保留已有业务 ID，不在编辑时重生成。
- 团队成员、任职经历、融资轮次等会触发跨表同步，必须通过对应 API mutation。

## UI/UX Rules

- 删除必须二次确认。
- mutation 期间提交按钮 disabled，并通过 toast 反馈结果。
- 表格保持 server-side pagination/filter；URL search state 是查询参数来源。
- 项目、机构列表和详情必须展示 `logo`；人物列表和详情必须展示 `headImg`。
- 创建/编辑表单中与前端校验一致的必填项必须有可见“必填”提示。
- 列表与详情集合表的行级操作使用折叠菜单；每个菜单项必须同时有中文文本和图标。

## Testing

- 修改本目录后至少运行：
  - `pnpm --filter @ztcj/admin typecheck`
  - `pnpm --filter @ztcj/admin lint`

## Change Notes

- 当前第一版不复刻旧版上传/选择弹窗，选择器使用 API 搜索或直接输入旧库业务 ID。
- 不复刻旧版硬编码 `wfadmin.com` URL 和编辑项目时重生成 `project_id` 的行为。
