# VcRadio 组件 SDD 文档

> 本文件是组件级 SDD（Specification-Driven Development）文档框架。
> 完整规格以 [`docs/stage-2-form/Radio.spec.md`](../../../docs/stage-2-form/Radio.spec.md) 为准，本文件用于组件目录内就近查阅与维护记录。
> 框架结构与总指南 [`docs/00-overview.md`](../../../docs/00-overview.md) 第三节"`<script>` 块约定"及单组件 spec 模板对齐。

---

## 1. 元数据

| 字段 | 值 |
|---|---|
| 组件名 | `VcRadio` / `VcRadioGroup` |
| 分类 | 表单 |
| 所属阶段 | Stage-2 |
| 依赖组件 | RadioGroup 通过 provide/inject 协调，非组件依赖 |
| 文件位置 | `src/components/radio/Radio.vue`、`src/components/radio/RadioGroup.vue` |
| 测试文件 | `src/components/radio/Radio.test.ts` |

---

## 2. 设计意图

提供受控的单选控件。Radio 单独使用意义有限，主要在 `RadioGroup` 内实现互斥选择。

**不解决**：多选（用 Checkbox）、卡片式选项布局（可通过样式扩展）。

**与 Checkbox 的核心差异**：
- 单选 vs 多选：`modelValue` 是单值 `string | number` 而非数组
- 无 `indeterminate` 三态
- 必须共享 `name` 属性才能让浏览器原生方向键互斥（a11y 关键）
- 点击已选中项不触发事件（B-06）

---

## 3. API 规格

### 3.1 VcRadioGroup Props

| 名称 | 类型 | 默认值 | 必填 | 行为说明 |
|---|---|---|---|---|
| `modelValue` | `string \| number` | `''` | 否 | 当前选中值，`v-model` |
| `disabled` | `boolean` | `false` | 否 | 整组禁用，透传给子 Radio |
| `direction` | `'horizontal' \| 'vertical'`（由 `DirectionStateEnum` 派生） | `'horizontal'` | 否 | 排列方向，映射 class `vc-radio-group--${direction}` |

### 3.2 VcRadioGroup Emits

| 事件名 | 载荷类型 | 触发时机 |
|---|---|---|
| `update:modelValue` | `string \| number` | 选中项变化时（点击未选中 Radio） |
| `change` | `string \| number` | 同上 |

> 点击已选中 Radio 不触发任何事件（B-06，由 RadioGroup 的 `toggle` 与 Radio 的 `isChecked` 守卫双重拦截）。

### 3.3 VcRadio Props

| 名称 | 类型 | 默认值 | 必填 | 行为说明 |
|---|---|---|---|---|
| `value` | `string \| number` | `''` | 否 | 该选项的值；为空字符串时不参与 Group 收集（与 Checkbox 一致） |
| `label` | `string` | `''` | 否 | 选项文本，渲染为 `vc-radio__label` |
| `disabled` | `boolean` | `false` | 否 | 单项禁用，与 Group disabled 叠加（`isDisabled` computed） |
| `size` | `'small' \| 'medium' \| 'large'`（由 `SizeStateEnum` 派生） | `'medium'` | 否 | 尺寸，映射 class `vc-radio--${size}` |

### 3.4 Slots

| 组件 | 名称 | 说明 |
|---|---|---|
| VcRadio | `default` | 自定义文本（覆盖 `label`） |
| VcRadioGroup | `default` | 若干 VcRadio |

### 3.5 Expose

无。组件不暴露任何 ref 方法。

---

## 4. 行为约束

### 4.1 渲染与 DOM

- **B-01** Radio 根 class 含 `vc-radio`，内部含原生 `<input type="radio">`
- **B-02** Radio `label` prop 有值时渲染文本节点 `vc-radio__label`
- **B-03** RadioGroup 根 class 含 `vc-radio-group`，`direction` 映射 class `vc-radio-group--${direction}`

### 4.2 选中（Group 内）

- **B-04** Group `modelValue` 等于某 Radio 的 `value` 时，该 Radio 选中（input `checked=true`，class 含 `vc-radio--checked`）
- **B-05** 点击未选中 Radio 时，Group 触发 `update:modelValue`（载荷为该 Radio 的 `value`）
- **B-06** 点击已选中 Radio 时，不触发事件（值不变）
- **B-07** 选中变化同时触发 Group 的 `change` 事件

