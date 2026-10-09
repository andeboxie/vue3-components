# VcForm / VcFormItem 组件 SDD 文档

## 1. 元数据

| 字段 | 值 |
|---|---|
| 组件名 | `VcForm` / `VcFormItem` |
| 分类 | 表单 |
| 所属阶段 | Stage-2 |
| 依赖组件 | 通过 provide/inject 与内部表单控件协调（Input / Select 等） |
| 文件位置 | `./Form.vue`、`./FormItem.vue` |
| 上下文 | `./FormContext.ts`（Form→FormItem）、`./FormItemContext.ts`（FormItem→控件） |
| 校验器 | `./validators.ts`（纯函数，可独立单测） |
| 类型文件 | `./FormProps.ts`、`./FormItemProps.ts`、`./FormRule.ts` |
| 事件/暴露 | `../../emits/FormEmits.ts`、`../../expose/FormExpose.ts` |
| 注入 Key | `../../keys/FormContextKey.ts`、`../../keys/FormItemContextKey.ts` |
| 测试文件 | `./Form.test.ts` |
| Spec | `../../../docs/stage-2-form/Form.spec.md` |

---

## 2. 设计意图

提供表单容器与字段容器，承担**布局、标签、校验规则、提交拦截**。Form 聚合各字段值并在提交时统一校验；FormItem 负责单字段的 label、错误信息展示与规则触发。

**本阶段定位**：实现一套最小但完整的校验闭环（必填、类型、长度、自定义校验器），不追求 async-validator 的全部规则。

**不解决**：跨字段联动校验的 DSL（自定义 validator 可覆盖）、动态表单项的增删动画、schema 驱动表单。

---

## 3. API 规格

### 3.1 VcForm Props

| 名称 | 类型 | 默认值 | 必填 | 行为说明 |
|---|---|---|---|---|
| `model` | `Record<string, unknown>` | - | 是 | 表单数据对象，字段值来源 |
| `rules` | `Record<string, FormRule[]>` | `{}` | 否 | 字段校验规则，key 对应字段名 |
| `labelWidth` | `string` | - | 否 | 统一 label 宽度 |
| `labelPosition` | `LabelPosition` | `'right'` | 否 | label 对齐（`'left' \| 'right' \| 'top'`） |
| `inline` | `boolean` | `false` | 否 | 行内布局 |
| `disabled` | `boolean` | `false` | 否 | 整体禁用（传递给控件） |

### 3.2 VcForm Emits

| 事件名 | 载荷 | 触发时机 |
|---|---|---|
| `submit` | `values: Record<string, unknown>` | 原生提交且校验通过时 |
| `validate` | `valid: boolean, fields?: Record<string, string>` | 校验完成时（fields 为错误信息表） |

### 3.3 VcForm Expose

| 名称 | 签名 | 说明 |
|---|---|---|
| `validate` | `() => Promise<boolean>` | 校验全部字段，通过 resolve(true)，失败 resolve(false) |
| `validateField` | `(name: string) => Promise<boolean>` | 校验单个字段 |
| `resetFields` | `() => void` | 重置为初始值并清空错误 |
| `clearValidate` | `() => void` | 仅清空错误信息 |

### 3.4 VcFormItem Props

| 名称 | 类型 | 默认值 | 必填 | 行为说明 |
|---|---|---|---|---|
| `label` | `string` | - | 否 | 字段标签 |
| `name` | `string` | - | 是 | 字段名，关联 model 与 rules 的 key |
| `required` | `boolean` | `false` | 否 | 显示必填星号（规则仍以 rules 为准） |
| `showMessage` | `boolean` | `true` | 否 | 是否显示错误信息 |

### 3.5 VcFormItem Slots

| 名称 | 说明 |
|---|---|
| `default` | 表单控件 |
| `label` | 自定义 label |
| `error` | 自定义错误展示（slot props: `error`, `errorId`） |

### 3.6 校验规则类型

```ts
interface FormRule {
    required?: boolean;
    message?: string;
    min?: number;
    max?: number;
    pattern?: RegExp;
    validator?: (value: unknown) => boolean | string;
    trigger?: 'change' | 'blur';
}
```

---

## 4. 行为约束

### 渲染

- **B-01** Form 根元素为 `<form>`，class 含 `vc-form`；`inline=true` 时 class 含 `vc-form--inline`
- **B-02** FormItem class 含 `vc-form-item`；`label` 有值时渲染 `<label class="vc-form-item__label">`
- **B-03** labelPosition / labelWidth 作用于 label（位置 class 或宽度 style）
- **B-04** `required=true` 时 label 旁显示必填标记（`vc-form-item__required`）

