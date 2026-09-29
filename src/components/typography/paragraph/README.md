# VcParagraph 组件 SDD 文档

> 本文件是组件级 SDD（Specification-Driven Development）文档。
> 完整规格以 [`docs/stage-1-atomic/Typography.spec.md`](../../../../docs/stage-1-atomic/Typography.spec.md) 为准。
> 框架结构与总指南 [`docs/00-overview.md`](../../../../docs/00-overview.md) 第三节"单组件 spec 模板"对齐。

---

## 1. 元数据

| 字段 | 值 |
|---|---|
| 组件名 | `VcTypographyParagraph` |
| 分类 | 基础原子（Typography 子组件） |
| 所属阶段 | Stage-1 |
| 依赖组件 | 无 |
| 文件位置 | `src/components/typography/paragraph/Paragraph.vue` |
| 测试文件 | `src/components/typography/Typography.test.ts` |
| composable | `src/composables/UseTypography.ts`（修饰符 class） |
| composable | `src/composables/UseSizableStyle.ts`（size 样式，通用） |

---

## 2. 设计意图

排版组件族的段落组件，渲染 `<p>`，封装 level 到样式的映射，以及对齐、截断、加粗、斜体、颜色等修饰符。

不解决：富文本编辑、HTML 安全转义。

---

## 3. API 规格

### 3.1 Props

| 名称 | 类型 | 默认值 | 必填 | 行为说明 |
|---|---|---|---|---|
| `level` | `'body' \| 'lead' \| 'small'`（由 `ParagraphLevelEnum` 派生） | `'body'` | 否 | class 加 `vc-paragraph--{level}`，根元素为 `<p>` |
| `component` | `string \| Component` | `'p'` | 否 | 覆盖 level 决定的标签（仍应用 level 对应的 class） |
| `align` | `'left' \| 'center' \| 'right'`（由 `AlignStateEnum` 派生） | `'left'` | 否 | 文本对齐，class 加 `vc-paragraph--{align}` |
| `truncate` | `boolean` | `false` | 否 | 单行截断，class 加 `vc-paragraph--truncate` |
| `strong` | `boolean` | `false` | 否 | 加粗，class 加 `vc-paragraph--strong` |
| `italic` | `boolean` | `false` | 否 | 斜体，class 加 `vc-paragraph--italic` |
| `color` | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger' \| 'muted'`（由 `TextColorEnum` 派生） | `'default'` | 否 | 文本颜色，class 加 `vc-paragraph--{color}` |
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

- **B-04** 默认渲染为 `<p>`，class 含 `vc-paragraph` 与 `vc-paragraph--body`
- **B-07** `align="right"` 时 class 加 `vc-paragraph--right`
- **B-08** `truncate=true` 时 class 加 `vc-paragraph--truncate`
- **B-09** `strong=true` 时 class 加 `vc-paragraph--strong`
- **B-10** `italic=true` 时 class 加 `vc-paragraph--italic`
- **B-11** `color="primary"` 时 class 加 `vc-paragraph--primary`
- **B-12** default slot 内容渲染为根元素子节点
- **B-13** slot 为空时根元素内部为空

---

## 5. 边界条件与异常

- **E-03** `align` 传入非约定值：class 不加对应项，不报错
- **E-04** `color` 传入非约定值：class 不加对应项，不报错

---

## 6. 可访问性（a11y）

- **A-03** 段落必须用 `<p>`，不可用 `<div>`

---

## 7. 测试用例清单

| 编号 | 关联行为 | Given | When | Then | 优先级 |
|---|---|---|---|---|---|
| T-14 | B-04 | mount | 取根元素 | tagName `P`，class 含 `vc-paragraph` `vc-paragraph--body` | P0 |
| T-15 | B-04 | `{ level: 'lead' }` | 取 class | 含 `vc-paragraph--lead` | P0 |
| T-16 | B-07 | `{ align: 'right' }` | 取 class | 含 `vc-paragraph--right` | P0 |
| T-17 | B-14 | `{ strong: true, italic: true, color: 'danger' }` | 取 class | 含 `vc-paragraph--strong --italic --danger` | P0 |

---

## 8. 实现提示

- `defaultTag` 优先返回 `component`，否则返回 `level`（默认 component='p'）
- class 计算由 `useTypography('vc-paragraph', ...)` 返回修饰符数组，再追加 `vc-paragraph--${level}`
- `align` / `color` 非法值在 `useTypography` 内部校验，不生成对应 class

---

## 9. 完成自查

- [x] 根元素默认 `<p>`
- [x] `component` prop 能覆盖标签
- [x] 修饰符 class 命名前缀 `vc-paragraph` 正确
- [x] 共享 composable 抽出，无重复 class 计算代码

---

## 10. 变更记录

| 版本 | 日期 | 变更说明 |
|---|---|---|
| 0.1.0 | 2026-09-29 | 按 spec 实现；测试通过；扩展 `size` prop（`useSizableStyle`） |
