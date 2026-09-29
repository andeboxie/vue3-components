const TextLevelEnum = {
    BODY: 'body',
    CAPTION: 'caption',
    MARK: 'mark',
} as const;

// 可选：导出值类型的 union，方便在 props 类型里用 
type TextLevel = typeof TextLevelEnum[keyof typeof TextLevelEnum];
// 即：type TextLevel = 'body' | 'caption' | 'mark'
export type { TextLevel };
export default TextLevelEnum;
