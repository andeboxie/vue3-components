# Switch 组件规格

## 元数据

| 字段 | 值 |
|---|---|
| 组件名 | `VcSwitch` |
| 分类 | 表单 |
| 所属阶段 | Stage-2 |
| 依赖组件 | 无 |
| 文件位置 | `src/components/switch/Switch.vue` |
| 测试文件 | `src/components/switch/Switch.test.ts` |

---

## 设计意图

提供开关控件，用于在两个互斥状态间即时切换（开/关），比 Checkbox 更强调"即时生效"的开关语义。

**不解决**：三态、多选。

---

## API 规格

### Props

| 名称 | 类型 | 默认值 | 必填 | 行为说明 |
|---|---|---|---|---|
| `modelValue` | `boolean` | `false` | 否 | 开关状态，`v-model` |
| `disabled` | `boolean` | `false` | 否 | 禁用 |
| `loading` | `boolean` | `false` | 否 | 加载态，切换中不可操作 |
| `activeText` | `string` | - | 否 | 开启时文本 |
| `inactiveText` | `string` | - | 否 | 关闭时文本 |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | 否 | 尺寸 |

### Emits

| 事件名 | 载荷 | 触发时机 |
|---|---|---|
| `update:modelValue` | `boolean` | 切换时 |
| `change` | `boolean` | 切换时 |

### Slots

无。

### Expose

无。

---

## 行为约束

### 渲染

- **B-01** 根元素 class 含 `vc-switch`，角色为开关（`role="switch"`）
- **B-02** `modelValue=true` 时根 class 含 `vc-switch--active`，`aria-checked="true"`
- **B-03** `modelValue=false` 时 `aria-checked="false"`
- **B-04** 内部含滑块节点（`vc-switch__handle`）
- **B-05** `activeText` 有值且开启时显示该文本；`inactiveText` 有值且关闭时显示

### 切换

- **B-06** 关闭态点击时触发 `update:modelValue`（载荷 `true`）
- **B-07** 开启态点击时触发 `update:modelValue`（载荷 `false`）
- **B-08** 切换同时触发 `change`（载荷为新值）

### 禁用与加载

- **B-09** `disabled=true` 时点击无事件，class 含 `vc-switch--disabled`
- **B-10** `loading=true` 时点击无事件，class 含 `vc-switch--loading`，显示加载指示
- **B-11** `disabled` 与 `loading` 同时：均不可操作

### 尺寸

- **B-12** `size` 映射 class `vc-switch--{size}`

---

## 边界条件

- **E-01** `modelValue` 非布尔：按 truthy 处理（TS 告警）
- **E-02** loading 期间外部仍可改 modelValue：以 props 为准（受控），但用户不可操作

---

## 可访问性

- **A-01** 用 `<button role="switch">` 或带 role 的可聚焦元素，键盘 Space/Enter 可切换
- **A-02** `aria-checked` 表达当前状态
- **A-03** disabled 用 `disabled` 属性或 `aria-disabled`，移出/保留 Tab 序列需一致（推荐原生 button disabled）

---

## 测试用例清单

| 编号 | 关联行为 | Given | When | Then | 优先级 |
|---|---|---|---|---|---|
| T-01 | B-01 | mount | 取根元素 | class 含 `vc-switch`，role 为 `switch` | P0 |
| T-02 | B-02 | `{ modelValue: true }` | 取属性 | class 含 `--active`，aria-checked `'true'` | P0 |
| T-03 | B-03 | mount | 取 aria-checked | `'false'` | P0 |
| T-04 | B-04 | mount | 找滑块 | 存在 `vc-switch__handle` | P0 |
| T-05 | B-05 | `{ activeText: '开', modelValue: true }` | 取文本 | 含 `'开'` | P1 |
| T-06 | B-06 | mount（关），点击 | 取 emitted | 载荷 `true` | P0 |
| T-07 | B-07 | `{ modelValue: true }`，点击 | 取 emitted | 载荷 `false` | P0 |
| T-08 | B-08 | 点击 | 取 emitted change | 载荷新值 | P1 |
| T-09 | B-09 | `{ disabled: true }`，点击 | 取 emitted | 无事件，class 含 `--disabled` | P0 |
| T-10 | B-10 | `{ loading: true }`，点击 | 取 emitted | 无事件，class 含 `--loading` | P0 |
| T-11 | B-12 | `{ size: 'small' }` | 取 class | 含 `vc-switch--small` | P1 |

---

## 实现提示

- 根元素用 `<button type="button" role="switch" :aria-checked="modelValue">`，@click 处理切换
- 切换逻辑：`if (disabled || loading) return; const next = !props.modelValue; emit('update:modelValue', next); emit('change', next)`
- loading 指示可复用 Button 的思路（滑块内小 spinner）
- 滑块位置由 CSS 根据 `--active` class 切换，不需要内联 style
