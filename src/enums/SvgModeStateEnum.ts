// 文件名已更新为 SvgModestateEnum，保持与重构后的文件名一致
const SvgModeStateEnum = {
    SINGLE: 'single',
    MULTI: 'multi',
}

// 可选：导出值类型的 union，方便在 props 类型里用 
type SvgModeState = typeof SvgModeStateEnum[keyof typeof SvgModeStateEnum]
// 即 'single' | 'multi' 类型
export type { SvgModeState }
export default SvgModeStateEnum
