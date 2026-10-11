# Avatar 组件规格

## 元数据

| 字段 | 值 |
|---|---|
| 组件名 | `VcAvatar` |
| 分类 | 数据展示 |
| 所属阶段 | Stage-3 |
| 依赖组件 | 无 |
| 文件位置 | `src/components/avatar/Avatar.vue` |
| 测试文件 | `src/components/avatar/Avatar.test.ts` |

---

## 设计意图

展示用户头像或品牌图标，支持图片、文字兜底、图标三种模式。图片加载失败时自动降级到文字或图标。

**不解决**：头像组（AvatarGroup，后续迭代）、在线状态点（留给 Badge 组合）、头像上传。

---

## API 规格

### Props

| 名称 | 类型 | 默认值 | 必填 | 行为说明 |
|---|---|---|---|---|
| `src` | `string` | - | 否 | 图片地址 |
| `size` | `number \| 'small' \| 'medium' \| 'large'` | `'medium'` | 否 | 尺寸（数字为像素值） |
| `shape` | `'circle' \| 'square'` | `'circle'` | 否 | 形状 |
| `icon` | `string` | - | 否 | 图标名称（SVG 图标路径） |
| `alt` | `string` | - | 否 | 图片替代文本 |

### Emits

| 事件名 | 载荷类型 | 触发时机 |
|---|---|---|
| `error` | `Event` | 图片加载失败时 |

### Slots

| 名称 | 说明 |
|---|---|
| `default` | 兜底内容（覆盖文字/图标，优先级最高） |
| `icon` | 自定义图标（覆盖 icon prop） |

### Expose

无。

---

## 行为约束

### 渲染与 DOM

- **B-01** 根元素为 `<span>`，class 含 `vc-avatar`
- **B-02** `shape='circle'` 时，class 含 `vc-avatar--circle`
- **B-03** `shape='square'` 时，class 含 `vc-avatar--square`
- **B-04** `size='small'` / `'large'` 时，class 含 `vc-avatar--small` / `vc-avatar--large`
- **B-05** `size` 为数字时，根元素 `style.width` 与 `style.height` 为该数值的像素值

### 图片模式

- **B-06** `src` 有值且加载成功时，渲染 `<img>` 元素，`src` 属性为传入值
- **B-07** `alt` prop 透传给 `<img>` 的 `alt` 属性
- **B-08** `src` 加载失败时，触发 `error` 事件，且不再渲染 `<img>`（降级到文字/图标）

### 兜底模式

- **B-09** `src` 无值时，渲染兜底内容：优先 default slot，其次 icon prop/slot，最后无内容
- **B-10** 图片加载失败后，降级到兜底内容（与 B-09 相同的优先级）
- **B-11** `icon` prop 有值且无 default slot 时，渲染图标（class `vc-avatar__icon`）
- **B-12** 提供 `icon` slot 时，覆盖 `icon` prop 的图标渲染

### 尺寸数字

- **B-13** `size` 为数字时，根元素的 `style.width` 与 `style.height` 均为 `${size}px`

---

## 边界条件与异常

- **E-01** `src` 与 `icon` 同时传入：优先渲染图片，图片失败后降级到 icon
- **E-02** `src` 为空字符串：视为无图片，直接进入兜底模式
- **E-03** `size` 为 0 或负数：忽略数字尺寸，使用默认 `medium` 档位
- **E-04** 所有内容源都无值（无 src、无 icon、无 default slot）：渲染一个空的 Avatar 框，不报错
- **E-05** default slot 与 icon 同时存在：default slot 优先

---

## 可访问性（a11y）

- **A-01** 图片模式 `<img>` 的 `alt` 有值时，作为可访问名
- **A-02** `alt` 无值时，`<img>` 的 `alt` 为空字符串（装饰性图片）
- **A-03** 兜底模式（文字/图标）下，根元素可加 `role="img"` 与 `aria-label`（若有可读内容）
- **A-04** 图标模式无文字时，图标需有 `aria-label` 或被屏幕阅读器忽略

