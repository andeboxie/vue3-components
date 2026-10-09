const TriggerEnum = {
    Change: 'change',
    Blur: 'blur',
}
// 可选：导出值类型的 union，方便在 props 类型里用 
type Trigger = (typeof TriggerEnum)[keyof typeof TriggerEnum];
// 即：type Trigger = 'change' | 'blur'
export type { Trigger };
export default TriggerEnum