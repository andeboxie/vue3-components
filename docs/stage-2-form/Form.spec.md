# Form 组件规格

## 元数据

| 字段 | 值 |
|---|---|
| 组件名 | `VcForm` / `VcFormItem` |
| 分类 | 表单 |
| 所属阶段 | Stage-2 |
| 依赖组件 | 通过 provide/inject 与内部表单控件协调（Input / Select 等） |
| 文件位置 | `src/components/form/Form.vue`、`src/components/form/FormItem.vue` |
| 测试文件 | `src/components/form/Form.test.ts` |

---

## 设计意图

提供表单容器与字段容器，承担**布局、标签、校验规则、提交拦截**。Form 聚合各字段值并在提交时统一校验；FormItem 负责单字段的 label、错误信息展示与规则触发。

**本阶段定位**：实现一套最小但完整的校验闭环（必填、类型、长度、自定义校验器），不追求 async-validator 的全部规则。

**不解决**：跨字段联动校验的 DSL（自定义 validator 可覆盖）、动态表单项的增删动画、schema 驱动表单。

---

## API 规格

### VcForm Props

| 名称 | 类型 | 默认值 | 必填 | 行为说明 |
|---|---|---|---|---|
| `model` | `Record<string, unknown>` | - | 是 | 表单数据对象，字段值来源 |
| `rules` | `Record<string, FormRule[]>` | `{}` | 否 | 字段校验规则，key 对应字段名 |
| `labelWidth` | `string` | - | 否 | 统一 label 宽度 |
| `labelPosition` | `'left' \| 'right' \| 'top'` | `'right'` | 否 | label 对齐 |
| `inline` | `boolean` | `false` | 否 | 行内布局 |
| `disabled` | `boolean` | `false` | 否 | 整体禁用（传递给控件） |

### VcForm Emits

| 事件名 | 载荷 | 触发时机 |
|---|---|---|
| `submit` | `values: Record<string, unknown>` | 原生提交且**校验通过**时 |
| `validate` | `valid: boolean, fields?: Record<string, string>` | 校验完成时（fields 为错误信息表） |

### VcForm Expose

| 名称 | 签名 | 说明 |
|---|---|---|
| `validate` | `() => Promise<boolean>` | 校验全部字段，通过 resolve(true)，失败 resolve(false)（不 reject） |
| `validateField` | `(name: string) => Promise<boolean>` | 校验单个字段 |
| `resetFields` | `() => void` | 重置为初始值并清空错误 |
| `clearValidate` | `() => void` | 仅清空错误信息 |

### VcFormItem Props

| 名称 | 类型 | 默认值 | 必填 | 行为说明 |
|---|---|---|---|---|
| `label` | `string` | - | 否 | 字段标签 |
| `name` | `string` | - | 是 | 字段名，关联 model 与 rules 的 key |
| `required` | `boolean` | `false` | 否 | 显示必填星号（规则仍以 rules 为准） |
| `showMessage` | `boolean` | `true` | 否 | 是否显示错误信息 |

### VcFormItem Slots

| 名称 | 说明 |
|---|---|
| `default` | 表单控件 |
| `label` | 自定义 label |
| `error` | 自定义错误展示 |

### 校验规则类型

```ts
interface FormRule {
    required?: boolean;          // 非空校验（空串/null/undefined 视为空）
    message?: string;            // 错误信息
    min?: number;                // 字符串最小长度 / 数字最小值
    max?: number;                // 字符串最大长度 / 数字最大值
    pattern?: RegExp;            // 正则匹配
    validator?: (value: unknown) => boolean | string; // 自定义：true 通过，false 用 message，string 作为错误信息
    trigger?: 'change' | 'blur'; // 触发时机，默认 'change'
}
```

---

## 行为约束

### 渲染

- **B-01** Form 根元素为 `<form>`，class 含 `vc-form`；`inline=true` 时 class 含 `vc-form--inline`
- **B-02** FormItem class 含 `vc-form-item`；`label` 有值时渲染 `<label class="vc-form-item__label">`
- **B-03** labelPosition / labelWidth 作用于 label（位置 class 或宽度 style）
- **B-04** `required=true` 时 label 旁显示必填标记（`vc-form-item__required`）

### 提交与校验

- **B-05** 触发表单提交（点击 submit 按钮）时，先执行全部校验；校验通过才触发 `submit`（载荷为 model 的拷贝）
- **B-06** 校验未通过时，不触发 `submit`，且各错误字段显示错误信息（`vc-form-item__error`）
- **B-07** 原生 submit 事件必须 preventDefault（阻止页面刷新）
- **B-08** 校验完成后触发 `validate` 事件（载荷 valid + 错误表）

### 规则执行

- **B-09** `required` 规则：值为 `''` / `undefined` / `null` 时失败，显示 message
- **B-10** `min` / `max` 规则：字符串按长度、数字按数值校验
- **B-11** `pattern` 规则：值不匹配正则时失败
- **B-12** 自定义 `validator`：返回 false 时用 message，返回字符串时以该字符串为错误信息，true 通过
- **B-13** 一个字段多条规则：按顺序执行，遇到第一个失败即停止并显示该错误

### 触发时机

- **B-14** 规则 `trigger='blur'`：仅在控件 blur 时校验该字段（change 时不校验）
- **B-15** 默认/`trigger='change'`：控件值变化时校验该字段（仅在该字段已被触碰过或提交后，避免初始即报错——本阶段可简化为：首次提交后才启用 change 实时校验）
- **B-16** 控件通过 FormItem inject 的上下文上报 change/blur 事件与当前值

