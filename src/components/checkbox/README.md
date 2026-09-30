# VcCheckbox 组件 SDD 文档

> 本文件是组件级 SDD（Specification-Driven Development）文档框架。
> 完整规格以 [`docs/stage-2-form/Checkbox.spec.md`](../../../docs/stage-2-form/Checkbox.spec.md) 为准，本文件用于组件目录内就近查阅与维护记录。
> 框架结构与总指南 [`docs/00-overview.md`](../../../docs/00-overview.md) 第三节"`<script>` 块约定"及单组件 spec 模板对齐。

---

## 1. 元数据

| 字段 | 值 |
|---|---|
| 组件名 | `VcCheckbox` |
| 分类 | 表单 |
| 所属阶段 | Stage-2 |
| 依赖组件 | 无（CheckboxGroup 通过 provide/inject 协调，非组件依赖） |
| 文件位置 | `src/components/checkbox/Checkbox.vue` |
| 测试文件 | `src/components/checkbox/Checkbox.test.ts` |

---

## 2. 设计意图

提供受控的复选框，支持选中 / 未选中 / 不确定三态，可单独使用或放入 `CheckboxGroup` 实现多选。

**不解决**：全选逻辑（由不确定态配合业务实现）、树形选择。

---

## 3. API 规格

### 3.1 Props

| 名称 | 类型 | 默认值 | 必填 | 行为说明 |
|---|---|---|---|---|
| `modelValue` | `boolean` | `false` | 否 | 选中状态，支持 `v-model` |
| `label` | `string` | `''` | 否 | 复选框文本 |
| `value` | `string \| number` | `''` | 否 | 在 Group 中该选项的值；为空字符串时不参与 Group 收集 |
| `disabled` | `boolean` | `false` | 否 | 禁用 |
| `indeterminate` | `boolean` | `false` | 否 | 不确定态（视觉横线），不影响 modelValue |
| `size` | `'small' \| 'medium' \| 'large'`（由 `SizeStateEnum` 派生） | `'medium'` | 否 | 尺寸，映射 class `vc-checkbox--${size}` |

### 3.2 Emits

| 事件名 | 载荷类型 | 触发时机 |
|---|---|---|
| `update:modelValue` | `boolean` | 独立模式下切换时，载荷为新的布尔值 |
| `change` | `boolean` | 独立模式下切换时（载荷同新值） |

> Group 模式下子项不 emit `update:modelValue` / `change`，由 `CheckboxGroup` 统一 emit 数组载荷。

### 3.3 Slots

| 名称 | 说明 |
|---|---|
| `default` | 自定义 label 内容（覆盖 `label` prop） |

### 3.4 Expose

无。组件不暴露任何 ref 方法。

---

## 4. 行为约束

### 4.1 渲染与 DOM

- **B-01** 根元素含 class `vc-checkbox`，内部含原生 `<input type="checkbox">`
- **B-02** 原生 input 默认视觉隐藏（绝对定位 + opacity:0），用自定义 span（`vc-checkbox__inner`）显示方框，保留聚焦与 Space 切换能力
- **B-03** `label` prop 有值时渲染文本节点（`vc-checkbox__label`）
- **B-04** default slot 有内容时覆盖 `label` prop

### 4.2 选中态

- **B-05** `modelValue=true` 时原生 input `checked` 为 true，根 class 含 `vc-checkbox--checked`
- **B-06** 点击未选中项时触发 `update:modelValue`（载荷 `true`）
- **B-07** 点击已选中项时触发 `update:modelValue`（载荷 `false`）
- **B-08** 点击同时触发 `change` 事件（载荷为新布尔值）

### 4.3 不确定态

- **B-09** `indeterminate=true` 时根 class 含 `vc-checkbox--indeterminate`
- **B-10** `indeterminate=true` 时原生 input 的 `indeterminate` DOM property 为 true
- **B-11** 不确定态下点击，`update:modelValue` 载荷为 `true`（从不明确变为选中），indeterminate 视觉清除由父组件控制 prop

### 4.4 禁用

- **B-12** `disabled=true` 时原生 input disabled，点击不触发任何事件
- **B-13** `disabled=true` 时根 class 含 `vc-checkbox--disabled`

### 4.5 Group 协作

- **B-14** 在 `CheckboxGroup` 中点击时，调用 `group.toggle(value)` 通知 Group 更新选中数组（不在子项 emit `update:modelValue`）
- **B-15** Group 的禁用状态传递给子 Checkbox：子 `disabled` 与 Group `disabled` 任一为 true 即禁用（`isDisabled` computed）
- **B-16** Group 模式下 `checked` 由 Group 的 `modelValue` 数组派生（`isChecked` computed 用 `group.modelValue.value.includes(props.value)`）

### 4.6 尺寸

