# Typography 组件规格

## 元数据

| 字段 | 值 |
|---|---|
| 组件名 | `VcTypography`（容器）+ 子组件 `VcTitle` / `VcText` / `VcParagraph` |
| 分类 | 基础原子 |
| 所属阶段 | Stage-1 |
| 依赖组件 | 无 |
| 文件位置 | `src/components/typography/`（4 个文件） |
| 测试文件 | 与组件同目录、同名 `.test.ts` |

---

## 设计意图

提供一套排版组件，封装语义化 HTML（h1-h5 / p / span）与字号 / 行高 / 颜色的预设。

**为什么是一个 spec 涵盖多个组件**：Title / Text / Paragraph 共享一致的"level → 标签 + 样式"映射机制，放在一起设计才能保证一致性。

**不解决**：富文本编辑、HTML 安全转义（用户输入由调用方负责）、中英文混排微调。

---

## API 规格

### 共通约定（三个子组件都遵守）

| 名称 | 类型 | 默认值 | 必填 | 行为说明 |
|---|---|---|---|---|
| `level` | 见下各组件 | 见下 | 否 | 决定渲染的标签与样式 |
| `component` | `string \| Component` | - | 否 | 覆盖 `level` 决定的标签（仍应用 level 对应的 class） |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | 否 | 文本对齐 |
| `truncate` | `boolean` | `false` | 否 | 单行截断（class 加 `vc-xxx--truncate`） |
| `strong` | `boolean` | `false` | 否 | 加粗（class 加 `vc-xxx--strong`） |
| `italic` | `boolean` | `false` | 否 | 斜体（class 加 `vc-xxx--italic`） |
| `color` | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger' \| 'muted'` | `'default'` | 否 | 文本颜色 class |

### VcTitle（标题）

| 名称 | 类型 | 默认值 | 必填 | 行为说明 |
|---|---|---|---|---|
| `level` | `1 \| 2 \| 3 \| 4 \| 5` | `1` | 否 | 渲染 `<h1>` ~ `<h5>`，class 加 `vc-title--{level}` |

### VcText（行内文本）

| 名称 | 类型 | 默认值 | 必填 | 行为说明 |
|---|---|---|---|---|
| `level` | `'body' \| 'caption' \| 'mark'` | `'body'` | 否 | class 加 `vc-text--{level}`，根元素为 `<span>` |

### VcParagraph（段落）

| 名称 | 类型 | 默认值 | 必填 | 行为说明 |
|---|---|---|---|---|
| `level` | `'body' \| 'lead' \| 'small'` | `'body'` | 否 | class 加 `vc-paragraph--{level}`，根元素为 `<p>` |

### Emits

无。

### Slots

| 名称 | 说明 |
|---|---|
| `default` | 文本内容 |

### Expose

无。

---

## 行为约束

### 渲染与标签

- **B-01** `VcTitle` 默认渲染为 `<h1>`，class 含 `vc-title` 与 `vc-title--1`
- **B-02** `VcTitle` props `{ level: 3 }` 时渲染为 `<h3>`，class 含 `vc-title--3`
- **B-03** `VcText` 默认渲染为 `<span>`，class 含 `vc-text` 与 `vc-text--body`
- **B-04** `VcParagraph` 默认渲染为 `<p>`，class 含 `vc-paragraph` 与 `vc-paragraph--body`
- **B-05** 传入 `component="div"` 时，无论 `level` 是什么，根元素都是 `<div>`，但 class 仍按 `level` 添加（如 level=1 时含 `vc-title--1`）
- **B-06** 传入 `component` 为字符串时，作为动态组件标签渲染；为 Component 时作为 Vue 组件渲染

### 修饰符 class

- **B-07** `align="center"` 时 class 加 `vc-xxx--center`（xxx 为 title / text / paragraph）
- **B-08** `truncate=true` 时 class 加 `vc-xxx--truncate`
- **B-09** `strong=true` 时 class 加 `vc-xxx--strong`
- **B-10** `italic=true` 时 class 加 `vc-xxx--italic`
- **B-11** `color="primary"` 时 class 加 `vc-xxx--primary`；其他颜色同理

### 内容与插槽

- **B-12** default slot 内容渲染为根元素子节点
- **B-13** slot 为空时根元素内部为空，不报错

### 通用性

- **B-14** 三个子组件都遵守相同的修饰符语义（align/truncate/strong/italic/color），class 命名前缀随组件变化

---

## 边界条件与异常

- **E-01** `level` 传入非约定值（如 VcTitle `level=6`）：渲染 `<h6>` 也可接受（fallback 到字符串拼接），但 TS 会告警；运行时不报错
- **E-02** `component` 传入非组件、非字符串：Vue 渲染会报错，组件层不做兜底
- **E-03** `align` 传入非约定值：class 不加对应项（不报错）
- **E-04** `color` 传入非约定值：class 不加对应项（不报错）

---

## 可访问性（a11y）

- **A-01** 不要使用 `<div role="heading">`，必须用 `<h1>` ~ `<h5>` 真实语义标签
- **A-02** `truncate=true` 时，截断的内容若对屏幕阅读器重要，应由调用方提供 `title` 属性（本阶段不强制，组件不实现）
- **A-03** 段落必须用 `<p>`，不可用 `<div>`

---

## 测试用例清单

### VcTitle

