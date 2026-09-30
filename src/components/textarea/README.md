# VcTextarea 组件 SDD 文档

> 本文件是组件级 SDD（Specification-Driven Development）文档框架。
> 完整规格以 [`docs/stage-2-form/Textarea.spec.md`](../../../docs/stage-2-form/Textarea.spec.md) 为准，本文件用于组件目录内就近查阅与维护记录。
> 框架结构与总指南 [`docs/00-overview.md`](../../../docs/00-overview.md) 第三节"`<script>` 块约定"及单组件 spec 模板对齐。

---

## 1. 元数据

| 字段 | 值 |
|---|---|
| 组件名 | `VcTextarea` |
| 分类 | 表单 |
| 所属阶段 | Stage-2 |
| 依赖组件 | 无 |
| 文件位置 | `src/components/textarea/Textarea.vue` |
| 测试文件 | `src/components/textarea/Textarea.test.ts` |

---

## 2. 设计意图

提供受控的多行文本输入框，是 Input 的多行变体，额外支持可见行数（rows）和自适应高度（autosize）。

不解决：富文本编辑、Markdown 编辑器、复杂校验（由 Form 组件负责）。

---

## 3. API 规格

### 3.1 Props

| 名称 | 类型 | 默认值 | 必填 | 行为说明 |
|---|---|---|---|---|
| `modelValue` | `string` | `''` | 否 | 文本值，支持 `v-model` |
| `placeholder` | `string` | `''` | 否 | 占位文本 |
| `disabled` | `boolean` | `false` | 否 | 禁用 |
| `readonly` | `boolean` | `false` | 否 | 只读 |
| `clearable` | `boolean` | `false` | 否 | 可清空，显示清空按钮 |
| `maxlength` | `number` | - | 否 | 最大字符数，原生 maxlength |
| `rows` | `number` | `3` | 否 | 可见行数，原生 rows；小于 1 视为 1（E-03） |
| `autosize` | `boolean \| { minRows: number; maxRows: number }` | `false` | 否 | 自适应内容高度 |
| `size` | `'small' \| 'medium' \| 'large'`（由 `SizeStateEnum` 派生） | `'medium'` | 否 | 尺寸，映射 class `vc-textarea--${size}` |

### 3.2 Emits

`TextareaEmits<string>` 继承自 `InputEmits<string>`，事件同 Input：

| 事件名 | 载荷类型 | 触发时机 |
|---|---|---|
| `update:modelValue` | `string` | 输入值变化时 |
| `blur` | `FocusEvent` | 失焦时（disabled 不触发） |
| `focus` | `FocusEvent` | 聚焦时（disabled 不触发） |
| `change` | `string` | 值变化且失焦时（disabled / readonly 不触发） |
| `clear` | `FocusEvent` | 点击清空按钮时 |

### 3.3 Slots

无。

### 3.4 Expose

无。组件不暴露任何 ref 方法。

---

## 4. 行为约束

### 4.1 渲染与 DOM

- **B-01** 根元素含 class `vc-textarea`，内部渲染原生 `<textarea>`
- **B-02** `placeholder` prop 透传给原生 `<textarea>` 的 `placeholder` 属性
- **B-03** `disabled` / `readonly` / `maxlength` 透传到原生属性
- **B-04** `rows` 透传到原生 `rows` 属性（小于 1 视为 1，见 E-03）

### 4.2 v-model

- **B-05** `modelValue` 为 `'line1\nline2'` 时，textarea 值为该内容
- **B-06** 用户输入时，触发 `update:modelValue`，载荷为输入后的完整值
- **B-07** `disabled` 或 `readonly` 时，用户输入不触发 `update:modelValue`

### 4.3 清空

- **B-08** `clearable=true` 且 `modelValue` 非空时，显示清空按钮（class `vc-textarea__clear`）
- **B-09** 点击清空按钮时，触发 `update:modelValue`（载荷 `''`）和 `clear` 事件

### 4.4 自适应高度

- **B-10** `autosize=true` 时，内容增加，textarea 高度随内容增长
- **B-11** `autosize={ maxRows: 5 }` 时，内容超过 5 行高度后不再增长（出现滚动条）
- **B-12** `autosize={ minRows: 2 }` 时，初始高度不小于 2 行

### 4.5 尺寸与焦点

- **B-13** `size` 映射为 class `vc-textarea--{size}`
- **B-14** focus / blur 触发对应事件
- **B-15** 失焦且值变化时触发 `change`（载荷为当前值）

---

## 5. 边界条件与异常

### 5.1 边界条件

- **E-01** `modelValue` 为 `undefined` / `null`：视为空字符串（`:value="modelValue ?? ''"`）
- **E-02** `readonly` 时不显示清空按钮
- **E-03** `rows` 小于 1：视为 1（由 `getRows` computed 用 `Math.max(1, props.rows ?? 1)` 实现）
- **E-04** `autosize` 的 `maxRows < minRows`：忽略 maxRows（在 `resize` 函数里通过 `max && (!min || max >= min)` 判断）

### 5.2 实现补充（spec 之外，已实现）

