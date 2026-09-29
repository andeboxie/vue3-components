# Select 组件规格

## 元数据

| 字段 | 值 |
|---|---|
| 组件名 | `VcSelect` |
| 分类 | 表单 |
| 所属阶段 | Stage-2 |
| 依赖组件 | 无（选项通过 props options 传入） |
| 文件位置 | `src/components/select/Select.vue` |
| 测试文件 | `src/components/select/Select.test.ts` |

---

## 选择意图

提供下拉选择器：点击展开选项面板，选中后收起并回传值。支持单选、禁用项、占位、清空、键盘导航。

**不解决**：多选、远程搜索、虚拟滚动、分组选项（本阶段不实现）。

---

## API 规格

### Props

| 名称 | 类型 | 默认值 | 必填 | 行为说明 |
|---|---|---|---|---|
| `modelValue` | `string \| number` | - | 否 | 当前选中值，`v-model` |
| `options` | `Array<{ label: string; value: string \| number; disabled?: boolean }>` | `[]` | 是 | 选项列表 |
| `placeholder` | `string` | `'请选择'` | 否 | 未选中时占位文本 |
| `disabled` | `boolean` | `false` | 否 | 禁用 |
| `clearable` | `boolean` | `false` | 否 | 可清空 |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | 否 | 尺寸 |

### Emits

| 事件名 | 载荷 | 触发时机 |
|---|---|---|
| `update:modelValue` | `string \| number` | 选中或清空时 |
| `change` | `string \| number` | 选中值变化时 |
| `visible-change` | `boolean` | 下拉面板展开/收起时 |
| `clear` | - | 清空时 |

### Slots

| 名称 | 说明 |
|---|---|
| `default` | 自定义触发器内容（本阶段可预留，不强制） |

### Expose

| 名称 | 说明 |
|---|---|
| `focus()` | 聚焦触发器 |
| `blur()` | 失焦 |

---

## 行为约束

### 触发器

- **B-01** 根元素 class 含 `vc-select`，含触发器节点（`vc-select__control`）
- **B-02** 未选中时触发器显示 placeholder（class `vc-select__placeholder`）
- **B-03** 选中值后触发器显示该选项的 label（不是 value）
- **B-04** `aria-haspopup="listbox"`，`aria-expanded` 反映面板状态

### 展开/收起

- **B-05** 点击触发器展开面板（class `vc-select__dropdown`，面板含全部 options），触发 `visible-change(true)`
- **B-06** 再次点击触发器收起面板，触发 `visible-change(false)`
- **B-07** 展开时点击面板外部，面板收起
- **B-08** 选中任意选项后自动收起面板

### 选项选中

- **B-09** 点击未禁用选项时触发 `update:modelValue`（载荷为该选项 value）
- **B-10** 选中变化同时触发 `change`
- **B-11** 点击 `disabled` 选项：不选中、不收起、不触发事件
- **B-12** 当前选中项在面板中有选中样式 class（`vc-select-option--selected`），`aria-selected="true"`
- **B-13** 点击已选中选项：收起面板但不触发 update/change（值不变）

### 清空

- **B-14** `clearable=true` 且有选中值时显示清空按钮（`vc-select__clear`）
- **B-15** 点击清空按钮触发 `update:modelValue`（载荷 `''`）、`clear`，面板状态不变（不展开）
- **B-16** 清空按钮点击不触发面板展开（需阻止冒泡）

### 键盘操作

- **B-17** 触发器聚焦时按 Enter / Space / ArrowDown 展开面板
- **B-18** 面板展开时按 ArrowDown / ArrowUp 移动高亮项（跳过 disabled），高亮项有 class `vc-select-option--highlighted`
- **B-19** 高亮项上按 Enter：选中该项
- **B-20** 按 Escape：收起面板，焦点回到触发器

### 禁用与尺寸

- **B-21** `disabled=true` 时点击不展开，触发器有禁用样式
- **B-22** `size` 映射 class `vc-select--{size}`

---

## 边界条件

- **E-01** options 为空数组：展开后显示空（本阶段不强制空状态文案）
- **E-02** modelValue 不在任何选项中：触发器显示 placeholder
- **E-03** 全部选项 disabled：可展开但无法选中
- **E-04** disabled 时 clearable：不显示清空按钮

---

## 可访问性

- **A-01** 触发器 `role="combobox"`（或 button + aria-haspopup），`aria-expanded`、`aria-controls` 关联面板 id
- **A-02** 面板 `role="listbox"`，选项 `role="option"` + `aria-selected`
- **A-03** 键盘操作完整（方向键、Enter、Escape、Tab）
- **A-04** 高亮项通过 `aria-activedescendant` 关联（推荐）

---

## 测试用例清单

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

---

## 实现提示

- 面板状态用本地 `ref(false)`；点击外部用全局 document click 监听（判断 `!rootEl.contains(e.target)`），或 VueUse 的 onClickOutside（若已引入）
- 选项渲染 `v-for`，class 计算 selected / disabled / highlighted
- 高亮索引用本地 ref，初始为当前选中项的 index；方向键移动时循环或钳制边界，跳过 disabled
- 键盘处理在 control 的 `@keydown`，Escape 后 `control.focus()` 回焦
- 面板可用 Teleport 到 body（避免 overflow 裁剪），本阶段也可直接绝对定位；若 Teleport，点击外部判断仍以 rootEl 为准
- 阻止冒泡：清空按钮 `@click.stop`
- Expose focus/blur：defineExpose 转发内部 control 元素的方法
