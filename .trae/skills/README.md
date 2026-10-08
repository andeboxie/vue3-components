# 项目 Skill 目录（供 LLM 查阅）

本文件是 `.trae/skills/` 下**项目级 skill 的索引**。LLM 在处理组件开发任务时，先查本目录判断当前情景该调用哪个 skill，再通过 Skill 工具按 `name` 加载。

全局/内置 skill（如 skill-creator、code review 类）不在本目录，以运行时的 available_skills 列表为准。

---

## 快速选择：按情景对号入座

| 当前情景 / 用户说法 | 调用 skill | 前置条件 |
|---|---|---|
| 组件有 spec，要"书写测试用例""按 spec 测试""补测试" | `sdd-component-test` | 存在 `docs/stage-*/Xxx.spec.md` |
| 测试红了，要"重新检查""检查代码""跑测试看看" | `sdd-component-test` | 同上 |
| 测试全绿后，要"写 README""归档""README 归档" | `sdd-component-readme` | 单文件测试 100% 通过 + 全量无回归 + type-check 干净 |
| 没有 spec 的组件 | 都不适用 | 先让用户补 spec |
| 纯样式微调 / 只要实现思路不要测试 | 都不适用 | 直接处理 |
| 创建或修改 skill 本身 | 全局 `skill-creator` | —— |

---

## Skill 1：sdd-component-test

| 项 | 内容 |
|---|---|
| name | `sdd-component-test` |
| 入口 | [sdd-component-test/SKILL.md](./sdd-component-test/SKILL.md) |
| 参考资料 | [references/pitfalls.md](./sdd-component-test/references/pitfalls.md)（12 条本仓库实战坑点） |
| 触发词 | 书写测试用例 / 按 spec 测试 / 重新检查 / 检查代码 |

**做什么**：按组件 spec 的"测试用例清单"（T-NN 表）生成 Vitest，先跑红，把每条红测归因到 B-/A-/E- 行为编号，输出带行号和最小修法的检查报告；用户修复后重跑直到全绿，再跑全量回归与类型检查收口。

**不做什么**：不替用户改实现（用户偏好手工编码）；不写 spec 表之外的用例（发现缺口先报告）；不处理无 spec 的组件。

**输入**：`docs/stage-*/Xxx.spec.md` + `src/components/{name}/` 下的 vue/props/emits + 被复用的 composable。

**产出**：`Xxx.test.ts`（N 条 T 用例）、红测归因报告、三连验证结果（单文件 / `pnpm test` / `pnpm type-check`）。

---

## Skill 2：sdd-component-readme

| 项 | 内容 |
|---|---|
| name | `sdd-component-readme` |
| 入口 | [sdd-component-readme/SKILL.md](./sdd-component-readme/SKILL.md) |
| 参考资料 | [references/examples.md](./sdd-component-readme/references/examples.md)（4 个场景示例：正常归档 / 红测拒绝 / spec 偏差标注 / Group 组件） |
| 触发词 | 写 README / 归档 / README 归档 |

**做什么**：测试全绿后，为组件生成目录内 10 节 SDD README（元数据、设计意图、API、B 行为、边界、a11y、T 测试清单、实现提示、自查、变更记录）。第 5.1/7.1/8.3/10 节必须从红→绿修复过程提炼，禁止照抄 spec。

**硬性闸门**：测试不全绿时**拒绝归档**，回到 sdd-component-test；spec 与实现不一致时三处透明标注，不掩盖也不擅自删功能。

**输入**：spec + 最终实现 + 测试文件与本轮修复记录。

**产出**：`src/components/{name}/README.md`，回报测试统计与 spec 外偏差清单。

---

## 标准协作链（SDD 闭环）

```
组件实现完成
      │
      ▼
sdd-component-test   写测试 → 跑红 → 归因报告 → 用户手工修复 → 重跑至全绿
      │
      ▼ （闸门：单文件 100% + 全量无回归 + type-check 干净）
sdd-component-readme  生成 10 节 README → 校验 T 数=it 数、自查全勾 → 归档完成
```

两个 skill 不互相调用，由 LLM 按前置条件顺序衔接；归档中发现 spec 缺口时先报告用户，再决定是否回到测试流程补编号续号用例，不静默补测。

---

## 调用方式

通过 Skill 工具加载，参数为 skill 的 `name`：

- 测试与检查：`sdd-component-test`
- 归档：`sdd-component-readme`

加载后以其 SKILL.md 正文为执行规程，references 仅在正文指向或遇到对应场景时按需读取。

---

## 维护规则

- 新建项目级 skill 时：放 `.trae/skills/<kebab-case-name>/SKILL.md`，并在本文件"快速选择"表和详情区各加一条。
- skill 的触发词写在其 frontmatter 的 `description` 中；本文件只做人工/LLM 可读的情景索引，两者保持一致。
- 废弃 skill 时从本文件移除对应行并注明，不直接删目录除非用户确认。
