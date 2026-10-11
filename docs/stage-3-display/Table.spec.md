# Table 组件规格

## 元数据

| 字段 | 值 |
|---|---|
| 组件名 | `VcTable` |
| 分类 | 数据展示 |
| 所属阶段 | Stage-3 |
| 依赖组件 | 无（空状态可复用 Empty 组件，但本阶段允许 Table 内部自带空状态） |
| 文件位置 | `src/components/table/Table.vue` |
| 测试文件 | `src/components/table/Table.test.ts` |

---

## 设计意图

提供数据表格组件，以列配置驱动渲染，支持斑马纹、边框、排序、行点击、空状态。核心是把"数据 + 列定义"渲染为语义化的 HTML `<table>`。

**不解决**：虚拟滚动（大数据量优化）、单元格编辑（留给可编辑表格组件）、固定列/固定表头（复杂的布局计算）、列拖拽调整宽度、树形数据、分页（分页是独立组件）。本阶段只做"看得见的基本表格"。

---

## API 规格

### Props

| 名称 | 类型 | 默认值 | 必填 | 行为说明 |
|---|---|---|---|---|
| `data` | `Record<string, unknown>[]` | `[]` | 否 | 表格数据（行数组） |
| `columns` | `TableColumn[]` | - | 否 | 列配置（不传时用 default slot 渲染列） |
| `stripe` | `boolean` | `false` | 否 | 斑马纹 |
| `border` | `boolean` | `false` | 否 | 纵向边框 |
| `rowKey` | `string` | - | 否 | 行数据唯一标识字段名（用于 v-for key） |
| `emptyText` | `string` | `'暂无数据'` | 否 | 空数据提示文本 |

### TableColumn 类型

```ts
interface TableColumn {
    key: string;              // 列唯一标识
    prop?: string;            // 数据字段名（取值用）
    label?: string;           | 列标题
    width?: string | number;  // 列宽
    align?: 'left' | 'center' | 'right'; // 对齐
    sortable?: boolean;       // 是否可排序（前端排序）
}
```

### Emits

| 事件名 | 载荷类型 | 触发时机 |
|---|---|---|
| `row-click` | `row: Record<string, unknown>, index: number` | 点击行时 |
| `sort-change` | `{ prop: string, order: 'asc' \| 'desc' \| null }` | 排序状态变化时 |

### Slots

| 名称 | 说明 |
|---|---|
| `default` | 自定义列（替代 columns prop，本阶段先支持 columns prop，slot 列配置留后续） |
| `empty` | 自定义空状态内容 |
| `header` | 自定义表头单元格（作用域插槽，暂列占位，本阶段先不实现） |

### Expose

| 名称 | 签名 | 说明 |
|---|---|---|
| `clearSort` | `() => void` | 清除排序状态 |

---

## 行为约束

### 渲染与 DOM

- **B-01** 根元素为 `<div>`，class 含 `vc-table`，内部渲染原生 `<table>`
- **B-02** `table` 元素 class 含 `vc-table__table`
- **B-03** `thead` 渲染列标题行，每个 `th` class 含 `vc-table__th`
- **B-04** `tbody` 渲染数据行，每个 `tr` class 含 `vc-table__tr`
- **B-05** 每个数据单元格 `td` class 含 `vc-table__td`
- **B-06** `columns` 为空数组时，`thead` 与 `tbody` 仍渲染（空结构）

### 斑马纹与边框

- **B-07** `stripe=true` 时，`table` class 含 `vc-table__table--stripe`
- **B-08** `border=true` 时，`table` class 含 `vc-table__table--border`

### 列渲染

- **B-09** `columns` 配置驱动 `thead` 与 `tbody` 的列结构
- **B-10** 列 `label` 有值时，渲染为 `th` 文本
- **B-11** 列 `prop` 有值时，对应 `td` 渲染该字段的值
- **B-12** 列 `width` 有值时，对应 `th` 的 `style.width` 为该值（数字加 px）
- **B-13** 列 `align` 有值时，对应 `th` 与 `td` 的 `style.textAlign` 为该值

### 数据渲染

- **B-14** `data` 的每一项渲染为一行（`tr`）
- **B-15** `rowKey` 有值时，`tr` 的 v-for key 使用 `row[rowKey]`；无值时用索引
- **B-16** `data` 为空数组时，渲染空状态行：`tbody` 内一个占位 `tr`，`td` 占满所有列数，显示 `emptyText`

### 排序

