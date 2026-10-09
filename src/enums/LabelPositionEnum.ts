const LabelPositionEnum = {
	Left: 'left',
	Right: 'right',
	Top: 'top',
	Bottom: 'bottom',
}
// 可选：导出值类型的 union，方便在 props 类型里用 
type LabelPosition = (typeof LabelPositionEnum)[keyof typeof LabelPositionEnum];
// 即：type LabelPosition = 'left' | 'right' | 'top' | 'bottom'
export type { LabelPosition };
export default LabelPositionEnum