### 4.3 禁用

- **B-08** Radio `disabled=true` 或 Group `disabled=true` 时，该 Radio 不可点击
- **B-09** 禁用 Radio class 含 `vc-radio--disabled`

### 4.4 互斥

- **B-10** Group 内同一时刻只有一个 Radio 选中（选中 A 后 B 自动取消）

### 4.5 单独使用

- **B-11** Radio 无 Group context 时，点击通过自身 emit（本阶段仅保证不报错，不强制支持独立 v-model）

---

## 5. 边界条件与异常

- **E-01** Group 中无任何 Radio 的 `value` 匹配 `modelValue`：无选中项
- **E-02** 多个 Radio 使用相同 `value`：它们会同时选中（业务应避免）
- **E-03** Radio 缺少 `value` prop（默认 `''`）：不参与 Group 收集，退回独立模式（实现用 `isNotEmpty(props.value)` 判定，与 Checkbox 一致）

### 5.1 实现补充（spec 之外，已实现）

- `isInGroup` 判定使用 `isNotEmpty(props.value)`（排除 `undefined / null / ''`），与 Checkbox 一致，覆盖默认空字符串场景
- `inject<RadioGroupContext | undefined>(radioGroupKey, undefined)` 显式传 `undefined` 默认值以消除 Vue "injection not found" warn，同时保持类型为 `RadioGroupContext | undefined`
- `onChange` 本地 handler 分流：
  - `isDisabled.value` → 直接 return（含 Group disabled 透传）
  - `isChecked.value` → 直接 return（B-06 在 Radio 侧的守卫，与 Group `toggle` 兜底双保险）
  - `isInGroup.value` → 调 `group.toggle!(props.value)`，不 emit 子项事件
  - 否则 → 调 `useCheckEvent` 返回的 `handleChange(e)`
- `useId()` 生成同组唯一 name，包成 ref 注入 context，子 Radio `<input :name="group?.name?.value">` 绑定（A-01 / A-02）
- `radioClasses` 用条件 class `{ 'vc-radio--checked': isChecked.value }` / `{ 'vc-radio--disabled': isDisabled.value }`（避免无条件常量导致的视觉 bug）

### 5.2 不需要处理（避免过度工程）

- 不做卡片式选项布局（spec 明确不解决）
- 不做独立模式 v-model（spec B-11 仅要求不报错）
- 不做自定义键盘导航（原生 radio 共享 name 后方向键互斥已足够）

---

## 6. 可访问性（a11y）

- **A-01** 必须用原生 `<input type="radio">`，同组共享 `name` 后浏览器原生支持方向键切换
- **A-02** Group 用 `useId()`（Vue 3.5）生成唯一 name，通过 `provide` 注入 context，子 Radio `<input :name>` 绑定
- **A-03** `<label>` 包裹 `<input>`（隐式关联），点击 label 文本能切换选中（浏览器原生行为）

> A-01 / A-02 在 jsdom 层面只能验证"共享 name"（T-12），键盘方向键联动需真机浏览器测；A-03 同理，jsdom 不模拟 label click → input change 联动，T-13 改为验证 label 包裹 input 的结构关系。

---

## 7. 测试用例清单

> 优先级：P0 必做 / P1 应做 / P2 可选。当前 13/13 全绿。

