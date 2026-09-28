# Icon 组件规格

## 元数据

| 字段 | 值 |
|---|---|
| 组件名 | `VcIcon` |
| 分类 | 基础原子 |
| 所属阶段 | Stage-1 |
| 依赖组件 | 无 |
| 文件位置 | `src/components/icon/Icon.vue` |
| 测试文件 | `src/components/icon/Icon.test.ts` |

---

## 设计意图

提供一个统一的图标组件，封装 SVG 图标的渲染、尺寸控制、颜色控制。

**设计取舍**：本阶段选用 **inline SVG + name 引用** 方案（不是 iconfont、不是 `<img>`）。理由：

- SVG 可被 CSS 控制颜色（`currentColor` + `fill`）
- 无需额外字体请求
- 树摇友好
- a11y 友好（自带 `<svg>` 语义）

**不解决**：图标库的打包与按需加载（本阶段直接 import 一个 icons 目录）；多色图标（本阶段只支持单色 currentColor）。

---

## API 规格

### Props

| 名称 | 类型 | 默认值 | 必填 | 行为说明 |
|---|---|---|---|---|
| `name` | `string` | - | 是 | 图标名，对应 `src/components/icon/icons/{name}.svg` 的文件名（不含扩展名）|
| `size` | `number \| string` | `'1em'` | 否 | 图标尺寸，传 number 时按 px 处理，传 string 时原样作为 CSS `width`/`height` |
| `color` | `string` | `'currentColor'` | 否 | 图标颜色，CSS `color` 值，SVG 内部 `fill="currentColor"` |
| `spin` | `boolean` | `false` | 否 | 为 `true` 时图标无限旋转（class `vc-icon--spin`） |
| `ariaLabel` | `string \| undefined` | `undefined` | 否 | 装饰图标传 `undefined`，语义图标传字符串作为 `aria-label` |

### Emits

无。

### Slots

无。

### Expose

无。

---

## 行为约束

### 渲染与 DOM

- **B-01** 根元素为 `<i>` 标签，class 始终含 `vc-icon`
- **B-02** 根元素 `aria-hidden`：当 `ariaLabel` 为 `undefined` 时为 `'true'`，否则不设 `aria-hidden` 而设 `aria-label`
- **B-03** 根元素内联 style 必含 `font-size`（size 为 number 时值为 `'{n}px'`；为 string 时原样）与 `color`（值为 color prop）
- **B-04** 根元素内部渲染 `<svg>` 子节点，`<svg>` 的 `fill` 属性为 `currentColor`
- **B-05** 当 `spin=true` 时根元素 class 含 `vc-icon--spin`

### 图标加载

- **B-06** 当 `name` 对应的 SVG 文件存在时，渲染对应 SVG 内容
- **B-07** 当 `name` 不存在对应 SVG 时，渲染空 `<i>`（不报错、不抛异常，便于生产环境降级）

### 尺寸与颜色

- **B-08** `size` 为 number `16` 时，根元素 `style.font-size` 为 `'16px'`
- **B-09** `size` 为 string `'2rem'` 时，根元素 `style.font-size` 为 `'2rem'`
- **B-10** `color` 为 `'red'` 时，根元素 `style.color` 为 `'red'`
- **B-11** SVG 内部 `<path>` 等元素的 `fill` 继承自父（`fill="currentColor"`），随根元素 `color` 变化

### 旋转

- **B-12** `spin=true` 时，根元素有 `vc-icon--spin` class，CSS 动画让 SVG 旋转（CSS 不在测试范围，只测 class）

---

## 边界条件与异常

- **E-01** `size` 为负数：照常渲染（CSS 自行处理，组件不做校验）
- **E-02** `color` 为非法颜色字符串：CSS 自行降级，组件不做校验
- **E-03** `name` 为空字符串 `''`：渲染空 `<i>`，不报错
- **E-04** `ariaLabel` 传空字符串 `''`：视为有值（设置 `aria-label=""`），与 `undefined` 不同

---

## 可访问性（a11y）

- **A-01** 装饰图标（`ariaLabel` 为 `undefined`）：根元素 `aria-hidden="true"`，屏幕阅读器跳过
- **A-02** 语义图标（`ariaLabel` 有值）：根元素 `aria-label` 为该值，不设 `aria-hidden`
- **A-03** SVG 本身不设 `title` 子元素（避免与 `aria-label` 重复朗读）

---

## 测试用例清单

