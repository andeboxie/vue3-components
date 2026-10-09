// 共享注入上下文(组件间契约,单独成文件避免循环引用)
import type { Ref } from 'vue';
import type { LabelPosition } from '@/enums/LabelPositionEnum';
import type FormRule from '@/components/form/FormRule';

// FormItem 注册给 Form 的 API，供 Form 调用校验/重置/清错
export interface FormItemApi {
    // 校验该字段，返回是否通过，同时更新自身错误显示
    validate: () => Promise<boolean>;
    // 重置为初始值并清空错误
    reset: () => void;
    // 仅清空错误信息
    clearError: () => void;
    // 获取当前错误信息（无错误时返回空串）
    getError: () => string;
    // 获取当前字段值
    getValue: () => unknown;
    // 设置字段值（来自控件上报）
    setValue: (value: unknown) => void;
}

// Form provide 给 FormItem 的上下文
export default interface FormContext {
    // 表单数据对象
    model: Ref<Record<string, unknown>>;
    // 校验规则
    rules: Ref<Record<string, FormRule[]>>;
    // 整体禁用
    disabled: Ref<boolean>;
    // 统一 label 宽度
    labelWidth: Ref<string | undefined>;
    // label 对齐
    labelPosition: Ref<LabelPosition>;
    // FormItem 注册
    addField: (name: string, itemApi: FormItemApi) => void;
    // FormItem 注销
    removeField: (name: string) => void;
    // 校验全部字段
    validate: () => Promise<boolean>;
    // 校验单个字段
    validateField: (name: string) => Promise<boolean>;
    // 重置为初始值并清空错误
    resetFields: () => void;
    // 仅清空错误信息
    clearValidate: () => void;
}
