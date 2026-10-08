const DirectionStateEnum = {
    Horizontal: 'horizontal',
    Vertical: 'vertical',
}
// 可选：导出值类型的 union，方便在 props 类型里用 
type DirectionState = (typeof DirectionStateEnum)[keyof typeof DirectionStateEnum];
// 即 'horizontal' | 'vertical'

export type { DirectionState };
export default DirectionStateEnum;
