# Tooltip 组件规格

## 元数据

| 字段 | 值 |
|---|---|
| 组件名 | `VcTooltip` |
| 分类 | 数据展示 |
| 所属阶段 | Stage-3 |
| 依赖组件 | 无 |
| 文件位置 | `src/components/tooltip/Tooltip.vue` |
| 测试文件 | `src/components/tooltip/Tooltip.test.ts` |

---

## 设计意图

在目标元素上悬浮或聚焦时展示文字提示，用于补充说明、解释图标含义、展示截断文本的完整内容。支持显隐控制与触发方式配置。

**不解决**：富内容弹出层（Popover 组件）、下拉菜单（Select / Dropdown）、确认对话框（Dialog）。Tooltip 只承载纯文本提示。

---

## API 规格

### Props

| 名称 | 类型 | 默认值 | 必填 | 行为说明 |
|---|---|---|---|---|
| `content` | `string` | - | 否 | 提示文本 |
| `placement` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | 否 | 提示出现位置 |
| `trigger` | `'hover' \| 'focus' \| 'click'` | `'hover'` | 否 | 触发方式 |
| `modelValue` | `boolean` | - | 否 | 手动控制显隐（支持 `v-model`） |
| `disabled` | `boolean` | `false` | 否 | 禁用提示 |
| `showArrow` | `boolean` | `true` | 否 | 是否显示箭头 |
| `hideAfter` | `number` | - | 否 | 延迟隐藏毫秒数 |

### Emits

| 事件名 | 载荷类型 | 触发时机 |
|---|---|---|
| `update:modelValue` | `boolean` | 显隐状态变化时 |
| `show` | - | 提示显示时 |
| `hide` | - | 提示隐藏时 |

### Slots

| 名称 | 说明 |
|---|---|
| `default` | 触发元素（Tooltip 附着的目标） |
| `content` | 自定义提示内容（覆盖 content prop） |

### Expose

无。

---

## 行为约束

### 渲染与 DOM

- **B-01** 根元素为 `<span>`，class 含 `vc-tooltip`（包裹触发元素）
- **B-02** 提示浮层节点 class 含 `vc-tooltip__popper`
- **B-03** `placement` 决定浮层 class 的方向修饰，如 `vc-tooltip__popper--top`
- **B-04** `showArrow=true` 且浮层显示时，渲染箭头节点（class `vc-tooltip__arrow`）
- **B-05** `showArrow=false` 时，不渲染箭头节点

### 显隐控制

- **B-06** `modelValue` 有值（非 undefined）时，使用受控模式：显隐完全由 `modelValue` 决定
- **B-07** `modelValue` 无值（undefined）时，使用非受控模式：由 trigger 行为切换显隐
- **B-08** `disabled=true` 时，任何触发方式都不显示提示
- **B-09** 提示显示时，触发 `update:modelValue`（载荷 true）、`show` 事件
- **B-10** 提示隐藏时，触发 `update:modelValue`（载荷 false）、`hide` 事件

### 触发方式

- **B-11** `trigger='hover'` 时，鼠标进入触发元素显示，离开隐藏
- **B-12** `trigger='focus'` 时，触发元素聚焦显示，失焦隐藏
- **B-13** `trigger='click'` 时，点击触发元素切换显隐

### 内容

- **B-14** `content` prop 有值时，渲染为提示文本
- **B-15** 提供 `content` slot 时，覆盖 `content` prop 的渲染
- **B-16** `content` 无值且无 `content` slot 时，浮层内为空（仍可显示空浮层）

### 隐藏延迟

- **B-17** `hideAfter` 有值且为正数时，隐藏动作延迟指定毫秒后执行

---

## 边界条件与异常

- **E-01** `content` 为空字符串：视为有内容（空字符串），浮层显示但无文本
- **E-02** `disabled=true` 且 `modelValue=true`：受控模式下仍显示（disabled 只阻止 trigger 触发，不阻止受控显示）
- **E-03** `trigger='click'` 且已显示时再次点击：隐藏
- **E-04** `hideAfter` 为 0 或负数：立即隐藏，不延迟
- **E-05** `modelValue` 从外部切回 false 时，即使 trigger 是 hover 且鼠标仍在内：立即隐藏

---

## 可访问性（a11y）

- **A-01** 提示浮层节点 `role="tooltip"`
- **A-02** 触发元素通过 `aria-describedby` 关联浮层节点 id
- **A-03** `trigger='focus'` 时，键盘 Tab 聚焦可触发提示（原生支持）
- **A-04** `trigger='hover'` 时，纯鼠标触发，键盘用户无法看到提示（设计取舍，非 a11y 缺陷）

---

## 测试用例清单

