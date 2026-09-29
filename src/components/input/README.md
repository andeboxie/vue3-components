# VcInput 组件 SDD 文档

> 本文件是组件级 SDD（Specification-Driven Development）文档框架。
> 完整规格以 [`docs/stage-2-form/Input.spec.md`](../../../docs/stage-2-form/Input.spec.md) 为准，本文件用于组件目录内就近查阅与维护记录。
> 框架结构与总指南 [`docs/00-overview.md`](../../../docs/00-overview.md) 第三节"`<script>` 块约定"及单组件 spec 模板对齐。

---

## 1. 元数据

| 字段 | 值 |
|---|---|
| 组件名 | `VcInput` |
| 分类 | 表单 |
| 所属阶段 | Stage-2 |
| 依赖组件 | 无 |
| 文件位置 | `src/components/input/Input.vue` |
| 测试文件 | `src/components/input/Input.test.ts` |

---

## 2. 设计意图

提供受控的文本输入框，封装 v-model 双向绑定、清空、禁用、只读、长度限制、前后置内容等常用能力。

不解决：富文本编辑、自动补全下拉（留给 Select / Autocomplete）、复杂校验（由 Form 组件负责）。

---

## 3. API 规格

### 3.1 Props

| 名称 | 类型 | 默认值 | 必填 | 行为说明 |
|---|---|---|---|---|
| `modelValue` | `string` | `''` | 否 | 输入框值，支持 `v-model` |
| `type` | `'text' \| 'password' \| 'number' \| 'email' \| 'tel' \| 'url'`（由 `InputTypeEnum` 派生） | `'text'` | 否 | 原生 input type |
| `placeholder` | `string` | `''` | 否 | 占位文本 |
| `disabled` | `boolean` | `false` | 否 | 禁用 |
| `readonly` | `boolean` | `false` | 否 | 只读 |
| `clearable` | `boolean` | `false` | 否 | 可清空，显示清空按钮 |
| `maxlength` | `number` | - | 否 | 最大字符数，原生 maxlength |
| `prefix` | `string` | - | 否 | 前置文本 |
| `suffix` | `string` | - | 否 | 后置文本 |
| `size` | `'small' \| 'medium' \| 'large'`（由 `SizeStateEnum` 派生） | `'medium'` | 否 | 尺寸，映射 class `vc-input--${size}` |

### 3.2 Emits

| 事件名 | 载荷类型 | 触发时机 |
|---|---|---|
| `update:modelValue` | `string` | 输入值变化时 |
| `blur` | `FocusEvent` | 失焦时（disabled 不触发） |
| `focus` | `FocusEvent` | 聚焦时（disabled 不触发） |
| `change` | `string` | 值变化且失焦时（disabled / readonly 不触发） |
| `clear` | `FocusEvent` | 点击清空按钮时 |

### 3.3 Slots

| 名称 | 说明 |
|---|---|
| `prefix` | 前置内容（覆盖 `prefix` prop） |
| `suffix` | 后置内容（覆盖 `suffix` prop） |

### 3.4 Expose

无。组件不暴露任何 ref 方法。

---

## 4. 行为约束

### 4.1 渲染与 DOM

- **B-01** 根元素含 class `vc-input`，内部渲染原生 `<input>` 元素
- **B-02** `type` prop 透传给原生 `<input>` 的 `type` 属性
- **B-03** `placeholder` prop 透传给原生 `<input>` 的 `placeholder` 属性
- **B-04** `disabled=true` 时原生 `<input>` 的 `disabled` 属性为 true
- **B-05** `readonly=true` 时原生 `<input>` 的 `readonly` 属性为 true
- **B-06** `maxlength` 透传给原生 `<input>` 的 `maxlength` 属性

### 4.2 v-model

- **B-07** `modelValue` 为 `'hello'` 时，原生 `<input>` 的值为 `'hello'`
- **B-08** 用户输入时，触发 `update:modelValue`，载荷为输入后的完整值
- **B-09** `disabled` 或 `readonly` 时，用户输入不触发 `update:modelValue`

### 4.3 清空

- **B-10** `clearable=true` 且 `modelValue` 非空时，显示清空按钮（class `vc-input__clear`）
- **B-11** `clearable=true` 且 `modelValue` 为空时，不显示清空按钮
- **B-12** 点击清空按钮时，触发 `update:modelValue`（载荷 `''`）和 `clear` 事件

### 4.4 前后置

- **B-13** `prefix` prop 有值时，渲染前置文本（class `vc-input__prefix`）
- **B-14** `suffix` prop 有值时，渲染后置文本（class `vc-input__suffix`）
- **B-15** 提供 `prefix` slot 时，覆盖 `prefix` prop 的渲染