- **B-17** 列 `sortable=true` 时，对应 `th` class 含 `vc-table__th--sortable`
- **B-18** 点击可排序列标题时，排序状态在 `null -> 'asc' -> 'desc' -> null` 之间循环切换
- **B-19** 当前排序列的 `th` class 含 `vc-table__th--{order}`（如 `vc-table__th--asc`）
- **B-20** 排序状态变化时，触发 `sort-change` 事件（载荷含 prop 与 order）
- **B-21** `sortable=true` 时，前端对 `data` 按 `prop` 字段值执行升序/降序排序（仅基本类型比较）

### 行点击

- **B-22** 点击数据行时，触发 `row-click` 事件（载荷为 row 对象与索引）

### 空状态

- **B-23** `data` 为空且提供 `empty` slot 时，空状态行渲染 slot 内容（覆盖 emptyText）
- **B-24** 空状态行的 `td` 的 `colspan` 等于列数

---

## 边界条件与异常

- **E-01** `columns` 为 undefined（不传）：视为空列，不渲染表头单元格与数据单元格（但渲染 table 结构）
- **E-02** 列 `prop` 引用了 `data` 中不存在的字段：对应 `td` 渲染空字符串
- **E-03** `data` 中某行缺少某些字段：缺失字段渲染为空字符串
- **E-04** `rowKey` 引用了不存在的字段：回退到索引作为 key（打印 console.warn）
- **E-05** `sortable=true` 但 `prop` 无值：排序按钮可点击但排序不生效（不报错）
- **E-06** 排序字段值为 `undefined` / `null`：排序时排在最后（升序）或最前（降序）
- **E-07** 同一列连续点击切换排序：每次触发 `sort-change`，即使回到 `null`

---

## 可访问性（a11y）

- **A-01** 使用语义化 `<table>` / `<thead>` / `<tbody>` / `<tr>` / `<th>` / `<td>`
- **A-02** `th` 设置 `scope="col"`，标记列标题
- **A-03** 可排序的 `th` 设置 `aria-sort`：`ascending` / `descending` / `none`
- **A-04** 空状态行的 `td` 有可读文本，屏幕阅读器可播报

---

## 测试用例清单

| 编号 | 关联行为 | Given | When | Then | 优先级 |
|---|---|---|---|---|---|
| T-01 | B-01 | mount | 取根元素 | tagName `DIV`，class 含 `vc-table`，内部有 `<table>` | P0 |
| T-02 | B-03 | `{ columns, data }` | 查找 th | 存在 `vc-table__th`，数量与列数一致 | P0 |
| T-03 | B-04 | `{ columns, data }` | 查找 tr | 存在 `vc-table__tr`，数量与数据行数一致 | P0 |
| T-04 | B-05 | `{ columns, data }` | 查找 td | 存在 `vc-table__td` | P0 |
| T-05 | B-07 | `{ stripe: true }` | 取 table class | 含 `vc-table__table--stripe` | P0 |
| T-06 | B-08 | `{ border: true }` | 取 table class | 含 `vc-table__table--border` | P0 |
| T-07 | B-09 | `{ columns, data }` | 取 th 文本 | 与各列 label 一致 | P0 |
| T-08 | B-10 | `{ columns: [{ key: 'n', label: '名称' }] }` | 取 th 文本 | 含 `'名称'` | P0 |
| T-09 | B-11 | `{ columns: [{ key: 'n', prop: 'name' }], data: [{ name: '张三' }] }` | 取 td 文本 | 含 `'张三'` | P0 |
| T-10 | B-12 | `{ columns: [{ key: 'n', width: 100 }] }` | 取 th style | width 为 `'100px'` | P1 |
| T-11 | B-13 | `{ columns: [{ key: 'n', align: 'center' }] }` | 取 th/td style | textAlign 为 `'center'` | P1 |
| T-12 | B-14 | `{ data: [{ a: 1 }, { a: 2 }] }` | 取 tr 数量 | 为 2 | P0 |
| T-13 | B-15 | `{ rowKey: 'id', data: [{ id: 1 }, { id: 2 }] }` | 取 tr key | 使用 `id` 值 | P1 |
| T-14 | B-16 | `{ columns, data: [] }` | 查找空状态 | 存在空状态行，含 `emptyText` 文本 | P0 |
| T-15 | B-17 | `{ columns: [{ key: 'n', sortable: true }] }` | 取 th class | 含 `vc-table__th--sortable` | P0 |
| T-16 | B-18 | `{ columns: [{ key: 'n', prop: 'name', sortable: true }] }`，点击 th | 取 th class/emitted | 第一次 asc，第二次 desc，第三次 null；每次有 `sort-change` | P0 |
| T-17 | B-19 | 排序状态为 asc | 取 th class | 含 `vc-table__th--asc` | P1 |
| T-18 | B-20 | 点击可排序 th | 取 emitted | 有 `sort-change`，载荷含 prop 与 order | P0 |
| T-19 | B-21 | `{ columns: [{ key: 'n', prop: 'age', sortable: true }], data: [{ age: 3 }, { age: 1 }] }`，排序 asc | 取 td 文本顺序 | 第一行 age 为 1 | P0 |
| T-20 | B-22 | `{ columns, data }`，点击某行 | 取 emitted | 有 `row-click`，载荷含 row 与 index | P0 |
| T-21 | B-23 | `{ columns, data: [] }`，slots `{ empty: '<span>无</span>' }` | 取空状态内容 | 含 `'无'` | P1 |
| T-22 | B-24 | `{ columns: 3列, data: [] }` | 取空状态 td colspan | 为 `'3'` | P1 |
| T-23 | E-02 | `{ columns: [{ key: 'n', prop: 'x' }], data: [{ a: 1 }] }` | 取 td 文本 | 为空 | P1 |
| T-24 | E-05 | `{ columns: [{ key: 'n', sortable: true }] }`，点击 th | 取 emitted | 有 `sort-change`，prop 为 undefined | P2 |
| T-25 | E-06 | `{ columns: [{ key: 'n', prop: 'age', sortable: true }], data: [{ age: 1 }, { age: null }] }`，排序 asc | 取顺序 | null 值排最后 | P2 |
| T-26 | A-02 | `{ columns, data }` | 取 th scope | 为 `'col'` | P1 |
| T-27 | A-03 | `{ columns: [{ key: 'n', sortable: true }] }`，无排序 | 取 th aria-sort | 为 `'none'` | P1 |
| T-28 | A-03 | 排序 asc | 取 th aria-sort | 为 `'ascending'` | P1 |
| T-29 | clearSort | 排序后调用 expose.clearSort | 取排序状态 | 回到 null | P2 |

