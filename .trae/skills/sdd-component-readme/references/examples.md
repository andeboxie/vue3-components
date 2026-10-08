# 使用示例（sdd-component-readme）

四个典型场景。示例中的组件（Switch/Radio）均为本仓库真实归档案例。

---

## 场景 1：正常归档（全绿，标准流程）

**触发条件**

用户说："写 README 归档""Switch 归档""把 Radio 的 README 补一下"，且该组件单文件测试已 11/11 全绿、全量与 type-check 干净。

**输入**

- spec：`docs/stage-2-form/Switch.spec.md`
- 实现：`src/components/switch/Switch.vue`、`SwitchProps.ts`
- 测试：`src/components/switch/Switch.test.ts`（11 个 it）+ 本轮红→绿记录（aria-pressed 改 aria-checked、--checked 改 --active、文本加状态条件等）

**执行动作**

1. 读三类输入（spec / 实现 / 测试与修复记录）。
2. 先跑一次三连验证确认前置条件（单文件 → 全量 → type-check），不凭记忆声称全绿。
3. 按 10 节映射表生成 README；第 5.1/7.1/8.3/10 节从修复记录提炼，不照抄 spec。
4. 写完抽查中文编码、核对 T 编号数 = 11 个 it。

**输出**

`src/components/switch/README.md`。回报格式：

```
已归档：src/components/switch/README.md
测试：11/11 全绿；全量 130 通过 / 3 跳过；type-check 无错误
spec 外偏差 1 项：保留 loading 具名插槽（spec 声明 Slots 无），已在 3.3/5.1/9 节标注
```

---

## 场景 2：拒绝归档（测试仍红）

**触发条件**

用户说："先归档吧"，但当前单文件 9 过 / 2 红（如 T-02、T-05 未修）。

**正确响应（不执行归档）**

```
现在不能归档：Switch.test.ts 仍有 2 条红（T-02、T-05）。
归档的前置条件是单文件 100% 通过，否则第 7 节"全绿"和第 9 节自查都无法如实填写。
请先按检查报告修两处：
1. Switch.vue L35：--checked 改为 --active（T-02）
2. Switch.vue L52-53：文本 v-if 补状态条件（T-05）
修完我重跑三连验证，全绿后立即归档。
```

**要点**：不写半个 README、不在文档里写"11 条用例（2 条待修复）"这种半成品状态。

---

## 场景 3：spec 与实现不一致时的归档（透明标注）

**触发条件**

归档 Switch 时发现：spec 第 46 行写"Slots：无"，但 `Switch.vue` 保留了 `<slot name="loading">`，且这是用户有意保留的已工作功能（用户硬规则：之前完成的功能尽量不修改）。

**执行动作**：不删 slot、不隐瞒，三处一致标注。

**三处标注的实际写法**

3.3 Slots：

```markdown
### 3.3 Slots

spec 声明为**无**。实现保留了一个具名插槽 `loading`（位于
`vc-switch__loading` 节点内）用于自定义加载指示，属 spec 之外的实现补充。
```

5.1 实现补充（末条）：

```markdown
- 保留具名 slot `loading`（spec 声明无 slot），class 已按 BEM 命名为
  `vc-switch__loading`（非从 Button 拷来的 `vc-button__loading`）
```

第 9 节自查：

```markdown
- [x] 没有实现 spec 未列出的功能（`loading` 具名 slot 为唯一超出项，已在第 5.1 节注明）
```

**反例（禁止）**：把 slot 从文档删掉假装 spec 一致；或未经用户确认直接改实现删掉 slot。

---

## 场景 4：Group 类组件归档的结构差异（以 Radio 为例）

Checkbox / Radio 这类含 Group 的组件，第 1/3/7 节与单组件不同：

**第 1 节元数据**：组件名并列两个、文件位置列两个：

```markdown
| 组件名 | `VcRadio` / `VcRadioGroup` |
| 文件位置 | `src/components/radio/Radio.vue`、`src/components/radio/RadioGroup.vue` |
```

**第 3 节 API 拆分**：

- 3.1 VcRadioGroup Props（modelValue/disabled/direction）
- 3.2 VcRadioGroup Emits（注明 B-06 双重守卫、子项不 emit）
- 3.3 VcRadio Props（value/label/disabled/size）
- 3.4 Slots（分两行列出 Group default 与 Radio default）

**第 5.1 节必有的 Group 决策**（从本仓库实际案例提炼）：

- `isInGroup` 用 `isNotEmpty(props.value)`（默认空字符串场景）
- Group 模式 `onChange` 只调 `group.toggle()`，不再调子项 `handleChange`（防双重 emit）
- `inject<Context | undefined>(key, undefined)` 消 warn
- provide 字段必须 `toRef`；Radio 的 name 用 `ref(useId())`

**第 7.1 节必记的测试坑**：

- 测 emit 后视觉重渲（如 T-10 互斥）必须加：

```ts
'onUpdate:modelValue': async (val) => {
    await wrapper.setProps({ modelValue: val })
}
```

- jsdom 测不了 label click 联动与方向键互斥，降级为结构/name 属性断言（T-12/T-13）。

---

## 不触发的情况（避免误用）

- 用户说"帮我写 Switch 组件"（还没实现）—— 走实现流程，不归档。
- 用户说"这个 spec 怎么写"—— 是 spec 编写问题，本 skill 只消费 spec。
- 纯改了样式要求更新文档 —— 只做 Update：patch 受影响章节与变更记录，不重写 10 节。
- 用户只要"看看 README 模板"—— 直接展示第 26-39 行的映射表即可，不生成文件。
