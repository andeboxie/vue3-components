# Vue3 组件库 SDD+TDD 总指南

> 本文件是组件库开发的方法论与约定总纲。所有阶段的 spec 文档都遵循这里的规则。
> 你手工编码，文档负责定义"做什么"和"怎么验收"；不负责"代码怎么写"。

---

## 一、什么是 SDD 与 TDD，以及二者如何协作

### 1.1 SDD（Specification-Driven Development，规格驱动开发）

在动手写组件前，先用一份**规格文档（spec）**把组件的边界定义清楚：

- 它解决什么问题（设计意图）
- 它暴露什么 API（Props / Emits / Slots / Expose）
- 它在什么输入下应产生什么行为（行为约束）
- 哪些边界条件必须处理（异常与退化）
- 无障碍（a11y）要求是什么

规格是**契约**，一旦定下来，实现就必须遵守，发现规格缺陷时回改规格再改实现，而不是反过来。

### 1.2 TDD（Test-Driven Development，测试驱动开发）

TDD 的核心节奏是 **Red-Green-Refactor**：

1. **Red**：先写一个失败的测试（描述期望行为，但实现还没写或还没满足）
2. **Green**：写**刚好**让测试通过的实现（不要多写）
3. **Refactor**：在测试保护下重构，保持绿色

### 1.3 SDD + TDD 的协作流程

```
spec 写完（SDD 产物）
     |
     v
从 spec 中挑一条"行为约束" -> 翻译成一个测试用例（Red）
     |
     v
写最小实现让测试通过（Green）
     |
     v
所有行为约束都覆盖后 -> 重构、清理（Refactor）
     |
     v
spec 中所有"可测断言"都通过 -> 组件交付
```

**关键纪律**：
- 每条行为约束至少对应一个测试用例
- 没有规格，不写测试；没有测试，不写实现
- 实现里出现的、spec 未定义的行为，要么补进 spec，要么删掉

---

## 二、文档结构约定

```
docs/
├── 00-overview.md                    # 本文件：总指南
├── 01-stage-0-setup.md               # 第 0 阶段：环境搭建
├── stage-1-atomic/                   # 第 1 阶段：基础原子组件
│   ├── 00-stage-overview.md          # 阶段总览
│   ├── Button.spec.md                # 单组件规格
│   ├── Icon.spec.md
│   └── Typography.spec.md
├── stage-2-form/                     # 第 2 阶段：表单类（spec 已交付）
├── stage-3-display/                 # 第 3 阶段：数据展示类
└── stage-4-layout-feedback/         # 第 4 阶段：布局与反馈类
```

