# Checkbox 关键概念

> 本文件记录 VcCheckbox 实现中最容易卡住的三个概念，配合 [Checkbox.spec.md](../../../docs/stage-2-form/Checkbox.spec.md) 与 [Checkbox.vue](./Checkbox.vue) 阅读。

---

## 概念一：三种状态，尤其是 indeterminate

Checkbox 有三种视觉状态，但只有两个数据值。

```
┌──────────────┬──────────────┬──────────────┐
│   未选中     │   已选中     │   不确定     │
│              │              │              │
│     ┌─┐      │     ┌─┐      │     ┌─┐      │
│     │ │      │     │✓ │      │     │─ │      │
│     └─┘      │     └─┘      │     └─┘      │
│              │              │              │
│ modelValue  │ modelValue  │ modelValue  │
│   = false   │   = true    │   = false   │
└──────────────┴──────────────┴──────────────┘
```

### 关键点

- **indeterminate 是"纯视觉层"状态**，用横线表示"部分选中"。典型场景：父复选框下的子项有的选了、有的没选。
- 它**不影响 modelValue** —— 注意上表第三栏 modelValue 仍是 `false`。
- 点击不确定态会直接跳到"已选中"（modelValue 变 true），横线是否清除**由父组件控制 `indeterminate` prop**，组件自己不管。
- indeterminate 是 DOM property 不是 attribute，Vue 模板用 `:indeterminate="indeterminate"` 绑定即可生效。

### 对应 spec 行为

- B-09：`indeterminate=true` 时根 class 含 `vc-checkbox--indeterminate`
- B-10：`indeterminate=true` 时原生 input 的 `indeterminate` property 为 true
- B-11：不确定态下点击，`update:modelValue` 载荷为 `true`

---

## 概念二：独立模式 vs Group 模式（两条数据流）

同一个 `<VcCheckbox>` 组件，在两种模式下职责完全不同。

### 独立模式：自己管自己

```
┌────────────────────┐
│  父组件            │
│  v-model="agree"   │
└─────────┬──────────┘
          │ ↓ prop: modelValue (boolean)
          ▼
┌────────────────────┐
│  Checkbox          │  ← 自己持有 boolean
└─────────┬──────────┘
          │ ↑ emit update:modelValue(true)
          ▼
┌────────────────────┐
│  父组件更新 agree  │
└────────────────────┘
```

### Group 模式：通知上级，由上级统一管

```
┌────────────────────┐
│  父组件            │
│  v-model="selected"│
└─────────┬──────────┘
          │ ↓ prop: modelValue (string[])
          ▼
┌────────────────────┐
│  CheckboxGroup     │  ← 持有数组 + provide context
└─────────┬──────────┘
          │ ↓ provide(context)
          ▼
┌────────────────────┐
│  Checkbox (inject) │  ← 不持有数据
└─────────┬──────────┘
          │ ↑ 调用 group.toggle('a')
          ▼
┌────────────────────┐
│  Group 改数组并    │
│  emit update:      │
│  modelValue(['a']) │
└────────────────────┘
```

### 关键差异

| 维度 | 独立模式 | Group 模式 |
|---|---|---|
| 数据持有者 | Checkbox 自己 | CheckboxGroup |
| modelValue 类型 | `boolean` | `string[]` / `number[]` |
| 点击后行为 | 自己 emit `update:modelValue` | 调 `group.toggle(value)`，**不 emit 子项事件** |
| checked 来源 | `props.modelValue` | `group.modelValue.value.includes(props.value)` |
| disabled 来源 | `props.disabled` | `props.disabled \|\| group.disabled.value` |

