# VcSelect 组件 SDD 文档

> 本文件是组件级 SDD（Specification-Driven Development）文档框架。
> 完整规格以 [`docs/stage-2-form/Select.spec.md`](../../../docs/stage-2-form/Select.spec.md) 为准，本文件用于组件目录内就近查阅与维护记录。
> 框架结构与总指南 [`docs/00-overview.md`](../../../docs/00-overview.md) 第三节"`<script>` 块约定"及单组件 spec 模板对齐。

---

## 1. 元数据

| 字段 | 值 |
|---|---|
| 组件名 | `VcSelect` |
| 分类 | 表单 |
| 所属阶段 | Stage-2 |
| 依赖组件 | 无外部组件依赖（选项通过 props options 传入；选项渲染抽为目录内子组件 VcSelectOption） |
| 文件位置 | `src/components/select/Select.vue` |
| 子组件位置 | `src/components/select/option/SelectOption.vue`（纯展示，Props 定义见同目录 `SelectOptionProps.ts`） |
| 测试文件 | `src/components/select/Select.test.ts` |

---

## 2. 设计意图

提供下拉选择器：点击展开选项面板，选中后收起并回传值。支持单选、禁用项、占位、清空、键盘导航。

**不解决**：多选、远程搜索、虚拟滚动、分组选项（本阶段不实现）。

**与原生 `<select>` 的核心差异**：原生元素无法承载自定义 class、`role="option"` 级 aria 标注、禁用项点击拦截与高亮导航，故实现为 control 触发器 + dropdown 面板的完全自定义结构。

---

## 3. API 规格

### 3.1 Props

| 名称 | 类型 | 默认值 | 必填 | 行为说明 |
|---|---|---|---|---|
| `modelValue` | `string \| number` | `''` | 否 | 当前选中值，`v-model` |
| `options` | `Array<{ label: string; value: string \| number; disabled?: boolean }>` | `[]` | 是 | 选项列表 |
| `placeholder` | `string` | `'请选择'` | 否 | 未选中时占位文本 |
| `disabled` | `boolean` | `false` | 否 | 禁用 |
| `clearable` | `boolean` | `false` | 否 | 可清空 |
| `size` | `'small' \| 'medium' \| 'large'`（由 `SizeStateEnum` 派生） | `'medium'` | 否 | 尺寸，映射 class `vc-select--${size}` |

### 3.2 Emits

| 事件名 | 载荷类型 | 触发时机 |
|---|---|---|
| `update:modelValue` | `string \| number` | 选中或清空时（清空载荷为 `''`） |
| `change` | `string \| number` | 选中值变化时（点击已选中项不触发） |
| `visible-change` | `boolean` | 下拉面板展开/收起时 |
| `clear` | - | 清空时 |

### 3.3 Slots

| 名称 | 说明 |
|---|---|
| `default` | 自定义触发器内容（spec 标注"本阶段可预留，不强制"；实现保留在 control 节点内） |

### 3.4 Expose

| 名称 | 说明 |
|---|---|
| `focus()` | 聚焦触发器（转发内部 control 元素方法） |
| `blur()` | 失焦 |

---

## 4. 行为约束

### 4.1 触发器

- **B-01** 根元素 class 含 `vc-select`，含触发器节点（`vc-select__control`）
- **B-02** 未选中时触发器显示 placeholder（class `vc-select__placeholder`）
- **B-03** 选中值后触发器显示该选项的 label（不是 value）
- **B-04** `aria-haspopup="listbox"`，`aria-expanded` 反映面板状态

### 4.2 展开/收起

- **B-05** 点击触发器展开面板（class `vc-select__dropdown`，面板含全部 options），触发 `visible-change(true)`
- **B-06** 再次点击触发器收起面板，触发 `visible-change(false)`
- **B-07** 展开时点击面板外部，面板收起
- **B-08** 选中任意选项后自动收起面板

### 4.3 选项选中

- **B-09** 点击未禁用选项时触发 `update:modelValue`（载荷为该选项 value）
- **B-10** 选中变化同时触发 `change`
- **B-11** 点击 `disabled` 选项：不选中、不收起、不触发事件
- **B-12** 当前选中项在面板中有选中样式 class（`vc-select-option--selected`），`aria-selected="true"`
- **B-13** 点击已选中选项：收起面板但不触发 update/change（值不变）

### 4.4 清空

- **B-14** `clearable=true` 且有选中值时显示清空按钮（`vc-select__clear`）
- **B-15** 点击清空按钮触发 `update:modelValue`（载荷 `''`）、`clear`，面板状态不变（不展开）
- **B-16** 清空按钮点击不触发面板展开（需阻止冒泡）

### 4.5 键盘操作

