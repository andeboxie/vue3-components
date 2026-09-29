# VcIcon 组件 SDD 文档

> 本文件是组件级 SDD（Specification-Driven Development）文档框架。
> 完整规格以 [`docs/stage-1-atomic/Icon.spec.md`](../../../docs/stage-1-atomic/Icon.spec.md) 为准，本文件用于组件目录内就近查阅与维护记录。
> 框架结构与总指南 [`docs/00-overview.md`](../../../docs/00-overview.md) 第三节"单组件 spec 模板"对齐。

---

## 1. 元数据

| 字段 | 值 |
|---|---|
| 组件名 | `VcIcon` |
| 分类 | 基础原子 |
| 所属阶段 | Stage-1 |
| 依赖组件 | 无 |
| 文件位置 | `src/components/icon/Icon.vue` |
| 测试文件 | `src/components/icon/Icon.test.ts` |
| composable | `src/components/icon/UseIcon.ts`（SVG 加载） |
| composable | `src/composables/useSizableStyle.ts`（尺寸/颜色样式，通用） |
| 图标目录 | `src/assets/icons/*.svg` |

---

## 2. 设计意图

提供统一的图标组件，封装 SVG 图标的渲染、尺寸控制、颜色控制。选用 inline SVG + name 引用方案（不是 iconfont、不是 `<img>`），理由：SVG 可被 CSS 控制颜色（`currentColor` + `fill`）、无需额外字体请求、树摇友好、a11y 友好。

不解决：图标库的打包与按需加载（本阶段直接 import icons 目录）；多色图标（本阶段只支持单色 currentColor，已预留 `mode` prop 供后续扩展）。

---

## 3. API 规格

### 3.1 Props

| 名称 | 类型 | 默认值 | 必填 | 行为说明 |
|---|---|---|---|---|
| `name` | `string` | - | 是 | 图标名，对应 `src/assets/icons/{name}.svg` 的文件名（不含扩展名）|
| `size` | `number \| string` | `'1em'` | 否 | 图标尺寸，number 时按 px 处理，string 时原样作为 CSS `font-size` |
| `color` | `string` | `'currentColor'` | 否 | CSS `color` 值，SVG 内部 `fill="currentColor"` |
| `spin` | `boolean` | `false` | 否 | 为 true 时图标无限旋转（class `vc-icon--spin`）|
| `ariaLabel` | `string \| undefined` | `undefined` | 否 | 装饰图标传 `undefined`，语义图标传字符串作为 `aria-label` |
| `mode` | `SvgModeState`（由 `SvgModeStateEnum` 派生，即 `'single' \| 'multi'`） | `'single'` | 否 | 预留：单色/多色模式，本阶段仅支持 `'single'`，`'multi'` 行为未实现 |

### 3.2 Emits

无。

### 3.3 Slots

无。

### 3.4 Expose

无。

---

## 4. 行为约束

> 每条行为须满足：单一职责 / 可观察 / 可翻译为 Given-When-Then。

### 4.1 渲染与 DOM

- **B-01** 根元素为 `<i>` 标签，class 始终含 `vc-icon`
- **B-02** 根元素 `aria-hidden`：当 `ariaLabel` 为 `undefined` 时为 `'true'`，否则不设 `aria-hidden` 而设 `aria-label`
- **B-03** 根元素内联 style 必含 `font-size`（size 为 number 时值为 `'{n}px'`；为 string 时原样）与 `color`（值为 color prop）
- **B-04** 根元素内部渲染 `<svg>` 子节点，`<svg>` 的 `fill` 属性为 `currentColor`
- **B-05** 当 `spin=true` 时根元素 class 含 `vc-icon--spin`

### 4.2 图标加载

- **B-06** 当 `name` 对应的 SVG 文件存在时，渲染对应 SVG 内容
- **B-07** 当 `name` 不存在对应 SVG 时，渲染空 `<i>`（不报错、不抛异常，便于生产环境降级）

### 4.3 尺寸与颜色

- **B-08** `size` 为 number `16` 时，根元素 `style.font-size` 为 `'16px'`
- **B-09** `size` 为 string `'2rem'` 时，根元素 `style.font-size` 为 `'2rem'`
- **B-10** `color` 为 `'red'` 时，根元素 `style.color` 为 `'red'`
- **B-11** SVG 内部 `<path>` 等元素的 `fill` 继承自父（`fill="currentColor"`），随根元素 `color` 变化

### 4.4 旋转

- **B-12** `spin=true` 时，根元素有 `vc-icon--spin` class，CSS 动画让 SVG 旋转（CSS 不在测试范围，只测 class）

---

## 5. 边界条件与异常

### 5.1 边界条件

- **E-01** `size` 为负数：照常渲染（CSS 自行处理，组件不做校验）
- **E-02** `color` 为非法颜色字符串：CSS 自行降级，组件不做校验
- **E-03** `name` 为空字符串 `''`：渲染空 `<i>`，不报错
- **E-04** `ariaLabel` 传空字符串 `''`：视为有值（设置 `aria-label=""`），与 `undefined` 不同（实现用 `!== undefined` 判断）

### 5.2 不需要处理（避免过度工程）

- 不做图标库打包与按需加载（本阶段直接全量 glob）
- 不做多色图标（已预留 `mode` prop，本阶段不实现 `'multi'` 行为）
- 不做 size / color 运行时校验