### 提交与校验

- **B-05** 触发表单提交时，先执行全部校验；校验通过才触发 `submit`（载荷为 model 的拷贝）
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
- **B-15** 默认/`trigger='change'`：控件值变化时校验该字段（仅在该字段已被触碰过或提交后，避免初始即报错）
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

## 5. 边界条件与异常

- **E-01** 某字段无 rules：该字段校验始终通过
- **E-02** rules 引用了 model 中不存在的字段：不报错，校验时按 undefined 处理（required 则失败）
- **E-03** rule 无 message 且非自定义：使用默认错误文案（"该字段为必填项"）
- **E-04** validator 抛异常：视为校验失败，错误信息用 message 或默认文案
- **E-05** resetFields 后再次提交：以重置后的值重新校验

### 5.1 实现补充（spec 之外但已落地的决策）

1. **深拷贝用 JSON 方案替代 structuredClone**：Vue reactive proxy 不能被 `structuredClone` 克隆（`DataCloneError`），改用 `JSON.parse(JSON.stringify())`。spec 实现提示本身也提到了"structuredClone 或 JSON 方案"。
2. **FormItemContext 增加 `invalid: Ref<boolean>`**：spec 实现提示中 FormItemContext 列出 `{ name, controlId, errorId, setValue, handleBlur, markChanged, disabled }`，未包含错误状态。为让控件设置 `aria-invalid="true"`（A-02），新增 `invalid` 字段，FormItem 通过 `hasError` computed provide。
3. **触发时机的 touched 实现**：spec B-15 说"首次提交后才启用 change 实时校验"。实现方式为 FormItem 本地 `touched = ref(false)`，`validate()` 调用后设 `touched = true`，`markChanged()` 检查 `touched` 决定是否触发 change 校验。提交时 Form 调用各字段 `validate()`，间接设 touched。
4. **文件名修正**：原 `FromEmits.ts`/`FromExpose.ts` 拼写笔误已修正为 `FormEmits.ts`/`FormExpose.ts`，移至 `src/emits/` 与 `src/expose/` 目录。
5. **LabelPositionEnum 包含 `Bottom`**：spec 只允许 `'left' | 'right' | 'top'`，枚举含 `Bottom` 是预存值，FormProps 类型标注为 `LabelPosition`（含 Bottom），FormItem 渲染时对 `top` 做特殊处理，其余按 textAlign 渲染，Bottom 落入 default 分支表现为 right 对齐。
6. **控件接入采用可选 inject**：VcInput 和 VcSelect 通过 `inject(formItemContextKey, undefined)` 注入，无 context 时正常独立工作，不破坏阶段 2 已有行为。合并禁用 `isDisabled = computed(() => props.disabled || formItemContext?.disabled.value === true)`。

### 5.2 避免过度工程

- 不实现跨字段联动校验 DSL（validator 已覆盖自定义场景）
- 不实现动态表单项增删动画
- 不实现 schema 驱动表单
- 不在 FormItem 暴露 focus/blur（Select 组件自身已有，Input 可后续按需添加）

---

## 6. 可访问性

- **A-01** `<label>` 通过 `for` 关联控件 id（由 FormItem `useId()` 生成唯一 id 并 provide 给控件）
- **A-02** 错误信息节点带 id，控件通过 `aria-describedby` 关联；`aria-invalid="true"` 表达错误
- **A-03** 必填星号 `aria-hidden="true"` 对屏幕阅读器隐藏，必填语义由规则与 label 文本承担
- **A-04** 提交按钮原生 `type="submit"`，Enter 可提交（属于使用方约束，非组件内部行为，jsdom 不测试）

---

## 7. 测试用例清单

当前 29/29 全绿。