### Expose 方法

- **B-17** `validate()` 对全部字段执行校验，返回 Promise<boolean>，并更新各字段错误显示
- **B-18** `validateField(name)` 仅校验指定字段
- **B-19** `resetFields()` 将 model 恢复为挂载时的初始值快照，并清空全部错误
- **B-20** `clearValidate()` 只清错误信息，不改值

### 禁用与布局

- **B-21** Form `disabled=true` 时 provide 禁用上下文，内部控件禁用
- **B-22** FormItem 错误状态 class 含 `vc-form-item--error`

---

## 边界条件

- **E-01** 某字段无 rules：该字段校验始终通过
- **E-02** rules 引用了 model 中不存在的字段：不报错，校验时按 undefined 处理（required 则失败）
- **E-03** rule 无 message 且非自定义：使用默认错误文案（如"该字段为必填项"）
- **E-04** validator 抛异常：视为校验失败，错误信息用 message 或默认文案
- **E-05** resetFields 后再次提交：以重置后的值重新校验

---

## 可访问性

- **A-01** `<label>` 通过 `for` 关联控件 id（由 FormItem 生成唯一 id 并 provide 给控件），或控件位于 label 内
- **A-02** 错误信息节点带 id，控件通过 `aria-describedby` 关联；`aria-invalid="true"` 表达错误
- **A-03** 必填星号对屏幕阅读器隐藏（视觉标记），必填语义由规则与 label 文本承担
- **A-04** 提交按钮原生 `type="submit"`，Enter 可提交

---

## 测试用例清单

| 编号 | 关联行为 | Given | When | Then | 优先级 |
|---|---|---|---|---|---|
| T-01 | B-01 | mount | 取根元素 | tagName `FORM`，class 含 `vc-form` | P0 |
| T-02 | B-02 | FormItem label=`'名称'` | 找 label | 存在 `vc-form-item__label`，文本含 `'名称'` | P0 |
| T-03 | B-04 | required true | 找必填标记 | 存在 | P1 |
| T-04 | B-07 | 触发原生 submit | 观察 | 页面不刷新（preventDefault 被调用） | P0 |
| T-05 | B-05 | 必填字段有值，触发 submit | 取 emitted | 有 `submit`，载荷含字段值 | P0 |
| T-06 | B-06 | 必填字段为空，submit | 取 emitted/错误 | 无 submit，有 `vc-form-item__error`，有 validate(false) | P0 |
| T-07 | B-09 | required，值为空，validate | 取错误 | 显示 message | P0 |
| T-08 | B-10 | min=2，值 `'a'`，validate | 取结果 | false | P0 |
| T-09 | B-11 | pattern 手机号，值 `'abc'` | 取结果 | false | P0 |
| T-10 | B-12 | validator 返回 `'自定义错误'` | 取错误信息 | 为 `'自定义错误'` | P1 |
| T-11 | B-13 | 两条规则，第一条失败 | 取错误 | 只显示第一条错误，不执行/显示第二条 | P1 |
| T-12 | B-17 | `validate()` 全通过 | 取 Promise | resolve true | P0 |
| T-13 | B-18 | `validateField('name')` | 观察 | 仅该字段校验 | P1 |
| T-14 | B-19 | 改值后 `resetFields()` | 取 model/错误 | 恢复初始值，错误清空 | P0 |
| T-15 | B-20 | 有错，`clearValidate()` | 取错误/值 | 错误清空，值不变 | P1 |
| T-16 | B-22 | 字段错误态 | 取 class | 含 `vc-form-item--error` | P1 |
| T-17 | E-01 | 字段无 rules | validate | 该字段通过 | P1 |
| T-18 | E-03 | required 无 message | 取错误文案 | 显示默认文案 | P2 |
| T-19 | B-21 | Form disabled | 取 provide/控件 | 控件禁用 | P1 |
| T-20 | A-02 | 字段错误 | 取控件 aria | aria-invalid true，aria-describedby 指向错误节点 | P1 |

---

## 实现提示

### 1. 结构

- Form provide 上下文：`{ model, rules, disabled, addField, removeField, validate, validateField, resetFields, clearValidate }`
- FormItem onMounted 时 `addField(name, itemApi)`，onUnmounted 移除；itemApi 暴露 validate/reset/clearError 与当前值、触碰状态
- 初始值深拷贝（`structuredClone` 或 JSON 方案）保存于 Form，供 resetFields 使用

### 2. 校验执行

- 单字段校验：取 `rules[name]`，顺序执行，每条产出错误字符串或 null；首个非 null 即结果
- required 判空：`value === '' || value == null`
- min/max 根据 typeof 区分长度/数值
- validator 用 try/catch 包裹
- 错误信息写入对应 FormItem 的本地 ref，控制 `__error` 渲染

### 3. 与控件对接

- FormItem provide：`{ name, controlId, errorId, setValue, handleBlur, markChanged, disabled }`
- 本阶段控件接入可分两步：先在测试中用简单 stub 控件验证 Form/FormItem 闭环；再让 VcInput 等真实消费上下文
- 注意不要为接入而改动阶段 2 前几个控件的既有行为，通过可选 inject（无 context 时正常独立工作）接入

### 4. 提交

```html
<form @submit.prevent="handleSubmit">
```

handleSubmit：`const ok = await validate(); if (ok) emit('submit', { ...model })`

### 5. 重构方向

- 规则执行器抽成独立纯函数模块 `src/components/form/validators.ts`，可独立单测
- addField/注册表逻辑若膨胀，抽 `useFormFields` composable
