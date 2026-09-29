# Radio 组件规格

## 元数据

| 字段 | 值 |
|---|---|
| 组件名 | `VcRadio` / `VcRadioGroup` |
| 分类 | 表单 |
| 所属阶段 | Stage-2 |
| 依赖组件 | RadioGroup 通过 provide/inject 协调 |
| 文件位置 | `src/components/radio/Radio.vue`、`src/components/radio/RadioGroup.vue` |
| 测试文件 | `src/components/radio/Radio.test.ts` |

---

## 设计意图

提供受控的单选控件。Radio 单独使用意义有限，主要在 RadioGroup 内实现互斥选择。

**不解决**：多选（用 Checkbox）、卡片式选项布局（可通过样式扩展）。

---

## API 规格

### VcRadioGroup Props

| 名称 | 类型 | 默认值 | 必填 | 行为说明 |
|---|---|---|---|---|
| `modelValue` | `string \| number` | - | 否 | 当前选中值，`v-model` |
| `disabled` | `boolean` | `false` | 否 | 整组禁用 |
| `direction` | `'horizontal' \| 'vertical'` | `'horizontal'` | 否 | 排列方向 |

### VcRadioGroup Emits

| 事件名 | 载荷 | 触发时机 |
|---|---|---|
| `update:modelValue` | `string \| number` | 选中项变化时 |
| `change` | `string \| number` | 同上 |

### VcRadio Props

| 名称 | 类型 | 默认值 | 必填 | 行为说明 |
|---|---|---|---|---|
| `value` | `string \| number` | - | 是 | 该选项的值 |
| `label` | `string` | `''` | 否 | 选项文本 |
| `disabled` | `boolean` | `false` | 否 | 单项禁用（与 Group disabled 叠加） |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | 否 | 尺寸 |

### Slots

| 组件 | 名称 | 说明 |
|---|---|---|
| Radio | `default` | 自定义文本（覆盖 label） |
| RadioGroup | `default` | 若干 Radio |

---

## 行为约束

### 渲染

- **B-01** Radio 根 class 含 `vc-radio`，内部含 `<input type="radio">`
- **B-02** Radio label 文本渲染（`vc-radio__label`）
- **B-03** RadioGroup 根 class 含 `vc-radio-group`，direction 映射 class `vc-radio-group--{direction}`

### 选中（Group 内）

- **B-04** Group 的 `modelValue` 等于某 Radio 的 `value` 时，该 Radio 选中（input checked、class 含 `vc-radio--checked`）
- **B-05** 点击未选中 Radio 时，Group 触发 `update:modelValue`（载荷为该 Radio 的 value）
- **B-06** 点击已选中 Radio 时，不触发事件（值不变）
- **B-07** 选中变化同时触发 Group 的 `change` 事件

### 禁用

- **B-08** Radio `disabled=true` 或 Group `disabled=true` 时，该 Radio 不可点击
- **B-09** 禁用 Radio class 含 `vc-radio--disabled`

### 互斥

- **B-10** Group 内同一时刻只有一个 Radio 选中（选中 A 后 B 自动取消）

### 单独使用

- **B-11** Radio 无 Group context 时，点击通过自身 emit（本阶段仅保证不报错，不强制支持独立 v-model）

---

## 边界条件

- **E-01** Group 中无任何 Radio 的 value 匹配 modelValue：无选中项
- **E-02** 多个 Radio 使用相同 value：它们会同时选中（业务应避免）
- **E-03** Radio 缺少 value prop：点击不更新 Group

---

## 可访问性

- **A-01** 原生 `<input type="radio">`，方向键可在同组间切换（浏览器原生 radio group 行为要求 input 共享 name）
- **A-02** 同组 input 共享相同 `name` 属性（由 Group 生成唯一 name 并 provide）
- **A-03** 文本点击可选中（`<label>` 关联）

---

## 测试用例清单

| 编号 | 关联行为 | Given | When | Then | 优先级 |
|---|---|---|---|---|---|
| T-01 | B-01 | mount Radio | 查找 | class 含 `vc-radio`，有 `input[type=radio]` | P0 |
| T-02 | B-02 | `{ value: 'a', label: '选项A' }` | 取文本 | 含 `'选项A'` | P0 |
| T-03 | B-03 | Group `{ direction: 'vertical' }` | 取 class | 含 `vc-radio-group--vertical` | P1 |
| T-04 | B-04 | Group modelValue `'a'`，含 Radio value `'a'` | 取该 Radio | checked true，class 含 `--checked` | P0 |
| T-05 | B-05 | Group modelValue `'a'`，点击 value=`'b'` 的 Radio | 取 Group emitted | `update:modelValue` 载荷 `'b'` | P0 |
| T-06 | B-06 | 点击已选中 Radio | 取 emitted | 无 `update:modelValue` | P0 |
| T-07 | B-07 | 切换选中 | 取 emitted | 有 `change` | P1 |
| T-08 | B-08 | Group disabled，点击 Radio | 取 emitted | 无事件 | P0 |
| T-09 | B-09 | 单项 disabled | 取 class | 含 `--disabled` | P1 |
| T-10 | B-10 | 选中 a 后点击 b | 查 a、b | a 取消，b 选中 | P0 |
| T-11 | B-11 | Radio 无 Group，点击 | 观察 | 不报错 | P2 |

---

## 实现提示

- RadioGroup 用 `provide('vc-radio-group', { modelValue, disabled, name, updateValue })` 提供上下文
- Group 用 `useId()`（Vue 3.5）生成唯一 name，子 Radio 的 input 绑定该 name，保证键盘方向键原生互斥
- Radio 点击：`if (disabled || groupDisabled || checked) return`；调用 `updateValue(props.value)`
- checked 派生：`groupContext ? props.value === group.modelValue : false`
- 与 Checkbox 视觉结构一致（`__inner` 自定义圆点），可复用样式思路
