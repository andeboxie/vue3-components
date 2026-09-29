# 第 2 阶段总览：表单类组件

> 本阶段在原子组件基础上，构建表单类组件。核心是 **v-model 双向绑定**、**表单校验**、**无障碍**。

---

## 2.1 阶段目标

- 掌握 Vue3 的 `v-model` 实现（`modelValue` prop + `update:modelValue` emit）
- 掌握表单控件的无障碍规范（label 关联、aria 属性、键盘操作）
- 掌握受控组件模式（值由 props 控制，不自行修改）
- 建立表单组件族的统一交互约定

---

## 2.2 组件清单与推荐完成顺序

| 序号 | 组件 | spec 文件 | 难度 | 学到的能力 |
|---|---|---|---|---|
| 1 | Input | Input.spec.md | 易 | v-model / 输入事件 / 清空 / 禁用 / 长度限制 |
| 2 | Textarea | Textarea.spec.md | 易 | 多行输入 / 自适应高度 / 行数限制 |
| 3 | Checkbox | Checkbox.spec.md | 中 | checked 状态 / 不确定态 / 组选中 |
| 4 | Radio | Radio.spec.md | 中 | 单选互斥 / RadioGroup 协调 |
| 5 | Switch | Switch.spec.md | 易 | 开关切换 / 加载态 |
| 6 | Select | Select.spec.md | 难 | 下拉面板 / 选项选中 / 键盘导航 |
| 7 | Form | Form.spec.md | 难 | 表单校验 / 提交 / 字段聚合 |

**建议按顺序做**：Input 是基础，Textarea 是变体，Checkbox/Radio 引入选中态，Switch 最简单，Select 最复杂（面板+键盘），Form 最后做整合。

---

## 2.3 共通约定（所有表单组件遵守）

### v-model 约定

- 所有表单组件的 `v-model` 绑定到 `modelValue` prop，通过 `update:modelValue` 事件回传
- 组件内部不直接修改 `modelValue`，必须通过 emit 更新
- 受控组件：值的唯一来源是 props

### 禁用与只读

- `disabled`：禁用交互，值不可变，视觉灰化
- `readonly`：只读，值不可变但可聚焦（仅输入类组件）

### 无障碍

- 所有表单控件必须有可访问名（通过 `label` prop 或 slot 关联 `aria-label` / `aria-labelledby`）
- 禁用态添加 `aria-disabled="true"`
- 键盘可操作（Tab 聚焦、Enter/Space 触发）

### Emits 命名

- 值变化：`update:modelValue`
- 其他事件：`blur` / `focus` / `change` / `clear` 等

---

## 2.4 阶段工作流

同阶段 1：读 spec → 写测试（红）→ 写实现（绿）→ 重构。

每完成一个组件后跑全部测试确认无回归。

---

## 2.5 完成阶段 2 后

- 所有表单组件 spec 行为 100% 覆盖
- Form 能完成基本校验与提交流程
- 进入阶段 3（数据展示类）
