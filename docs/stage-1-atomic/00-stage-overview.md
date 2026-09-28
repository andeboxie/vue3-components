# 第 1 阶段总览：基础原子组件

> 本阶段是组件库的"地基"。先做最简单、最稳定的原子组件，建立你对 SDD+TDD 节奏的手感。

---

## 1.1 阶段目标

- 把 [总指南](../00-overview.md) 里的 SDD+TDD 流程**完整走通一遍**：读 spec → 写测试（红）→ 写实现（绿）→ 重构
- 建立 3 个最常用组件：**Button / Icon / Typography**
- 熟练掌握 Vue3 组件的 Props / Emits / Slots / class 绑定
- 熟练掌握 `@vue/test-utils` 的 `mount` / `props` / `classes` / `find` / `emitted`
- 形成可复用的组件文件骨架与测试骨架，后续阶段照搬

---

## 1.2 组件清单与推荐完成顺序

| 序号 | 组件 | spec 文件 | 难度 | 学到的能力 |
|---|---|---|---|---|
| 1 | Button | [Button.spec.md](./Button.spec.md) | 易 | Props / Emits / Slots / disabled / class 绑定 |
| 2 | Icon | [Icon.spec.md](./Icon.spec.md) | 易 | SVG 方案选型 / 尺寸与颜色 / a11y |
| 3 | Typography | [Typography.spec.md](./Typography.spec.md) | 中 | 语义化 HTML / 多组件聚合 / props 默认值合并 |

**强烈建议按顺序做**：Button 最简单，能让你完整跑通一次 Red-Green-Refactor；Icon 引入图标方案选型；Typography 让你练习"一个 spec 对应多个子组件"的组织方式。

---

## 1.3 阶段工作流（每个组件都走一遍）

1. 通读该组件的 spec 文件，确认所有 API、行为约束、边界条件
2. 在 `src/components/<name>/` 下建好空文件：`Xxx.vue` 与 `Xxx.test.ts`
3. 按 spec 中的"测试用例清单"，**逐条**把测试写进 `Xxx.test.ts`（先全部红）
4. 写**最小**实现让测试通过（不写多余功能）
5. 全绿后做一次重构：命名、结构、抽取重复代码
6. 跑 `pnpm test` 确认仍然全绿
7. 自检：有没有 spec 之外的"顺手实现"功能？有的话删掉，或回补 spec
8. 进入下一个组件

---

## 1.4 完成阶段 1 后找我的事

完成 3 个组件后告诉我，我会：

- 对照 spec 检查你的实现是否每条行为都覆盖
- 检查测试是否真的"先红后绿"（看 git 提交历史）
- 指出过度工程、命名、a11y、TS 类型签名的问题
- 给出阶段 2（表单类）的 spec 文档
