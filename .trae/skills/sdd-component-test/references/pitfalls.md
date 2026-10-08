# 本仓库组件测试高频陷阱

按 Checkbox / Radio / Switch 三个组件的实际踩坑记录整理。写测试或归因红测时逐条对照。

## 1. Group 组件：emit 不会自动回写 props

`mount(VcGroup, { props: { modelValue: 'a' } })` 是单向写死的，子项触发 `update:modelValue` 后 Group 的 `props.modelValue` 不会自己变，`isChecked` 不重算。

- 只断言 emit（"事件有没有发"）不需要同步。
- 断言 emit 后的视觉重渲（"a 取消、b 选中"）必须模拟 v-model：

```ts
props: {
    modelValue: 'a',
    'onUpdate:modelValue': async (val: string | number) => {
        await wrapper.setProps({ modelValue: val })
    },
}
```

## 2. jsdom 不模拟浏览器原生联动

- `<label>` 点击联动内部 input 的 change 事件：jsdom 不支持。a11y 的 label 关联测试改测结构：`wrapper.find('label').find('input[type=radio]').exists()`。
- radio 同 name 的键盘方向键互斥：jsdom 不支持。改测"同组 input 的 name 属性相等且非空"作为代理验证。
- 原生 `disabled` 不阻止 test-utils 的 `trigger('click')`（手动 dispatchEvent）。所以"禁用无事件"必须靠组件内 JS 守卫，不能只靠 `:disabled`；两层都要写。

## 3. 复用 composable 前先核对它读的 DOM 属性

`useCheckEvent.handleChange` 内部走 `getCheckedValue(e)`，取 `e.target.checked`，且只判 `props.disabled`。

- 适用于 checkbox / radio 的 `<input @change>`。
- 不能绑到 Switch 的 `<button @click>`：button 没有 `.checked`，emit 载荷变成 `undefined`；也不判 loading。
- Switch 类组件写本地 handler：`if (disabled || loading) return; const next = !props.modelValue; emit(...)`，新值从 props 派生，不需要 Event 参数。

## 4. inject 要显式传 undefined 默认值

独立使用子组件时没有 provider，Vue 会打 `injection "Symbol(...)" not found` warn，且 TS 签名冲突：

```ts
const group = inject<XxxGroupContext | undefined>(xxxGroupKey, undefined);
```

Key 类型必须含 `| undefined`（在 Key 文件拓宽或调用处 cast），否则第二参数传 undefined 报 TS 错。

## 5. value 判定用 isNotEmpty，不用 !== undefined

`value` prop 的 withDefaults 默认值是 `''`。`props.value !== undefined` 对空字符串恒 true，会把没传 value 的子项误收入组。

```ts
const isInGroup = computed(() => !!group && isNotEmpty(props.value));
```

## 6. 组件间 class 命名串台

从相邻组件拷代码时最容易抄错修饰符，红测会直接抓：

- Checkbox：`vc-checkbox--checked`
- Switch：`vc-switch--active`（不是 --checked）
- Group 是独立组件：`vc-radio-group` / `vc-radio-group--vertical`，不是 `vc-radio--group`。

## 7. class 挂错层：双根结构

wrapper div 放 `vc-switch`、button 放 role 与状态 class，会导致"根元素同时含 class 和 role"的断言失败。spec 要求单根时直接让可交互元素（button/label）做根，class、role、aria 全挂同一层。

## 8. 状态 class 必须条件化

从 composable 拿的基础 class 只有 `prefix` + `prefix--size`。`--active / --disabled / --loading / --checked` 要在组件内包一层 computed 用对象语法条件追加；写成无条件常量会让所有状态视觉错误，且"禁用 class"断言会假绿。

## 9. aria 属性与 role 配套

- `role="switch"` 配 `aria-checked`，不是 `aria-pressed`。
- `:aria-checked="modelValue"` 布尔会渲染成字符串 `'true'/'false'`，断言用 `wrapper.attributes('aria-checked')`。

## 10. Group 模式子项不要重复 emit

Group 内点击只调 `group.toggle(value)`，不要再调子项的 `handleChange`，否则子项（布尔载荷）与 Group（数组/单值载荷）双重 emit。Radio 额外在子项侧加 `isChecked` 守卫：点已选中项直接 return（Group toggle 内再兜底一次，双保险）。

## 11. provide 的字段必须是 Ref

`provide` 时用 `toRef(props, 'xxx')` 而不是直接传 `props.xxx`，否则父级动态改 disabled/modelValue 时子项不响应。需要注入的稳定标识（如 RadioGroup 的 name）：`ref(useId())`（Vue 3.5+，useId 返回 string 需自己包 ref）。

## 12. 类型契约：props 与 context 是两个 interface

`defineProps` 用的 Props interface 不能含 `Ref<>` 字段和 `toggle` 方法；provide/inject 的 Context 单独一个 interface（Ref 字段 + 方法）。混写会让 `withDefaults` 的默认值（`''`、`false`）全部类型报错。