| 编号 | 关联行为 | Given | When | Then | 优先级 | 状态 |
|---|---|---|---|---|---|---|
| T-01 | B-01 | mount | 取根元素 | tagName `FORM`，class 含 `vc-form` | P0 | 绿 |
| T-02 | B-02 | FormItem label=`'名称'` | 找 label | 存在 `vc-form-item__label`，文本含 `'名称'` | P0 | 绿 |
| T-03 | B-04 | required true | 找必填标记 | 存在 | P1 | 绿 |
| T-04 | B-07 | 触发原生 submit | 观察 | preventDefault 被调用 | P0 | 绿 |
| T-05 | B-05 | 必填字段有值，触发 submit | 取 emitted | 有 `submit`，载荷含字段值 | P0 | 绿 |
| T-06 | B-06 | 必填字段为空，submit | 取 emitted/错误 | 无 submit，有 `vc-form-item__error`，有 validate(false) | P0 | 绿 |
| T-07 | B-09 | required，值为空，validate | 取错误 | 显示 message | P0 | 绿 |
| T-08 | B-10 | min=2，值 `'a'`，validate | 取结果 | false | P0 | 绿 |
| T-09 | B-11 | pattern 手机号，值 `'abc'` | 取结果 | false | P0 | 绿 |
| T-10 | B-12 | validator 返回 `'自定义错误'` | 取错误信息 | 为 `'自定义错误'` | P1 | 绿 |
| T-11 | B-13 | 两条规则，第一条失败 | 取错误 | 只显示第一条错误 | P1 | 绿 |
| T-12 | B-17 | `validate()` 全通过 | 取 Promise | resolve true | P0 | 绿 |
| T-13 | B-18 | `validateField('name')` | 观察 | 仅该字段校验 | P1 | 绿 |
| T-14 | B-19 | 改值后 `resetFields()` | 取 model/错误 | 恢复初始值，错误清空 | P0 | 绿 |
| T-15 | B-20 | 有错，`clearValidate()` | 取错误/值 | 错误清空，值不变 | P1 | 绿 |
| T-16 | B-22 | 字段错误态 | 取 class | 含 `vc-form-item--error` | P1 | 绿 |
| T-17 | E-01 | 字段无 rules | validate | 该字段通过 | P1 | 绿 |
| T-18 | E-03 | required 无 message | 取错误文案 | 显示默认文案 | P2 | 绿 |
| T-19 | B-21 | Form disabled | 取 provide/控件 | 控件禁用 | P1 | 绿 |
| T-20 | A-02 | 字段错误 | 取控件 aria | aria-invalid true，aria-describedby 指向错误节点 | P1 | 绿 |
| T-21 | B-08 | 校验后 | 取 validate 事件 | 载荷含 valid 与错误表 | P1 | 绿 |
| T-22 | B-14 | trigger=blur 规则 | change 后 blur | change 不校验，blur 时校验 | P1 | 绿 |
| T-23 | B-15 | 提交后修正值 | change 事件 | 实时校验，错误消失 | P1 | 绿 |
| T-24 | A-01 | 有 label 的字段 | 取 label for | 关联控件 id | P1 | 绿 |
| T-25 | A-03 | required=true | 取星号 aria | `aria-hidden="true"` | P2 | 绿 |
| T-26 | E-02 | rules 引用不存在字段 | validate | required 失败 | P2 | 绿 |
| T-27 | E-04 | validator 抛异常 | 取结果/错误 | 视为失败，显示 message | P2 | 绿 |
| T-28 | E-05 | resetFields 后再提交 | 取 submit | 以重置值校验通过 | P2 | 绿 |
| T-29 | B-03 | labelPosition=top | 取 label 样式/class | 全宽左对齐，含 `--label-top` | P2 | 绿 |

### 7.1 测试写法注意点

1. **StubControl 隔离测试**：测试文件内定义 `StubControl`（注入 FormItemContext，渲染 input，上报 setValue/markChanged/handleBlur），不依赖 VcInput 实现，隔离 Form 行为与控件行为。
2. **深拷贝 DataCloneError**：`structuredClone` 不能克隆 Vue reactive proxy，改用 `JSON.parse(JSON.stringify())` 后全绿。
3. **选择器精确性**：`vc-form-item__required` 同时出现在 label 的 class 列表和星号 span 上，测试 `aria-hidden` 时需用 `span.vc-form-item__required` 精确定位，否则命中 label 元素。
4. **createForm helper 的 formItemName**：辅助函数默认 `formItemName='name'`，测试中若用不同字段名（如 'phone'），必须作为第三参数传入，否则 FormItem 注册名与 rules key 不匹配，校验因无规则而通过（E-01）。
5. **T-14 初始值非空不报错**：required 规则下初始值 `'initial'` 非空会通过校验，测试需要先将值改为空再 validate 才能产生错误。
6. **异步提交事件**：`trigger('submit')` 后需 `await nextTick()` 等待 async `handleSubmit` 完成（内部 `await validate()` 是 microtask）。
7. **defaultPrevented 验证**：`trigger('submit')` 不返回事件对象，T-04 改用 `element.dispatchEvent(new Event('submit', { cancelable: true }))` 后检查 `event.defaultPrevented`。
8. **全量无回归**：10 个测试文件 180 通过 / 3 跳过，Form 新增 29 条不影响已有组件。

