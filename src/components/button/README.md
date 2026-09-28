# VcButton 组件 SDD 文档

> 本文件是组件级 SDD（Specification-Driven Development）文档框架。
> 完整规格以 [`docs/stage-1-atomic/Button.spec.md`](../../../docs/stage-1-atomic/Button.spec.md) 为准，本文件用于组件目录内就近查阅与维护记录。
> 框架结构与总指南 [`docs/00-overview.md`](../../../docs/00-overview.md) 第三节"单组件 spec 模板"对齐。

---

## 1. 元数据

| 字段 | 值 |
|---|---|
| 组件名 | `VcButton` |
| 分类 | 基础原子 |
| 所属阶段 | Stage-1 |
| 依赖组件 | 无 |
| 文件位置 | `src/components/button/Button.vue` |
| 测试文件 | `src/components/button/Button.test.ts` |

---

## 2. 设计意图

提供最常用的按钮组件，封装视觉变体（type）、尺寸（size）、加载态（loading）、禁用态（disabled）与块级展示（block）。根元素始终为原生 `<button>`，天然获得键盘与辅助技术支持。

不解决：图标按钮、按钮组、下拉按钮（留给后续阶段或独立组件）。

---

## 3. API 规格

### 3.1 Props

| 名称 | 类型 | 默认值 | 必填 | 行为说明 |
|---|---|---|---|---|
| `type` | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger'`（由 `VisualStyleStateEnum` 派生） | `'default'` | 否 | 决定视觉变体，映射 class `vc-button--{type}` |
| `size` | `'small' \| 'medium' \| 'large'`（由 `SizeStateEnum` 派生） | `'medium'` | 否 | 决定尺寸，映射 class `vc-button--{size}` |
| `disabled` | `boolean` | `false` | 否 | 为 true 时原生禁用，点击不触发 click |
| `loading` | `boolean` | `false` | 否 | 为 true 时显示加载图标且等价禁用 |
| `nativeType` | `'button' \| 'submit' \| 'reset'`（由 `NativeTypeEnum` 派生） | `'button'` | 否 | 透传给原生 `<button>` 的 `type` 属性 |
| `block` | `boolean` | `false` | 否 | 为 true 时占满父容器宽度（class 加 `vc-button--block`） |

### 3.2 Emits

| 事件名 | 载荷类型 | 触发时机 |
|---|---|---|
| `click` | `MouseEvent` | 用户点击且按钮未处于 disabled / loading 状态时 |

### 3.3 Slots

| 名称 | 载荷 | 说明 |
|---|---|---|
| `default` | 无 | 按钮文本或子内容 |
| `loading` | 无 | 自定义加载图标，替换默认图标（渲染于 `vc-button__loading` 节点内） |

### 3.4 Expose

无。组件不暴露任何 ref 方法。

---

## 4. 行为约束

> 每条行为须满足：单一职责 / 可观察 / 可翻译为 Given-When-Then。

### 4.1 视觉与 class

- **B-01** 根元素始终含 class `vc-button`
- **B-02** `type="X"` 时根元素额外含 class `vc-button--X`（default 也含 `vc-button--default`）
- **B-03** `size="X"` 时根元素额外含 class `vc-button--X`（X 为 small / medium / large）
- **B-04** `block=true` 时根元素额外含 class `vc-button--block`

### 4.2 渲染与 DOM 结构

- **B-05** 根元素必须为原生 `<button>` 元素（不可用 `<div role="button">`）
- **B-06** `<button>` 的 `type` 属性值等于 `nativeType` prop
- **B-07** default slot 内容渲染为按钮内部子节点
- **B-08** `loading=true` 时，按钮内部出现加载图标节点（class 至少含 `vc-button__loading`），默认 slot 内容仍渲染（图标在前、文本在后）

### 4.3 交互

- **B-09** `disabled=true` 时，根元素 `disabled` 属性为 true（原生禁用），点击不触发 click
- **B-10** `loading=true` 时等价禁用：根元素 `disabled` 为 true，点击不触发 click
- **B-11** `disabled=false` 且 `loading=false` 时，点击触发一次 `click` emit，载荷为 `MouseEvent`
- **B-12** 同时 `disabled=true` 与 `loading=true` 时以 `disabled` 优先（不触发 click 即可）

### 4.4 Slots 行为

- **B-13** 提供 `loading` slot 时，loading 状态下用该 slot 内容替换默认加载图标
- **B-14** 不提供 `default` slot 时，按钮内部为空（不报错）

---

## 5. 边界条件与异常

### 5.1 边界条件

- **E-01** `type` 传入非约定值：class 仍含 `vc-button`，但不生成 `vc-button--xxx`（TS 类型告警，运行时不强校验；当前实现未做运行时校验，无测试覆盖）
- **E-02** `size` 传入非约定值：同 E-01
- **E-03** `disabled` 与 `loading` 同时为 true：以 `disabled` 优先，按钮 disabled
- **E-04** default slot 传入多个根节点：支持（default slot 天然支持数组）

### 5.2 不需要处理（避免过度工程）

- 不做防抖 / 节流
- 不做 ripple 波纹动画
- 不做主题切换（暗色模式留给后续全局主题阶段）
- 不做图标 prop（图标留给 Icon 组件 + slot 组合）

