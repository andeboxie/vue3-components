<script setup lang="ts">
import type CheckboxGroupProps from '@/components/checkbox/CheckboxGroupProps';
import type CheckboxEmits from '@/emits/CheckboxEmits';
import { provide, toRef } from 'vue';
import { checkboxGroupContextKey} from '@/keys/CheckboxGroupContextKey';

defineOptions({
    name: "VcCheckboxGroup",
});
const props = withDefaults(defineProps<CheckboxGroupProps>(),{
    modelValue: () =>[],
    disabled: false,
});

const emit = defineEmits<CheckboxEmits<(string | number)[]>>();

function toggle(value: string | number) {
    if (props.disabled) {
        return;
    }
    const arr = [...props.modelValue];
    const i = arr.indexOf(value);
    if (i !== -1) {
        arr.splice(i, 1);
    } else {
        arr.push(value);
    }
    emit('update:modelValue', arr); 
    emit('change', arr);
}

// toRef 保证子组件拿到的是响应式引用（B-15 动态禁用）
provide(checkboxGroupContextKey, {
    modelValue: toRef(props, 'modelValue'),
    disabled: toRef(props, 'disabled'),
    toggle,
});
</script>

<template>
    <div class="vc-checkbox-group">
        <slot></slot>
    </div>
</template>