- **B-17** 触发器聚焦时按 Enter / Space / ArrowDown 展开面板
- **B-18** 面板展开时按 ArrowDown / ArrowUp 移动高亮项（跳过 disabled），高亮项有 class `vc-select-option--highlighted`
- **B-19** 高亮项上按 Enter：选中该项
- **B-20** 按 Escape：收起面板，焦点回到触发器

### 4.6 禁用与尺寸

- **B-21** `disabled=true` 时点击不展开，触发器有禁用样式
- **B-22** `size` 映射 class `vc-select--{size}`

---

## 5. 边界条件与异常

- **E-01** options 为空数组：展开后显示空（本阶段不强制空状态文案）
- **E-02** modelValue 不在任何选项中：触发器显示 placeholder（由 `hasSelection` 判定，`selectValue` 回退 placeholder 文本）
- **E-03** 全部选项 disabled：可展开但无法选中（`moveHighlight` 循环一轮全部跳过后保持原高亮，点击被守卫拦截）
- **E-04** disabled 时 clearable：不显示清空按钮（`showClear` 条件含 `!disabled`）

### 5.1 实现补充（spec 之外，已实现）

- **整体重写原生占位实现**：初版是原生 `<select>` + `<option>`，无法承载 role/aria/状态 class/键盘导航，按 spec 重写为 control + dropdown 自定义结构
- **`hasSelection` computed 单点判定**：`options.some(o => o.value === modelValue)`，同时驱动三处——placeholder/value 的 class 切换（B-02/B-03）、`selectValue` 文本回退（E-02）、清空按钮显隐（B-14）
- **选中 handler 三分支顺序**：`if (option.disabled) return`（B-11，不收起）→ `if (value === modelValue)` 只收起（B-13）→ 双 emit 后收起（B-08/B-09/B-10）
- **根修饰符 `vc-select--dropdown` 表示展开态**：spec 未声明该 class，为开发中自行添加的展开态样式钩子，保留
- **高亮索引初始值跟随选中项**：`openDropdown` 时 `findIndex(o => o.value === modelValue)`，无选中时为 -1；方向键按模运算循环并跳过 disabled（spec 实现提示允许循环或钳制，取循环）
- **面板 id 用 `useId()` 生成**：关联 control 的 `aria-controls` / `aria-activedescendant` 与选项 id（A-01/A-04）
- **`SelectProps.options` 在 interface 标为可选**：spec 声明必填，因 `withDefaults` 提供 `[]` 默认值故签名保留 optional，必填语义靠调用方保证
- **选项抽为纯展示子组件 `SelectOption.vue`**：原内联在 dropdown 中的 v-for div 抽出，只负责渲染——class（selected/disabled/highlighted 三修饰符）、`role="option"`、`aria-selected`、节点 id；状态由父级算好经 props（`selected`/`highlighted`/`optionId`）传入，点击只 emit `click` 上报 option 数据。**判定逻辑不随抽取移动**：B-11 禁用拦截、B-13 已选中分支、键盘 Enter 复用全部留在 Select 的 `onOptionClick`
- **v-for key 拼 index 防重复值**：`:key="`${option.value}-${index}`"`。选项 value 重复时 `:key="option.value"` 会触发 Vue 重复键报错（Duplicate keys detected）。同值选项的语义缺口（同值项同时 selected、B-13 无法区分具体项）不做组件层兜底，由数据源保证 value 唯一

### 5.2 避免过度工程

- 不使用 Teleport 挂载面板（spec 允许，本阶段直接绝对定位即可）
- 不写空状态文案节点（E-01 不强制）
- 不实现多选/远程搜索/虚拟滚动/分组（spec 明确不解决）

---

## 6. 可访问性（a11y）

- **A-01** control `role="combobox"` + `aria-haspopup="listbox"` + `:aria-expanded="isOpen"` + `aria-controls` 关联面板 id（aria-expanded 无独立 T 用例，由实现保证）
- **A-02** 面板 `role="listbox"`，选项 `role="option"` + `:aria-selected`（T-10 覆盖 aria-selected 断言；测试选择器统一用 `[role="option"]`）
- **A-03** 键盘操作：ArrowDown/ArrowUp/Enter/Escape 已由 T-16~T-19 覆盖；Tab 键焦点流转 jsdom 不测，需真机浏览器验证
- **A-04** 高亮项经 `:aria-activedescendant` 关联（推荐项，已实现但未在测试中断言）

---

## 7. 测试用例清单

> 优先级：P0 必做 / P1 应做 / P2 可选。当前 21/21 全绿。

