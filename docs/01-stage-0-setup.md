# 第 0 阶段：环境搭建

> 目标：把项目从"纯 Vite + TS 模板"改造为"Vue3 + TS + Vitest 的组件库开发环境"。
> 本阶段不写任何组件代码，只搭环境与配置。完成后你可以用 `pnpm test` 跑出一个空的可执行测试。

***

## 0.1 前置检查

- Node 版本：建议 >= 18（Vite 8 要求 Node 20+，请确认本机 Node 版本）
- 包管理器：推荐 `pnpm`，本指南所有命令以 pnpm 为例；用 npm/yarn 自行替换即可
- 编辑器：VSCode + Volar 扩展（Vue3 官方语法支持）

```powershell
node -v
pnpm -v
```

***

## 0.2 依赖清单

### 0.2.1 运行时依赖（dependencies）

| 包     | 版本   | 用途   |
| ----- | ---- | ---- |
| `vue` | ^3.5 | 框架本体 |

### 0.2.2 开发依赖（devDependencies）

| 包                           | 版本      | 用途                                   |
| --------------------------- | ------- | ------------------------------------ |
| `vite`                      | ^8.3.0  | 构建工具本体（Vite 8 要求 Node 20+）           |
| `@vitejs/plugin-vue`        | ^6.0.9  | 让 Vite 能编译 `.vue` 文件                 |
| `typescript`                | ~6.0.2  | TS 编译器本体（6.x 把 `baseUrl` 列为硬性弃用错误）  |
| `vue-tsc`                   | ^3.3.11 | 对 `.vue` 做 TS 类型检查（替代 tsc 用于 build）  |
| `vitest`                    | ^5.0.2  | 测试框架，与 Vite 共享配置                     |
| `@vue/test-utils`           | ^2.5.1  | Vue3 官方组件挂载与断言工具                     |
| `jsdom`                     | ^30.1.1 | 在 Node 里提供 DOM 环境                    |
| `@testing-library/jest-dom` | ^7.0.1  | 提供 `toBeVisible`、`toHaveClass` 等断言扩展 |
| `@types/node`               | ^26.6.3 | Node 类型声明（tsconfig.node.json 需要）     |
| `sass`                      | ^1.105.0 | 写组件样式（可选，也可纯 CSS）                   |

> 上表为阶段 0/1 实际锁定版本。新机器安装以最新稳定版为准，但注意 vite 8 / vitest 5 / vue-tsc 3 / TS 6 的大版本组合已验证可跑通。
> `@testing-library/vue` 原列"可选"，实际未安装，本库测试全程用 `@vue/test-utils`，无需引入。

### 0.2.3 安装命令（参考）

```powershell
pnpm add vue
pnpm add -D vite typescript @vitejs/plugin-vue vue-tsc vitest @vue/test-utils jsdom @testing-library/jest-dom @types/node sass
```

***

## 0.3 配置文件改造

### 0.3.1 `vite.config.ts`（在项目根目录新建）

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
})
```

### 0.3.2 `tsconfig.json` 改造

当前 `tsconfig.json` 缺少 Vue3 所需配置。改造方向（本库已采用手写路线，未引入 `@vue/tsconfig`）：

- `include` 加入 `src/**/*.vue`
- `compilerOptions.types` 加入 `"vitest/globals"`（如使用全局 API）
- 手写以下选项：
  - `"jsx": "preserve"`
  - `"jsxImportSource": "vue"`
  - `"lib": ["ES2023", "DOM", "DOM.Iterable"]`
  - `"verbatimModuleSyntax": true`（保留）
- 拆分 `tsconfig.app.json`（浏览器环境代码）与 `tsconfig.node.json`（Node 环境配置文件），根 `tsconfig.json` 改为 solution-style：
  ```json
  {
    "files": [],
    "references": [
      { "path": "./tsconfig.app.json" },
      { "path": "./tsconfig.node.json" }
    ]
  }
  ```

**硬性约束（TS 6.0 踩坑沉淀）**：

- **不要写 `baseUrl`**。TS 6.0 把 `baseUrl` 列为硬性弃用错误（TS5101），直接报红。`paths` 在 TS 4.1+ 已支持相对 `tsconfig` 所在目录解析，无需 `baseUrl` 锚定。
- 因为根 `tsconfig.json` 是 solution-style（`files: []` + `references`），`vue-tsc --noEmit` 直接跑会变成**空检查**（不读 references）。所以 `type-check` / `build` 脚本必须用 `vue-tsc -b`（build 模式走 references），详见 0.3.5。
- `tsconfig.app.json` 与 `tsconfig.node.json` 都需设 `"composite": true`（被 references 引用的前提），并各自配 `"tsBuildInfoFile"` 指向 `node_modules/.tmp/` 下，避免污染源码目录。

### 0.3.3 `vitest.config.ts`（与 vite.config 合并或单独）

推荐与 vite 配置合并，直接写在 `vite.config.ts` 里。注意从 `vitest/config` 导入 `defineConfig`（类型已内置，无需 `/// <reference types="vitest" />`），并加 `resolve.alias` 与 `tsconfig` 的 `paths` 对齐：

```ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

> 说明：0.3.1 的最简 `vite.config.ts` 是 dev 起步用；一旦接入 vitest，直接合并成上面这份即可，不再保留两份配置。
> 测试文件里若用 `@/` 别名，vitest 的 glob 路径 key 偶尔会出现大小写/格式不一致，建议测试用相对路径导入组件，`@/` 仅用于非 glob 场景。

### 0.3.4 `vitest.setup.ts`（项目根目录新建）

```ts
import '@testing-library/jest-dom'
// 后续可在此注入全局 mock、组件库全局插件等
```

### 0.3.5 `package.json` 脚本

替换 `scripts`（注意 `type-check` / `build` 用 `vue-tsc -b`，不是 `--noEmit`）：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "type-check": "vue-tsc -b"
  }
}
```

> 为什么用 `-b`：根 `tsconfig.json` 是 solution-style（`files: []` + `references`），`--noEmit` 直接跑不读 references，等于空检查。`-b` 走 build 模式才会真正检查 `tsconfig.app.json` / `tsconfig.node.json` 引用链。若想手动单查 app 配置，可用 `npx vue-tsc --noEmit -p tsconfig.app.json`。

***

## 0.4 目录骨架

按总指南 [第四节](./00-overview.md#四命名与目录约定) 约定的目录结构创建空目录与占位文件：

```
src/
├── components/           # 组件源码
├── composables/          # 组合式函数
├── utils/                # 工具函数
├── styles/               # 全局样式
│   ├── variables.scss    # 全局变量（颜色、字号、间距）
│   ├── mixins.scss       # 全局混入（如响应式布局）
│   └── index.scss        # 全局样式入口（被 build 注入到 dist/style.css）
└── index.ts              # 库入口（占位）
```

把模板原有的 `src/main.ts`、`src/counter.ts`、`src/style.css` 删掉或迁移到 `playground/`（如果你想留个 demo 入口）。

***

## 0.5 样式架构约定

### 0.5.1 载入策略（先定方案 A，预留方案 B）

- **现阶段**：采用方案 A（全量载入）。组件库 build 时把所有组件的样式合并输出到单一 `dist/style.css`，使用方一次性 `import 'vue3-components/dist/style.css'` 即可
- **未来扩展**：等组件数超过 10 个或阶段 3 之后，再升级到方案 B（按组件单独输出 css，使用方按需 import），不需要改组件源码，只改 `vite.config.ts` 的 lib 配置
- **本阶段不实现**：方案 C（样式内联到 JS 自动注入）、方案 D（Headless）

### 0.5.2 文件组织

| 文件                                                                 | 职责                                                             |
| ------------------------------------------------------------------ | -------------------------------------------------------------- |
| `src/styles/variables.scss`                                        | 全局 SCSS 变量（颜色、字号、间距、行高），所有组件 `@use` 引用                         |
| `src/styles/mixins.scss`                                           | 公共 mixin（如 `ellipsis($lines)`、`clearfix()`），所有组件 `@use` 引用     |
| `src/styles/index.scss`                                            | 全局样式入口，`@use` 所有公共文件 + reset/base，被 build 注入到 `dist/style.css` |
| `src/components/<name>/<Name>.vue` 中的 `<style lang="scss" scoped>` | 组件自身样式，仅作用于本组件                                                 |

### 0.5.3 class 命名约定（BEM 风格）

- 命名空间：所有 class 必须以 `vc-` 前缀开头
- 结构：`vc-{组件名}` + `vc-{组件名}__{元素}` + `vc-{组件名}--{修饰符}`
- 示例（Button）：
  - 根：`vc-button`
  - 修饰符：`vc-button--primary` / `vc-button--large` / `vc-button--disabled`
  - 子元素：`vc-button__loading`（加载图标容器）
- 一致性要求：阶段 1-4 所有组件严格遵守该前缀与结构，便于使用方覆盖样式

### 0.5.4 `<style>` 标签约定

- 组件内统一用 `<style lang="scss" scoped>`，避免样式泄漏到全局
- 若组件需要全局样式（如 Dialog 的 portal 样式），单独写 `<style lang="scss">`（不带 scoped）并加 BEM 前缀
- 组件内不要硬编码颜色 / 字号，必须从 `src/styles/variables.scss` 引用：
  ```scss
  @use '../../styles/variables.scss' as *;
  .vc-button {
    color: $color-primary;
  }
  ```

### 0.5.5 全局变量最小集（占位，后续阶段细化）

`src/styles/variables.scss` 至少包含以下变量（值可先写默认，后续阶段调整）：

```scss
// 颜色
$color-primary: #1677ff;
$color-success: #00b42a;
$color-warning: #ff7d00;
$color-danger:  #f53f3f;
$color-default: #1d2129;
$color-muted:   #86909c;

// 字号
$font-size-small:  12px;
$font-size-body:  14px;
$font-size-lead:  16px;
$font-size-title: 20px;

// 间距
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 12px;
$spacing-lg: 16px;

// 圆角
$radius-sm: 2px;
$radius-md: 4px;
$radius-lg: 8px;

// 过渡
$transition-fast: 0.15s ease-in-out;
```

### 0.5.6 build 产物预期

- `pnpm build` 后 `dist/` 下应有：
  - `dist/index.js`（或 `.cjs` / `.mjs`，取决于 lib 配置）—— 组件 JS
  - `dist/style.css` —— 全部组件样式合并产物
  - `dist/index.d.ts` —— 类型声明
- 使用方载入方式：`import 'vue3-components/dist/style.css'`
- 详细的 lib 模式配置在阶段 1 完成后写进本文件的新增章节

***

## 0.6 验收清单（自检）

完成第 0 阶段后，逐项确认：

- [x] `pnpm install` 成功，无报错
- [x] `pnpm dev` 能启动 Vite，浏览器打开无报错（页面可以空白，只要不报错）
- [x] `pnpm test` 能跑通一个**虚拟测试**（先写一个空 `describe` 占位测试）
- [x] `pnpm type-check` 通过
- [x] 项目根目录有 `vite.config.ts` / `vitest.setup.ts`
- [x] `src/components/` 等目录已建好

### 0.6.1 占位测试样例

在 `src/components/__placeholder__.test.ts` 写：

```ts
import { describe, it, expect } from 'vitest'

describe('环境自检', () => {
  it('vitest 可用', () => {
    expect(1 + 1).toBe(2)
  })
})
```

跑 `pnpm test` 应该看到 1 passed。跑通后把这个文件删掉。

***

## 0.7 常见坑提醒

- **Node 版本太低**：Vite 8 要求 Node 20+，低于此版本会启动失败
- **`tsconfig`** **没加** **`.vue`**：导致 vue-tsc 报"找不到模块"
- **`vitest`** **没设** **`environment: 'jsdom'`**：组件挂载时找不到 `document`
- **`setupFiles`** **路径错误**：相对路径写错会让 `toHaveClass` 等 matcher 不可用
- **同时装了 jest**：vitest 不需要 jest，二者并存会让 IDE 混淆类型
- **`@use`** **与** **`@import`** **混用**：dart-sass 推荐用 `@use`，`@import` 已废弃但仍能用，混用会导致同名变量被多次声明报错
- **scoped 样式里的变量报"未定义"**：scoped 不影响 `@use` 引用全局变量，但要确保 `variables.scss` 文件路径正确，且用 `as *` 别名引入
- **BEM 前缀忘加**：组件 class 没加 `vc-` 前缀，使用方覆盖样式时会与自身代码冲突
- **Vetur 扩展接管 .vue**：IDE 若装了 Vetur（Vue2 扩展），会接管 `.vue` 导致 `@/` 别名在 `.vue` 里报 `Cannot find module`（相对路径正常、`.ts` 正常、CLI 正常）。需禁用 Vetur，改装官方 Vue - Official (Volar) 扩展
- **TS 6.0 写了 `baseUrl`**：TS 6.0 把 `baseUrl` 列为硬性弃用错误（TS5101），直接报红。删掉 `baseUrl`，`paths` 相对 tsconfig 所在目录解析即可
- **solution-style tsconfig 跑 `--noEmit` 是空检查**：根 `tsconfig.json` 为 `files: []` + `references` 时，`vue-tsc --noEmit` 不读 references，等于没检查。脚本必须用 `vue-tsc -b`，详见 0.3.2 / 0.3.5
- **用了编译器宏却写普通 `<script lang="ts">`**：组件里用了 `defineProps` / `withDefaults` / `defineOptions` 等编译器宏，却用普通 `<script lang="ts">` 块，会报"类型上不存在属性 xxx"。必须改用 `<script setup lang="ts">`，约定见总指南第四节
- **Vitest 下 `@/` 别名的 glob 路径 key 不一致**：测试文件用 `@/` 导入时，vitest 的 glob 路径 key 偶尔出现大小写/格式不一致。建议测试用相对路径导入组件，`@/` 仅用于非 glob 场景

