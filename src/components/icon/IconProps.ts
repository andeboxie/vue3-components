export default interface IconProps {
    name: string; // 图标名，对应 `src/components/icon/icons/{name}.svg` 的文件名（不含扩展名）
    size?: number | string; // 图标尺寸，传 number 时按 px 处理，传 string 时原样作为 CSS `width`/`height`
    color?: string; // 图标颜色，CSS `color` 值，SVG 内部 `fill="currentColor"
    spin?: boolean; // 为 `true` 时图标无限旋转（class `vc-icon--spin`）
    ariaLabel?: string; // 装饰图标传 `undefined`，语义图标传字符串作为 `aria-label`
    mode?: 'single' | 'multi'; // 预留：单色/多色模式，本阶段仅支持 'single'
}