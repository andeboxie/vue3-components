// 基础事件类型
export default interface BaseEmits {
    // 通用错误事件，用于组件内部抛出错误信息
    error: [message: string];
    // 加载状态事件，用于组件内部抛出加载状态
    loading: [loading: boolean];
    // 关闭事件，用于组件内部抛出关闭信号
    close: [];
}
