# Checkbox 组件规格

## 元数据

| 字段 | 值 |
|---|---|
| 组件名 | `VcCheckbox` |
| 分类 | 表单 |
| 所属阶段 | Stage-2 |
| 依赖组件 | 无（CheckboxGroup 通过 provide/inject 协调，非组件依赖） |
| 文件位置 | `src/components/checkbox/Checkbox.vue` |
| 测试文件 | `src/components/checkbox/Checkbox.test.ts` |

---

## 设计意图

提供受控的复选框，支持选中/未选中/不确定三态，可单独使用或放入 CheckboxGroup 实现多选。

**不解决**：全选逻辑（由不确定态配合业务实现）、树形选择。

---

## API 规格

### Props

| 名称 | 类型 | 默认值 | 必填 | 行为说明 |
|---|---|---|---|---|
| `modelValue` | `boolean` | `false` | 否 | 选中状态，支持 `v-model` |
| `label` | `string` | `''` | 否 | 复选框文本 |
| `value` | `string \| number` | - | 否 | 在 Group 中该选项的值 |
| `disabled` | `boolean` | `false` | 否 | 禁用 |
| `indeterminate` | `boolean` | `false` | 否 | 不确定态（视觉横线），不影响 modelValue |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | 否 | 尺寸 |

### Emits

| 事件名 | 载荷类型 | 触发时机 |
|---|---|---|
| `update:modelValue` | `boolean` | 切换时，载荷为新的布尔值 |
| `change` | `boolean` | 切换时（载荷同新值） |

### Slots

| 名称 | 说明 |
|---|---|
| `default` | 自定义 label 内容（覆盖 label prop） |

### Expose

无。

---

## 行为约束

### 渲染

- **B-01** 根元素 class 含 `vc-checkbox`，内部含原生 `<input type="checkbox">`
- **B-02** 原生 input 默认视觉隐藏（用自定义样式），但仍可聚焦与操作
- **B-03** `label` prop 有值时渲染文本节点（`vc-checkbox__label`）
- **B-04** default slot 有内容时覆盖 label prop

### 选中态

- **B-05** `modelValue=true` 时原生 input 的 `checked` 为 true，根 class 含 `vc-checkbox--checked`
- **B-06** 点击未选中项时触发 `update:modelValue`（载荷 `true`）
- **B-07** 点击已选中项时触发 `update:modelValue`（载荷 `false`）
- **B-08** 点击同时触发 `change` 事件（载荷为新布尔值）

### 不确定态

- **B-09** `indeterminate=true` 时根 class 含 `vc-checkbox--indeterminate`
- **B-10** `indeterminate=true` 时原生 input 的 `indeterminate` 属性为 true（DOM property）
- **B-11** 不确定态下点击，`update:modelValue` 载荷为 `true`（从不明确变为选中），且 indeterminate 视觉清除（由父组件控制 prop）

### 禁用

- **B-12** `disabled=true` 时原生 input disabled，点击不触发任何事件
- **B-13** 根 class 含 `vc-checkbox--disabled`

### Group 协作

- **B-14** 在 CheckboxGroup 中点击时，通知 Group 更新选中数组（inject Group 的方法）
- **B-15** Group 的禁用状态传递给子 Checkbox（子 disabled 与 Group disabled 任一为 true 即禁用）

### 尺寸

- **B-16** `size` 映射 class `vc-checkbox--{size}`

---

## 边界条件

- **E-01** `modelValue` 非布尔值：TS 告警，运行时按 truthy 处理
- **E-02** 无 `value` 且在 Group 中：该选项不参与 Group 的值收集
- **E-03** `indeterminate` 与 `modelValue=true` 同时：以 indeterminate 视觉优先（横线），但 checked 仍为 true

---

## 可访问性

- **A-01** 必须用原生 `<input type="checkbox">`，保留 Space 切换能力
- **A-02** label 文本与 input 通过同级结构关联（点击文本可切换），或用 `<label>` 包裹
- **A-03** 禁用时原生 disabled 自动移出 Tab 序列
- **A-04** indeterminate 通过原生 input 的 indeterminate property 表达，屏幕阅读器可感知

---

## 测试用例清单

| 编号 | 关联行为 | Given | When | Then | 优先级 |
|---|---|---|---|---|---|
| T-01 | B-01 | mount | 查找 | class 含 `vc-checkbox`，有 `input[type=checkbox]` | P0 |
| T-02 | B-03 | `{ label: '同意' }` | 取 label | 文本含 `'同意'` | P0 |
| T-03 | B-04 | slots `{ default: '自定义' }` | 取文本 | 含 `'自定义'` | P1 |
| T-04 | B-05 | `{ modelValue: true }` | 取 input checked | true，class 含 `--checked` | P0 |
| T-05 | B-06 | mount（未选中），点击 | 取 emitted | `update:modelValue` 载荷 `true` | P0 |
| T-06 | B-07 | `{ modelValue: true }`，点击 | 取 emitted | 载荷 `false` | P0 |
| T-07 | B-08 | 点击 | 取 emitted change | 载荷为新值 | P0 |
| T-08 | B-09 | `{ indeterminate: true }` | 取 class | 含 `--indeterminate` | P0 |
| T-09 | B-10 | `{ indeterminate: true }` | 取 input.indeterminate | true | P0 |
| T-10 | B-11 | `{ indeterminate: true }`，点击 | 取 emitted | 载荷 `true` | P1 |
| T-11 | B-12 | `{ disabled: true }`，点击 | 取 emitted | 无事件 | P0 |
| T-12 | B-13 | `{ disabled: true }` | 取 class | 含 `--disabled` | P1 |
| T-13 | B-16 | `{ size: 'large' }` | 取 class | 含 `vc-checkbox--large` | P1 |

---

## 实现提示

- 原生 input 设置 visually-hidden（绝对定位+opacity:0），用自定义 span（`vc-checkbox__inner`）显示方框
- indeterminate 是 DOM property 不是 attribute，需在 mounted/watch 后通过 `inputEl.indeterminate = props.indeterminate` 设置（用 ref + watchEffect）
- 点击逻辑：`if disabled return; const newVal = !props.modelValue; emit('update:modelValue', newVal); emit('change', newVal)`
- Group 模式：inject Group context，点击时调用 `group.toggle(value)`；checked 状态由 Group 的选中数组派生
- label 点击触发 input click（用 `<label>` 包裹或 `@click` 转发）
