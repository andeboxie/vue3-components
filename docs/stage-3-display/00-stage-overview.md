# 第 3 阶段总览：数据展示类组件

> 本阶段聚焦"把数据展示给人看"的组件。核心是 **列表渲染**、**空状态**、**悬浮提示**、**条件渲染**。

---

## 3.1 阶段目标

- 掌握数据驱动渲染的基本模式（v-for + key、列配置驱动）
- 掌握条件渲染与空状态的处理范式
- 掌握悬浮层（Tooltip）的定位与显隐控制
- 掌握图片加载失败的降级策略（Avatar）
- 掌握 Badge / Tag 这类轻量标记组件的 props 组合
- 建立展示类组件的可访问性约定（语义化表格、空状态文案、aria-live）

---

## 3.2 组件清单与推荐完成顺序

| 序号 | 组件 | spec 文件 | 难度 | 学到的能力 | 状态 |
|---|---|---|---|---|---|
| 1 | Tag | Tag.spec.md | 易 | 类型色 / closable / round / effect | 待实现 |
| 2 | Badge | Badge.spec.md | 易 | 数值封顶 / dot / hidden / 嵌套内容 | 待实现 |
| 3 | Avatar | Avatar.spec.md | 中 | 图片加载失败降级 / 文字兜底 / 形状 | 待实现 |
| 4 | Card | Card.spec.md | 中 | 头部/正文/操作区组合 / shadow 模式 | 待实现 |
| 5 | Empty | Empty.spec.md | 易 | 空状态占位 / 自定义描述与图片 | 待实现 |
| 6 | Table | Table.spec.md | 难 | 列配置驱动 / 斑马纹 / 边框 / 排序 / 空数据 | 待实现 |
| 7 | Tooltip | Tooltip.spec.md | 中 | 悬浮定位 / 显隐控制 / 触发方式 / disabled | 待实现 |

**建议按顺序做**：Tag / Badge 是最轻量的标记组件，快速建立手感；Avatar 引入图片加载降级；Card 练习多 slot 组合的容器组件；Empty 最简单但为 Table 铺路（Table 的空状态可复用 Empty）；Table 是本阶段最复杂的，列配置驱动 + 排序；Tooltip 引入浮动层，为阶段 4 的 Popover / Dialog 打基础。

---

## 3.3 共通约定（所有展示组件遵守）

### 类型色统一

- 支持的类型色：`primary` / `success` / `warning` / `danger` / `info`
- class 命名统一为 `vc-{组件名}--{类型}`，如 `vc-tag--success`、`vc-badge--danger`
- 类型色取值来源于 `src/styles/variables.scss`，不在组件内硬编码颜色

### 尺寸

- 通用尺寸档位：`small` / `medium` / `large`，默认 `medium`
- class 命名 `vc-{组件名}--{尺寸}`

### 空数据处理

- 列表类组件（Table）数据为空时渲染空状态，不渲染空行
- 空状态默认有文案，支持自定义

### 无障碍

- 语义化 HTML 优先：表格用 `<table>`，卡片用 `<article>` 或 `<div role="article">`
- 图标按钮必须有 `aria-label`
- Tooltip 的触发元素与提示内容通过 `aria-describedby` 关联
- 装饰性图片用 `alt=""`（空 alt），内容性图片有描述性 alt

---

## 3.4 阶段工作流

同阶段 1 / 2：读 spec → 写测试（红）→ 写实现（绿）→ 重构。

每完成一个组件后跑全部测试确认无回归。

---

## 3.5 完成阶段 3 后

- 7 个展示组件 spec 行为 100% 覆盖
- Table 能完成基本的数据渲染与排序
- 进入阶段 4（布局与反馈类）