| 编号 | 关联行为 | Given | When | Then | 优先级 |
|---|---|---|---|---|---|
| T-01 | B-01 | mount，props `{ name: 'check' }`（前提：check.svg 已存在） | 取根元素 | tagName 为 `I`，class 含 `vc-icon` | P0 |
| T-02 | B-02 | mount，`ariaLabel` 不传 | 取 `aria-hidden` 属性 | 为 `'true'` | P0 |
| T-03 | B-02 | mount，props `{ ariaLabel: '保存' }` | 取 `aria-label` 属性 | 为 `'保存'`，且无 `aria-hidden` | P0 |
| T-04 | B-03 | mount，props `{ name: 'check' }` | 取 style | 含 `font-size` 与 `color` | P0 |
| T-05 | B-04 | mount，props `{ name: 'check' }` | 查找内部 `<svg>` | 存在，且 `fill` 为 `'currentColor'` | P0 |
| T-06 | B-05 | mount，props `{ name: 'check', spin: true }` | 取根元素 class | 含 `vc-icon--spin` | P0 |
| T-07 | B-06 | mount，props `{ name: 'check' }`（存在） | 查找 svg | 存在 | P0 |
| T-08 | B-07 | mount，props `{ name: 'not-exist' }`（不存在） | 查找 svg | 不存在，组件不报错 | P1 |
| T-09 | B-08 | mount，props `{ name: 'check', size: 16 }` | 取 `style.font-size` | 为 `'16px'` | P0 |
| T-10 | B-09 | mount，props `{ name: 'check', size: '2rem' }` | 取 `style.font-size` | 为 `'2rem'` | P1 |
| T-11 | B-10 | mount，props `{ name: 'check', color: 'red' }` | 取 `style.color` | 为 `'red'` | P0 |
| T-12 | B-11 | mount，props `{ name: 'check', color: 'red' }` | 取 svg 内 path 的 `fill` | 为 `'currentColor'`（由 SVG 模板保证）| P1 |
| T-13 | B-12 | 同 T-06 | 同 T-06 | 同 T-06 | P0（与 T-06 等价，可合并）|
| T-14 | E-03 | mount，props `{ name: '' }` | 查找 svg | 不存在，根元素仍含 `vc-icon` | P1 |
| T-15 | A-01 | 同 T-02 | 同 T-02 | 同 T-02 | P0（与 T-02 等价）|
| T-16 | A-02 | 同 T-03 | 同 T-03 | 同 T-03 | P0（与 T-03 等价）|

> 提示：T-13 / T-15 / T-16 是与 B 行为等价的 a11y 表述，可合并；如想分开测，独立编号即可。

---

## 实现提示

### 1. SVG 加载方案

Vue3 + Vite 推荐用 Vite 的 `import.meta.glob` 加载所有 SVG：

```ts
// 伪代码，仅说明思路
const modules = import.meta.glob('./icons/*.svg', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>
// 通过 name 找到对应 SVG 文本
```

把 SVG 文本直接 v-html 到 `<i>` 内部即可。注意：

- SVG 文本里的 `fill` 应统一替换为 `currentColor`（或加载时就用 `?raw` 拿原文，原文里 `fill` 必须是 `currentColor`）
- 测试时 `import.meta.glob` 会被 Vitest 自动处理（Vite 共享配置），不需额外 mock

### 2. 测试时如何准备 SVG

在 `src/components/icon/icons/` 下放一个 `check.svg`：

```xml
<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
```

测试依赖此文件存在；不在测试里 mock，走真实加载。

### 3. 组件骨架

```vue
<script setup lang="ts">
const props = withDefaults(defineProps<{
  name: string
  size?: number | string
  color?: string
  spin?: boolean
  ariaLabel?: string
}>(), {
  size: '1em',
  color: 'currentColor',
  spin: false,
})
// computed: svgContent / ariaAttrs / rootStyle / rootClass
</script>

<template>
  <i :class="rootClass" :style="rootStyle" v-bind="ariaAttrs" v-html="svgContent" />
</template>
```

### 4. 关键提示

- 不要直接给根元素加 `aria-hidden="true"` 硬编码，要按 `ariaLabel` 是否为 `undefined` 来切换
- `size` 为 number 时转 `'16px'`，为 string 时直接用，用 computed 统一处理
- v-html 用于 SVG 是安全的（来自本地静态文件），但仍要确保 SVG 文本不会被外部篡改
- 测试里 `wrapper.find('svg').attributes('fill')` 取 SVG 根的 fill 属性

### 5. 重构方向

- 把 SVG 加载逻辑抽到 `useIcon()` composable
- 把 rootStyle 计算抽到一个通用 `useSizableStyle`
- 如果后续要支持多色图标，预留 `mode: 'single' | 'multi'` prop（本阶段不实现）

---

## 完成后自查

- [ ] 装饰图标与语义图标的 a11y 行为不同（aria-hidden vs aria-label）
- [ ] size number / string 两种类型都正确处理
- [ ] name 不存在时不报错
- [ ] spin class 正确添加
- [ ] 没有实现多色、图标库打包等 spec 未要求的功能
