# Empty 组件规格

## 元数据

| 字段 | 值 |
|---|---|
| 组件名 | `VcEmpty` |
| 分类 | 数据展示 |
| 所属阶段 | Stage-3 |
| 依赖组件 | 无 |
| 文件位置 | `src/components/empty/Empty.vue` |
| 测试文件 | `src/components/empty/Empty.test.ts` |

---

## 设计意图

提供空状态占位组件，用于列表、表格、搜索无结果等场景下展示统一风格的空状态提示，支持自定义图片、描述与操作区。

**不解决**：错误状态展示（留给独立的 Result 组件）、加载中状态。

---

## API 规格

### Props

| 名称 | 类型 | 默认值 | 必填 | 行为说明 |
|---|---|---|---|---|
| `description` | `string` | `'暂无数据'` | 否 | 描述文本 |
| `image` | `string` | - | 否 | 自定义图片地址（覆盖默认占位图） |
| `imageSize` | `number` | - | 否 | 图片尺寸（像素，同时控制宽高） |

### Emits

无。

### Slots

| 名称 | 说明 |
|---|---|
| `default` | 底部操作区（按钮等） |
| `description` | 自定义描述内容（覆盖 description prop） |
| `image` | 自定义图片内容（覆盖 image prop） |

### Expose

无。

---

## 行为约束

### 渲染与 DOM

- **B-01** 根元素为 `<div>`，class 含 `vc-empty`
- **B-02** 图片节点 class 含 `vc-empty__image`
- **B-03** 描述节点 class 含 `vc-empty__description`
- **B-04** 底部操作区 class 含 `vc-empty__actions`

### 图片

- **B-05** `image` 有值时，渲染 `<img>` 元素，`src` 为传入值
- **B-06** `image` 无值时，渲染默认占位元素（class `vc-empty__image--default`）
- **B-07** `imageSize` 有值时，图片元素的 `style.width` 与 `style.height` 为 `${imageSize}px`
- **B-08** 提供 `image` slot 时，覆盖 `image` prop 与默认占位

### 描述

- **B-09** `description` 有值时，渲染描述文本
- **B-10** 提供 `description` slot 时，覆盖 `description` prop
- **B-11** `description` 为空字符串时，不渲染描述节点

### 操作区

- **B-12** 提供 `default` slot 时，渲染底部操作区

---

## 边界条件与异常

- **E-01** `description` 为空字符串：不渲染描述节点，但其余部分正常
- **E-02** `image` 为空字符串：视为无自定义图片，使用默认占位
- **E-03** `imageSize` 为 0 或负数：忽略尺寸，使用 CSS 默认尺寸
- **E-04** 所有 slot 与 prop 都无内容：仍渲染图片占位与描述默认文案

---

## 可访问性（a11y）

- **A-01** 根元素 `role="status"`，让屏幕阅读器识别为状态信息
- **A-02** 自定义图片 `<img>` 的 `alt` 为空（装饰性，描述由描述节点承担）
- **A-03** 描述节点为可读文本，屏幕阅读器可播报

---

## 测试用例清单

| 编号 | 关联行为 | Given | When | Then | 优先级 |
|---|---|---|---|---|---|
| T-01 | B-01 | mount | 取根元素 | tagName `DIV`，class 含 `vc-empty` | P0 |
| T-02 | B-02 | mount | 查找图片节点 | 存在 `vc-empty__image` | P0 |
| T-03 | B-03 | mount | 查找描述节点 | 存在 `vc-empty__description` | P0 |
| T-04 | B-04 | slots `{ default: '<button>重试</button>' }` | 查找操作区 | 存在 `vc-empty__actions`，含按钮 | P1 |
| T-05 | B-05 | `{ image: 'empty.png' }` | 查找 img | 存在 `<img>`，src 为 `'empty.png'` | P0 |
| T-06 | B-06 | 无 image | 查找占位 | 存在 `vc-empty__image--default` | P0 |
| T-07 | B-07 | `{ image: 'a.png', imageSize: 80 }` | 取图片 style | width 与 height 均为 `'80px'` | P1 |
| T-08 | B-08 | slots `{ image: '<i>icon</i>' }` | 取图片内容 | 含 `'icon'`，不含 img/默认占位 | P1 |
| T-09 | B-09 | `{ description: '暂无记录' }` | 取描述文本 | 含 `'暂无记录'` | P0 |
| T-10 | B-10 | slots `{ description: '<span>自定义</span>' }` | 取描述内容 | 含 `'自定义'` | P1 |
| T-11 | B-11 | `{ description: '' }` | 查找描述节点 | 不存在 | P1 |
| T-12 | B-09 | 无 description | 取描述文本 | 含 `'暂无数据'` | P0 |
| T-13 | E-02 | `{ image: '' }` | 查找占位 | 存在 `vc-empty__image--default` | P2 |
| T-14 | E-03 | `{ image: 'a.png', imageSize: 0 }` | 取图片 style | 无数字尺寸 style | P2 |
| T-15 | E-04 | 无 slot 无 prop（仅默认） | 取结构 | 存在图片占位与描述默认文案 | P1 |
| T-16 | A-01 | mount | 取根元素 role | 为 `'status'` | P1 |
| T-17 | A-02 | `{ image: 'a.png' }` | 取 img alt | 为 `''` | P2 |

---

## 实现提示

### 1. 结构

```html
<div class="vc-empty" role="status">
    <div class="vc-empty__image" :class="{ 'vc-empty__image--default': !hasCustomImage }" :style="imageStyle">
        <slot name="image">
            <img v-if="image" :src="image" alt="" class="vc-empty__img" />
            <!-- 无 image 时渲染默认占位（SVG 或 CSS 图形） -->
        </slot>
    </div>
    <div v-if="hasDescription" class="vc-empty__description">
        <slot name="description">{{ description }}</slot>
    </div>
    <div v-if="$slots.default" class="vc-empty__actions">
        <slot></slot>
    </div>
</div>
```

### 2. 关键提示

- `hasCustomImage` = `image !== undefined && image !== null && image !== ''`
- `hasDescription` = slot 存在 或 description 非空字符串
- `imageSize` 为数字且 `> 0` 时设 style，否则用 CSS 默认
- image slot 优先级最高，覆盖 image prop 与默认占位
- description slot 优先级高于 description prop
- 默认占位图可以用内联 SVG（不依赖外部资源），或 CSS 绘制简单图形

### 3. 重构方向

- 默认占位 SVG 可抽到独立文件，便于主题切换
- 后续 Table 组件的空数据状态可复用 Empty 组件
