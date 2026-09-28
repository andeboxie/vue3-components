const SizeStateEnum = {
    Medium: "medium",
    Small: "small",
    Large: "large",
} as const;

// 可选：导出值类型的 union，方便在 props 类型里用 
type SizeState = typeof SizeStateEnum[keyof typeof SizeStateEnum];
// 即 "medium" | "small" | "large"

export type { SizeState };
export default SizeStateEnum;