---

## 6. 可访问性（a11y）

- **A-01** 装饰图标（`ariaLabel` 为 `undefined`）：根元素 `aria-hidden="true"`，屏幕阅读器跳过
- **A-02** 语义图标（`ariaLabel` 有值）：根元素 `aria-label` 为该值，不设 `aria-hidden`
- **A-03** SVG 本身不设 `title` 子元素（避免与 `aria-label` 重复朗读）

---

## 7. 测试用例清单

> 优先级：P0 必做 / P1 应做 / P2 可选

| 编号 | 关联行为 | Given | When | Then | 优先级 |
|---|---|---|---|---|---|
| T-01 | B-01 | mount，`{ name: 'check' }` | 取根元素 | tagName 为 `I`，class 含 `vc-icon` | P0 |
| T-02 | B-02 | mount，不传 `ariaLabel` | 取 `aria-hidden` | 为 `'true'` | P0 |
| T-03 | B-02 | mount，`{ ariaLabel: '保存' }` | 取 `aria-label` | 为 `'保存'`，且无 `aria-hidden` | P0 |
| T-04 | B-03 | mount，`{ name: 'check' }` | 取 style | 含 `font-size` 与 `color` | P0 |
| T-05 | B-04 | mount，`{ name: 'check' }` | 查找内部 `<svg>` | 存在，且 `fill` 为 `'currentColor'` | P0 |
| T-06 | B-05 | mount，`{ name: 'check', spin: true }` | 取 class | 含 `vc-icon--spin` | P0 |
| T-07 | B-06 | mount，`{ name: 'check' }`（存在）| 查找 svg | 存在 | P0 |
| T-08 | B-07 | mount，`{ name: 'not-exist' }`（不存在）| 查找 svg | 不存在，组件不报错 | P1 |
| T-09 | B-08 | mount，`{ name: 'check', size: 16 }` | 取 `style.font-size` | 为 `'16px'` | P0 |
| T-10 | B-09 | mount，`{ name: 'check', size: '2rem' }` | 取 `style.font-size` | 为 `'2rem'` | P1 |
| T-11 | B-10 | mount，`{ name: 'check', color: 'red' }` | 取 `style.color` | 为 `'red'` | P0 |
| T-12 | B-11 | mount，`{ name: 'check', color: 'red' }` | 取 svg `fill` | 为 `'currentColor'` | P1 |
| T-14 | E-03 | mount，`{ name: '' }` | 查找 svg | 不存在，根元素仍含 `vc-icon` | P1 |

> T-13 / T-15 / T-16 与 T-06 / T-02 / T-03 等价，已合并，不再独立编号。

---

## 8. 实现提示

> 不给完整代码，只给关键提示。

### 8.1 组件骨架

script setup + TS：`defineOptions` 命名 VcIcon；`withDefaults(defineProps<IconProps>())` 提供全部默认值。模板为单个 `<i>`，通过 `v-html` 注入 SVG 字符串。

### 8.2 关键提示

- SVG 加载用 Vite 的 `import.meta.glob('../../assets/icons/*.svg', { eager: true, query: '?raw', import: 'default' })`，模块级只执行一次（相对 UseIcon.ts 所在目录）
- `v-html` 用于 SVG 是安全的（来自本地静态文件）
- `ariaLabel` 判断必须用 `!== undefined`，不能用 `||`（空字符串 `''` 是 falsy 但 spec E-04 要求视为有值）
- size 转 style：number → `'{n}px'`，string → 原样
- `aria-hidden` / `aria-label` 二选一，不能同时出现

### 8.3 测试骨架提示

使用 `@vue/test-utils` 的 `mount`。断言区分：class 用 `classes()`、HTML 属性用 `attributes()`、标签用 `element.tagName`、style 用 `element.style.fontSize` / `element.style.color`、子节点用 `find('svg')`。测试依赖 `src/assets/icons/check.svg` 文件存在（不在测试里 mock，走真实加载）。

### 8.4 重构方向

- SVG 加载逻辑已抽到 `UseIcon.ts` 的 `useIcon()` composable（已完成）
- size/color 样式计算已抽到通用 `useSizableStyle.ts` composable（已完成，使用 `MaybeRefOrGetter` + `toValue`）
- 后续支持多色图标时，扩展 `mode` prop 的 `'multi'` 分支逻辑（当前仅预留类型）

---

## 9. 完成自查

- [x] 装饰图标与语义图标的 a11y 行为不同（aria-hidden vs aria-label）
- [x] size number / string 两种类型都正确处理
- [x] name 不存在时不报错
- [x] spin class 正确添加
- [x] 没有实现多色、图标库打包等 spec 未要求的功能

---

## 10. 变更记录

| 版本 | 日期 | 变更说明 |
|---|---|---|
| 0.0.0 | 2026-09-28 | 初始框架 |
| 0.1.0 | 2026-09-28 | 按 spec 填充全部章节；实现与测试（T-01 ~ T-12, T-14）完成并通过；完成重构方向 A（useIcon）与 B（useSizableStyle），预留 C（mode prop，引用 `SvgModeStateEnum`）；图标目录从 `src/components/icon/icons/` 迁移至 `src/assets/icons/` |
