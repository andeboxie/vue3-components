<script setup lang="ts">
import DirectionStateEnum from '@/enums/DirectionStateEnum';
import type RadioGroupProps  from '@/components/radio/RadioGroupProps';
import type RadioEmits from '@/emits/RadioEmits';
import { provide, toRef, computed, useId, ref } from 'vue';
import { radioGroupKey } from '@/keys/RadioGroupKey';



defineOptions({
    name: "VcRadioGroup",
});

const props = withDefaults(defineProps<RadioGroupProps>(), {
    modelValue: '',
    disabled: false,
    direction: DirectionStateEnum.Horizontal,
});

const radioGroupClasses = computed(() => {
    return [
        'vc-radio-group',
        `vc-radio-group--${props.direction}`,
    ];
});

const emit = defineEmits<RadioEmits<string | number>>();

function toggle(value: string | number) {
    if (props.disabled || value === props.modelValue) {
        return;
    }
    emit('update:modelValue', value); 
    emit('change', value);
}

// 用 useId 生成同组唯一 name，子 Radio 通过 inject 拿到并绑到 <input name>
// 让浏览器原生 radio group 生效（键盘方向键互斥，A-01 / A-02）
const groupName = ref(useId());

provide(radioGroupKey, {
    modelValue: toRef(props, 'modelValue'),
    disabled: toRef(props, 'disabled'),
    name: groupName,
    toggle,
});
</script>
<template>
    <div :class="radioGroupClasses">
        <slot></slot>
    </div>
</template>