- **B-17** `size` 映射 class `vc-checkbox--{size}`

---

## 5. 边界条件与异常

### 5.1 边界条件

- **E-01** `modelValue` 非布尔值：TS 告警，运行时按 truthy 处理
- **E-02** 无 `value`（含空字符串）且在 Group 中：该选项不参与 Group 的值收集，退回独立模式
- **E-03** `indeterminate` 与 `modelValue=true` 同时：以 indeterminate 视觉优先（横线），但 `checked` 仍为 true

### 5.2 实现补充（spec 之外，已实现）

- `isInGroup` 判定使用 `isNotEmpty(props.value)`（排除 `undefined / null / ''`），比 spec 字面 "无 value" 更严格，覆盖默认空字符串场景
- `inject<CheckboxGroupContext | undefined>(key, undefined)` 显式传 `undefined` 默认值以消除 Vue "injection not found" 运行时 warn，同时保持类型为 `CheckboxGroupContext | undefined`
- `onChange` 本地 handler 在 Group 分支只调 `group.toggle()`，不再 emit 子项事件，避免与 Group 的 emit 双重触发

### 5.3 不需要处理（避免过度工程）

- 不做全选 / 反选逻辑（由业务层配合 `indeterminate` 实现）
- 不做树形选择
- 不做键盘自定义（原生 input 已支持 Space 切换）

---

## 6. 可访问性（a11y）

- **A-01** 必须用原生 `<input type="checkbox">`，保留 Space 切换能力
- **A-02** label 文本与 input 通过 `<label>` 包裹关联（点击文本可切换）
- **A-03** 禁用时原生 `disabled` 自动移出 Tab 序列
- **A-04** indeterminate 通过原生 input 的 `indeterminate` property 表达，屏幕阅读器可感知

---

## 7. 测试用例清单

> 优先级：P0 必做 / P1 应做 / P2 可选。当前 17/17 全绿。

| 编号 | 关联行为 | Given | When | Then | 优先级 |
|---|---|---|---|---|---|
| T-01 | B-01 | mount | 取根元素 | class 含 `vc-checkbox`，内部有 `input[type=checkbox]` | P0 |
| T-02 | B-03 | `{ label: '同意' }` | 取 label | 含 `'同意'` | P0 |
| T-03 | B-04 | slots `{ default: '自定义' }` | 取文本 | 含 `'自定义'`，不含 prop 文本 | P1 |
| T-04 | B-05 | `{ modelValue: true }` | 取 input checked / class | `checked=true`，含 `--checked` | P0 |
| T-05 | B-06 | `{ modelValue: false }`，setValue true | 取 emitted | `update:modelValue` 载荷 `true` | P0 |
| T-06 | B-07 | `{ modelValue: true }`，setValue false | 取 emitted | 载荷 `false` | P0 |
| T-07 | B-08 | mount，setValue true | 取 emitted change | 载荷为新值 | P0 |
| T-08 | B-09 | `{ indeterminate: true }` | 取 class | 含 `--indeterminate` | P0 |
| T-09 | B-10 | `{ indeterminate: true }` | 取 input.indeterminate | `true` | P0 |
| T-10 | B-11 | `{ indeterminate: true, modelValue: false }`，setValue true | 取 emitted | 载荷 `true` | P1 |
| T-11 | B-12 | `{ disabled: true }`，trigger click | 取 emitted | 无 `update:modelValue` / `change` | P0 |
| T-12 | B-13 | `{ disabled: true }` | 取 class | 含 `--disabled` | P1 |
| T-13 | B-17 | `{ size: 'large' }` | 取 class | 含 `vc-checkbox--large` | P1 |
| T-14 | B-02 | mount | 查找 | 存在 `vc-checkbox__inner` 节点 | P2 |
| T-15 | B-14 | Group 中放 VcCheckbox `{ value: 'a' }`，setValue true | 取 Group emitted | `update:modelValue` 载荷 `['a']` | P1 |
| T-16 | B-15 | Group `{ disabled: true }`，子 VcCheckbox | 取子 input disabled | `true` | P1 |
| T-17 | E-02 | Group 中放 VcCheckbox 无 value，setValue true | 取 Group emitted | 无 `update:modelValue` | P2 |

---

## 8. 实现提示

> 不给完整代码，只给关键提示。实际实现见 [Checkbox.vue](./Checkbox.vue) 与 [CheckboxGroup.vue](./CheckboxGroup.vue)。

### 8.1 组件骨架

`<script setup lang="ts">`：`withDefaults(defineProps<CheckboxProps>())` 提供 6 个默认值（modelValue / label / value / disabled / indeterminate / size）；`defineEmits<CheckboxEmits<boolean>>()` 声明 2 个事件。模板为 `<label :class="checkboxClasses">` 包裹原生 `<input type="checkbox">` + 自定义 `<span class="vc-checkbox__inner">` + label/slot 文本。