### 4.5 尺寸

- **B-16** `size="small"` 时根元素 class 含 `vc-input--small`
- **B-17** `size="large"` 时根元素 class 含 `vc-input--large`

### 4.6 焦点

- **B-18** 聚焦时触发 `focus` 事件
- **B-19** 失焦时触发 `blur` 事件
- **B-20** 失焦且值变化时触发 `change` 事件（载荷为当前值）

---

## 5. 边界条件与异常

### 5.1 边界条件

- **E-01** `modelValue` 为 `undefined` / `null`：视为空字符串（`:value="modelValue ?? ''"`）
- **E-02** `clearable` 与 `readonly` 同时为 true：不显示清空按钮（只读不可改）
- **E-03** `disabled` 时：不触发 focus / blur / change
- **E-04** `maxlength` 为负数或 0：不设置 maxlength 属性

### 5.2 实现补充（spec 之外，已实现）

- 清空按钮显示条件额外排除 `disabled`（spec E-02 只要求 readonly，实现加了 `&& !disabled`，避免禁用时还能点清空）

### 5.3 不需要处理（避免过度工程）

- 不做防抖 / 节流
- 不做输入校验（留给 Form）
- 不做自动补全下拉（留给 Select / Autocomplete）

---

## 6. 可访问性（a11y）

- **A-01** 原生 `<input>` 天然支持键盘输入与 Tab 聚焦
- **A-02** `disabled=true` 时原生 `disabled` 让浏览器自动从 tab 序列移除
- **A-03** 清空按钮需要可访问名（`aria-label="清空"`）

---

## 7. 测试用例清单

> 优先级：P0 必做 / P1 应做 / P2 可选。当前 22/22 全绿。

| 编号 | 关联行为 | Given | When | Then | 优先级 |
|---|---|---|---|---|---|
| T-01 | B-01 | mount | 取根元素 | class 含 `vc-input`，内部有 `<input>` | P0 |
| T-02 | B-02 | `{ type: 'password' }` | 取 input type | 为 `'password'` | P0 |
| T-03 | B-03 | `{ placeholder: '请输入' }` | 取 placeholder | 为 `'请输入'` | P0 |
| T-04 | B-04 | `{ disabled: true }` | 取 input disabled | 存在 | P0 |
| T-05 | B-05 | `{ readonly: true }` | 取 input readonly | 存在 | P0 |
| T-06 | B-06 | `{ maxlength: 10 }` | 取 input maxlength | 为 `'10'` | P0 |
| T-07 | B-07 | `{ modelValue: 'hello' }` | 取 input value | 为 `'hello'` | P0 |
| T-08 | B-08 | mount，setValue `'hi'` | 取 emitted | `update:modelValue` 载荷 `'hi'` | P0 |
| T-09 | B-09 | `{ disabled: true }`，触发 input | 取 emitted | 无 `update:modelValue` | P0 |
| T-10 | B-10 | `{ clearable: true, modelValue: 'x' }` | 查找清空按钮 | 存在 `vc-input__clear` | P0 |
| T-11 | B-11 | `{ clearable: true, modelValue: '' }` | 查找清空按钮 | 不存在 | P0 |
| T-12 | B-12 | `{ clearable: true, modelValue: 'x' }`，点击清空 | 取 emitted | `update:modelValue` 载荷 `''`，有 `clear` | P0 |
| T-13 | B-13 | `{ prefix: '$' }` | 查找 prefix | 存在 `vc-input__prefix`，含 `'$'` | P1 |
| T-14 | B-14 | `{ suffix: '元' }` | 查找 suffix | 存在 `vc-input__suffix`，含 `'元'` | P1 |
| T-15 | B-15 | slots `{ prefix: '<span>icon</span>' }` | 取 prefix 内容 | 含 `'icon'`，不含 prop 内容 | P1 |
| T-16 | B-16 | `{ size: 'small' }` | 取 class | 含 `vc-input--small` | P0 |
| T-17 | B-17 | `{ size: 'large' }` | 取 class | 含 `vc-input--large` | P0 |
| T-18 | B-18 | mount，触发 input focus | 取 emitted | 有 `focus` 事件 | P0 |
| T-19 | B-19 | mount，触发 input blur | 取 emitted | 有 `blur` 事件 | P0 |
| T-20 | B-20 | `{ modelValue: 'a' }`，setValue `'b'`，触发 blur | 取 emitted change | 载荷为 `'b'` | P1 |
| T-21 | E-02 | `{ clearable: true, readonly: true, modelValue: 'x' }` | 查找清空按钮 | 不存在 | P1 |
| T-22 | A-03 | `{ clearable: true, modelValue: 'x' }` | 取清空按钮 aria-label | 为 `'清空'` | P1 |

