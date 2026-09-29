# Textarea 组件规格

## 元数据

| 字段 | 值 |
|---|---|
| 组件名 | `VcTextarea` |
| 分类 | 表单 |
| 所属阶段 | Stage-2 |
| 依赖组件 | 无 |
| 文件位置 | `src/components/textarea/Textarea.vue` |
| 测试文件 | `src/components/textarea/Textarea.test.ts` |

---

## 设计意图

提供受控的多行文本输入框，是 Input 的多行变体，额外支持行数、自适应高度。

**不解决**：富文本编辑、Markdown 编辑器、复杂校验（由 Form 负责）。

---

## API 规格

### Props

| 名称 | 类型 | 默认值 | 必填 | 行为说明 |
|---|---|---|---|---|
| `modelValue` | `string` | `''` | 否 | 文本值，支持 `v-model` |
| `placeholder` | `string` | `''` | 否 | 占位文本 |
| `disabled` | `boolean` | `false` | 否 | 禁用 |
| `readonly` | `boolean` | `false` | 否 | 只读 |
| `clearable` | `boolean` | `false` | 否 | 可清空 |
| `maxlength` | `number` | - | 否 | 最大字符数 |
| `rows` | `number` | `3` | 否 | 可见行数，原生 rows |
| `autosize` | `boolean \| { minRows: number; maxRows: number }` | `false` | 否 | 自适应内容高度 |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | 否 | 尺寸 |

### Emits

| 事件名 | 载荷类型 | 触发时机 |
|---|---|---|
| `update:modelValue` | `string` | 值变化时 |
| `blur` | `FocusEvent` | 失焦时 |
| `focus` | `FocusEvent` | 聚焦时 |
| `change` | `string` | 值变化且失焦时 |
| `clear` | - | 清空时 |

### Slots

无。

### Expose

无。

---

## 行为约束

### 渲染

- **B-01** 根元素 class 含 `vc-textarea`，内部渲染原生 `<textarea>`
- **B-02** `placeholder` 透传
- **B-03** `disabled` / `readonly` / `maxlength` 透传到原生属性
- **B-04** `rows` 透传到原生 `rows` 属性

### v-model

- **B-05** `modelValue` 为 `'line1\nline2'` 时，textarea 值为该内容
- **B-06** 用户输入时触发 `update:modelValue`，载荷为完整值
- **B-07** `disabled` / `readonly` 时输入不触发 `update:modelValue`

### 清空

- **B-08** `clearable=true` 且值非空时显示清空按钮（`vc-textarea__clear`）
- **B-09** 点击清空按钮触发 `update:modelValue`（`''`）和 `clear`

### 自适应高度

- **B-10** `autosize=true` 时，内容增加，textarea 高度随内容增长
- **B-11** `autosize={ maxRows: 5 }` 时，内容超过 5 行高度后不再增长（出现滚动条）
- **B-12** `autosize={ minRows: 2 }` 时，初始高度不小于 2 行

### 尺寸与焦点

- **B-13** `size` 映射为 class `vc-textarea--{size}`
- **B-14** focus / blur 触发对应事件
- **B-15** 失焦且值变化时触发 `change`

---

## 边界条件

- **E-01** `modelValue` 为 `undefined` / `null`：视为空串
- **E-02** `readonly` 时不显示清空按钮
- **E-03** `rows` 小于 1：视为 1
- **E-04** `autosize` 的 `maxRows < minRows`：忽略 maxRows

---

## 可访问性

- **A-01** 原生 `<textarea>` 支持键盘 Tab 聚焦
- **A-02** 清空按钮 `aria-label="清空"`

---

## 测试用例清单

| 编号 | 关联行为 | Given | When | Then | 优先级 |
|---|---|---|---|---|---|
| T-01 | B-01 | mount | 取根元素 | class 含 `vc-textarea`，有 `<textarea>` | P0 |
| T-02 | B-02 | `{ placeholder: '描述' }` | 取属性 | placeholder 为 `'描述'` | P0 |
| T-03 | B-03 | `{ disabled: true }` | 取属性 | disabled 存在 | P0 |
| T-04 | B-04 | `{ rows: 5 }` | 取属性 | rows 为 `'5'` | P0 |
| T-05 | B-05 | `{ modelValue: 'a\nb' }` | 取值 | 为 `'a\nb'` | P0 |
| T-06 | B-06 | 输入触发 | 取 emitted | `update:modelValue` 载荷为输入值 | P0 |
| T-07 | B-07 | `{ readonly: true }`，输入 | 取 emitted | 无 `update:modelValue` | P0 |
| T-08 | B-08 | `{ clearable: true, modelValue: 'x' }` | 找清空按钮 | 存在 | P0 |
| T-09 | B-09 | 点击清空 | 取 emitted | 载荷 `''`，有 `clear` | P0 |
| T-10 | B-10 | `{ autosize: true }`，设置内容为 10 行 | 取 style.height | 大于初始高度 | P1 |
| T-11 | B-11 | `{ autosize: { maxRows: 5 } }`，20 行内容 | 取 style.height | 不超过 5 行高度 | P2 |
| T-12 | B-12 | `{ autosize: { minRows: 2 } }` | 取初始高度 | 不小于 2 行 | P2 |
| T-13 | B-13 | `{ size: 'small' }` | 取 class | 含 `vc-textarea--small` | P0 |
| T-14 | B-14 | 触发 focus / blur | 取 emitted | 有对应事件 | P0 |
| T-15 | B-15 | 改值后 blur | 取 emitted change | 载荷为新值 | P1 |
| T-16 | E-02 | `{ clearable: true, readonly: true, modelValue: 'x' }` | 找清空按钮 | 不存在 | P1 |

---

## 实现提示

- v-model 与 Input 同模式：`:value="modelValue ?? ''" @input`
- autosize 实现思路：隐藏的镜像 div 复制 textarea 内容计算 scrollHeight，或直接读 `textarea.scrollHeight` 调整 style.height
- autosize 在 `nextTick` 后根据内容设置高度
- 与 Input 共享 disabled/readonly/clearable/change 逻辑，可抽 `useFormControl` composable
