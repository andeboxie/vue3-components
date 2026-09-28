const NativeTypeEnum = {
    Submit: "submit",
    Reset: "reset",
    Button: "button",
} as const;

// 可选：导出值类型的 union，方便在 props 类型里用 
type NativeType = typeof NativeTypeEnum[keyof typeof NativeTypeEnum];
// 即 "submit" | "reset" | "button"

export type { NativeType };
export default NativeTypeEnum;