import type BaseEmits from '@/emits/BaseEmits';

export default interface InputEmits<T> extends BaseEmits {

    // 变化事件，用于组件内部抛出变化信号
    change: [value: T];

    // 失去焦点事件，用于组件内部抛出失去焦点信号
    blur: [e: FocusEvent | null];

    // 获得焦点事件，用于组件内部抛出获得焦点信号
    focus: [e: FocusEvent | null];

    // 更新值事件，用于组件内部抛出更新值信号
    'update:modelValue': [value: T];

    // 清空事件，用于组件内部抛出清空信号
    clear: [e: FocusEvent | null];

}