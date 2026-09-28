# Button 组件规格

## 元数据

| 字段 | 值 |
|---|---|
| 组件名 | `VcButton` |
| 分类 | 基础原子 |
| 所属阶段 | Stage-1 |
| 依赖组件 | 无 |
| 文件位置 | `src/components/button/Button.vue` |
| 测试文件 | `src/components/button/Button.test.ts` |

---

## 设计意图

提供一个最常用的按钮组件，封装：样式变体（type）、尺寸（size）、加载态（loading）、禁用态（disabled）。

**不解决**：图标按钮、按钮组、下拉按钮（这些留给后续阶段或单独组件）。

---

## API 规格

### Props

| 名称 | 类型 | 默认值 | 必填 | 行为说明 |
|---|---|---|---|---|
| `type` | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger'` | `'default'` | 否 | 决定按钮视觉变体，映射到 class `vc-button--{type}` |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | 否 | 决定按钮尺寸，映射到 class `vc-button--{size}` |
| `disabled` | `boolean` | `false` | 否 | 为 `true` 时按钮禁用，禁用时不触发 click |
| `loading` | `boolean` | `false` | 否 | 为 `true` 时按钮显示加载图标且禁用交互 |
| `nativeType` | `'button' \| 'submit' \| 'reset'` | `'button'` | 否 | 透传给原生 `<button>` 的 `type` 属性 |
| `block` | `boolean` | `false` | 否 | 为 `true` 时按钮占满父容器宽度（class 加 `vc-button--block`） |

### Emits

| 事件名 | 载荷类型 | 触发时机 |
|---|---|---|
| `click` | `MouseEvent` | 用户点击按钮且按钮未处于 disabled / loading 状态时 |

### Slots

| 名称 | 载荷 | 说明 |
|---|---|---|
| `default` | 无 | 按钮文本或子内容 |
| `loading` | 无 | 自定义加载图标（替换默认加载图标） |

### Expose

无。组件不暴露任何 ref 方法。

---

## 行为约束

### 视觉与 class

- **B-01** 根元素始终含 class `vc-button`
- **B-02** `type="X"` 时根元素额外含 class `vc-button--X`（X 为 type 取值，default 也含 `vc-button--default`）
- **B-03** `size="X"` 时根元素额外含 class `vc-button--X`（X 为 small / medium / large）
- **B-04** `block=true` 时根元素额外含 class `vc-button--block`

### 渲染与 DOM 结构

- **B-05** 根元素必须为原生 `<button>` 元素（不可用 `<div role="button">`）
- **B-06** `<button>` 的 `type` 属性值等于 `nativeType` prop
- **B-07** default slot 内容渲染为按钮内部子节点
- **B-08** `loading=true` 时，按钮内部出现一个加载图标节点（class 至少含 `vc-button__loading`），且默认 slot 内容仍然渲染（图标在前、文本在后）

### 交互

- **B-09** `disabled=true` 时，根元素 `disabled` 属性为 `true`（原生禁用），点击不触发 `click` emit
- **B-10** `loading=true` 时，等价于禁用：根元素 `disabled` 为 `true`，点击不触发 `click` emit
- **B-11** `disabled=false` 且 `loading=false` 时，点击按钮必须触发一次 `click` emit，载荷为 `MouseEvent`
- **B-12** 同时传入 `disabled=true` 与 `loading=true` 时，以 `disabled` 优先（按钮 disabled，不显示 loading 图标也行；只要不触发 click 即可）

### Slots 行为

- **B-13** 提供 `loading` slot 时，loading 状态下用该 slot 内容替换默认加载图标
- **B-14** 不提供 `default` slot 时，按钮内部为空（不报错）

---

## 边界条件与异常

### 边界条件

- **E-01** `type` 传入非约定值（如 `'xxx'`）：根元素 class 仍含 `vc-button`，但不生成 `vc-button--xxx`（TS 类型会告警，运行时不强校验）
- **E-02** `size` 传入非约定值：同 E-01
- **E-03** `disabled` 与 `loading` 同时为 `true`：以 `disabled` 优先，按钮 disabled
- **E-04** default slot 传入多个根节点：支持（v-slot default 天然支持数组）

### 不需要处理（避免过度工程）

- 不做防抖 / 节流
- 不做 ripple 波纹动画
- 不做主题切换（暗色模式留给后续全局主题阶段）
- 不做图标 prop（图标留给 Icon 组件 + slot 组合）

---

## 可访问性（a11y）

- **A-01** 根元素为 `<button>`，天然支持 Tab 聚焦与 Enter/Space 触发 click
- **A-02** `disabled=true` 时，`<button>` 的 `disabled` 属性为 `true`，浏览器原生从 tab 序列移除
- **A-03** `loading=true` 时，按钮应仍可聚焦（让屏幕阅读器朗读 loading 状态），但不可激活；推荐给根元素加 `aria-busy="true"`
- **A-04** 按钮无文字内容（slot 为空）时，应通过 `aria-label` 或子节点提供可访问名（本阶段不强制，留作 TODO）

