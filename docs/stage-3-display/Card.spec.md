# Card 组件规格

## 元数据

| 字段 | 值 |
|---|---|
| 组件名 | `VcCard` |
| 分类 | 数据展示 |
| 所属阶段 | Stage-3 |
| 依赖组件 | 无 |
| 文件位置 | `src/components/card/Card.vue` |
| 测试文件 | `src/components/card/Card.test.ts` |

---

## 设计意图

提供内容容器，将相关信息分组展示，支持标题、操作区、正文区域。常用于卡片列表、仪表盘、详情摘要等场景。

**不解决**：可折叠卡片（后续 Collapse 组件）、卡片网格布局（留给 Layout / Grid）、卡片内嵌表单（Form 已覆盖）。

---

## API 规格

### Props

| 名称 | 类型 | 默认值 | 必填 | 行为说明 |
|---|---|---|---|---|
| `title` | `string` | - | 否 | 卡片标题 |
| `shadow` | `'always' \| 'hover' \| 'never'` | `'always'` | 否 | 阴影模式 |
| `border` | `boolean` | `true` | 否 | 是否显示边框 |
| `bodyStyle` | `Record<string, string \| number>` | - | 否 | 正文区域的 style |
| `headerClass` | `string` | - | 否 | 头部额外 class |

### Emits

无。

### Slots

| 名称 | 说明 |
|---|---|
| `default` | 卡片正文内容 |
| `title` | 自定义标题（覆盖 title prop） |
| `extra` | 标题右侧操作区 |

### Expose

无。

---

## 行为约束

### 渲染与 DOM

- **B-01** 根元素为 `<div>`，class 含 `vc-card`
- **B-02** `shadow='always'` 时，class 含 `vc-card--shadow-always`
- **B-03** `shadow='hover'` 时，class 含 `vc-card--shadow-hover`
- **B-04** `shadow='never'` 时，class 含 `vc-card--shadow-never`
- **B-05** `border=false` 时，class 含 `vc-card--no-border`
- **B-06** `headerClass` 有值时，头部节点 class 含该值

### 头部

- **B-07** `title` 有值 或 `title` slot 或 `extra` slot 存在时，渲染头部节点（class `vc-card__header`）
- **B-08** 头部内 `title` 有值时，渲染标题文本（class `vc-card__title`）
- **B-09** 提供 `title` slot 时，覆盖 `title` prop 的渲染
- **B-10** 提供 `extra` slot 时，渲染到头部右侧（class `vc-card__extra`）
- **B-11** `title` 无值 且 无 `title` slot 且 无 `extra` slot 时，不渲染头部节点

### 正文

- **B-12** 正文节点 class 含 `vc-card__body`
- **B-13** `bodyStyle` 有值时，正文节点的 style 合并该值
- **B-14** 默认 slot 内容渲染在正文节点内部

---

## 边界条件与异常

- **E-01** `title` 与 `title` slot 同时传入：slot 优先，title prop 不渲染
- **E-02** `title` 为空字符串：视为无标题（不渲染标题文本节点）
- **E-03** `bodyStyle` 为空对象：不产生额外 style
- **E-04** `shadow` 与 `border` 同时控制：两者独立生效，shadow class 与 no-border class 可并存
- **E-05** 仅 `extra` slot 有内容（无 title）：仍渲染头部节点，标题部分为空

---

## 可访问性（a11y）

- **A-01** 卡片根元素可加 `role="article"`，语义化标记独立内容块
- **A-02** 标题节点为可读文本，屏幕阅读器可播报
- **A-03** 头部操作区（extra slot）的按钮/链接需有可访问名（原生元素天然支持）

---

## 测试用例清单

| 编号 | 关联行为 | Given | When | Then | 优先级 |
|---|---|---|---|---|---|
| T-01 | B-01 | mount | 取根元素 | tagName `DIV`，class 含 `vc-card` | P0 |
| T-02 | B-02 | mount（默认 shadow） | 取 class | 含 `vc-card--shadow-always` | P0 |
| T-03 | B-03 | `{ shadow: 'hover' }` | 取 class | 含 `vc-card--shadow-hover` | P0 |
| T-04 | B-04 | `{ shadow: 'never' }` | 取 class | 含 `vc-card--shadow-never` | P0 |
| T-05 | B-05 | `{ border: false }` | 取 class | 含 `vc-card--no-border` | P1 |
| T-06 | B-06 | `{ headerClass: 'my-header' }`，有 title | 取头部 class | 含 `'my-header'` | P2 |
| T-07 | B-07 | `{ title: '标题' }` | 查找头部 | 存在 `vc-card__header` | P0 |
| T-08 | B-08 | `{ title: '标题' }` | 取标题文本 | 存在 `vc-card__title`，含 `'标题'` | P0 |
| T-09 | B-09 | slots `{ title: '<span>自定义</span>' }` | 取标题内容 | 含 `'自定义'`，不含 title prop 文本 | P1 |
| T-10 | B-10 | slots `{ extra: '<button>更多</button>' }` | 查找 extra | 存在 `vc-card__extra`，含按钮 | P1 |
| T-11 | B-11 | 无 title 无 slots | 查找头部 | 不存在 `vc-card__header` | P0 |
| T-12 | B-12 | mount | 查找正文 | 存在 `vc-card__body` | P0 |
| T-13 | B-13 | `{ bodyStyle: { padding: '20px' } }` | 取正文 style | 含 `padding: 20px` | P1 |
| T-14 | B-14 | slots `{ default: '<p>内容</p>' }` | 取正文内容 | 含 `'内容'` | P0 |
| T-15 | E-01 | `{ title: 'A' }`，slots `{ title: '<span>B</span>' }` | 取标题内容 | 含 `'B'`，不含 `'A'` | P1 |
| T-16 | E-02 | `{ title: '' }` | 查找标题文本 | 不存在 `vc-card__title` | P2 |
| T-17 | E-05 | slots `{ extra: '<button>X</button>' }`，无 title | 查找头部 | 存在头部节点 | P2 |
| T-18 | A-01 | mount | 取根元素 role | 为 `'article'` | P1 |

---

## 实现提示

### 1. 结构

```html
<div class="vc-card" :class="cardClass" role="article">
    <div
        v-if="hasHeader"
        class="vc-card__header"
        :class="headerClass"
    >
        <div class="vc-card__title">
            <slot name="title">{{ title }}</slot>
        </div>
        <div v-if="$slots.extra" class="vc-card__extra">
            <slot name="extra"></slot>
        </div>
    </div>
    <div class="vc-card__body" :style="bodyStyle">
        <slot></slot>
    </div>
</div>
```

### 2. 关键提示

- `hasHeader` = `title` 有值 或 `title` slot 存在 或 `extra` slot 存在
- `title` slot 优先级高于 `title` prop：slot 存在时 title prop 不渲染
- `shadow` 与 `border` 是独立维度，class 可并存
- `bodyStyle` 直接绑定到正文节点的 `:style`，Vue 会自动合并
- 头部节点的 class 合并 `vc-card__header` 与 `headerClass`

### 3. 重构方向

- 后续可扩展 `divider` prop 控制头部与正文之间的分割线
- 若需可折叠卡片，新增 `collapsible` / `collapsed` prop 与 `toggle` 事件
