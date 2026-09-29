# vue3-components

Vue 3 + TypeScript 组件库学习项目，采用 SDD（规格驱动开发）+ TDD（测试驱动开发）流程：先写规格（spec），再写测试确认红灯，最后最小实现转绿并重构。

## 技术栈

| 类别 | 选型 |
|---|---|
| 框架 | Vue 3.5 + TypeScript 6.0 |
| 构建 | Vite 8 + vue-tsc（类型检查） |
| 测试 | Vitest 5 + @vue/test-utils + jsdom |
| 样式 | SCSS，全局变量集中在 `src/styles/variables.scss` |

## 快速开始

```bash
pnpm install      # 安装依赖（项目使用 pnpm）
pnpm dev          # 启动开发服务器
pnpm test         # 运行全部测试（单次）
pnpm test:watch   # 监听模式运行测试
pnpm build        # 类型检查 + 打包
```

## 目录结构

```text
src/
├── components/            # 组件，每个组件一个目录
│   └── button/            # Button.vue / ButtonProps.ts / Button.test.ts / README.md
├── enums/                 # 枚举常量（const 对象 + as const + 派生 union 类型）
└── styles/                # 全局样式与变量
docs/
├── 00-overview.md         # 总指南（SDD 流程与模板）
└── stage-1-atomic/        # 原子组件规格
```

## 组件清单

| 组件 | 状态 | 规格 |
|---|---|---|
| VcButton | 测试通过（T-01 ~ T-18） | `docs/stage-1-atomic/Button.spec.md` |
| Typography | 测试通过（VcTitle / VcText / VcParagraph） | `docs/stage-1-atomic/Typography.spec.md` |
| Icon | 测试通过 | `docs/stage-1-atomic/Icon.spec.md` |

## 约定

- 组件命名：`Vc` 前缀（如 `VcButton`），class 采用 BEM 风格 `vc-{组件}__元素--修饰符`
- 文件命名：组件相关文件用 PascalCase（如 `ButtonProps.ts`），导入路径的大小写必须与磁盘文件名完全一致
- 枚举：使用 const 对象 + `as const`，不使用 enum 语法（`erasableSyntaxOnly` 约束）
- 样式：写在组件 `.vue` 文件的 `<style lang="scss" scoped>` 内，现阶段全量载入

## 已知事项

- 根 `tsconfig.json` 为 solution-style（`files: []` + `references`），`type-check` / `build` 脚本已统一用 `vue-tsc -b`（build 模式走 references），`--noEmit` 直接跑会是空检查，不要回退
- TypeScript 6.0 已将 `baseUrl` 列为硬性弃用错误（TS5101），路径别名只配置 `paths`（相对 tsconfig 所在目录解析）
