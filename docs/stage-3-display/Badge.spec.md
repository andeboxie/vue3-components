# Badge 组件规格

## 元数据

| 字段 | 值 |
|---|---|
| 组件名 | `VcBadge` |
| 分类 | 数据展示 |
| 所属阶段 | Stage-3 |
| 依赖组件 | 无 |
| 文件位置 | `src/components/badge/Badge.vue` |
| 测试文件 | `src/components/badge/Badge.test.ts` |

---

## 设计意图

提供数值标记或状态小圆点，用于在元素右上角显示未读数、新消息提示或状态点。

**不解决**：下拉通知列表（留给通知组件）、复杂徽章动画。

---

## API 规格

### Props

| 名称 | 类型 | 默认值 | 必填 | 行为说明 |
|---|---|---|---|---|
| `value` | `string \| number` | - | 否 | 标记内容（数字或文本） |
| `max` | `number` | - | 否 | 数值封顶，超过显示 `{max}+`（仅对数字生效） |
| `hidden` | `boolean` | `false` | 否 | 是否隐藏徽章 |
| `dot` | `boolean` | `false` | 否 | 只显示圆点，忽略 value |
| `type` | `'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'danger'` | 否 | 类型色 |
| `showZero` | `boolean` | `false` | 否 | value 为 0 时是否显示（默认不显示） |

### Emits

无。

### Slots

| 名称 | 说明 |
|---|---|
| `default` | 徽章所附着的主体内容 |
| `value` | 自定义徽章内容（覆盖 value prop） |

### Expose

无。

---

## 行为约束

### 渲染与 DOM

- **B-01** 根元素为 `<span>`，class 含 `vc-badge`
- **B-02** 默认 slot 内容渲染在根元素内部
- **B-03** 徽章标记节点 class 含 `vc-badge__content`，且 class 含 `vc-badge__content--{type}`

### 显示规则

- **B-04** `dot=true` 时，只渲染圆点（class `vc-badge__content--dot`），不显示 value 文本
- **B-05** `hidden=true` 时，不渲染徽章标记节点
- **B-06** `value` 为数字 0 且 `showZero=false` 时，不渲染徽章标记节点
- **B-07** `value` 为数字且 `max` 有值且 `value > max` 时，显示 `{max}+`（如 `max=99`，`value=100` 显示 `99+`）
- **B-08** `value` 为字符串时，直接显示该字符串，`max` 不生效

### 位置

- **B-09** 徽章标记位于主体内容右上角（绝对定位，CSS 控制）

### 自定义内容

- **B-10** 提供 `value` slot 时，覆盖 `value` prop 的渲染内容

---

## 边界条件与异常

- **E-01** `dot=true` 且 `value` 有值：仍只显示圆点，忽略 value
- **E-02** `value` 为 `undefined` / `null` 且 `dot=false`：不渲染徽章标记
- **E-03** `max` 为 0 或负数：`max` 规则不生效，直接显示 value
- **E-04** `value` 为负数：直接显示该负数（不应用 max 规则）
- **E-05** 默认 slot 为空：仍渲染根元素，徽章标记正常显示（无主体内容场景）

---

## 可访问性（a11y）

- **A-01** 徽章标记节点带 `role="status"`，让屏幕阅读器播报数量
- **A-02** 数值徽章的文本内容为可读数字或 `max+` 文本
- **A-03** `dot` 模式下，徽章节点带 `aria-label`，值为 `'有新消息'`

---

## 测试用例清单

| 编号 | 关联行为 | Given | When | Then | 优先级 |
|---|---|---|---|---|---|
| T-01 | B-01 | mount | 取根元素 | tagName `SPAN`，class 含 `vc-badge` | P0 |
| T-02 | B-02 | slot 文本 `'消息'` | 取根元素文本 | 含 `'消息'` | P0 |
| T-03 | B-03 | `{ value: 5 }` | 查找徽章节点 | 存在 `vc-badge__content`，含 `vc-badge__content--danger` | P0 |
| T-04 | B-04 | `{ dot: true, value: 5 }` | 查找徽章节点 | 含 `vc-badge__content--dot`，文本不含 `'5'` | P0 |
| T-05 | B-05 | `{ value: 5, hidden: true }` | 查找徽章节点 | 不存在 | P0 |
| T-06 | B-06 | `{ value: 0, showZero: false }` | 查找徽章节点 | 不存在 | P0 |
| T-07 | B-07 | `{ value: 100, max: 99 }` | 取徽章文本 | 为 `'99+'` | P0 |
| T-08 | B-08 | `{ value: 'new' }` | 取徽章文本 | 为 `'new'` | P1 |
| T-09 | B-09 | mount | 取徽章节点样式 | position 为 absolute | P2 |
| T-10 | B-10 | slot value `'自定义'` | 取徽章文本 | 为 `'自定义'` | P1 |
| T-11 | E-01 | `{ dot: true, value: 5 }` | 取徽章文本 | 不含 `'5'` | P1 |
| T-12 | E-02 | `{ value: undefined, dot: false }` | 查找徽章节点 | 不存在 | P1 |
| T-13 | E-03 | `{ value: 5, max: 0 }` | 取徽章文本 | 为 `'5'` | P2 |
| T-14 | E-04 | `{ value: -3, max: 99 }` | 取徽章文本 | 为 `'-3'` | P2 |
| T-15 | B-06 | `{ value: 0, showZero: true }` | 查找徽章节点 | 存在，文本为 `'0'` | P1 |
| T-16 | A-01 | `{ value: 5 }` | 取徽章节点 role | 为 `'status'` | P1 |
| T-17 | A-03 | `{ dot: true }` | 取徽章节点 aria-label | 为 `'有新消息'` | P2 |

---

## 实现提示

### 1. 结构

```html
<span class="vc-badge">
    <slot></slot>
    <span
        v-if="showBadge"
        class="vc-badge__content"
        :class="contentClass"
        role="status"
        :aria-label="dot ? '有新消息' : undefined"
    >
        <slot name="value">{{ displayValue }}</slot>
    </span>
</span>
```

### 2. 关键提示

- `showBadge` 计算属性：`!hidden && (dot || value !== undefined && value !== null && !(value === 0 && !showZero))`
- `displayValue` 计算属性：dot 模式返回空串；数字且 max 有效且 value > max 返回 `${max}+`；否则返回 value 原值
- `max` 规则只在 `typeof value === 'number'` 且 `max > 0` 时生效
- 徽章标记的右上角定位用 CSS absolute + top/right 实现
- `value` slot 优先级高于 `value` prop，用具名 slot 覆盖

### 3. 重构方向

- 类型色的背景色集中在 `badge.scss`，用 CSS 变量便于主题切换
- 若后续需支持独立徽章（无主体内容，直接显示），已由 B-09 / E-05 覆盖
