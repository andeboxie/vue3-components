# VcTypography 聚合入口

> 本目录是 Typography 组件族的聚合入口。完整规格以 [`docs/stage-1-atomic/Typography.spec.md`](../../../docs/stage-1-atomic/Typography.spec.md) 为准。
> 子组件各有独立的 SDD 文档，见下方"子组件"。

---

## 1. 元数据

| 字段 | 值 |
|---|---|
| 组件名 | `VcTypography`（聚合容器） |
| 分类 | 基础原子 |
| 所属阶段 | Stage-1 |
| 文件位置 | `src/components/typography/Typography.vue` |
| 子组件 | VcTitle / VcText / VcParagraph |

---

## 2. 角色

`Typography.vue` 作为聚合容器，在模板内组合渲染三个子组件（`VcTitle` / `VcParagraph` / `VcText`），并通过三个具名 slot（`title` / `paragraph` / `text`）向外暴露各自内容。本身不额外包裹根元素（Vue3 fragment，多根节点）。

---

## 3. Slots

| 名称 | 说明 |
|---|---|
| `title` | 渲染进 `VcTitle` 的内容 |
| `paragraph` | 渲染进 `VcParagraph` 的内容 |
| `text` | 渲染进 `VcText` 的内容 |

---

## 4. 子组件

| 子组件 | 文件 | SDD 文档 | 渲染标签 |
|---|---|---|---|
| VcTitle | `title/Title.vue` | [title/README.md](./title/README.md) | `<h1>` ~ `<h5>` |
| VcText | `text/Text.vue` | [text/README.md](./text/README.md) | `<span>` |
| VcParagraph | `paragraph/Paragraph.vue` | [paragraph/README.md](./paragraph/README.md) | `<p>` |

---

## 5. 共通 Props

三个子组件共享一组共通 Props（`level` / `component` / `align` / `truncate` / `strong` / `italic` / `color` / `size`），类型与默认值详见 spec 的"共通约定"表。`level` 类型随子组件不同（Title 为数字 1-5，Text/Paragraph 为字符串字面量），未放入共享类型，由各子组件各自声明。

---

## 6. 变更记录

| 版本 | 日期 | 变更说明 |
|---|---|---|
| 0.1.0 | 2026-09-29 | 聚合容器实现（组合 VcTitle / VcParagraph / VcText + 三具名 slot）；子组件实现与测试通过 |
| 0.2.0 | 2026-09-29 | spec 回改：补聚合容器 Slots / B-18~B-21 / T-24~T-27 / 文件组织注释；`Typography.vue` 改为 `<script setup lang="ts">`（符合总指南 4.3）。原"已知差异"两 点均已解决，本节移除 |
