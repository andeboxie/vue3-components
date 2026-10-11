# Tag 组件规格

## 元数据

| 字段 | 值 |
|---|---|
| 组件名 | `VcTag` |
| 分类 | 数据展示 |
| 所属阶段 | Stage-3 |
| 依赖组件 | 无 |
| 文件位置 | `src/components/tag/Tag.vue` |
| 测试文件 | `src/components/tag/Tag.test.ts` |

---

## 设计意图

提供紧凑的标签标记，用于对事物分类或打标记。支持类型色、可关闭、圆角、纯文本模式。

**不解决**：可编辑标签（动态增删，留给组件库后续迭代）、Tag 选择器（Select 的下拉选项已覆盖选中场景）。

---

## API 规格

### Props

| 名称 | 类型 | 默认值 | 必填 | 行为说明 |
|---|---|---|---|---|
| `type` | `'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'info'` | 否 | 类型色 |
| `closable` | `boolean` | `false` | 否 | 是否可关闭（显示关闭按钮） |
| `color` | `string` | - | 否 | 自定义背景色（覆盖 type 色值） |
| `effect` | `'dark' \| 'light' \| 'plain'` | `'light'` | 否 | 视觉风格：实色 / 浅底 / 描边 |
| `round` | `boolean` | `false` | 否 | 圆角样式 |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | 否 | 尺寸 |
| `disabled` | `boolean` | `false` | 否 | 禁用，不可关闭 |

### Emits

| 事件名 | 载荷类型 | 触发时机 |
|---|---|---|
| `close` | `MouseEvent` | 点击关闭按钮时（disabled 时不触发） |

### Slots

| 名称 | 说明 |
|---|---|
| `default` | 标签文本内容 |

### Expose

无。

---

## 行为约束

### 渲染与 DOM

- **B-01** 根元素为 `<span>`，class 含 `vc-tag`
- **B-02** `type` 非默认时，class 含 `vc-tag--{type}`（如 `vc-tag--success`）
- **B-03** `effect` 非默认时，class 含 `vc-tag--{effect}`（如 `vc-tag--plain`）
- **B-04** `round=true` 时，class 含 `vc-tag--round`
- **B-05** `size` 非默认时，class 含 `vc-tag--{size}`（如 `vc-tag--small`）
- **B-06** `disabled=true` 时，class 含 `vc-tag--disabled`

### 自定义颜色

- **B-07** `color` 有值时，根元素 `style.backgroundColor` 为该值，且不再添加 type 色的 class

### 关闭

- **B-08** `closable=true` 时，渲染关闭按钮（class `vc-tag__close`），按钮为可点击元素
- **B-09** `closable=false` 时，不渲染关闭按钮
- **B-10** 点击关闭按钮时，触发 `close` 事件
- **B-11** `disabled=true` 时，点击关闭按钮不触发 `close` 事件

### 内容

- **B-12** 默认 slot 内容渲染在根元素内部

---

## 边界条件与异常

- **E-01** `color` 与 `type` 同时传入：`color` 优先，type 色的 class 不添加
- **E-02** `closable=true` 且 `disabled=true`：仍渲染关闭按钮，但点击不触发事件
- **E-03** 默认 slot 为空：渲染一个空的标签框，不报错
- **E-04** `effect` 与 `color` 同时传入：`color` 只控制背景色，effect 的 class 仍添加

---

## 可访问性（a11y）

- **A-01** 根元素 `role="status"`，让屏幕阅读器能播报标签内容
- **A-02** 关闭按钮为 `<button type="button">`，有 `aria-label="关闭"`
- **A-03** `disabled=true` 时，关闭按钮设置 `aria-disabled="true"` 且 `tabindex="-1"`

---

## 测试用例清单

| 编号 | 关联行为 | Given | When | Then | 优先级 |
|---|---|---|---|---|---|
| T-01 | B-01 | mount，slot 文本 `'标签'` | 取根元素 | tagName `SPAN`，class 含 `vc-tag`，文本含 `'标签'` | P0 |
| T-02 | B-02 | `{ type: 'success' }` | 取 class | 含 `vc-tag--success` | P0 |
| T-03 | B-03 | `{ effect: 'plain' }` | 取 class | 含 `vc-tag--plain` | P0 |
| T-04 | B-04 | `{ round: true }` | 取 class | 含 `vc-tag--round` | P1 |
| T-05 | B-05 | `{ size: 'small' }` | 取 class | 含 `vc-tag--small` | P0 |
| T-06 | B-06 | `{ disabled: true }` | 取 class | 含 `vc-tag--disabled` | P1 |
| T-07 | B-07 | `{ color: '#f00' }` | 取 style/class | style.backgroundColor 含 `#f00`，不含 `vc-tag--info` | P1 |
| T-08 | B-08 | `{ closable: true }` | 查找关闭按钮 | 存在 `vc-tag__close` | P0 |
| T-09 | B-09 | `{ closable: false }` | 查找关闭按钮 | 不存在 | P0 |
| T-10 | B-10 | `{ closable: true }`，点击关闭按钮 | 取 emitted | 有 `close` 事件 | P0 |
| T-11 | B-11 | `{ closable: true, disabled: true }`，点击关闭按钮 | 取 emitted | 无 `close` 事件 | P1 |
| T-12 | B-12 | slot 文本 `'内容'` | 取根元素文本 | 含 `'内容'` | P0 |
| T-13 | E-01 | `{ type: 'success', color: '#f00' }` | 取 class | 不含 `vc-tag--success` | P2 |
| T-14 | A-02 | `{ closable: true }` | 取关闭按钮 | tagName `BUTTON`，aria-label 为 `'关闭'` | P1 |
| T-15 | A-03 | `{ closable: true, disabled: true }` | 取关闭按钮 aria | aria-disabled 为 `'true'`，tabindex 为 `'-1'` | P2 |

---

## 实现提示

### 1. 结构

```html
<span class="vc-tag" :class="tagClass" :style="tagStyle">
    <slot></slot>
    <button
        v-if="closable"
        type="button"
        class="vc-tag__close"
        aria-label="关闭"
        :aria-disabled="disabled"
        :tabindex="disabled ? -1 : 0"
        @click="handleClose"
    >x</button>
</span>
```

### 2. 关键提示

- `color` 有值时，`tagStyle` 设置 `backgroundColor`，且 `tagClass` 计算时跳过 type 色的 class
- `effect` 的 class 与 `color` 互不干扰，effect 控制视觉风格（描边/浅底），color 只控制背景色
- 关闭按钮用原生 `<button type="button">` 保证键盘可达
- `disabled` 时关闭按钮的 click 处理直接 return，不触发事件

### 3. 重构方向

- 类型色与 effect 的组合样式集中在 `tag.scss`，class 命名遵循 BEM
- 若后续需支持图标标签，新增 `icon` slot 即可，不影响现有结构