---

## 实现提示

### 1. 结构

```html
<div class="vc-table">
    <table class="vc-table__table" :class="tableClass">
        <thead>
            <tr>
                <th
                    v-for="col in columns"
                    :key="col.key"
                    class="vc-table__th"
                    :class="thClass(col)"
                    :style="thStyle(col)"
                    scope="col"
                    :aria-sort="ariaSort(col)"
                    @click="onSortClick(col)"
                >
                    {{ col.label }}
                </th>
            </tr>
        </thead>
        <tbody>
            <tr
                v-for="(row, index) in displayData"
                :key="getRowKey(row, index)"
                class="vc-table__tr"
                @click="onRowClick(row, index)"
            >
                <td
                    v-for="col in columns"
                    :key="col.key"
                    class="vc-table__td"
                    :style="tdStyle(col)"
                >
                    {{ getCellValue(row, col) }}
                </td>
            </tr>
            <tr v-if="displayData.length === 0" class="vc-table__tr vc-table__tr--empty">
                <td class="vc-table__td vc-table__td--empty" :colspan="columns.length">
                    <slot name="empty">{{ emptyText }}</slot>
                </td>
            </tr>
        </tbody>
    </table>
</div>
```

### 2. 关键提示

- `displayData` 计算属性：无排序时返回原 `data`；有排序时按当前排序列与方向执行前端排序
- 排序比较函数：基本类型用 `>` / `<`；`null` / `undefined` 排在最后（升序）或最前（降序）
- `sortState` 内部 ref：`{ prop: string | null, order: 'asc' | 'desc' | null }`
- 点击排序 th：`null -> 'asc' -> 'desc' -> null` 循环
- 排序变化时触发 `sort-change` 事件，载荷为 `{ prop, order }`
- `getRowKey`：`rowKey` 有值且 row 有该字段时用 `row[rowKey]`，否则用 index
- `getCellValue`：`col.prop` 有值且 row 有该字段时返回 `row[col.prop]`，否则返回空字符串
- 列宽 `width` 为数字时转 `${width}px`，为字符串时直接使用
- 空状态行的 `colspan` 用 `columns.length`

### 3. 重构方向

- 列配置解析逻辑可抽 `useColumns` composable
- 排序逻辑可抽 `useSort` composable，支持后续 `sortable='custom'` 时只触发事件不前端排序
- 后续若支持 default slot 列配置，参考 Form 的 provide/inject 模式让子组件 TableColumn 注册到 Table
- 大数据量场景预留虚拟滚动接入点（本阶段不实现）