| 编号 | 关联行为 | Given | When | Then | 优先级 |
|---|---|---|---|---|---|
| T-01 | B-01 | mount VcRadio | 查找 | class 含 `vc-radio`，有 `input[type=radio]` | P0 |
| T-02 | B-02 | `{ value: 'a', label: '选项A' }` | 取文本 | 含 `'选项A'` | P0 |
| T-03 | B-03 | Group `{ direction: 'vertical' }` | 取 class | 含 `vc-radio-group` 与 `vc-radio-group--vertical` | P1 |
| T-04 | B-04 | Group modelValue `'a'`，含 Radio value `'a'` | 取该 Radio | input checked=true，class 含 `--checked` | P0 |
| T-05 | B-05 | Group modelValue `'a'`，点击 value=`'b'` 的 Radio | 取 Group emitted | `update:modelValue` 载荷 `'b'` | P0 |
| T-06 | B-06 | 点击已选中 Radio | 取 emitted | 无 `update:modelValue` | P0 |
| T-07 | B-07 | 切换选中 | 取 emitted | 有 `change`，载荷为新 value | P1 |
| T-08 | B-08 | Group disabled，点击 Radio | 取 emitted | 无事件 | P0 |
| T-09 | B-09 | 单项 disabled | 取 class | 含 `--disabled` | P1 |
| T-10 | B-10 | 选中 a 后点 b | 查 a、b | a 取消，b 选中 | P0 |
| T-11 | B-11 | Radio 无 Group，点击 | 观察 | 不报错 | P2 |
| T-12 | A-01 / A-02 | Group 含 2 个 Radio | 取 input.name | 两个 name 都 truthy 且相等 | P1 |
| T-13 | A-03 | mount VcRadio | 取 label | label 存在且内含 `input[type=radio]` | P2 |

### 7.1 测试注意点

- **T-10 / T-13**：测试 `mount(VcRadioGroup)` 时 `props: { modelValue: 'a' }` 是单向写死，要测"emit 后视觉重渲"必须加 `'onUpdate:modelValue': async (val) => { await wrapper.setProps({ modelValue: val }) }` 模拟 v-model 双向绑定（与 Checkbox T-15 不同，T-15 只测 emit 不测重渲）
- **T-13**：原本想用 `label.trigger('click')` 验证 label 点击触发 input change，但 jsdom 不模拟 label→input 联动，改为验证 label 包裹 input 的结构关系（A-03 的核心契约）

---

## 8. 实现提示

> 不给完整代码，只给关键提示。实际实现见 [Radio.vue](./Radio.vue)、[RadioGroup.vue](./RadioGroup.vue)。

### 8.1 组件骨架

`<script setup lang="ts">`：Radio 用 `withDefaults(defineProps<RadioProps>())` 提供 4 个默认值（value / label / disabled / size）；`defineEmits<RadioEmits<string | number>>()` 声明 2 个事件。模板为 `<label :class="radioClasses">` 包裹原生 `<input type="radio">` + label/slot 文本。

### 8.2 关键提示

- 根容器：用 `<label>` 包裹，点击文本即切换（A-03）；class 由 `radioClasses` computed 生成 `['vc-radio', 'vc-radio--${size}', {条件 class}]`
- 原生 input：`:checked="isChecked"` / `:disabled="isDisabled"` / `:value="props.value"` / `:name="group?.name?.value"` / `@change="onChange"`
- Group context：`const group = inject<RadioGroupContext | undefined>(radioGroupKey, undefined)`，传 `undefined` 默认值消除 Vue warn
- `isInGroup` 用 `!!group && isNotEmpty(props.value)`（与 Checkbox 一致，覆盖默认空字符串场景）
- `isDisabled` 用 `props.disabled || !!group?.disabled?.value`，Group 禁用透传子项（B-08）
- `isChecked` Group 模式 `group!.modelValue?.value === props.value`，独立模式 `false`（不强制支持独立 v-model）
- `onChange` 本地 handler 分流：
  - `isDisabled.value || isChecked.value` → return（B-06 在 Radio 侧的守卫）
  - `isInGroup.value` → `group!.toggle!(props.value)`，不 emit 子项事件
  - 否则 → 调 `useCheckEvent` 返回的 `handleChange(e)`

### 8.3 RadioGroup 实现

- `useId()`（Vue 3.5）生成同组唯一 name，包成 `ref` 注入 context
- `provide(radioGroupKey, { modelValue: toRef(props, 'modelValue'), disabled: toRef(props, 'disabled'), name: groupName, toggle })`
- `toggle(value)`：`if (props.disabled || value === props.modelValue) return`，否则 emit `update:modelValue` 与 `change`（载荷为新值，非数组）
- `toRef(props, 'xxx')` 保证子组件拿到的是响应式引用（B-08 动态禁用、B-04 动态选中）
- 模板：`<div :class="radioGroupClasses"><slot /></div>`

