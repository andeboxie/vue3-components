const AlignStateEnum = {
    LEFT: 'left',
    CENTER: 'center',
    RIGHT: 'right',
} as const;
// 可选：导出值类型的 union，方便在 props 类型里用 
type AlignState = (typeof AlignStateEnum)[keyof typeof AlignStateEnum];
// 即：type AlignState = 'left' | 'center' | 'right'

export type { AlignState };
export default AlignStateEnum;
