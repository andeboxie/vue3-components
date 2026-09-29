# VcText 组件 SDD 文档

> 本文件是组件级 SDD（Specification-Driven Development）文档。
> 完整规格以 [`docs/stage-1-atomic/Typography.spec.md`](../../../../docs/stage-1-atomic/Typography.spec.md) 为准。
> 框架结构与总指南 [`docs/00-overview.md`](../../../../docs/00-overview.md) 第三节"单组件 spec 模板"对齐。

---

## 1. 元数据

| 字段 | 值 |
|---|---|
| 组件名 | `VcTypographyText` |
| 分类 | 基础原子（Typography 子组件） |
| 所属阶段 | Stage-1 |
| 依赖组件 | 无 |
| 文件位置 | `src/components/typography/text/Text.vue` |
| 测试文件 | `src/components/typography/Typography.test.ts` |
| composable | `src/composables/UseTypography.ts`（修饰符 class） |
| composable | `src/composables/UseSizableStyle.ts`（size 样式，通用） |

---

## 2. 设计意图

排版组件族的行内文本组件，渲染 `<span>`，封装 level 到样式的映射，以及对齐、截断、加粗、斜体、颜色等修饰符。

不解决：富文本编辑、HTML 安全转义。

---

## 3. API 规格

### 3.1 Props

| 名称 | 类型 | 默认值 | 必填 | 行为说明 |
|---|---|---|---|---|
| `level` | `'body' \| 'caption' \| 'mark'`（由 `TextLevelEnum` 派生） | `'body'` | 否 | class 加 `vc-text--{level}`，根元素为 `<span>` |
| `component` | `string \| Component` | `'span'` | 否 | 覆盖 level 决定的标签（仍应用 level 对应的 class） |
| `align` | `'left' \| 'center' \| 'right'`（由 `AlignStateEnum` 派生） | `'left'` | 否 | 文本对齐，class 加 `vc-text--{align}` |
| `truncate` | `boolean` | `false` | 否 | 单行截断，class 加 `vc-text--truncate` |
| `strong` | `boolean` | `false` | 否 | 加粗，class 加 `vc-text--strong` |
| `italic` | `boolean` | `false` | 否 | 斜体，class 加 `vc-text--italic` |
| `color` | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger' \| 'muted'`（由 `TextColorEnum` 派生） | `'default'` | 否 | 文本颜色，class 加 `vc-text--{color}` |
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

- **B-03** 默认渲染为 `<span>`，class 含 `vc-text` 与 `vc-text--body`
- **B-05** `component="div"` 时根元素为 `<div>`，class 仍含 `vc-text--body`
- **B-07** `align="center"` 时 class 加 `vc-text--center`
- **B-08** `truncate=true` 时 class 加 `vc-text--truncate`
- **B-09** `strong=true` 时 class 加 `vc-text--strong`
- **B-10** `italic=true` 时 class 加 `vc-text--italic`
- **B-11** `color="primary"` 时 class 加 `vc-text--primary`
- **B-12** default slot 内容渲染为根元素子节点
- **B-13** slot 为空时根元素内部为空

---

## 5. 边界条件与异常

- **E-03** `align` 传入非约定值：class 不加对应项，不报错
- **E-04** `color` 传入非约定值：class 不加对应项，不报错

---

## 6. 可访问性（a11y）

无特殊要求（行内文本，语义由 `<span>` 承担）。

---

## 7. 测试用例清单

| 编号 | 关联行为 | Given | When | Then | 优先级 |
|---|---|---|---|---|---|
| T-10 | B-03 | mount | 取根元素 | tagName `SPAN`，class 含 `vc-text` `vc-text--body` | P0 |
| T-11 | B-03 | `{ level: 'caption' }` | 取 class | 含 `vc-text--caption` | P0 |
| T-12 | B-10 | `{ italic: true }` | 取 class | 含 `vc-text--italic` | P0 |
| T-13 | B-05 | `{ component: 'div' }` | 取根元素 | tagName `DIV`，class 含 `vc-text--body` | P1 |
| T-19 | E-04 | `{ color: 'xxx' }` | 取 class | 不含 `vc-text--xxx` | P1 |

---

## 8. 实现提示

- `defaultTag` 优先返回 `component`，否则返回 `level`（level 为字符串，直接作为标签名不适用，默认 component='span'）
- class 计算由 `useTypography('vc-text', ...)` 返回修饰符数组，再追加 `vc-text--${level}`
- `align` / `color` 非法值在 `useTypography` 内部校验，不生成对应 class

---

## 9. 完成自查

- [x] 根元素默认 `<span>`
- [x] `component` prop 能覆盖标签
- [x] 修饰符 class 命名前缀 `vc-text` 正确
- [x] 共享 composable 抽出，无重复 class 计算代码

---

## 10. 变更记录

| 版本 | 日期 | 变更说明 |
|---|---|---|
| 0.1.0 | 2026-09-29 | 按 spec 实现；测试通过；扩展 `size` prop（`useSizableStyle`） |