### 8.2 关键提示

- 根容器：用 `<label>` 包裹，点击文本即切换（A-02）；class 由 `checkboxClasses` computed 生成 `['vc-checkbox', 'vc-checkbox--${size}', {条件 class}]`
- 原生 input：`:checked="isChecked"` / `:disabled="isDisabled"` / `:value="value"` / `:indeterminate="indeterminate"` / `@change="onChange"`
- `indeterminate` 是 DOM property 不是 attribute，Vue 模板用 `:indeterminate` 绑定即可生效（Vue 3 对 input 的 indeterminate 做了 property 同步）
- Group context：`const group = inject<CheckboxGroupContext | undefined>(checkboxGroupContextKey, undefined)`，传 `undefined` 默认值消除 Vue warn
- `isInGroup` 用 `!!group && isNotEmpty(props.value)`，比 spec 字面"无 value"更严格，覆盖默认空字符串场景
- `isDisabled` 用 `props.disabled || !!group?.disabled.value`，Group 禁用透传子项（B-15）
- `isChecked` Group 模式 `group!.modelValue.value.includes(props.value)`，独立模式 `props.modelValue`
- `onChange` 本地 handler 分流：
  - `isDisabled.value` → 直接 return
  - `isInGroup.value` → `group!.toggle(props.value)`，不 emit 子项事件
  - 否则 → 调 `useCheckEvent` 返回的 `handleChange(e)`，emit `update:modelValue` + `change`

### 8.3 CheckboxGroup 实现

- `provide(checkboxGroupContextKey, { modelValue: toRef(props, 'modelValue'), disabled: toRef(props, 'disabled'), toggle })`
- `toggle(value)`：拷贝数组，`indexOf` 判断在/不在，`splice` 移除或 `push` 加入，emit `update:modelValue` 与 `change`（载荷为新数组）
- `toRef(props, 'xxx')` 保证子组件拿到的是响应式引用（B-15 动态禁用）
- 模板最简：`<div class="vc-checkbox-group"><slot /></div>`

### 8.4 测试骨架提示

使用 `@vue/test-utils` 的 `mount`。断言按目标区分：根 class 用 `wrapper.classes()`、input property 用 `(wrapper.find('input').element as HTMLInputElement).xxx`、子节点用 `find('.vc-checkbox__xxx').exists()`、事件用 `wrapper.emitted('xxx')`。触发用 `await input.setValue(true / false)`（设值 + 派发 change）、`await input.trigger('click')`。

注意：
- T-15 / T-17 测 Group 行为时，`wrapper` 是 `VcCheckboxGroup`，`emitted('update:modelValue')` 取的是 Group 的 emission，不是子项
- T-17（E-02）依赖 `isInGroup` 把空字符串 value 排除，否则会调用 `group.toggle('')` 误触发 Group 的 `update:modelValue`

### 8.5 重构方向

- 事件 emit 逻辑已抽 `useCheckEvent` composable（独立模式复用，未来 Radio / Switch 可共享）
- Group 协作逻辑是 Checkbox 独有语义，保留在 `Checkbox.vue` / `CheckboxGroup.vue`，不上提到 composable

---

## 9. 完成自查

- [x] 测试全绿（17/17），每条 P0 行为都有对应测试
- [x] 没有实现 spec 未列出的功能（`isInGroup` 排除空字符串 / `onChange` 分流 / inject 默认值消除 warn 是 spec E-02 与运行时 warn 的合理延伸，已注明）
- [x] props 类型签名与 spec 完全一致（6 个字段，`CheckboxProps` 接口，全部 optional）
- [x] disabled 守卫覆盖 `onChange`（含 Group disabled 透传）
- [x] Group 模式不重复 emit 子项 `update:modelValue` / `change`
- [x] indeterminate 通过原生 input property 表达（A-04）
- [x] 组件文件结构与总指南约定一致（`<script setup lang="ts">`，符合第四节 4.3）

---

## 10. 变更记录

| 版本 | 日期 | 变更说明 |
|---|---|---|
| 0.0.0 | 2026-09-30 | 初始空框架 |
| 0.1.0 | 2026-09-30 | 按 spec 填充全部章节；实现完成，17/17 测试通过。关键决策：`useCheckEvent` composable 复用独立模式 emit；`Checkbox.vue` 本地 `onChange` 分流 Group / 独立模式（Group 只调 `group.toggle()`，不重复 emit 子项事件）；`isInGroup` 用 `isNotEmpty(props.value)` 覆盖空字符串场景；`inject<T | undefined>(key, undefined)` 消除 Vue "injection not found" warn 同时保留类型安全；`CheckboxGroup.vue` 补 `<template><slot /></template>` 让子项可渲染 |
