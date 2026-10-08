# VcSwitch 组件 SDD 文档

> 本文件是组件级 SDD（Specification-Driven Development）文档框架。
> 完整规格以 [`docs/stage-2-form/Switch.spec.md`](../../../docs/stage-2-form/Switch.spec.md) 为准，本文件用于组件目录内就近查阅与维护记录。
> 框架结构与总指南 [`docs/00-overview.md`](../../../docs/00-overview.md) 第三节"`<script>` 块约定"及单组件 spec 模板对齐。

---

## 1. 元数据

| 字段 | 值 |
|---|---|
| 组件名 | `VcSwitch` |
| 分类 | 表单 |
| 所属阶段 | Stage-2 |
| 依赖组件 | 无（无 Group 协作，三个选择类组件中结构最简单） |
| 文件位置 | `src/components/switch/Switch.vue` |
| 测试文件 | `src/components/switch/Switch.test.ts` |

---

## 2. 设计意图

提供开关控件，用于在两个互斥状态间即时切换（开/关），比 Checkbox 更强调"即时生效"的开关语义。

**不解决**：三态（用 Checkbox 的 indeterminate）、多选（用 CheckboxGroup）。

**与 Checkbox 的核心差异**：
- 语义是"即时切换"而非"勾选收集"，点击即发新值，无 Group
- 激活态 class 是 `vc-switch--active`（Checkbox 是 `--checked`）
- 用 `<button role="switch">` 而非 `<input type="checkbox">`
- 多一个 `loading` 态（切换中不可操作）与开/关两侧文本
- 切换新值从 `!props.modelValue` 派生，不读 DOM 的 checked

---

## 3. API 规格

### 3.1 Props

| 名称 | 类型 | 默认值 | 必填 | 行为说明 |
|---|---|---|---|---|
| `modelValue` | `boolean` | `false` | 否 | 开关状态，`v-model` |
| `disabled` | `boolean` | `false` | 否 | 禁用 |
| `loading` | `boolean` | `false` | 否 | 加载态，切换中不可操作 |
| `activeText` | `string` | `''` | 否 | 开启时文本；**仅开启且有值时显示** |
| `inactiveText` | `string` | `''` | 否 | 关闭时文本；**仅关闭且有值时显示** |
| `size` | `'small' \| 'medium' \| 'large'`（由 `SizeStateEnum` 派生） | `'medium'` | 否 | 尺寸，映射 class `vc-switch--${size}` |

### 3.2 Emits

| 事件名 | 载荷类型 | 触发时机 |
|---|---|---|
| `update:modelValue` | `boolean` | 切换时（点击且非 disabled/loading），载荷为新值 |
| `change` | `boolean` | 同上 |

### 3.3 Slots

spec 声明为**无**。实现保留了一个具名插槽 `loading`（位于 `vc-switch__loading` 节点内）用于自定义加载指示，属 spec 之外的实现补充。

### 3.4 Expose

无。组件不暴露任何 ref 方法。

---

## 4. 行为约束

### 4.1 渲染

- **B-01** 根元素 class 含 `vc-switch`，角色为开关（`role="switch"`）
- **B-02** `modelValue=true` 时根 class 含 `vc-switch--active`，`aria-checked="true"`
- **B-03** `modelValue=false` 时 `aria-checked="false"`
- **B-04** 内部含滑块节点（`vc-switch__handle`）
- **B-05** `activeText` 有值且开启时显示；`inactiveText` 有值且关闭时显示（两者同传时每个状态只显示一个）

### 4.2 切换

- **B-06** 关闭态点击时触发 `update:modelValue`（载荷 `true`）
- **B-07** 开启态点击时触发 `update:modelValue`（载荷 `false`）
- **B-08** 切换同时触发 `change`（载荷为新值）

### 4.3 禁用与加载

- **B-09** `disabled=true` 时点击无事件，class 含 `vc-switch--disabled`
- **B-10** `loading=true` 时点击无事件，class 含 `vc-switch--loading`，显示加载指示
- **B-11** `disabled` 与 `loading` 同时：均不可操作

