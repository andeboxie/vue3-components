---
name: sdd-component-readme
description: Generate the 10-section SDD README for a Vue component after tests pass. Use for 写 README/归档/README 归档 on spec-backed components only, never before tests are green.
---

# SDD 组件归档（README）

为已通过测试的组件生成目录内 `README.md`，把 spec、最终实现、测试过程中的关键决策固化成 10 节 SDD 文档。归档是 sdd-component-test 流程的收口动作。

## 前置条件（不满足不归档）

1. 组件单文件测试 100% 通过（`pnpm test -- src/components/xxx/Xxx.test.ts`）。
2. 全量测试无回归、`pnpm type-check` 无错误。
3. 存在对应 `docs/stage-*/Xxx.spec.md`。

测试仍红时拒绝归档，先回到 sdd-component-test 流程修复。禁止把"待实现/部分通过"写进归档文档。

## 必读输入

归档前读全三类材料，缺一不可：

1. spec 全文 —— 第 1/3/4/6/7 节的事实来源
2. 最终实现（Xxx.vue / Props / Context / Emits）—— 第 5.1/8 节的实现事实来源
3. 测试文件与本轮红→绿修复记录 —— 第 7.1/8.3/10 节的决策来源

## 10 节模板与数据来源

| 节 | 标题 | 数据来源 | 写法 |
|---|---|---|---|
| 1 | 元数据 | spec 元数据表 | 组件名（含 Group 则并列两个）、文件位置、测试文件相对路径 |
| 2 | 设计意图 | spec 设计意图 | 解决什么、明确"不解决"什么；同类组件并列时写"与 Xxx 的核心差异" |
| 3 | API 规格 | spec Props/Emits/Slots 表 | 3.1 Props（含默认值）/ 3.2 Emits（含触发时机）/ 3.3 Slots / 3.4 Expose；Group 组件拆 3.1 Group、3.3 子项 |
| 4 | 行为约束 | spec B-NN | 按 spec 原分组（渲染/选中/禁用/尺寸等）原样列出，编号不重排 |
| 5 | 边界条件与异常 | spec E-NN + 实现事实 | E 条款照抄；另起 5.1"实现补充"只记 spec 之外但已落地的决策；不需要处理的列入 5.2"避免过度工程" |
| 6 | 可访问性 | spec A-NN | 逐条列出；标注 jsdom 测不了、需真机浏览器验证的条款 |
| 7 | 测试用例清单 | spec T 表 + 实际测试 | 表格逐行 T 编号/B 关联/Given/When/Then/优先级，末列状态全绿；另起 7.1 记录测试写法坑点 |
| 8 | 实现提示 | 最终实现 | 8.1 骨架 / 8.2 关键提示 / 8.3 不要做的事；给提示不给完整代码 |
| 9 | 完成自查 | 实现 vs spec 逐条核对 | checkbox 清单，全部勾上才能归档；含"超出 spec 的实现已注明"类条目 |
| 10 | 变更记录 | 本轮修复历史 | 0.0.0 空框架 + 0.1.0 首版；只记关键决策，不记流水 |

## 必须从过程中提炼的内容（不能照抄 spec）

这几节是归档的核心价值，纯搬运 spec 等于没归档：

- **5.1 实现补充**：红→绿过程中确认的非显然决策，例如"Switch 不复用 useCheckEvent，因为 button 无 checked property""inject 显式传 undefined 消除 warn""isNotEmpty 而非 !== undefined"。
- **7.1 测试注意点**：测试写法本身的坑，例如"Group 视觉重渲要加 onUpdate:modelValue + setProps""两个互斥 prop 必须同传断言，否则放过同时渲染的 bug""jsdom 不模拟 label click 联动"。
- **8.3 不要做的事**：把踩过的坑反向写成禁忌（错用 composable、双根结构、class 串台、只靠原生 disabled）。
- **第 10 节变更记录**：每条决策要能回答"为什么这么写"，格式为"X 替代 Y（原因）"；不写"修改了某文件"这类无信息量流水。

## spec 与实现不一致的处理

发现实现超出 spec（如 Switch 保留了 spec 声明为"无"的 loading 插槽）：

1. 不掩盖、不擅自删除（用户规则：之前完成的功能尽量不动）。
2. 在 **3.3 Slots、5.1、第 9 节自查** 三处一致标注"spec 之外的实现补充"。
3. 若偏差属于错误实现而非有意保留，在归档前先回到测试流程修复，不把已知错误归档。

## 格式硬规则

- 文件位置：`src/components/{name}/README.md`；引用 spec 用相对路径（`../../../docs/stage-*/Xxx.spec.md`），引用同目录实现用 `./Xxx.vue`。
- 全文中文、UTF-8 无乱码；写完抽查中文段落确认编码。
- 不使用 emoji；代码标识符、B-/A-/E-/T- 编号保持原文。
- 行为编号与 spec 严格一致，归档时不重新编号。
- 不新增 README 之外的任何文件；除非用户明确要求，不主动更新 stage overview。
- 第 7 节表格"当前 N/N 全绿"必须与实际最近一次测试结果一致。

## 完成后校验

1. 10 节齐全，节编号连续。
2. 第 7 节 T 用例数与测试文件 `it` 数量一致，逐条可对应。
3. 第 4/6 节 B/A 编号覆盖与 spec 无遗漏；无测试覆盖的条款已在第 6/7 节注明原因。
4. 第 9 节自查全部勾选；未勾项必须先回实现/测试流程解决。
5. 向用户回报归档路径、测试统计（N/N）、以及记录在案的 spec 外偏差清单。

## 使用示例

四个典型场景（正常归档 / 测试红时拒绝归档 / spec 偏差透明标注 / Group 组件结构差异）的触发语、输入、动作与回报样例见 [references/examples.md](./references/examples.md)，遇到不确定是否该归档或如何落笔时先对照。

## 与 sdd-component-test 的衔接

sdd-component-test 全绿收口后触发本 skill；若归档中发现 spec 未覆盖的真实缺口，先在归档报告中提出，再由用户决定是否回到测试流程补编号续号的用例，不在归档时静默补测。
