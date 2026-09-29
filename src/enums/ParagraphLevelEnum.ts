const ParagraphLevelEnum = {
    BODY: 'body',
    LEAD: 'lead',
    SMALL: 'small',
} as const;

// 可选：导出值类型的 union，方便在 props 类型里用 
type ParagraphLevel = typeof ParagraphLevelEnum[keyof typeof ParagraphLevelEnum];
// 即：type ParagraphLevel = 'body' | 'lead' | 'small'
export type { ParagraphLevel };
export default ParagraphLevelEnum;