| 编号 | 关联行为 | Given | When | Then | 优先级 |
|---|---|---|---|---|---|
| T-01 | B-01 | mount，options 两项 | 查找 | class 含 `vc-select`，有 control | P0 |
| T-02 | B-02 | 不传 modelValue | 取触发器文本 | 含 `'请选择'` | P0 |
| T-03 | B-03 | modelValue 为某 value | 取触发器文本 | 显示对应 label | P0 |
| T-04 | B-05 | 点击 control | 找面板 | 存在 `vc-select__dropdown`，visible-change(true) | P0 |
| T-05 | B-06 | 展开后点击 control | 找面板 | 不存在，visible-change(false) | P0 |
| T-06 | B-09 | 展开，点击选项 a | 取 emitted | update 载荷 a.value | P0 |
| T-07 | B-08 | 选中选项 | 找面板 | 自动收起 | P0 |
| T-08 | B-10 | 选中 | 取 emitted | 有 change | P1 |
| T-09 | B-11 | 点击 disabled 选项 | 取 emitted/面板 | 无事件，面板仍展开 | P0 |
| T-10 | B-12 | modelValue=a，展开 | 取 a 选项 | class `--selected`，aria-selected true | P1 |
| T-11 | B-13 | 点击已选中项 | 取 emitted | 无 update，面板收起 | P1 |
| T-12 | B-07 | 展开，点击组件外部 | 找面板 | 收起 | P1 |
| T-13 | B-14 | clearable，有值 | 找清空按钮 | 存在 | P0 |
| T-14 | B-15 | 点击清空 | 取 emitted | update 载荷 `''`，有 clear | P0 |
| T-15 | B-16 | 点击清空 | 观察面板 | 未展开 | P1 |
| T-16 | B-17 | 聚焦，按 ArrowDown | 找面板 | 展开 | P1 |
| T-17 | B-18 | 展开，按 ArrowDown | 取高亮 | 高亮移到下一项（跳过 disabled） | P1 |
| T-18 | B-19 | 高亮第一项，按 Enter | 取 emitted | 选中该项 | P1 |
| T-19 | B-20 | 展开，按 Escape | 找面板 | 收起 | P1 |
| T-20 | B-21 | disabled，点击 control | 找面板 | 不展开 | P0 |
| T-21 | B-22 | size small | 取 class | 含 `vc-select--small` | P1 |

无独立 T 编号的 spec 条款：E-01~E-04、B-04、A-01/A-03(Tab)/A-04、Expose（focus/blur）。其中 E-02 由 T-02/T-03 经由 `hasSelection` 间接覆盖，E-04 由 `showClear` 的 `!disabled` 条件实现但未单独断言，其余 a11y 项需真机验证或后续补测。

### 7.1 测试注意点

- **T-13 防"实现取巧"**：条件渲染类必须两种挂载分别断言——有值时按钮存在、无值时不存在；只测正例会放过"无条件渲染"的 bug
- **T-12 外部点击模拟**：`document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))` 后必须 `await wrapper.vm.$nextTick()` 再断言面板消失（状态同步、渲染异步）
- **T-17/T-18 的确定性前提**：依赖"初始高亮 = 当前选中项 index"这一 spec 实现提示，测试用 modelValue 锚定初始高亮再按方向键，避免对"-1 起始还是先选中第一项"的实现差异脆弱
- **选项选择器用 `[role="option"]`**：不断言基础 class 名（spec 只规定了 `--selected`/`--highlighted` 修饰符），以 a11y 属性为锚更稳
- **抽子组件后测试零改动**：class、role、aria-selected 全部挂在 SelectOption 的根 DOM 上，test-utils 的 `findAll`/`classes`/`attributes` 会穿透子组件边界，原断言无需修改；这反向验证了抽取时没有把状态属性挂到包装层
- **无需模拟 v-model 回写**：本组件测试只断言 emit 载荷与本地面板状态（isOpen 是组件内 ref），不像 Group 类组件需要 `onUpdate:modelValue` + `setProps`
- **T-20 依赖组件 JS 守卫**：jsdom 下 `trigger('click')` 绕过原生 disabled，组件必须在 click/keydown handler 内判 `props.disabled`

---

## 8. 实现提示

> 不给完整代码，只给关键提示。实际实现见 [Select.vue](./Select.vue)。

### 8.1 组件骨架

`<script setup lang="ts">`：`withDefaults(defineProps<SelectProps>())` 提供 6 个默认值；`defineEmits<SelectEmits>()` 声明 4 个事件。本地状态：`isOpen`（面板）、`highlightIndex`（高亮）、`rootRef`/`controlRef`（DOM）。模板单根 `div.vc-select`，内层 control（role=combobox）+ `v-if="isOpen"` 的 dropdown（role=listbox）；选项由独立的纯展示组件 [SelectOption.vue](./option/SelectOption.vue) 循环渲染（role=option），key 为 `` `${option.value}-${index}` ``。

### 8.2 关键提示