---

## 测试用例清单

| 编号 | 关联行为 | Given | When | Then | 优先级 |
|---|---|---|---|---|---|
| T-01 | B-01 | mount | 取根元素 | tagName `SPAN`，class 含 `vc-avatar` | P0 |
| T-02 | B-02 | mount（默认 shape） | 取 class | 含 `vc-avatar--circle` | P0 |
| T-03 | B-03 | `{ shape: 'square' }` | 取 class | 含 `vc-avatar--square` | P0 |
| T-04 | B-04 | `{ size: 'small' }` | 取 class | 含 `vc-avatar--small` | P0 |
| T-05 | B-05 | `{ size: 48 }` | 取 style | width 与 height 均为 `'48px'` | P0 |
| T-06 | B-06 | `{ src: 'a.jpg' }` | 查找 img | 存在 `<img>`，src 为 `'a.jpg'` | P0 |
| T-07 | B-07 | `{ src: 'a.jpg', alt: '头像' }` | 取 img alt | 为 `'头像'` | P1 |
| T-08 | B-08 | `{ src: 'bad.jpg' }`，触发 img error 事件 | 取 emitted/查找 img | 有 `error` 事件，img 不再渲染 | P0 |
| T-09 | B-09 | 无 src 无 icon | 查找 img | 不存在 | P0 |
| T-10 | B-10 | `{ src: 'bad.jpg' }`，触发 img error 后 | 查找 img | 不存在 | P1 |
| T-11 | B-11 | `{ icon: 'user' }` | 查找图标 | 存在 `vc-avatar__icon` | P1 |
| T-12 | B-12 | slots `{ icon: '<i>custom</i>' }` | 取图标内容 | 含 `'custom'` | P2 |
| T-13 | B-13 | `{ size: 32 }` | 取 style | width 为 `'32px'`，height 为 `'32px'` | P0 |
| T-14 | E-02 | `{ src: '' }` | 查找 img | 不存在 | P1 |
| T-15 | E-03 | `{ size: 0 }` | 取 class | 含 `vc-avatar--medium`，无数字尺寸 style | P2 |
| T-16 | E-04 | 无任何内容源 | 取根元素 | 存在空 Avatar 框，不报错 | P1 |
| T-17 | E-05 | slots `{ default: '张' }`，`{ icon: 'user' }` | 取内容 | 含 `'张'`，不含图标 | P2 |
| T-18 | A-02 | `{ src: 'a.jpg' }` 无 alt | 取 img alt | 为 `''` | P1 |

---

## 实现提示

### 1. 结构

```html
<span class="vc-avatar" :class="avatarClass" :style="avatarStyle">
    <img
        v-if="hasImage && !imgError"
        :src="src"
        :alt="alt ?? ''"
        class="vc-avatar__img"
        @error="handleError"
    />
    <span v-else-if="$slots.default" class="vc-avatar__text">
        <slot></slot>
    </span>
    <span v-else-if="icon || $slots.icon" class="vc-avatar__icon">
        <slot name="icon">
            <!-- 渲染 icon prop 对应的 SVG -->
        </slot>
    </span>
</span>
```

### 2. 关键提示

- `hasImage` = `src !== undefined && src !== null && src !== ''`
- `imgError` 是 ref，img error 事件触发后设为 true，切到兜底模式
- `icon` slot 优先级低于 default slot，但高于 icon prop
- `size` 为数字且 `> 0` 时用 style 设宽高，否则用 size 档位 class
- shape 的 class 与 size 的 class 可并存

### 3. 重构方向

- 图标渲染逻辑后续可抽成共享的 Icon 渲染层（与阶段 1 的 Icon 组件对齐）
- 若后续支持 AvatarGroup，provide/inject 传递尺寸与形状默认值