- 清空按钮显示条件额外排除 `disabled`（spec E-02 只要求 readonly，实现加了 `&& !disabled`，与 Input 一致，避免禁用时还能点清空）
- `autosize=false` 时清空 `style.height` 与 `style.overflowY`，让原生 `rows` 属性重新生效
- 行高读取：`window.getComputedStyle(ta).lineHeight`，jsdom / 解析失败时回退 `18px`
- `autosize=true`（无 minRows/maxRows）时 `maxHeight = Infinity`，仅按内容增长无上限

### 5.3 不需要处理（避免过度工程）

- 不做防抖 / 节流
- 不做输入校验（留给 Form）
- 不做富文本编辑 / Markdown 编辑器

---

## 6. 可访问性（a11y）

- **A-01** 原生 `<textarea>` 天然支持键盘输入与 Tab 聚焦
- **A-02** `disabled=true` 时原生 `disabled` 让浏览器自动从 tab 序列移除
- **A-03** 清空按钮需要可访问名（`aria-label="清空"`）

---

## 7. 测试用例清单

> 优先级：P0 必做 / P1 应做 / P2 可选。当前 16/16 全绿，autosize 3 条因 jsdom 限制 skip。

| 编号 | 关联行为 | Given | When | Then | 优先级 |
|---|---|---|---|---|---|
| T-01 | B-01 | mount | 取根元素 | class 含 `vc-textarea`，有 `<textarea>` | P0 |
| T-02 | B-02 | `{ placeholder: '描述' }` | 取 textarea placeholder | 为 `'描述'` | P0 |
| T-03 | B-03 | `{ disabled: true }` | 取 textarea disabled | 存在 | P0 |
| T-04 | B-04 | `{ rows: 5 }` | 取 textarea rows | 为 `'5'` | P0 |
| T-05 | B-05 | `{ modelValue: 'a\nb' }` | 取 textarea value | 为 `'a\nb'` | P0 |
| T-06 | B-06 | mount，setValue `'hi'` | 取 emitted | `update:modelValue` 载荷 `'hi'` | P0 |
| T-07 | B-07 | `{ readonly: true }`，输入 | 取 emitted | 无 `update:modelValue` | P0 |
| T-08 | B-08 | `{ clearable: true, modelValue: 'x' }` | 查找清空按钮 | 存在 `vc-textarea__clear` | P0 |
| T-09 | B-09 | 点击清空 | 取 emitted | `update:modelValue` 载荷 `''`，有 `clear` | P0 |
| T-10 | B-10 | `{ autosize: true }`，设置 10 行内容 | 取 style.height | 大于初始高度 | P1 |
| T-11 | B-11 | `{ autosize: { maxRows: 5 } }`，20 行内容 | 取 style.height | 不超过 5 行高度 | P2 |
| T-12 | B-12 | `{ autosize: { minRows: 2 } }` | 取初始高度 | 不小于 2 行 | P2 |
| T-13 | B-13 | `{ size: 'small' }` | 取 class | 含 `vc-textarea--small` | P0 |
| T-14 | B-14 | 触发 focus / blur | 取 emitted | 有对应事件 | P0 |
| T-15 | B-15 | `{ modelValue: 'a' }`，setValue `'b'`，触发 blur | 取 emitted change | 载荷为 `'b'` | P1 |
| T-16 | E-02 | `{ clearable: true, readonly: true, modelValue: 'x' }` | 查找清空按钮 | 不存在 | P1 |
| T-17 | E-03 | `{ rows: 0 }` | 取 textarea rows | 为 `'1'` | P2 |
| T-18 | A-03 | `{ clearable: true, modelValue: 'x' }` | 取清空按钮 aria-label | 为 `'清空'` | P1 |
| T-19 | - | `{ autosize: false }` | 取 textarea style.height | 为空字符串 | P2 |

> **T-10~T-12 skip 说明**：jsdom 不做真实布局，`scrollHeight` 恒为 0，无法验证"增长 / 上限 / 下限"。这三条留待真实浏览器（e2e / playwright）环境再补。

---

## 8. 实现提示

> 不给完整代码，只给关键提示。实际实现见 [Textarea.vue](./Textarea.vue)。

### 8.1 组件骨架

`<script setup lang="ts">`：`withDefaults(defineProps<TextareaProps>())` 提供 9 个默认值（modelValue / placeholder / disabled / readonly / clearable / rows / autosize / size）；`defineEmits<TextareaEmits<string>>()` 声明 5 个事件（继承 InputEmits）；class 通过 `useFormControl('vc-textarea', props.size)` composable 计算。模板为单个 `<div :class="textareaClasses">` 根容器，内部依次是原生 `<textarea ref="textareaRef">` 与清空按钮 `span.vc-textarea__clear`。

### 8.2 关键提示

