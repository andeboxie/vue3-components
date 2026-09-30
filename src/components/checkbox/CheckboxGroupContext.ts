// 共享注入键(组件间契约,单独成文件避免循环引用)
import type { Ref } from 'vue';

export default interface CheckboxGroupContext {
    // 选中的值数组
    modelValue: Ref<(string | number)[]>;
    // 是否禁用
    disabled: Ref<boolean>;
    // 切换选中状态
    toggle: (value: string | number) => void;
}