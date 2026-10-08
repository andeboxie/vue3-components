import type BaseEmits from "@/emits/BaseEmits";

export default interface SwitchEmits extends BaseEmits {
    'update:modelValue': [value: boolean];
    'change': [value: boolean];
}
