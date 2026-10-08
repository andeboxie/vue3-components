---
name: sdd-component-test
description: Generate Vitest cases from a Vue component SDD spec table, then map red tests to B/A/E behavior IDs. Use for 书写测试用例/按 spec 测试/重新检查/检查代码 on spec-backed components only.
---

# SDD 组件测试驱动检查

按组件 spec 的"测试用例清单"编写 Vitest，先跑红，再把每条红测归因到 spec 行为编号，输出实现缺口报告；用户修复后重跑直到单文件全绿，最后全量回归 + 类型检查。

## 适用 / 不适用

- 适用：`docs/stage-*/` 下存在 `Xxx.spec.md` 的组件，且测试文件为空或需要按 spec 补齐。
- 不适用：没有 spec 的组件（先让用户补 spec）、纯样式改动、用户只问实现思路不要测试。
- 遵守用户硬规则：不写测试之外的功能代码、不用 mock/fallback 造数据、代码与注释无 emoji、注释中文且 UTF-8、用户没要求时不创建 README/说明文档。

## 文件定位

1. spec：`docs/stage-{n}-{name}/Xxx.spec.md`（含 API 规格、行为约束 B-NN、边界 E-NN、可访问性 A-NN、测试用例表 T-NN）。
2. 组件目录：`src/components/{kebab-name}/`，包含 `Xxx.vue`、`XxxProps.ts`、`XxxGroup*.ts`、`Xxx.test.ts`。
3. 关联依赖必读：`src/composables/Use*.ts`（确认复用的 handler 取的是什么 DOM 属性）、`src/emits/XxxEmits.ts`、`src/keys/`、`src/utils/`。

## 标准流程

1. **读全上下文再动笔**：spec 全文 + 组件 vue/props/emits + 被复用的 composable 与工具函数。spec 表的 Given/When/Then 是测试断言的唯一依据。
2. **写测试，不改实现**：按测试用例表逐条生成 `Xxx.test.ts`，一条 T 编号对应一个 `it`，先红后绿（TDD）。
3. **跑红并归因**：运行单文件测试，每条红测映射回它关联的 B/A/E 编号；同根因的红测合并描述。
4. **输出检查报告**：按"类型契约 / 事件流 / DOM 结构与 class / a11y / 边界"分类，给出具体文件行号和最小修法，不直接替用户改实现（用户偏好手工编码）。
5. **用户修复后重跑前先 Read**：以磁盘上最新的组件文件为锚点确认改动落地，不要凭上一轮记忆断言。先跑单文件，全绿后再跑全量。
6. **收口验证**：单文件 100% 通过后，依次跑全量测试与类型检查；全量有回归时优先排查新测试与公共 composable 的耦合。

## 测试编写规范

- 顶部按 spec 顺序组织 `describe('VcXxx', ...)`，每个 it 标题格式 `T-NN: 中文行为描述`，断言前用注释标注关联编号（如 `// B-06`）。
- 挂载：`mount(VcXxx, { props: {...} })`；Group/Slot 场景用 `h()` 渲染子组件（`slots: { default: () => [h(VcChild, {...})] }`）。
- 布尔交互：input 用 `await wrapper.find('input[type="..."]').setValue(true)`；button 用 `await wrapper.find('button').trigger('click')`。
- 事件断言取**持有 v-model 的那一层**（Group 模式子项不 emit，断言 Group 的 `wrapper.emitted('update:modelValue')`）。
- DOM 状态取 property 而非 attribute：`(el as HTMLInputElement).checked`；aria 取 attribute：`wrapper.attributes('aria-checked')`。
- 测试要防"实现取巧"：互斥/条件渲染类 prop 必须同时传入两个值再分别断言（例如 activeText 与 inactiveText 同传，验证每个状态只显示一个），只传一个值会放过"两个都渲染"的 bug。
- 不写 spec 表之外的用例，除非实现里发现了 spec 未覆盖的真实缺口——先在报告里说明，再补编号续号的测试。

## 红测归因模板

报告每条红测时固定四要素：**T 编号 + 关联 B/A/E 编号 + 根因（含文件行号链接）+ 最小修法**。多个 T 命中同一根因时合并，例如"事件未分流"可同时解释 T-05/T-07。分类顺序：类型契约错误 > 事件流错误 > 条件渲染/class 错误 > 纯缺失节点。

## 验证命令（Windows PowerShell）

- 单文件：`pnpm test -- src/components/xxx/Xxx.test.ts`
- 全量：`pnpm test`
- 类型：`pnpm type-check`（即 `vue-tsc -b`；不要用 `vue-tsc --noEmit`，根 tsconfig 是 solution-style 会空检查）
- PowerShell 精简输出：在命令后接 `2>&1 | Select-String -Pattern "Test Files|Tests |✓|×|FAIL|AssertionError" | Out-String`。pnpm 的 NativeCommandError 红字是 stderr 包装，Exit code 1 且有 FAIL 才是真失败。

## 高频陷阱

本仓库组件已反复踩过的坑（Group v-model 同步、jsdom 限制、composable target 错配、inject warn、空字符串判定、class 串台等）见 [references/pitfalls.md](./references/pitfalls.md)，写测试或归因前先对照一遍。
