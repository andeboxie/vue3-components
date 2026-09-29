# VcTitle 组件 SDD 文档

> 本文件是组件级 SDD（Specification-Driven Development）文档。
> 完整规格以 [`docs/stage-1-atomic/Typography.spec.md`](../../../../docs/stage-1-atomic/Typography.spec.md) 为准。
> 框架结构与总指南 [`docs/00-overview.md`](../../../../docs/00-overview.md) 第三节"单组件 spec 模板"对齐。

---

## 1. 元数据

| 字段 | 值 |
|---|---|
| 组件名 | `VcTypographyTitle` |
| 分类 | 基础原子（Typography 子组件） |
| 所属阶段 | Stage-1 |
| 依赖组件 | 无 |
| 文件位置 | `src/components/typography/title/Title.vue` |
| 测试文件 | `src/components/typography/Typography.test.ts` |
| composable | `src/composables/UseTypography.ts`（修饰符 class） |
| composable | `src/composables/UseSizableStyle.ts`（size 样式，通用） |

---

## 2. 设计意图

排版组件族的标题组件，渲染语义化 `<h1>`~`<h5>`，封装 level 到标签与样式的映射，以及对齐、截断、加粗、斜体、颜色等修饰符。

不解决：富文本编辑、HTML 安全转义、中英文混排微调。

---

## 3. API 规格

### 3.1 Props

| 名称 | 类型 | 默认值 | 必填 | 行为说明 |
|---|---|---|---|---|
| `level` | `1 \| 2 \| 3 \| 4 \| 5`（由 `TitleLevelEnum` 派生） | `1` | 否 | 渲染 `<h1>`~`<h5>`，class 加 `vc-title--{level}` |
| `component` | `string \| Component` | - | 否 | 覆盖 level 决定的标签（仍应用 level 对应的 class） |
| `align` | `'left' \| 'center' \| 'right'`（由 `AlignStateEnum` 派生） | `'left'` | 否 | 文本对齐，class 加 `vc-title--{align}` |
| `truncate` | `boolean` | `false` | 否 | 单行截断，class 加 `vc-title--truncate` |
| `strong` | `boolean` | `false` | 否 | 加粗，class 加 `vc-title--strong` |
| `italic` | `boolean` | `false` | 否 | 斜体，class 加 `vc-title--italic` |
| `color` | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger' \| 'muted'`（由 `TextColorEnum` 派生） | `'default'` | 否 | 文本颜色，class 加 `vc-title--{color}` |
| `size` | `number \| string` | `'1em'` | 否 | 字号，number 按 px 处理，string 原样作为 CSS `font-size`（扩展项） |

### 3.2 Emits

无。

### 3.3 Slots

| 名称 | 说明 |
|---|---|
| `default` | 文本内容 |

### 3.4 Expose

无。

---

## 4. 行为约束

- **B-01** 默认渲染为 `<h1>`，class 含 `vc-title` 与 `vc-title--1`
- **B-02** `level=3` 时渲染为 `<h3>`，class 含 `vc-title--3`
- **B-05** `component="div"` 时根元素为 `<div>`，class 仍按 level 添加
- **B-07** `align="center"` 时 class 加 `vc-title--center`
- **B-08** `truncate=true` 时 class 加 `vc-title--truncate`
- **B-09** `strong=true` 时 class 加 `vc-title--strong`
- **B-11** `color="primary"` 时 class 加 `vc-title--primary`
- **B-12** default slot 内容渲染为根元素子节点
- **B-13** slot 为空时根元素内部为空

---

## 5. 边界条件与异常

- **E-01** `level` 传入非约定值（如 `6`）：TS 告警，运行时渲染 `<h6>`（fallback 到字符串拼接）
- **E-03** `align` 传入非约定值：class 不加对应项，不报错
- **E-04** `color` 传入非约定值：class 不加对应项，不报错

---

## 6. 可访问性（a11y）

- **A-01** 必须用 `<h1>`~`<h5>` 真实语义标签，不可用 `<div role="heading">`

---

## 7. 测试用例清单

| 编号 | 关联行为 | Given | When | Then | 优先级 |
|---|---|---|---|---|---|
| T-01 | B-01 | mount | 取根元素 | tagName `H1`，class 含 `vc-title` `vc-title--1` | P0 |
| T-02 | B-02 | `{ level: 3 }` | 取根元素 | tagName `H3`，class 含 `vc-title--3` | P0 |
| T-03 | B-05 | `{ component: 'div' }` | 取根元素 | tagName `DIV`，class 含 `vc-title--1` | P0 |
| T-04 | B-07 | `{ align: 'center' }` | 取 class | 含 `vc-title--center` | P0 |
| T-05 | B-08 | `{ truncate: true }` | 取 class | 含 `vc-title--truncate` | P0 |
| T-06 | B-09 | `{ strong: true }` | 取 class | 含 `vc-title--strong` | P0 |
| T-07 | B-11 | `{ color: 'primary' }` | 取 class | 含 `vc-title--primary` | P0 |
| T-08 | B-12 | slots `{ default: 'Hello' }` | 取 text | 含 `'Hello'` | P0 |
| T-09 | B-13 | 不传 slot | 取 text | 空字符串 | P1 |
| T-18 | E-03 | `{ align: 'xxx' }` | 取 class | 不含 `vc-title--xxx` | P1 |
| T-20 | A-01 | `{ level: 4 }` | 取根元素 | tagName `H4` | P0 |

---

## 8. 实现提示

- `defaultTag` 用 `` `h${props.level}` `` 将数字 level 转为标签字符串（Vue 的 `<component :is>` 不支持数字直接映射 h 标签）
- `component` 不设默认值，让 level 决定标签
- class 计算由 `useTypography('vc-title', ...)` 返回修饰符数组，再追加 `vc-title--${level}`
- `align` / `color` 非法值在 `useTypography` 内部校验，不生成对应 class

---

## 9. 完成自查

- [x] 根元素用语义化 h1-h5 标签
- [x] `component` prop 能覆盖 level 决定的标签
- [x] 修饰符 class 命名前缀 `vc-title` 正确
- [x] level 越界时不报错
- [x] 共享 composable 抽出，无重复 class 计算代码

---

## 10. 变更记录

| 版本 | 日期 | 变更说明 |
|---|---|---|
| 0.1.0 | 2026-09-29 | 按 spec 实现；测试通过；扩展 `size` prop（`useSizableStyle`） |