| 编号 | 关联行为 | Given | When | Then | 优先级 |
|---|---|---|---|---|---|
| T-01 | B-01 | mount，slot 触发元素 | 取根元素 | tagName `SPAN`，class 含 `vc-tooltip` | P0 |
| T-02 | B-02 | mount，显示提示 | 查找浮层 | 存在 `vc-tooltip__popper` | P0 |
| T-03 | B-03 | `{ placement: 'bottom' }`，显示提示 | 取浮层 class | 含 `vc-tooltip__popper--bottom` | P0 |
| T-04 | B-04 | `{ showArrow: true }`，显示提示 | 查找箭头 | 存在 `vc-tooltip__arrow` | P1 |
| T-05 | B-05 | `{ showArrow: false }`，显示提示 | 查找箭头 | 不存在 | P1 |
| T-06 | B-06 | `{ modelValue: true }` | 查找浮层 | 显示 | P0 |
| T-07 | B-07 | 无 modelValue，`{ trigger: 'hover' }`，触发 mouseenter | 查找浮层 | 显示 | P0 |
| T-08 | B-08 | `{ disabled: true }`，触发 mouseenter | 查找浮层 | 不显示 | P0 |
| T-09 | B-09 | 显示提示 | 取 emitted | 有 `update:modelValue`（true）与 `show` | P0 |
| T-10 | B-10 | 隐藏提示 | 取 emitted | 有 `update:modelValue`（false）与 `hide` | P0 |
| T-11 | B-11 | `{ trigger: 'hover' }`，mouseenter 后 mouseleave | 查找浮层 | 先显示后隐藏 | P0 |
| T-12 | B-12 | `{ trigger: 'focus' }`，触发 focus | 查找浮层 | 显示 | P0 |
| T-13 | B-13 | `{ trigger: 'click' }`，点击触发元素 | 查找浮层 | 显示；再次点击隐藏 | P0 |
| T-14 | B-14 | `{ content: '提示' }`，显示提示 | 取浮层文本 | 含 `'提示'` | P0 |
| T-15 | B-15 | slots `{ content: '<span>自定义</span>' }` | 取浮层内容 | 含 `'自定义'`，不含 content prop 文本 | P1 |
| T-16 | B-17 | `{ hideAfter: 100 }`，触发隐藏 | 等待后检查 | 延迟后隐藏 | P2 |
| T-17 | E-02 | `{ disabled: true, modelValue: true }` | 查找浮层 | 显示（受控模式优先） | P1 |
| T-18 | E-03 | `{ trigger: 'click' }`，点击两次 | 取浮层 | 第一次显示，第二次隐藏 | P1 |
| T-19 | E-05 | `{ modelValue: true }`，改为 false | 查找浮层 | 隐藏 | P1 |
| T-20 | A-01 | 显示提示 | 取浮层 role | 为 `'tooltip'` | P1 |
| T-21 | A-02 | mount | 取触发元素 aria-describedby | 存在且指向浮层 id | P1 |

---

## 实现提示

### 1. 结构

```html
<span class="vc-tooltip" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave" @click="onClick">
    <slot></slot>
    <Transition name="vc-tooltip-fade">
        <span
            v-show="visible"
            ref="popperRef"
            class="vc-tooltip__popper"
            :class="`vc-tooltip__popper--${placement}`"
            role="tooltip"
            :id="tooltipId"
        >
            <span class="vc-tooltip__content">
                <slot name="content">{{ content }}</slot>
            </span>
            <span v-if="showArrow" class="vc-tooltip__arrow"></span>
        </span>
    </Transition>
</span>
```

### 2. 关键提示

- `visible` 计算属性：受控模式用 `modelValue`，非受控模式用内部 `ref` + trigger 事件
- 受控模式判定：`modelValue !== undefined`
- `disabled` 只在非受控模式下拦截 trigger；受控模式下显隐完全由 `modelValue` 决定
- `trigger='focus'`：在触发元素上监听 `focus` / `blur`（注意触发元素需可聚焦，如 `<button>` / `<input>` / 带 `tabindex` 的元素）
- `trigger='click'`：点击切换内部状态（非受控模式）
- `hideAfter` 用 `setTimeout` 实现，隐藏前清除定时器
- 浮层的 `id` 用于 `aria-describedby` 关联，id 需保证唯一性
- 本阶段不实现精准的浮层定位（依赖 CSS absolute 简单定位），精准定位留给后续 Popper 升级

### 3. 重构方向

- 浮层定位逻辑后续可抽 `usePopper` composable，复用于 Popover / Dropdown
- trigger 事件处理可抽 `useTooltipTrigger`，支持更多触发方式
- 若后续支持手动 `open` / `close` 方法，通过 defineExpose 暴露