每个 `.spec.md` 都遵循统一模板（见 [第三节](#三单组件-spec-模板)）。

---

## 三、单组件 spec 模板

每个组件的 spec 文档必须包含以下章节，缺一不可：

### 3.1 元数据

| 字段 | 值 |
|---|---|
| 组件名 | XxxButton |
| 分类 | 基础原子 / 表单 / 数据展示 / 布局与反馈 |
| 所属阶段 | Stage-N |
| 依赖组件 | 列出本组件依赖的内部组件（无则写"无"）|

### 3.2 设计意图

2-4 句话说明：这个组件为什么存在？它解决什么问题？不解决什么问题？

### 3.3 API 规格

四张表：**Props / Emits / Slots / Expose**。每条 API 必须写：

- 名称
- 类型（TS 类型签名）
- 默认值（仅 Props）
- 是否必填
- 行为说明（一句话能说清，不要模糊）

### 3.4 行为约束

按编号列出**可观察的行为**。每条要满足：

- 单一职责（一条行为只描述一件事）
- 可观察（能用断言验证，而不是"代码内部状态"）
- 可翻译成测试（Given-When-Then）

示例格式：

```
B-01 当 type="primary" 时，根元素 class 必含 "vc-button--primary"
```

### 3.5 边界条件与异常

列出**反例**：什么输入下应当退化、报错、保持默认。这些是 TDD 最容易漏掉的，单独成节强调。

### 3.6 可访问性（a11y）

- 语义化 HTML（用 `<button>` 而不是 `<div role="button">`）
- 键盘可达（Tab / Enter / Space）
- ARIA 属性（必要时）
- 焦点管理（disabled 时不应可聚焦）

### 3.7 测试用例清单

一张表，每行一个测试用例，与 3.4 的行为约束一一对应（可多对一）：

| 编号 | 关联行为 | Given | When | Then | 优先级 |
|---|---|---|---|---|---|
| T-01 | B-01 | 组件挂载，type="primary" | 渲染根元素 | class 含 `vc-button--primary` | P0 |

### 3.8 实现提示

**不给完整代码**，只给关键提示（容易踩坑的点、Vue3 特性提醒、重构方向）。

---

## 四、命名与目录约定

### 4.1 组件目录结构

```
src/
├── components/
│   └── button/
│       ├── Button.vue          # 组件本体
│       ├── Button.test.ts      # 组件测试
│       ├── button.ts           # 导出 + install（可选）
│       └── types.ts           # TS 类型集中定义（可选）
├── composables/                # 可复用逻辑（useXxx）
├── utils/                      # 工具函数
├── styles/                     # 全局样式 / 变量
└── index.ts                   # 库入口
```

### 4.2 命名规则

- 组件文件：`PascalCase.vue`（如 `Button.vue`）
- 测试文件：与组件同名 + `.test.ts`（如 `Button.test.ts`）
- 组件名前缀统一用 `Vc`（vue3-components），导出时用 `VcButton`，DOM class 用 `vc-button`
- Props 用 `camelCase`，模板里用 `kebab-case`
- Emits 用 `kebab-case`（如 `click`、`update:modelValue`）

### 4.3 `<script>` 块约定

组件统一使用 `<script setup lang="ts">`，不要用普通 `<script lang="ts">` 块来调用编译器宏。

**硬性约束（阶段 1 踩坑沉淀）**：

- 凡是使用 `defineProps` / `defineEmits` / `withDefaults` / `defineOptions` / `defineSlots` / `defineModel` 等 `<script setup>` 编译器宏，或希望在模板里直接访问顶层变量，**必须**用 `<script setup lang="ts">`。
- 若误用普通 `<script lang="ts">` 块调用上述宏，会报"类型上不存在属性 'xxx'"（宏不会被编译器展开，顶层变量也不会暴露给模板）。
- 仅当确实需要"普通 `<script>` + `<script setup>` 并存"的特殊场景（如运行时 options 配合 setup），才允许二者并存；此时编译器宏仍只能写在 `<script setup>` 内。

### 4.4 测试文件位置

测试文件与组件文件**同目录、同名**，便于查找。

---

## 五、测试策略

### 5.1 测试金字塔（适用于组件库）

```
        /\
       /e2e\          <- 很少，仅做关键路径冒烟
      /------\
     /集成测试\       <- 组件 + 子组件 + 真实 DOM
    /----------\
   /  单元测试  \     <- 主体，每个 props/emit/slot/边界
  /--------------\
```

组件库阶段我们只做**单元测试 + 轻量集成测试**，由 `@vue/test-utils` + `vitest` 完成。

### 5.2 测试什么

- Props 传递与默认值
- Emits 触发与载荷
- Slots 渲染（默认 + 具名 + 作用域）
- 条件渲染（v-if / v-show）
- class/style/style 绑定
- 事件绑定（click / keydown / ...）
- v-model 行为（如有）
- 边界条件（异常输入、空值）
- a11y（焦点、ARIA、键盘）

### 5.3 不测什么

- Vue 框架自身的响应式机制
- 第三方库的内部行为
- CSS 视觉效果（除非用 visual regression，本阶段不做）
- 实现细节（私有方法、内部变量名）

### 5.4 测试组织

每个测试文件用 `describe(组件名)` 包裹，内部按"Props / Emits / Slots / 行为 / 边界 / a11y"分组：

```ts
describe('VcButton', () => {
  describe('Props', () => { /* ... */ })
  describe('Emits', () => { /* ... */ })
  describe('Slots', () => { /* ... */ })
  describe('边界条件', () => { /* ... */ })
  describe('a11y', () => { /* ... */ })
})
```

### 5.5 AAA 模式

每个测试用例按 **Arrange-Act-Assert** 组织：

```ts
it('T-01: type=primary 时根元素含 vc-button--primary', () => {
  // Arrange
  const wrapper = mount(VcButton, { props: { type: 'primary' } })
  // Act + Assert
  expect(wrapper.classes()).toContain('vc-button--primary')
})
```

---

## 六、工作流约定（你要遵守的纪律）

1. **拿到 spec 后先通读**，有疑问立刻提出，不要"猜"
2. **先写测试再写实现**（至少在一个组件内坚持）
3. **每条行为约束至少一个测试**，覆盖后才允许重构
4. **实现时发现 spec 没说的情况**：先回改 spec，再写测试，再改实现
5. **不要在组件里加 spec 没要求的功能**（避免过度工程）
6. **完成一个阶段后找我做 review**，我会按 spec 对照实现与测试

---

## 七、阶段规划

| 阶段 | 主题 | 组件（建议） | 状态 |
|---|---|---|---|
| 0 | 环境搭建 | - | 已完成 |
| 1 | 基础原子 | Button / Icon / Typography | 已完成（51/51 测试通过） |
| 2 | 表单类 | Input / Textarea / Checkbox / Radio / Switch / Select / Form | spec 已交付，待实现 |
| 3 | 数据展示 | Tag / Badge / Avatar / Card / Empty / Table / Tooltip | 待生成 |
| 4 | 布局与反馈 | Layout / Container / Grid / Dialog / Drawer / Message / Toast / Loading | 待生成 |

完成阶段 2 后告诉我，我会：
1. 按你的实现 + 测试做 review，给出点评
2. 生成阶段 3 的 spec 文档

