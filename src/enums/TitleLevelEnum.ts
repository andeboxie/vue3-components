const TitleLevelEnum = {
    H1: 1,
    H2: 2,
    H3: 3,
    H4: 4,
    H5: 5,
} as const;

// 可选：导出值类型的 union，方便在 props 类型里用
type TitleLevel = typeof TitleLevelEnum[keyof typeof TitleLevelEnum];
// 即：type TitleLevel = 1 | 2 | 3 | 4 | 5
export type { TitleLevel };
export default TitleLevelEnum;
