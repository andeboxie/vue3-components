# Input 组件规格

## 元数据

| 字段 | 值 |
|---|---|
| 组件名 | `VcInput` |
| 分类 | 表单 |
| 所属阶段 | Stage-2 |
| 依赖组件 | 无 |
| 文件位置 | `src/components/input/Input.vue` |
| 测试文件 | `src/components/input/Input.test.ts` |

---

## 设计意图

提供受控的文本输入框，封装 v-model 双向绑定、清空、禁用、只读、长度限制、前后置内容等常用能力。

**不解决**：富文本编辑、自动补全下拉（留给 Select / Autocomplete）、复杂校验（由 Form 组件负责）。

---

## API 规格

### Props

| 名称 | 类型 | 默认值 | 必填 | 行为说明 |
|---|---|---|---|---|
| `modelValue` | `string` | `''` | 否 | 输入框值，支持 `v-model` |
| `type` | `'text' \| 'password' \| 'number' \| 'email' \| 'tel' \| 'url'` | `'text'` | 否 | 原生 input type |
| `placeholder` | `string` | `''` | 否 | 占位文本 |
| `disabled` | `boolean` | `false` | 否 | 禁用 |
| `readonly` | `boolean` | `false` | 否 | 只读 |
| `clearable` | `boolean` | `false` | 否 | 可清空，显示清空按钮 |
| `maxlength` | `number` | - | 否 | 最大字符数，原生 maxlength |
| `prefix` | `string` | - | 否 | 前置文本 |
| `suffix` | `string` | - | 否 | 后置文本 |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | 否 | 尺寸 |

### Emits

| 事件名 | 载荷类型 | 触发时机 |
|---|---|---|
| `update:modelValue` | `string` | 输入值变化时 |
| `blur` | `FocusEvent` | 失焦时 |
| `focus` | `FocusEvent` | 聚焦时 |
| `change` | `string` | 值变化且失焦时 |
| `clear` | - | 点击清空按钮时 |

### Slots

| 名称 | 说明 |
|---|---|
| `prefix` | 前置内容（覆盖 prefix prop） |
| `suffix` | 后置内容（覆盖 suffix prop） |

### Expose

无。

---

## 行为约束

### 渲染与 DOM

- **B-01** 根元素含 class `vc-input`，内部渲染原生 `<input>` 元素
- **B-02** `type` prop 透传给原生 `<input>` 的 `type` 属性
- **B-03** `placeholder` prop 透传给原生 `<input>` 的 `placeholder` 属性
- **B-04** `disabled=true` 时原生 `<input>` 的 `disabled` 属性为 true
- **B-05** `readonly=true` 时原生 `<input>` 的 `readonly` 属性为 true
- **B-06** `maxlength` 透传给原生 `<input>` 的 `maxlength` 属性

### v-model

- **B-07** `modelValue` 为 `'hello'` 时，原生 `<input>` 的值为 `'hello'`
- **B-08** 用户输入时，触发 `update:modelValue`，载荷为输入后的完整值
- **B-09** `disabled` 或 `readonly` 时，用户输入不触发 `update:modelValue`

### 清空

- **B-10** `clearable=true` 且 `modelValue` 非空时，显示清空按钮（class `vc-input__clear`）
- **B-11** `clearable=true` 且 `modelValue` 为空时，不显示清空按钮
- **B-12** 点击清空按钮时，触发 `update:modelValue`（载荷 `''`）和 `clear` 事件

### 前后置

- **B-13** `prefix` prop 有值时，渲染前置文本（class `vc-input__prefix`）
- **B-14** `suffix` prop 有值时，渲染后置文本（class `vc-input__suffix`）
- **B-15** 提供 `prefix` slot 时，覆盖 `prefix` prop 的渲染

### 尺寸

- **B-16** `size="small"` 时根元素 class 含 `vc-input--small`
- **B-17** `size="large"` 时根元素 class 含 `vc-input--large`

### 焦点

- **B-18** 聚焦时触发 `focus` 事件
- **B-19** 失焦时触发 `blur` 事件
- **B-20** 失焦且值变化时触发 `change` 事件（载荷为当前值）

---

## 边界条件与异常

- **E-01** `modelValue` 为 `undefined` / `null`：视为空字符串
- **E-02** `clearable` 与 `readonly` 同时为 true：不显示清空按钮（只读不可改）
- **E-03** `disabled` 时：不触发 focus / blur / change
- **E-04** `maxlength` 为负数：不设置 maxlength 属性

