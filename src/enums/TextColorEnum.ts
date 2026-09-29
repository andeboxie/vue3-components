const TextColorEnum = {
    Default: 'default',
    Primary: 'primary',
    Success: 'success',
    Warning: 'warning',
    Danger: 'danger',
    Muted: 'muted',
} as const;

// 导出类型定义：确保在类型检查中使用 TextColorEnum 中的值
type TextColor = typeof TextColorEnum[keyof typeof TextColorEnum];
// 即 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'muted'

export type { TextColor };
export default TextColorEnum;