---

## 8. 实现提示

> 不给完整代码，只给关键提示。实际实现见 [Input.vue](./Input.vue)。

### 8.1 组件骨架

`<script setup lang="ts">`：`withDefaults(defineProps<InputProps>())` 提供 7 个默认值（modelValue / type / placeholder / disabled / readonly / clearable / size）；`defineEmits<InputEmits<string>>()` 声明 5 个事件；class 通过 `useFormControl('vc-input', props.size)` composable 计算。模板为单个 `<div :class="inputClasses">` 根容器，内部依次是 prefix（slot 优先 / prop 回退）、原生 `<input>`、suffix（同 prefix）、清空按钮 `span.vc-input__clear`。

### 8.2 关键提示

- 根容器：class 挂根 `<div>`，不挂原生 input；BEM class 由 `useFormControl` 生成 `['vc-input', 'vc-input--${size}']`
- input 透传：`:value="modelValue ?? ''"`（E-01）、`:type` / `:placeholder` / `:readonly` / `:disabled` / `:maxlength="maxlength && maxlength > 0 ? maxlength : undefined"`（E-04）
- 清空按钮：`v-if="clearable && modelValue && !readonly && !disabled"`，`aria-label="清空"`，`@click="handleClear"`
- prefix / suffix：`v-if="$slots.prefix"` 用 slot，`v-else-if="prefix"` 用 prop（slot 优先，B-15）
- 事件守卫：每个 handler 开头判断 `props.disabled`（focus / blur / change / clear）与 `props.readonly`（input / change / clear），命中 return
- change 载荷：`emit('change', getValue(e))`，传字符串值（不是 Event）；依赖原生 `@change`（值变化 + 失焦时浏览器派发）
- blur / focus 只 emit 对应事件，不再 emit `update:modelValue`（值在 input 时已更新）

### 8.3 测试骨架提示

使用 `@vue/test-utils` 的 `mount`。断言按目标区分：根 class 用 `wrapper.classes()`、input 属性用 `wrapper.find('input').attributes()`、input value 用 `(wrapper.find('input').element as HTMLInputElement).value`、子节点用 `find('.vc-input__xxx').exists()`、事件用 `wrapper.emitted('xxx')`。触发用 `await input.setValue('hi')`（设值 + 派发 input）、`await input.trigger('focus' / 'blur')`、`await wrapper.find('.vc-input__clear').trigger('click')`。

注意：T-20 依赖 jsdom 原生行为——input value 改变后触发 blur，jsdom 会自动派发 change 事件，因此绑 `@change` 的实现能通过"触发 blur 即触发 change"。

### 8.4 重构方向

- class 计算已抽为 `useFormControl` composable（已完成，见 [UseFormControl.ts](../../composables/UseFormControl.ts)）
- Input / Textarea 共享 disabled / readonly / size 逻辑，Textarea 阶段可复用 `useFormControl`
- 事件守卫逻辑重复，可考虑抽 `useInputEvents` composable（当前未抽，避免过度工程）

---

## 9. 完成自查

- [x] 测试全绿（22/22），每条 P0 行为都有对应测试
- [x] 没有实现 spec 未列出的功能（清空按钮排除 disabled 是 spec E-02 的合理延伸，已注明）
- [x] props 类型签名与 spec 完全一致（10 个字段，`InputProps` 接口）
- [x] disabled / readonly 守卫覆盖所有值事件 handler
- [x] `change` 载荷为 string，符合 spec Emits 表
- [x] 组件文件结构与总指南约定一致（`<script setup lang="ts">`，符合第四节 4.3）

---

## 10. 变更记录

| 版本 | 日期 | 变更说明 |
|---|---|---|
| 0.0.0 | 2026-09-29 | 初始空框架 |
| 0.1.0 | 2026-09-29 | 按 spec 填充全部章节；实现完成，22/22 测试通过 |
| 0.2.0 | 2026-09-29 | P0/P1 修复：补根容器 div + `inputClasses`、补 type/placeholder/readonly/maxlength/disabled 透传、`modelValue ?? ''`、`clearable` 默认值改 false、prefix/suffix slot 优先、`change` 载荷改 string、disabled/readonly 事件守卫；class 抽为 `useFormControl` composable；删除未用的 `getFocusValue` import |
