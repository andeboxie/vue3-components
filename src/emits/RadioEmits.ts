import type BaseEmits from '@/emits/BaseEmits';

export default interface RadioEmits<T> extends BaseEmits {

    'update:modelValue': [value: T];

    change: [value: T];
}