---

## 可访问性（a11y）

- **A-01** 原生 `<input>` 天然支持键盘输入与 Tab 聚焦
- **A-02** `disabled=true` 时原生 `disabled` 让浏览器自动从 tab 序列移除
- **A-03** 清空按钮需要可访问名（`aria-label="清空"`）

---

## 测试用例清单

| 编号 | 关联行为 | Given | When | Then | 优先级 |
|---|---|---|---|---|---|
| T-01 | B-01 | mount | 取根元素 | class 含 `vc-input`，内部有 `<input>` | P0 |
| T-02 | B-02 | `{ type: 'password' }` | 取 input type | 为 `'password'` | P0 |
| T-03 | B-03 | `{ placeholder: '请输入' }` | 取 placeholder | 为 `'请输入'` | P0 |
| T-04 | B-04 | `{ disabled: true }` | 取 input disabled | 存在 | P0 |
| T-05 | B-05 | `{ readonly: true }` | 取 input readonly | 存在 | P0 |
| T-06 | B-06 | `{ maxlength: 10 }` | 取 input maxlength | 为 `'10'` | P0 |
| T-07 | B-07 | `{ modelValue: 'hello' }` | 取 input value | 为 `'hello'` | P0 |
| T-08 | B-08 | mount，设置 input value 为 `'hi'`，触发 input 事件 | 取 emitted | `update:modelValue` 载荷为 `'hi'` | P0 |
| T-09 | B-09 | `{ disabled: true }`，触发 input | 取 emitted | 无 `update:modelValue` | P0 |
| T-10 | B-10 | `{ clearable: true, modelValue: 'x' }` | 查找清空按钮 | 存在 `vc-input__clear` | P0 |
| T-11 | B-11 | `{ clearable: true, modelValue: '' }` | 查找清空按钮 | 不存在 | P0 |
| T-12 | B-12 | `{ clearable: true, modelValue: 'x' }`，点击清空按钮 | 取 emitted | `update:modelValue` 载荷 `''`，有 `clear` 事件 | P0 |
| T-13 | B-13 | `{ prefix: '$' }` | 查找 prefix | 存在 `vc-input__prefix`，文本含 `'$'` | P1 |
| T-14 | B-14 | `{ suffix: '元' }` | 查找 suffix | 存在 `vc-input__suffix`，文本含 `'元'` | P1 |
| T-15 | B-15 | slots `{ prefix: '<span>icon</span>' }` | 取 prefix 内容 | 含 `'icon'`，不含 prefix prop 内容 | P1 |
| T-16 | B-16 | `{ size: 'small' }` | 取 class | 含 `vc-input--small` | P0 |
| T-17 | B-17 | `{ size: 'large' }` | 取 class | 含 `vc-input--large` | P0 |
| T-18 | B-18 | mount，触发 input focus | 取 emitted | 有 `focus` 事件 | P0 |
| T-19 | B-19 | mount，触发 input blur | 取 emitted | 有 `blur` 事件 | P0 |
| T-20 | B-20 | `{ modelValue: 'a' }`，改 input 为 `'b'`，触发 blur | 取 emitted change | 载荷为 `'b'` | P1 |
| T-21 | E-02 | `{ clearable: true, readonly: true, modelValue: 'x' }` | 查找清空按钮 | 不存在 | P1 |
| T-22 | A-03 | `{ clearable: true, modelValue: 'x' }` | 取清空按钮 aria-label | 为 `'清空'` | P1 |

---

## 实现提示

### 1. v-model 实现

```ts
const props = defineProps<{ modelValue?: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

function handleInput(e: Event) {
    emit('update:modelValue', (e.target as HTMLInputElement).value)
}
```

模板里 `<input :value="modelValue ?? ''" @input="handleInput">`。

### 2. 清空按钮

```html
<span v-if="clearable && modelValue && !readonly" class="vc-input__clear" aria-label="清空" @click="handleClear"></span>
```

### 3. 关键提示

- 原生 `<input>` 的 value 绑定用 `:value`（不是 `v-model`），值的唯一来源是 `modelValue` prop
- `change` 事件在 blur 时判断值是否变化，变化才 emit
- `prefix` / `suffix` slot 优先级高于 prop
- size class 用 `vc-input--${size}`

### 4. 重构方向

- 抽出 `useFormControl` composable 处理 disabled/readonly/size 的通用逻辑
- Input / Textarea 共享大部分逻辑，可抽公共 composable
