import type BaseEmits from "@/emits/BaseEmits";

export default interface SelectEmits extends BaseEmits {
    'update:modelValue': [value: string | number];
    'change': [value: string | number];
    'visible-change': [visible: boolean];
    'clear': [];
}