### 8.4 RadioGroupContext 契约

```ts
export default interface RadioGroupContext {
    modelValue?: Ref<string | number>;
    disabled?: Ref<boolean>;
    direction?: Ref<DirectionState>;
    name?: Ref<string>;        // ← A-01/A-02 关键
    toggle?: (value: string | number) => void;
}
```

> 字段全 `?`（与 CheckboxGroupContext 全必填不同）。Radio 调用处用 `?.` 链式访问，调 `toggle` 时用 `group!.toggle!(...)` 双重断言。后续可考虑统一改必填，与 Checkbox 风格对齐。

### 8.5 测试骨架提示

- Group 行为测试：`mount(VcRadioGroup, { slots: { default: () => [h(VcRadio, ...), h(VcRadio, ...)] } })`
- 找多个 input：`wrapper.findAll('input[type="radio"]')`，按下标取
- 触发选中：`await inputs[1].setValue(true)`（设值 + 派发 change）
- 验证 emit：`wrapper.emitted('update:modelValue')` 取的是 Group 的 emission（子项不 emit）
- **测视觉重渲**（T-10 / T-13）：必须加 `'onUpdate:modelValue': async (val) => { await wrapper.setProps({ modelValue: val }) }` 让 props 跟随 emit 同步，否则 Group 的 `props.modelValue` 不会变，`isChecked` 不会重算
- **a11y 测共享 name**（T-12）：`(inputs[i].element as HTMLInputElement).name` 取 DOM property
- **a11y 测 label 关联**（T-13）：jsdom 不支持 label click 联动，改测 `label.find('input').exists()` 结构关系

### 8.6 重构方向

- 事件 emit 逻辑已抽 `useCheckEvent` composable（独立模式复用，与 Checkbox 共享）
- Group 协作逻辑是 Radio 独有语义，保留在 `Radio.vue` / `RadioGroup.vue`，不上提到 composable
- `useId()` 生成 name 是 Vue 3.5 才有的 API，老项目需 polyfill 或自实现 uuid

---

## 9. 完成自查

- [x] 测试全绿（13/13），每条 P0 行为都有对应测试
- [x] 没有实现 spec 未列出的功能（`isNotEmpty` 判定 / `onChange` 分流 / inject 默认值消除 warn / `useId` 生成 name 是 spec E-03 / B-06 / a11y / 运行时 warn 的合理延伸，已注明）
- [x] Props 类型签名与 spec 完全一致（VcRadioGroup 3 个、VcRadio 4 个，全部 optional，defaults 由 `withDefaults` 提供）
- [x] disabled 守卫覆盖 `onChange`（含 Group disabled 透传）
- [x] Group 模式不重复 emit 子项 `update:modelValue` / `change`
- [x] A-01 / A-02 通过 `useId()` + provide name + `<input :name>` 实现，T-12 验证
- [x] A-03 通过 `<label>` 包裹 `<input>` 实现，T-13 结构验证
- [x] B-06 双重守卫：Radio `isChecked` 守卫 + Group `toggle` 内 `value === props.modelValue` 兜底
- [x] 组件文件结构与总指南约定一致（`<script setup lang="ts">`）

---

## 10. 变更记录

| 版本 | 日期 | 变更说明 |
|---|---|---|
| 0.0.0 | 2026-09-30 | 初始空框架 |
| 0.1.0 | 2026-09-30 | 按 spec 填充全部章节；实现完成，13/13 测试通过。关键决策：与 Checkbox 对比明确了"单选 vs 多选"的核心差异（modelValue 单值 vs 数组、无 indeterminate、必须共享 name 让原生方向键互斥）；`useId()` 生成同组唯一 name（A-01/A-02）；`onChange` 在 Radio 侧加 `isChecked` 守卫（B-06 双重保险）；T-10 / T-13 测试加 `onUpdate:modelValue` 回调模拟 v-model 双向绑定让 props 同步重渲；T-13 因 jsdom 限制改为验证 label 包裹 input 的结构关系；`RadioGroupContext` 字段全 `?`（与 Checkbox 全必填不同），调用处用 `?.` + `!` 双重断言 |