**这就是 [Checkbox.vue#L55-L64](./Checkbox.vue) 里 `onChange` 要分流的原因** —— 两条数据流路径完全不同，必须分支处理。

---

## 概念三：onChange 的分流决策 + disabled 透传

`onChange` 是 Checkbox 的"心脏"，三个决策点串起来就是全部逻辑。

### 决策流程

```
              ┌─────────────────┐
              │   用户点击      │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │  isDisabled ?  │  ← 第一道闸
              └────┬───────┬───┘
                   │ 是    │ 否
                   ▼       ▼
        ┌──────────────┐  ┌──────────────┐
        │ return        │  │ 继续 ↓       │
        │ 不触发任何事件│  └──────┬───────┘
        └──────────────┘         │
                                 ▼
                       ┌─────────────────┐
                       │  isInGroup ?    │  ← 第二道闸
                       └────┬───────┬────┘
                            │ 是    │ 否
                            ▼       ▼
        ┌──────────────────────┐  ┌──────────────────────┐
        │ Group 模式           │  │ 独立模式             │
        │                      │  │                      │
        │ group.toggle(value)  │  │ handleChange(e)      │
        │ Group 改数组 + emit  │  │ emit update:modelValue│
        │                      │  │ emit change          │
        └──────────────────────┘  └──────────────────────┘
```

### 三个决策点拆解

1. **`isDisabled`** —— 第一道闸
   - 实现：`computed(() => props.disabled || !!group?.disabled.value)`
   - 独立模式只看 `props.disabled`
   - Group 模式额外看 `group.disabled.value`，任一为真即禁用
   - 命中即 `return`，不触发任何事件

2. **`isInGroup`** —— 第二道闸
   - 实现：`computed(() => !!group && isNotEmpty(props.value))`
   - **注意用 `isNotEmpty` 而不是 `props.value !== undefined`**
   - `value` prop 默认是空字符串 `''`，如果只判 `undefined`，没传 value 的子项会被误认成 Group 成员，调 `group.toggle('')` 把空字符串塞进数组
   - 这就是 spec E-02（无 value 不参与 Group 收集）的实现

3. **分流结果**
   - Group 走 `group.toggle(props.value)`，Group 维护数组并 emit
   - 独立走 `handleChange(e)`（来自 `useCheckEvent` composable），emit `update:modelValue` + `change`
   - 两条流互不重叠，Group 模式下子项**不会**重复 emit 自己的 `update:modelValue`

### disabled 透传机制

Group 模式下，Group 的 `disabled` prop 通过 `provide` 注入到子 Checkbox：

```
CheckboxGroup (props.disabled = true)
       │
       │ provide(checkboxGroupContextKey, {
       │   disabled: toRef(props, 'disabled'),
       │   ...
       │ })
       ▼
Checkbox (inject)
       │
       │ isDisabled = props.disabled || group.disabled.value
       ▼
   任一为 true → 禁用
```

`toRef(props, 'disabled')` 保证子组件拿到的是响应式引用 —— 父级 Group 动态切换 disabled 时，所有子 Checkbox 的禁用态会自动跟着变（对应 spec B-15）。

---

## 容易被忽略的细节

### 1. `isChecked` 在 Group 模式是派生值

[Checkbox.vue#L51-L53](./Checkbox.vue)：

```ts
const isChecked = computed(() => isInGroup.value
    ? group!.modelValue.value.includes(props.value as string | number)
    : props.modelValue);
```

Group 模式下 `checked` **不是从 props 读**，而是从 Group 的数组派生。所以 Group 数组变了，子项的勾选状态会自动跟着变 —— 这是 Group 模式"自己不管数据"的另一半体现。

### 2. `indeterminate` 不进 `isChecked`

`isChecked` 只看 `modelValue` 或 Group 数组，indeterminate 只影响视觉（通过 `:indeterminate="indeterminate"` 绑定到原生 input property）。所以 indeterminate 与 modelValue=true 可以同时存在，视觉是横线，但 checked 仍是 true（对应 spec E-03）。

### 3. `inject` 的类型与 warn 处理

[Checkbox.vue#L42](./Checkbox.vue)：

```ts
const group = inject<CheckboxGroupContext | undefined>(
    checkboxGroupContextKey,
    undefined
);
```

- 显式传 `undefined` 作为默认值，消除 Vue 运行时 `[Vue warn]: injection not found` 警告
- 类型拓宽为 `CheckboxGroupContext | undefined`，让后续 `group?.` 链式访问在 TS 下不报错
- `InjectionKey<T>` 在 T 上协变，所以拓宽 T 不需要 cast

### 4. `onChange` 不复用 `handleChange` 的 Group 分支

直接调 `handleChange(e)` 会让子项 emit `update:modelValue`（boolean 载荷）+ `change`，与 Group 的 emit（数组载荷）双重触发，语义混乱。所以 Group 分支**只调 `group.toggle()`**，不再走 `handleChange`。

---

## 概念四：indeterminate 在父组件控制下的状态循环

indeterminate 是父组件驱动的视觉状态。一个完整的"不确定 → 选中 → 未选中 → 不确定"循环需要父组件配合，子组件自身永远不知道自己处于哪一态。

### 状态循环图

```
                  ┌──────────────────────────────┐
                  │                              │
                  ▼                              │
   ┌──────────────────────────┐                 │
   │ 不确定 (indeterminate)   │                 │
   │  indeterminate = true    │                 │
   │  modelValue    = false   │                 │
   └─────────────┬────────────┘                 │
                 │ 用户点击                     │
                 │ 组件 emit update:modelValue(true)
                 │ 父组件接收，同时把           │
                 │ indeterminate 改为 false     │
                 ▼                              │
   ┌──────────────────────────┐                 │
   │ 已选中                   │                 │
   │  indeterminate = false   │                 │
   │  modelValue    = true    │                 │
   └─────────────┬────────────┘                 │
                 │ 用户点击                     │
                 │ 组件 emit update:modelValue(false)
                 │ 父组件接收，保持            │
                 │ indeterminate=false          │
                 ▼                              │
   ┌──────────────────────────┐                 │
   │ 未选中                   │                 │
   │  indeterminate = false   │                 │
   │  modelValue    = false   │                 │
   └─────────────┬────────────┘                 │
                 │ 用户在子项上操作（部分选中）│
                 │ 父组件监听子项状态，         │
                 │ 检测到"部分选中"            │
                 │ 父组件主动设                │
                 │ indeterminate=true          │
                 └──────────────────────────────┘
```

### 三段转换的关键点

| 转换 | 触发方 | 触发动作 | 组件 emit | 父组件反应 |
|---|---|---|---|---|
| 不确定 → 选中 | 用户点击父项 | 浏览器派发 change | `update:modelValue(true)` | 收到 true，把 `indeterminate` 改为 false |
| 选中 → 未选中 | 用户点击父项 | 浏览器派发 change | `update:modelValue(false)` | 收到 false，`indeterminate` 保持 false |
| 未选中 → 不确定 | 用户操作子项 | 父组件监听子项数组 | 无（父组件自己改） | 检测部分选中，主动设 `indeterminate=true` |

### 反直觉点

- **未选中 → 不确定** 这一步**不是用户点击父项触发**的，而是父组件监听子项状态后主动改 prop
- 组件自身**永远无法区分**自己处于"不确定"还是"未选中" —— 两种状态下 `modelValue` 都是 `false`，差异完全由父组件传入的 `indeterminate` prop 决定
- 所以 indeterminate 不是组件的"第三个数据态"，而是"父组件给的一个视觉提示标签"

### 父组件示例骨架

```vue
<script setup lang="ts">
import { ref, computed } from 'vue';

// 子项选中数组
const childValues = ref<string[]>([]);

// 父项是否全选：所有子项都选了才算选中
const allChecked = computed(() =>
    childValues.value.length === 3
);

// 父项是否不确定：选了一些但没全选
const indeterminate = computed(() =>
    childValues.value.length > 0 &&
    childValues.value.length < 3
);

// 父项 modelValue：仅当全选时为 true
const parentValue = computed(() => allChecked.value);

// 父项点击：全选或全不选
function onParentChange(val: boolean) {
    childValues.value = val ? ['a', 'b', 'c'] : [];
}
</script>

<template>
    <VcCheckbox
        :model-value="parentValue"
        :indeterminate="indeterminate"
        @update:model-value="onParentChange"
    />
    <!-- 子项列表 -->
</template>
```

父组件用 `computed` 把 `indeterminate` 派生自 `childValues`，从而完成"未选中 → 不确定"的自动转换。子项变化时，`childValues` 变 → `indeterminate` 自动重算 → 父项视觉自动跳回不确定态。

---

## 概念五：CheckboxGroup provide/inject 完整调用链

这是 Group 模式的"神经系统" —— 从父组件到子项再回父组件的完整数据/控制流。

### 调用链全图

```
┌────────────────────────────────────────────────────────────┐
│  父组件 (Parent)                                           │
│  <VcCheckboxGroup v-model="selected" :disabled="grpDis" />│
└──────────────────┬─────────────────────────────────────────┘
                   │
                   ▼  setup 阶段
┌────────────────────────────────────────────────────────────┐
│  CheckboxGroup setup()                                     │
│                                                            │
│  const props = withDefaults(defineProps<...>(), {...})     │
│  const emit  = defineEmits<...>()                          │
│                                                            │
│  function toggle(value) {            ← 闭包，捕获 props/emit
│      if (props.disabled) return;                          │
│      const arr = [...props.modelValue];                    │
│      const i = arr.indexOf(value);                        │
│      if (i !== -1) arr.splice(i, 1);                      │
│      else        arr.push(value);                          │
│      emit('update:modelValue', arr); ① emit 给父组件       │
│      emit('change', arr);                                 │
│  }                                                         │
│                                                            │
│  provide(checkboxGroupContextKey, {                       │
│      modelValue: toRef(props, 'modelValue'),  ← 响应式引用 │
│      disabled:  toRef(props, 'disabled'),    ← 响应式引用  │
│      toggle,                                  ← 闭包方法   │
│  })                                                        │
│                                                            │
│  <template><div class="vc-checkbox-group"><slot /></div>   │
│  </template>  ← 子 Checkbox 渲染在这里                     │
└──────────────────┬─────────────────────────────────────────┘
                   │
                   │ provide 注入 context
                   ▼
┌────────────────────────────────────────────────────────────┐
│  Checkbox setup() (每个子项)                               │
│                                                            │
│  const group = inject<...>(checkboxGroupContextKey, undef) │
│                                                            │
│  const isInGroup  = computed(() =>                         │
│      !!group && isNotEmpty(props.value))                  │
│  )                                                         │
│  const isDisabled = computed(() =>                         │
│      props.disabled || !!group?.disabled.value             │
│  )                                                         │
│  const isChecked  = computed(() =>                        │
│      isInGroup.value                                       │
│        ? group!.modelValue.value.includes(props.value)     │
│        : props.modelValue                                  │
│  )                                                         │
│                                                            │
│  function onChange(e) {                                   │
│      if (isDisabled.value) return;                        │
│      if (isInGroup.value)                                 │
│          group!.toggle(props.value);  ← ② 调 Group 方法    │
│      else handleChange(e);                                │
│  }                                                         │
└──────────────────┬─────────────────────────────────────────┘
                   │
                   │ 用户点击子项
                   ▼
┌────────────────────────────────────────────────────────────┐
│  事件回放路径                                              │
│                                                            │
│  用户点击 → @change 触发 onChange(e)                       │
│     → group.toggle('a')            [子项 → Group]           │
│     → Group 改数组 ['a']          [Group 内部]             │
│     → Group emit update:modelValue [Group → 父组件]  ① ←─┐ │
│     → 父组件 v-model 收到 ['a']                         │ │
│     → props.modelValue 变化 → toRef 触发                 │ │
│     → group.modelValue.value 变化                        │ │
│     → 子项 isChecked 重算（includes('a')）               │ │
│     → 命中项 checked=true，未命中项 checked=false        │ │
└────────────────────────────────────────────────────────────┘ │
                  ↑ 响应式回流闭环 ─────────────────────────┘
```

### 调用链按时序拆解

#### T0：初始化阶段

1. 父组件传 `modelValue: []` / `disabled: false` 给 Group
2. Group `setup()` 执行：`provide` 注入 context（用 `toRef` 包装为响应式引用）
3. Group `<template>` 渲染 `<slot />`，子 Checkbox 进入 setup
4. 子 Checkbox `inject` 拿到 context 引用
5. 子 Checkbox 渲染：`isChecked` = `[].includes(props.value)` = `false`

#### T1：用户点击子项

6. 浏览器派发 `change` 事件 → 触发子 Checkbox `onChange(e)`
7. `isDisabled.value` 为 false，放行
8. `isInGroup.value` 为 true，走 Group 分支
9. 调 `group.toggle('a')` —— 这是 Group `setup` 里的闭包方法

#### T2：Group 处理 toggle

10. `toggle` 内：`props.disabled` 为 false，放行
11. 拷贝数组 → `['a']`
12. `emit('update:modelValue', ['a'])` —— **Group** emit，不是子项
13. `emit('change', ['a'])`

#### T3：响应式回流

14. 父组件 `v-model` 收到 `['a']`，更新 `selected`
15. Group `props.modelValue` 变化 → `toRef` 触发 → `group.modelValue.value` 变化
16. 所有子 Checkbox 的 `isChecked` 重算：
    - value='a' 的子项：`['a'].includes('a')` = `true` → checked
    - value='b' 的子项：`['a'].includes('b')` = `false` → unchecked
17. DOM 更新：勾选框视觉跟着 `checked` 变

### 关键设计点

| 设计点 | 做法 | 为什么 |
|---|---|---|
| `toRef(props, 'xxx')` 而非 `props.xxx` | 用 `toRef` 包装 | 前者是响应式引用，父组件改 props 时子项能感知；后者是普通值，setup 跑完就固化 |
| `toggle` 是闭包 | 定义在 Group `setup` 内 | 闭包捕获了 Group 的 `props` / `emit`，子项调 `group.toggle()` 时实际在 Group 上下文执行 |
| 子项不持有数据 | `isChecked` 从 `group.modelValue.value.includes()` 派生 | Group 数组变 → 所有子项 checked 自动重算，单一数据源 |
| 单一 emit 源 | 只有 Group emit `update:modelValue`，子项绝不重复 | 避免父组件收到两种不同类型（boolean vs array）的载荷 |
| disabled 透传 | `isDisabled = props.disabled \|\| group.disabled.value` | Group 改 disabled → `toRef` 触发 → 子项 `isDisabled` 重算 → 自动禁用 |

### 为什么这套设计能跑通

provide/inject + `toRef` + computed 派生，三者组合让 Group 模式变成"单一数据源 + 自动响应"：

- **单一数据源**：Group 的 `props.modelValue` 是唯一的真相，子项不存副本
- **自动响应**：`toRef` 把 props 包成 ref，子项通过 computed 派生，无需手动同步
- **闭包方法**：`toggle` 闭包让子项"调父方法"成为可能，无需 emit 中转

如果不用 provide/inject，就得用 emit 一层层冒泡：子项 emit 给 Group，Group 再 emit 给父组件 —— 但子项无法直接通知"父的父"，所以这套机制本质上是**跨层级通信**，provide/inject 是 Vue 官方推荐的解法。
