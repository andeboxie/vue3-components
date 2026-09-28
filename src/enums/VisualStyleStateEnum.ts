const VisualStyleStateEnum = {
    Default: "default",
    Primary: "primary",
    Success: "success",
    Warning: "warning",
    Danger: "danger",
} as const;

// 可选：导出值类型的 union，方便在 props 类型里用 
type VisualStyleState = typeof VisualStyleStateEnum[keyof typeof VisualStyleStateEnum];
// 即 "default" | "primary" | "success" | "warning" | "danger"
export type { VisualStyleState };
export default VisualStyleStateEnum;