---

## 测试用例清单

> 优先级：P0 必做 / P1 应做 / P2 可选

| 编号 | 关联行为 | Given | When | Then | 优先级 |
|---|---|---|---|---|---|
| T-01 | B-01 | mount VcButton | 取根元素 class | 含 `vc-button` | P0 |
| T-02 | B-02 | mount，props `{ type: 'primary' }` | 取 class | 含 `vc-button--primary` | P0 |
| T-03 | B-02 | mount，不传 type | 取 class | 含 `vc-button--default` | P0 |
| T-04 | B-03 | mount，props `{ size: 'small' }` | 取 class | 含 `vc-button--small` | P0 |
| T-05 | B-03 | mount，不传 size | 取 class | 含 `vc-button--medium` | P0 |
| T-06 | B-04 | mount，props `{ block: true }` | 取 class | 含 `vc-button--block` | P1 |
| T-07 | B-05 | mount | 取根元素 | `tagName` 为 `BUTTON` | P0 |
| T-08 | B-06 | mount，props `{ nativeType: 'submit' }` | 取 `type` 属性 | 等于 `'submit'` | P0 |
| T-09 | B-07 | mount，slots `{ default: '点我' }` | 取文本 | 为 `'点我'` | P0 |
| T-10 | B-08 | mount，props `{ loading: true }` | 查找 loading 节点 | 存在 class 含 `vc-button__loading` 的元素 | P0 |
| T-11 | B-09 | mount，props `{ disabled: true }`，模拟 click | 取 emitted('click') | 长度为 0 | P0 |
| T-12 | B-09 | mount，props `{ disabled: true }` | 取根元素 `disabled` 属性 | 为 `true` | P0 |
| T-13 | B-10 | mount，props `{ loading: true }`，模拟 click | 取 emitted('click') | 长度为 0 | P0 |
| T-14 | B-11 | mount，不传 disabled/loading，模拟 click | 取 emitted('click') | 长度为 1，载荷为 MouseEvent | P0 |
| T-15 | B-12 | mount，props `{ disabled: true, loading: true }`，模拟 click | 取 emitted('click') | 长度为 0 | P1 |
| T-16 | B-13 | mount，props `{ loading: true }`，slots `{ loading: '⟳' }` | 查找 loading 节点 | 文本含 `'⟳'` | P1 |
| T-17 | B-14 | mount，不传 default slot | 取根元素文本 | 为空字符串 | P1 |
| T-18 | A-03 | mount，props `{ loading: true }` | 取根元素 `aria-busy` 属性 | 为 `'true'` | P1 |

> 备注：T-16 中 `'⟳'` 只是示例文本，可换任意自定义内容。

---

## 实现提示（不给完整代码）

### 1. 组件骨架

```vue
<script setup lang="ts">
// 定义 props：用 defineProps + TS 类型字面量
// 定义 emits：用 defineEmits<{ click: [e: MouseEvent] }>()
</script>

<template>
  <button>...</button>
</template>
```

### 2. 关键提示

- props 用 `withDefaults(defineProps<...>(), {...})` 写法，TS 类型签名照 spec 表抄
- loading 图标节点用一个 `<span class="vc-button__loading">` 包裹，里面放 SVG 或简单 CSS spinner
- class 绑定推荐用一个 computed 返回数组，配合 `:class` 自动展开
- click 触发条件判断：在 `<button @click="handleClick">` 里检查 `disabled || loading`，满足则 `return`，否则 `emit('click', e)`
- **不要**给根元素加 `@click` 然后在 click 处理函数里阻止冒泡——直接判断是否触发 emit 即可
- `aria-busy` 绑定到 `loading`

### 3. 测试骨架提示

```ts
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import VcButton from './Button.vue'

describe('VcButton', () => {
  describe('Props', () => {
    it('T-01: 根元素含 vc-button', () => {
      const wrapper = mount(VcButton)
      expect(wrapper.classes()).toContain('vc-button')
    })
    // ... 继续写
  })
})
```

### 4. 重构方向（全绿后）

- 把 class 计算逻辑抽到一个 computed
- 如果 loading 图标 SVG 内容超过 5 行，抽成独立子组件 `ButtonLoading.vue`
- 检查 props 类型是否可被外部消费者复用（导出 `ButtonProps` 类型）

---

## 完成后自查

- [ ] 测试全绿，且每条 P0 行为都有对应测试
- [ ] 没有实现 spec 未列出的功能
- [ ] props 类型签名与 spec 完全一致
- [ ] disabled 与 loading 同时为 true 时行为符合 B-12
- [ ] 组件文件结构与总指南约定一致