- 根容器：class 挂根 `<div>`，不挂原生 textarea；BEM class 由 `useFormControl` 生成 `['vc-textarea', 'vc-textarea--${size}']`
- textarea 透传：`:value="modelValue ?? ''"`（E-01）、`:placeholder` / `:readonly` / `:disabled` / `:maxlength`、`:rows="getRows"`（E-03 computed clamp）
- **不要**把 `autosize` 透传给原生 textarea（原生无此属性，无效）；自适应高度通过 JS 实现
- 清空按钮：`v-if="clearable && modelValue && !readonly && !disabled"`，`aria-label="清空"`，`@click="handleClear"`
- 事件守卫：每个 handler 开头判断 `props.disabled`（focus / blur / change / clear）与 `props.readonly`（input / change / clear），命中 return
- change 载荷：`emit('change', getValue(e))`，传字符串值（不是 Event）；依赖原生 `@change`（值变化 + 失焦时浏览器派发）
- blur / focus 只 emit 对应事件，不再 emit `update:modelValue`（值在 input 时已更新）

### 8.3 自适应高度实现要点

- `textareaRef = ref<HTMLTextAreaElement>()`，template `<textarea ref="textareaRef">`
- `resize()` 函数核心：
  1. `autosize=false` → 清空 `style.height` / `style.overflowY`，return
  2. 解析 `minRows` / `maxRows`（`typeof props.autosize === 'object'`）
  3. `lineHeight = getLineHeight()`（读 computedStyle，回退 18px）
  4. `minHeight = min ? min * lineHeight : 0`
  5. `maxHeight = (max && (!min || max >= min)) ? max * lineHeight : Infinity`（E-04）
  6. **关键**：`style.height = 'auto'` 先重置（否则 scrollHeight 会卡在已设固定高度上）
  7. `scrollHeight = ta.scrollHeight`
  8. `clamped = Math.max(minHeight, Math.min(maxHeight, scrollHeight))`
  9. `style.height = '${clamped}px'`
  10. `overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden'`
- `watch([() => props.autosize, () => props.modelValue], () => nextTick(resize))`
- `onMounted(resize)` 初始按 minRows 设最小高度

### 8.4 测试骨架提示

使用 `@vue/test-utils` 的 `mount`。断言按目标区分：根 class 用 `wrapper.classes()`、textarea 属性用 `wrapper.find('textarea').attributes()`、textarea value 用 `(wrapper.find('textarea').element as HTMLTextAreaElement).value`、style 用 `.element.style.xxx`、子节点用 `find('.vc-textarea__xxx').exists()`、事件用 `wrapper.emitted('xxx')`。触发用 `await ta.setValue('hi')`、`await ta.trigger('focus' / 'blur')`、`await wrapper.find('.vc-textarea__clear').trigger('click')`。

注意：
- T-15（change）依赖 jsdom 原生行为——textarea value 改变后触发 blur，jsdom 会自动派发 change 事件，因此绑 `@change` 的实现能通过"触发 blur 即触发 change"
- T-17（E-03）验证 `rows=0` 时 `attributes('rows')` 为 `'1'`（getRows computed clamp）
- T-19（autosize=false）验证 `style.height` 为空字符串（resize 关闭分支清空内联样式）
- T-10~T-12（autosize 增长/上限/下限）**jsdom 无法验证**，用 `it.skip` 占位，留 TODO 待 e2e

### 8.5 重构方向

- class 计算已抽为 `useFormControl` composable（已完成，与 Input 共享，见 [UseFormControl.ts](../../composables/UseFormControl.ts)）
- autosize 逻辑可考虑抽 `useAutosize` composable（当前未抽，避免过度工程；若其他组件无此需求则保留在 Textarea 内）
- 事件守卫逻辑与 Input 重复，可考虑抽 `useInputEvents` composable（当前未抽）

---

## 9. 完成自查

- [x] 测试全绿（16/16，autosize 3 条因 jsdom 限制 skip）
- [x] 没有实现 spec 未列出的功能（清空按钮排除 disabled 是 spec E-02 的合理延伸，已注明）
- [x] props 类型签名与 spec 完全一致（9 个字段，`TextareaProps` 接口，`modelValue?: string` optional）
- [x] disabled / readonly 守卫覆盖所有值事件 handler
- [x] `change` 载荷为 string，符合 spec Emits 表
- [x] autosize JS 实现（不透传原生属性），E-04 maxRows<minRows 处理
- [x] E-03 rows<1 用 `getRows` computed clamp
- [x] 组件文件结构与总指南约定一致（`<script setup lang="ts">`，符合第四节 4.3）

---

## 10. 变更记录

| 版本 | 日期 | 变更说明 |
|---|---|---|
| 0.0.0 | 2026-09-29 | 初始空框架 |
| 0.1.0 | 2026-09-29 | 按 spec 填充全部章节；实现完成，16/16 测试通过（autosize 3 条 jsdom 限制 skip） |
| 0.2.0 | 2026-09-29 | P0/P1 修复：`textareaRef` 绑 ref、`maxHeight=Infinity`、E-04 maxRows<minRows 处理、`getRows` computed 用 Math.max、移除 `:autosize` 透传、`modelValue` 改 optional、清理 `window.getComputedStyle` 空格 |
| 0.3.0 | 2026-09-29 | 重构：抽 `useInputEvents` composable 共享 5 个事件 handler（与 Input 复用）；调用处传 `props` 对象保证 disabled / readonly 响应式访问；删除 `Event.ts` 中死代码 `getFocusValue` |
