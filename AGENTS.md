# 项目 Agent 指南

本项目使用一套轻量的、按目录作用域划分的 `SPEC.md` 工作流，供 Codex
开发时使用。

目标是让 AI 只加载当前任务真正需要的 context：先读取根目录的
`AGENTS.md`，再沿着目标文件所在路径，逐级读取简洁的 `SPEC.md`。

## 核心规则

每个有明确职责的 feature 或 domain 目录，都应该拥有一个本地 `SPEC.md`。

`SPEC.md` 不是长篇文档。它只记录安全修改当前目录所需的最小、精准
context。

处理任何任务时：

1. 先识别受影响的最小 feature/domain 目录。
2. 如果路径上存在 `SPEC.md`，按从宽到窄的顺序读取。
3. 多个 `SPEC.md` 规则重叠时，以更靠近目标文件的规则为准。
4. 只有 behavior、boundary 或 contract 发生变化时，才更新 `SPEC.md`。
5. 不加载、不修改与当前任务无关的 SPEC。

以 `src/features/users/components/user-table.tsx` 为例，context 加载顺序是：

```text
AGENTS.md
src/SPEC.md
src/features/SPEC.md
src/features/users/SPEC.md
src/features/users/components/SPEC.md
```

只读取实际存在的文件。不要为了补全示例路径而创建空泛的上层 SPEC。

## 语言约定

- 项目级说明、`SPEC.md`、任务拆解、变更说明默认使用中文。
- 技术专有名词、库名、框架名、文件名、目录名、命令、代码标识保留英文。
- 推荐写法：`feature`、`route`、`contract`、`hook`、`schema`、`API`、
  `state`、`context`、`component`。
- 不强行翻译会降低准确性的技术词，例如 `layout`、`provider`、
  `store`、`query`、`mutation`、`entry point`。
- UI 文案语言以具体业务需求为准；没有特别说明时，管理台面向中文用户。

## 目录架构

使用 feature-first 结构。每个用户可感知的能力或业务能力，都应该有独立目录。

推荐结构：

```text
src/
  features/
    <feature-name>/
      SPEC.md
      index.tsx
      components/
        SPEC.md
      data/
        SPEC.md
      hooks/
        SPEC.md
      api/
        SPEC.md
      schemas/
        SPEC.md
```

只创建当前 feature 实际需要的子目录。

只有被多个 feature 复用的代码，才放到 shared 目录：

```text
src/components/      shared app components
src/components/ui/   shadcn/Radix primitives and thin wrappers
src/hooks/           shared hooks
src/lib/             shared utilities
src/context/         app-level providers
src/stores/          shared client state
src/routes/          TanStack Router route bindings
```

`routes` 应该保持薄层。route 文件只负责把 TanStack Router 绑定到 feature
模块；具体 feature behavior 应放在 `src/features/<feature-name>/` 中。

## SPEC.md 格式

每个 `SPEC.md` 应该短、准、局部化。建议控制在 20-80 行。

使用这个结构：

```md
# <Directory Or Feature Name> SPEC

## Purpose

- 当前目录负责什么。

## Boundaries

- 什么应该放在这里。
- 什么必须放到目录外。

## Contracts

- public exports、route contract、data shape、API expectation、state rule。

## UI/UX Rules

- 当前目录特有的 interaction、layout、accessibility、visual 约束。

## Testing

- 修改当前目录时需要补充的 test 或 verification command。

## Change Notes

- 后续修改必须保留的当前决策。
```

不适用的 section 可以省略。不要粘贴从附近代码能直接看出的实现细节。

## SPEC 写作规则

- 默认中文表达，技术名词和代码标识保留英文。
- 用 bullet 表达约束，少写解释性长段落。
- 优先记录 boundary、contract、decision，而不是泛泛描述。
- 不重复代码、类型定义或可通过工具发现的文件清单。
- 不写尚未实现的愿景式要求。
- 保持 SPEC 新鲜。如果 code 和 SPEC 冲突，先检查 code，再在本次变更中同步
  SPEC。
- 不在 SPEC 中记录 secret、credential 或环境专属值。

## 新 Feature 工作流

添加新 feature 时：

1. 创建 `src/features/<feature-name>/`。
2. 添加 `src/features/<feature-name>/SPEC.md`。
3. 添加 feature entry point，通常是 `index.tsx`。
4. 在 `src/routes/` 下添加 route 文件，并导入 feature entry point。
5. route-level logic 保持最少。
6. 为被保护的行为补充聚焦的 tests。

大型 feature 可以按职责拆分本地 SPEC：

```text
src/features/<feature-name>/SPEC.md
src/features/<feature-name>/components/SPEC.md
src/features/<feature-name>/data/SPEC.md
src/features/<feature-name>/api/SPEC.md
```

不要在代码真正需要之前，把 feature 拆成过多目录。

## 现有项目约定

- 默认技术栈是 React、Vite、TanStack Router、TanStack Query、TypeScript、
  Tailwind CSS、Radix 和 shadcn-style components。
- interface action 优先使用 `lucide-react` icons。
- reusable UI primitives 放在 `src/components/ui/`。
- feature-specific components 放在对应 feature 目录内。
- tests 尽量靠近被保护的 behavior。
- 项目命令通过 `mise` 执行：
  - `mise run dev`
  - `mise run lint`
  - `mise run format:check`
  - `mise run test`
  - `mise run build`
  - `mise run ci`

## Agent 行为

编辑文件前，agent 应说明本次加载了哪些 SPEC；如果目标路径没有对应 SPEC，也要
说明。

当任务跨多个 feature 时，只加载根指南和必要的 feature SPEC。

引入新的 shared abstraction 时，需要说明为什么它应该放在 shared code，而不是
某个 feature 目录内。

如果修改了 behavior，但当前目录没有对应 SPEC，且新增或更新 SPEC 能帮助未来避免
加载无关 context，就创建或更新最近的相关 `SPEC.md`。
