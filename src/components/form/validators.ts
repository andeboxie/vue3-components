// 纯函数校验器：对单个字段执行规则链，返回错误信息或 null
import type FormRule from '@/components/form/FormRule';
import { isEmpty } from '@/utils/function';

// 默认错误文案
const DEFAULT_REQUIRED_MESSAGE = '该字段为必填项';

/**
 * 校验单个字段
 * @param rules 规则数组（按顺序执行，首个失败即停止）
 * @param value 当前字段值
 * @returns 错误信息字符串（失败时）或 null（通过时）
 */
export function validateField(rules: FormRule[], value: unknown): string | null {
    for (const rule of rules) {
        const error = validateRule(rule, value);
        if (error !== null) {
            return error;
        }
    }
    return null;
}

/**
 * 执行单条规则
 * @returns 错误信息字符串（失败时）或 null（通过时）
 */
function validateRule(rule: FormRule, value: unknown): string | null {
    // required：空串/null/undefined 视为空
    if (rule.required) {
        if (isEmpty(value)) {
            return rule.message ?? DEFAULT_REQUIRED_MESSAGE;
        }
    }

    // min/max：字符串按长度、数字按数值
    if (rule.min !== undefined || rule.max !== undefined) {
        const error = validateMinMax(rule, value);
        if (error !== null) return error;
    }

    // pattern：正则匹配
    if (rule.pattern) {
        if (typeof value === 'string' && !rule.pattern.test(value)) {
            return rule.message ?? '格式不正确';
        }
        if (typeof value === 'number' && !rule.pattern.test(String(value))) {
            return rule.message ?? '格式不正确';
        }
    }

    // 自定义 validator：true 通过，false 用 message，string 作为错误信息
    if (rule.validator) {
        try {
            const result = rule.validator(value);
            if (result === false) {
                return rule.message ?? DEFAULT_REQUIRED_MESSAGE;
            }
            if (typeof result === 'string') {
                return result;
            }
            // true 表示通过
        } catch {
            // validator 抛异常视为校验失败
            return rule.message ?? DEFAULT_REQUIRED_MESSAGE;
        }
    }

    return null;
}

/**
 * min/max 校验：字符串按长度、数字按数值
 */
function validateMinMax(rule: FormRule, value: unknown): string | null {
    if (typeof value === 'string') {
        if (rule.min !== undefined && value.length < rule.min) {
            return rule.message ?? `长度不能少于 ${rule.min} 个字符`;
        }
        if (rule.max !== undefined && value.length > rule.max) {
            return rule.message ?? `长度不能超过 ${rule.max} 个字符`;
        }
    } else if (typeof value === 'number') {
        if (rule.min !== undefined && value < rule.min) {
            return rule.message ?? `值不能小于 ${rule.min}`;
        }
        if (rule.max !== undefined && value > rule.max) {
            return rule.message ?? `值不能大于 ${rule.max}`;
        }
    }
    return null;
}