### 4.4 尺寸

- **B-12** `size` 映射 class `vc-switch--${size}`

---

## 5. 边界条件与异常

- **E-01** `modelValue` 非布尔：按 truthy 处理（TS 类型已约束为 `boolean`，运行时不额外防御）
- **E-02** loading 期间外部仍可改 modelValue：以 props 为准（受控组件，`aria-checked`/class 跟随 props），但用户不可操作

### 5.1 实现补充（spec 之外，已实现）

- **不复用 `useCheckEvent`**：该 composable 内部取 `e.target.checked`（[Event.ts](../../utils/Event.ts)）且只判 disabled。绑到 `<button @click>` 时 button 无 `.checked`，emit 载荷变成 `undefined`，也不判 loading。Switch 写本地 `onClick`：`if (disabled || loading) return; const next = !props.modelValue; emit(...)`，不需要 Event 参数
- **单根结构**：直接以 `<button type="button" role="switch">` 为根，class/role/aria 全挂同一层（早期实现是外层 `div.vc-switch` 包 button，导致根元素 class 与 role 分层）
- **状态 class 条件化**：`useFormControl('vc-switch', props.size)` 只提供基础两项，组件内包一层 computed 用对象语法追加 `--active` / `--disabled` / `--loading`
- **不可操作双防线**：原生 `:disabled="disabled || loading"`（浏览器移出 Tab 序列）+ JS 守卫（test-utils 的 `trigger('click')` 是手动 dispatchEvent，绕过原生 disabled，必须靠 JS 拦截）
- **文本显示带状态条件**：`v-if="modelValue && activeText"` / `v-if="!modelValue && inactiveText"`，防止两个文本同时渲染
- 保留具名 slot `loading`（spec 声明无 slot），class 已按 BEM 命名为 `vc-switch__loading`（非从 Button 拷来的 `vc-button__loading`）

---

## 6. 可访问性（a11y）

- **A-01** 用 `<button type="button" role="switch">`，原生支持键盘 Space/Enter 切换（jsdom 不测键盘联动，靠真机浏览器）
- **A-02** 用 `aria-checked` 表达当前状态（`role="switch"` 的配套属性，**不是** `aria-pressed`）；布尔经 Vue 渲染为字符串 `'true'/'false'`
- **A-03** disabled 用原生 `disabled` 属性，浏览器自动移出 Tab 序列；loading 也并入 `:disabled` 绑定

---

## 7. 测试用例清单

> 优先级：P0 必做 / P1 应做 / P2 可选。当前 11/11 全绿。

| 编号 | 关联行为 | Given | When | Then | 优先级 |
|---|---|---|---|---|---|
| T-01 | B-01 | mount | 取根元素 | class 含 `vc-switch`，role 为 `switch` | P0 |
| T-02 | B-02 | `{ modelValue: true }` | 取属性 | class 含 `--active`，aria-checked `'true'` | P0 |
| T-03 | B-03 | mount（默认关） | 取 aria-checked | `'false'` | P0 |
| T-04 | B-04 | mount | 找滑块 | 存在 `vc-switch__handle` | P0 |
| T-05 | B-05 | activeText/inactiveText **同传** | 分别取开/关两态文本 | 开启只含 `'开'` 不含 `'关'`，关闭反之 | P1 |
| T-06 | B-06 | `{ modelValue: false }` | 点 button | `update:modelValue` 载荷 `true` | P0 |
| T-07 | B-07 | `{ modelValue: true }` | 点 button | `update:modelValue` 载荷 `false` | P0 |
| T-08 | B-08 | 关闭态点击 | 取 change | 载荷 `true` | P1 |
| T-09 | B-09 | `{ disabled: true }` | 取 class + 点击 | 含 `--disabled`，无任何事件 | P0 |
| T-10 | B-10/B-11 | `{ loading: true }` | 取 class + 点击 | 含 `--loading`，无任何事件 | P0 |
| T-11 | B-12 | `{ size: 'small' }` | 取 class | 含 `vc-switch--small` | P1 |

