import type { Trigger } from '@/enums/TriggerEnum';

export default interface FormRule {
    required?: boolean;          // 非空校验（空串/null/undefined 视为空）
    message?: string;            // 错误信息
    min?: number;                // 字符串最小长度 / 数字最小值
    max?: number;                // 字符串最大长度 / 数字最大值
    pattern?: RegExp;            // 正则匹配
    validator?: (value: unknown) => boolean | string; // 自定义：true 通过，false 用 message，string 作为错误信息
    trigger?: Trigger; // 触发时机，默认 'change'
}
