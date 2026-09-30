import type BaseEmits from '@/emits/BaseEmits';

export default interface CheckboxEmits<T> extends BaseEmits {

    // 更新模型值时触发
    'update:modelValue': [value: T];

    // 切换状态时触发
    'change': [value: T];
}