### 7.1 测试注意点

- **T-05 必须两个文本同传**：若每次只传一个文本再 mount，"两个 span 无条件同时渲染"的 bug 也能通过；同传后用 `not.toContain` 才能卡住互斥显示
- button 交互统一用 `await wrapper.find('button').trigger('click')`（不是 input 的 `setValue`）
- `aria-checked` 取 attribute（字符串），断言 `'true'/'false'`；Switch 无 checked DOM property 需求
- T-09/T-10 即使原生 `:disabled` 生效，仍依赖组件 JS 守卫——jsdom 下 `trigger('click')` 会绕过 disabled

---

## 8. 实现提示

> 不给完整代码，只给关键提示。实际实现见 [Switch.vue](./Switch.vue)。

### 8.1 组件骨架

`<script setup lang="ts">`：`withDefaults(defineProps<SwitchProps>())` 提供 6 个默认值；`defineEmits<SwitchEmits>()` 声明 2 个事件。模板为单个 `<button type="button" role="switch">`，内含 loading 指示、滑块、两侧条件文本。

### 8.2 关键提示

- 切换逻辑本地写：`if (props.disabled || props.loading) return; const next = !props.modelValue; emit('update:modelValue', next); emit('change', next);`
- class：`const baseClasses = useFormControl('vc-switch', props.size)` 再包 computed 追加三个条件 class 对象
- aria：`:aria-checked="modelValue"`，切勿写成 `aria-pressed`
- 模板绑定：`:disabled="disabled || loading"` / `@click="onClick"`（不带 `$event`，新值由 props 派生）
- 滑块：`<span class="vc-switch__handle"></span>`，位置由 CSS 根据 `--active` 切换，不写内联 style
- 文本：两个 span 各带"状态 && 文本"双条件

### 8.3 不要做的事

- 不要把 `useCheckEvent` 绑给 button（target.checked 为 undefined，且不判 loading）
- 不要用 div 包 button 的双根结构（class 与 role 会分层）
- 不要把 `--active` 写成 `--checked`（Checkbox 命名串台）
- 不要只靠原生 disabled 拦截点击（测试与部分场景绕过）

---

## 9. 完成自查

- [x] 测试全绿（11/11），每条 P0 行为都有对应测试
- [x] 没有实现 spec 未列出的功能（`loading` 具名 slot 为唯一超出项，已在第 5.1 节注明）
- [x] Props 类型签名与 spec 完全一致（6 个，全部 optional，defaults 由 `withDefaults` 提供）
- [x] disabled / loading 双守卫覆盖点击（JS + 原生属性两层）
- [x] 单一事件源：点击只 emit 子组件自身的两个事件，无 Group 双重触发问题
- [x] A-01 / A-02 / A-03 通过原生 button + aria-checked + 原生 disabled 实现
- [x] 组件文件结构与总指南约定一致（`<script setup lang="ts">`）
- [x] E-02 由受控模式天然满足：loading 期间 props 仍可外部更新，视觉跟随 props

---

## 10. 变更记录

| 版本 | 日期 | 变更说明 |
|---|---|---|
| 0.0.0 | 2026-10-08 | 初始空框架 |
| 0.1.0 | 2026-10-08 | 按 spec 填充全部章节；实现完成，11/11 测试通过。关键决策：不复用 `useCheckEvent`（button 无 checked property 且不判 loading），本地 `onClick` 从 `!modelValue` 派生新值；外层 div 拍平为单 button 根；`aria-checked` 替代误用的 `aria-pressed`；`--active` 替代串台的 `--checked`；状态 class 经 computed 条件追加；文本 v-if 加状态条件（T-05 加强为两文本同传互斥断言）；保留 spec 外的 `loading` 具名插槽，class 修正为 `vc-switch__loading` |