- 选中逻辑集中在 `onOptionClick`，键盘 Enter 直接复用它（传 `options[highlightIndex]`），不要另写一份
- 展开/收起封装 `openDropdown`/`closeDropdown`，所有路径（点击、键盘、选中、外部点击、Escape）走同一对函数，保证 `visible-change` 不漏发不多发
- 外部点击：`onMounted` 挂 document click，`onUnmounted` 移除；判断 `rootEl && !rootEl.contains(e.target)`
- 高亮移动：`(next + step + len) % len` 循环，`for` 一轮内跳过 disabled，全部 disabled 时保持原值（E-03）
- 清空按钮 `@click.stop="onClear"`，handler 只 emit `update:modelValue('')` + `clear`，不碰 isOpen（B-15）
- class：`useFormControl('vc-select', props.size)` 提供基础两项，computed 对象语法追加 `--disabled`/`--clearable`/展开态修饰符；选项三状态修饰符（selected/disabled/highlighted）移至 SelectOption 组件内，父级把布尔状态当 props 传入

### 8.3 不要做的事

- 不要用原生 `<select>`/`<option>` 实现（无法标注 role=option、aria-selected、状态 class，也无法拦截禁用项点击）
- 不要只靠原生 disabled 属性拦截交互（jsdom 的 trigger 会绕过，click/keydown 都要 JS 守卫）
- 不要忘记清空按钮的 `.stop`（冒泡会触发 control 的展开切换，B-16 直接挂）
- 不要把高亮初始值写死 0（要跟随当前选中项 index，否则 T-17 的"跳过 disabled"断言失去锚点）
- 不要把 `aria-selected` 只在选中项上渲染（布尔多值绑定渲染 `'true'/'false'`，每个 option 都带）
- 不要让 SelectOption 承担判定（disabled 拦截、值相等判断都留在父级 onOptionClick），子组件只 emit click，否则键盘 Enter 与鼠标点击会产生两套行为
- 不要用 `option.value` 单独做 key（value 重复时报 Duplicate keys，拼上 index）

---

## 9. 完成自查

- [x] 测试全绿（21/21），每条 P0 行为都有对应测试
- [x] 全量测试无回归（151 通过 / 3 跳过），`pnpm type-check` 无错误
- [x] Props/Emits 类型签名与 spec 一致（`options` 因 withDefaults 默认值在 interface 标 optional，已在 5.1 注明）
- [x] B-01~B-22 全覆盖；无 T 编号的条款（B-04、E-01~E-04、Expose）已在第 7 节注明原因
- [x] 展开/收起统一走 open/close 封装，`visible-change` 四条触发路径（点击切换、选中、外部点击、Escape）一致
- [x] disabled 双守卫：control click 与 keydown 均判 `props.disabled`（B-21）
- [x] A-01/A-02/A-04 的 role 与 aria 属性齐备；A-03 键盘项除 Tab 外均有测试
- [x] 超出 spec 的实现（根展开态修饰符 `vc-select--dropdown`、useId 生成面板 id、SelectOption 子组件）已在 5.1 注明
- [x] 子组件边界清晰：SelectOption 为纯展示（状态 props 进、click 上报出），判定逻辑不跨组件；抽取后测试零改动且 21/21 仍全绿
- [x] 组件文件结构与总指南约定一致（`<script setup lang="ts">`）

---

## 10. 变更记录

| 版本 | 日期 | 变更说明 |
|---|---|---|
| 0.0.0 | 2026-10-08 | 初始空框架（原生 `<select>` 占位实现） |
| 0.1.0 | 2026-10-08 | 按 spec 填充全部章节；实现完成，21/21 测试通过。关键决策：原生 `<select>` 占位整体重写为 control + dropdown 自定义结构（原生元素无法承载 role/aria/键盘导航）；`hasSelection` computed 单点判定驱动 placeholder 切换、文本回退与清空显隐（覆盖 E-02/B-14）；选中 handler 三分支（B-11 禁用不收起 / B-13 已选中只收起 / 正常双 emit 收起）；open/close 统一封装保证 visible-change 一致；document 外部点击 + `rootEl.contains` 判断（B-07）；清空按钮 `@click.stop`（B-16）；高亮索引初始 = 选中项 index、模运算循环跳过 disabled（B-18）；click/keydown 双 JS 守卫（jsdom 绕过原生 disabled）；`useId()` 生成面板 id 关联 aria-controls/aria-activedescendant |
| 0.2.0 | 2026-10-09 | 修复 + 结构优化，21/21 测试仍全绿、类型检查通过。v-for key 由 `option.value` 改为 `` `${option.value}-${index}` ``（选项 value 重复时报 Duplicate keys，同值语义缺口由数据源保证唯一）；选项 v-for 片段抽为纯展示子组件 `SelectOption.vue`（class/role/aria 渲染内聚，状态 props 输入、click 上报，B-11/B-13 等判定逻辑保留在父级 onOptionClick，键盘 Enter 与鼠标点击单一事件源）；README 同步更新元数据、5.1、7.1、第 8 节与本记录 |