| 编号 | 关联行为 | Given | When | Then | 优先级 |
|---|---|---|---|---|---|
| T-01 | B-01 | mount VcTitle | 取根元素 | tagName 为 `H1`，class 含 `vc-title vc-title--1` | P0 |
| T-02 | B-02 | mount，props `{ level: 3 }` | 取根元素 | tagName 为 `H3`，class 含 `vc-title--3` | P0 |
| T-03 | B-05 | mount，props `{ component: 'div' }` | 取根元素 | tagName 为 `DIV`，class 仍含 `vc-title--1` | P0 |
| T-04 | B-07 | mount，props `{ align: 'center' }` | 取 class | 含 `vc-title--center` | P0 |
| T-05 | B-08 | mount，props `{ truncate: true }` | 取 class | 含 `vc-title--truncate` | P0 |
| T-06 | B-09 | mount，props `{ strong: true }` | 取 class | 含 `vc-title--strong` | P0 |
| T-07 | B-11 | mount，props `{ color: 'primary' }` | 取 class | 含 `vc-title--primary` | P0 |
| T-08 | B-12 | mount，slots `{ default: 'Hello' }` | 取 text | 含 `'Hello'` | P0 |
| T-09 | B-13 | mount，不传 slot | 取 text | 为空字符串 | P1 |

### VcText

| 编号 | 关联行为 | Given | When | Then | 优先级 |
|---|---|---|---|---|---|
| T-10 | B-03 | mount VcText | 取根元素 | tagName 为 `SPAN`，class 含 `vc-text vc-text--body` | P0 |
| T-11 | B-04 | mount，props `{ level: 'caption' }` | 取 class | 含 `vc-text--caption` | P0 |
| T-12 | B-10 | mount，props `{ italic: true }` | 取 class | 含 `vc-text--italic` | P0 |
| T-13 | B-05 | mount，props `{ component: 'div' }` | 取根元素 | tagName 为 `DIV`，class 含 `vc-text--body` | P1 |

### VcParagraph

| 编号 | 关联行为 | Given | When | Then | 优先级 |
|---|---|---|---|---|---|
| T-14 | B-04 | mount VcParagraph | 取根元素 | tagName 为 `P`，class 含 `vc-paragraph vc-paragraph--body` | P0 |
| T-15 | B-04 | mount，props `{ level: 'lead' }` | 取 class | 含 `vc-paragraph--lead` | P0 |
| T-16 | B-07 | mount，props `{ align: 'right' }` | 取 class | 含 `vc-paragraph--right` | P0 |

### 共性 / 边界

| 编号 | 关联行为 | Given | When | Then | 优先级 |
|---|---|---|---|---|---|
| T-17 | B-14 | 三个组件分别 mount + `{ strong: true, italic: true, color: 'danger' }` | 取 class | 三者都含对应 `--strong --italic --danger` 前缀只差前缀 | P0 |
| T-18 | E-03 | mount VcTitle，props `{ align: 'xxx' as any }` | 取 class | 不含 `vc-title--xxx`，不报错 | P1 |
| T-19 | E-04 | mount VcText，props `{ color: 'xxx' as any }` | 取 class | 不含 `vc-text--xxx`，不报错 | P1 |
| T-20 | A-01 | mount VcTitle，props `{ level: 4 }` | 取根元素 | tagName 为 `H4`（不能是 div role=heading）| P0 |

---

## 实现提示

### 1. 文件组织

```
src/components/typography/
├── Title.vue
├── Text.vue
├── Paragraph.vue
├── Typography.vue          # 仅做导出聚合（可选）
├── types.ts                # 共享类型与 level 映射
└── use-typography.ts       # 共享 class 计算 composable
```

### 2. 共享 composable

把 align / truncate / strong / italic / color 五个修饰符的 class 计算抽到 `useTypography(prefix: 'vc-title' | 'vc-text' | 'vc-paragraph')`，三个组件各自调用，避免重复。

### 3. 标签选择 + component 覆盖

```ts
// 伪代码
const defaultTag = computed(() => {
  if (props.component) return props.component
  return levelToTagMap[props.level]  // 如 title: { 1: 'h1', 2: 'h2', ... }
})
```

模板里用 `<component :is="defaultTag">`。

### 4. 关键提示

- VcTitle 的 `level` 与 VcText/Paragraph 的 `level` 类型不同（一个是数字 1-5，一个是字符串字面量），不要抽到同一个 props 类型里
- `component` prop 类型用 `string | Component`，需要从 vue 导入 `Component`
- class 拼接推荐用 computed 返回数组，避免手写字符串拼接出错
- 测 `tagName` 时用 `wrapper.element.tagName === 'H1'`（注意全大写）

### 5. 重构方向

- 三个组件的 props 重复度高，可考虑用 TypeScript 工厂函数生成 props 定义
- `levelToTagMap` 集中到 `types.ts`，便于将来增加 level
- 如未来要支持响应式字号，预留 `size` prop（本阶段不实现）

---

## 完成后自查

- [ ] 三个组件的修饰符 class 命名前缀正确（vc-title / vc-text / vc-paragraph）
- [ ] `component` prop 能覆盖 level 决定的标签
- [ ] 标签始终用语义化 HTML（h1-h5、p、span）
- [ ] level 越界时不报错
- [ ] 共享 composable 抽出，三个组件无重复 class 计算代码