---

## 8. 实现提示

### 8.1 结构骨架

- **Form.vue**：`<form @submit.prevent="handleSubmit"><slot /></form>`，onMounted 深拷贝初始值快照，provide FormContext（model/rules/disabled 用 `toRef`），本地 `fields = new Map<string, FormItemApi>()` 字段注册表，`defineExpose<FormExpose>` 四个方法。
- **FormItem.vue**：`inject(formContextKey, undefined)`，`useId()` 生成 controlId/errorId，本地 `error = ref('')` + `touched = ref(false)`，onMounted `addField` / onUnmounted `removeField`，`provide(formItemContextKey, itemContext)`（含 `invalid: hasError`）。
- **validators.ts**：纯函数 `validateField(rules, value): string | null`，顺序执行 `validateRule`，首条失败即停止。required 用 `isEmpty()` 判空，min/max 按 typeof 区分长度/数值，validator 用 try/catch 包裹。

### 8.2 关键提示

- provide 的字段类型必须是 `Ref<>`（用 `toRef` 保证响应式），inject 传 `undefined` 默认值消除 Vue warn。
- `handleSubmit`：`const ok = await validate(); if (ok) emit('submit', { ...props.model }); emit('validate', ok, errors)`。
- `resetFields` 遍历 initialValues 恢复每个字段，再调 `itemApi.reset()` 清错。
- FormItem 的 `labelStyle`：`labelPosition='top'` 时返回 `{ width: '100%', textAlign: 'left' }`，否则返回 `{ width: labelWidth || '100px', textAlign: labelPosition }`。
- 控件接入：`isDisabled = computed(() => props.disabled || formItemContext?.disabled.value === true)`，包装事件 handler 在原有行为后调 `formItemContext?.setValue()` + `markChanged()` / `handleBlur()`。

### 8.3 不要做的事

- 不要用 `structuredClone` 克隆 reactive model（会抛 `DataCloneError`），用 JSON 方案。
- 不要在 FormItem 的 labelClasses 中同时给 label 和星号 span 用 `vc-form-item__required`（会导致选择器歧义；当前实现保留此行为，测试用 `span.` 前缀规避）。
- 不要让 `useInputEvents` composable 直接感知 FormItemContext（会破坏 Input 独立使用行为），在外层包装 handler 上报。
- 不要在 change 校验时不检查 touched（会导致初始输入即报错，违反 B-15）。
- 不要在 `validate()` 中 reject（spec 要求 resolve(false) 而非 reject）。

---

## 9. 完成自查

- [x] B-01~B-22 全部行为约束已实现并有测试覆盖
- [x] E-01~E-05 全部边界条件已实现并有测试覆盖
- [x] A-01~A-03 已实现并有测试覆盖（A-04 属使用方约束，jsdom 不测）
- [x] B-16 控件通过 inject 上报（StubControl 测试隐式覆盖，VcInput/VcSelect 已接入）
- [x] 测试 T-01~T-29 共 29 条全绿
- [x] 全量测试 10 文件 180 通过 / 3 跳过，无回归
- [x] `pnpm type-check` 无错误
- [x] spec 外实现已注明（5.1 实现补充）
- [x] LabelPositionEnum 含 `Bottom` 为预存值，spec 只允许三值，FormItem 渲染时 Bottom 落入 default 分支

---

## 10. 变更记录

### 0.1.0（2026-10-09）

- 阶段 1~5 全部完成：基础设施 → Form.vue → FormItem.vue → 测试 → 控件接入
- 深拷贝用 JSON 方案替代 structuredClone（Vue reactive proxy 不支持 structuredClone）
- FormItemContext 新增 `invalid: Ref<boolean>` 字段（spec 未列出，为 A-02 aria-invalid 提供）
- 触发时机用 touched 标志实现：validate 后设 touched，markChanged 检查 touched 决定是否 change 校验
- 文件名从 `FromEmits`/`FromExpose` 修正为 `FormEmits`/`FormExpose`
- VcInput + VcSelect 通过可选 inject 接入，合并禁用 `isDisabled`，不破坏独立使用行为
- 测试 29 条全绿（T-01~T-20 spec 原始 + T-21~T-29 续号补充）