---

## 6. 可访问性（a11y）

- **A-01** 根元素为 `<button>`，天然支持 Tab 聚焦与 Enter/Space 触发 click
- **A-02** `disabled=true` 时原生 `disabled` 属性为 true，浏览器自动从 tab 序列移除
- **A-03** `loading=true` 时按钮仍可聚焦但不可激活，根元素绑定 `aria-busy="true"`
- **A-04** 无文字内容时通过 `aria-label` 或子节点提供可访问名（本阶段不强制，留作 TODO）

---

## 7. 测试用例清单

> 优先级：P0 必做 / P1 应做 / P2 可选

| 编号 | 关联行为 | Given | When | Then | 优先级 |
|---|---|---|---|---|---|
| T-01 | B-01 | mount VcButton | 取根元素 class | 含 `vc-button` | P0 |
| T-02 | B-02 | props `{ type: 'primary' }` | 取 class | 含 `vc-button--primary` | P0 |
| T-03 | B-02 | 不传 type | 取 class | 含 `vc-button--default` | P0 |
| T-04 | B-03 | props `{ size: 'small' }` | 取 class | 含 `vc-button--small` | P0 |
| T-05 | B-03 | 不传 size | 取 class | 含 `vc-button--medium` | P0 |
| T-06 | B-04 | props `{ block: true }` | 取 class | 含 `vc-button--block` | P1 |
| T-07 | B-05 | mount | 取根元素标签 | `tagName` 为 `BUTTON` | P0 |
| T-08 | B-06 | props `{ nativeType: 'submit' }` | 取 `type` 属性 | 等于 `'submit'` | P0 |
| T-09 | B-07 | slots `{ default: '点我' }` | 取文本 | 为 `'点我'` | P0 |
| T-10 | B-08 | props `{ loading: true }` | 查找 loading 节点 | 存在 `vc-button__loading` 元素 | P0 |
| T-11 | B-09 | props `{ disabled: true }` | 模拟 click | click 事件数为 0 | P0 |
| T-12 | B-09 | props `{ disabled: true }` | 取根元素 `disabled` 属性 | 存在 | P0 |
| T-13 | B-10 | props `{ loading: true }` | 模拟 click | click 事件数为 0 | P0 |
| T-14 | B-11 | 不传 disabled / loading | 模拟 click | 事件数为 1，载荷 MouseEvent | P0 |
| T-15 | B-12 | props `{ disabled: true, loading: true }` | 模拟 click | click 事件数为 0 | P1 |
| T-16 | B-13 | props `{ loading: true }`，slots `{ loading: '⟳' }` | 查找 loading 节点文本 | 含 `'⟳'` | P1 |
| T-17 | B-14 | 不传 default slot | 取根元素文本 | 为空字符串 | P1 |
| T-18 | A-03 | props `{ loading: true }` | 取根元素 `aria-busy` 属性 | 为 `'true'` | P1 |

---

## 8. 实现提示

> 不给完整代码，只给关键提示。

### 8.1 组件骨架

script setup + TS：`defineOptions` 命名 VcButton；`withDefaults(defineProps<ButtonProps>())` 提供全部默认值；`defineEmits` 声明 click；用 `computed` 返回 class 数组。模板为单个 `<button>`，内部依次是 `v-if="loading"` 的 `span.vc-button__loading`（内含 loading 具名 slot）与 default slot。

### 8.2 关键提示

- 禁用表达：`:disabled="disabled || loading"`，原生属性即可，不引入额外 class
- click 守卫：处理函数内先判断 `disabled || loading`，命中直接 return，否则 `emit('click', e)`
- `aria-busy` 绑定 loading（布尔属性，false 时 Vue 自动移除）
- 默认加载图标放在 loading 具名 slot 的标签体内，作为未传 slot 时的回退内容

### 8.3 测试骨架提示

使用 `@vue/test-utils` 的 `mount`；断言 API 按目标区分：class 用 `classes()`、HTML 属性用 `attributes()`、标签用 `element.tagName`、文本用 `text()`、子节点用 `find()`、事件用 `emitted()`（模拟点击需 await）。注意：原生 disabled 按钮在 jsdom 中不派发 click，`emitted('click')` 会是 undefined，断言前需归一化（`?? []`）。

### 8.4 重构方向

- class 计算已抽为 computed（已完成）
- loading 图标实现超过 5 行时，抽独立子组件 `ButtonLoading.vue`
- 按需导出 `ButtonProps` 类型供外部消费者复用

---

## 9. 完成自查

- [x] 测试全绿（18/18），每条 P0 行为都有对应测试
- [x] 没有实现 spec 未列出的功能
- [x] props 类型签名与 spec 完全一致
- [x] disabled 与 loading 同时为 true 时行为符合 B-12
- [x] 组件文件结构与总指南约定一致

---

## 10. 变更记录

| 版本 | 日期 | 变更说明 |
|---|---|---|
| 0.0.0 | 2026-09-28 | 初始框架 |
| 0.1.0 | 2026-09-28 | 按 spec 填充全部章节；实现与测试（T-01 ~ T-18）完成并通过 |
