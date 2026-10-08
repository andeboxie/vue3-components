<script setup lang="ts">
    import type SwitchProps from "@/components/switch/SwitchProps";
    import type SwitchEmits from "@/emits/SwitchEmits";
    import SizeStateEnum from "@/enums/SizeStateEnum";
    import { useFormControl } from "@/composables/UseFormControl";
    import { computed } from "vue";

    defineOptions({
        name: "VcSwitch",
    });
    const props = withDefaults(defineProps<SwitchProps>(), {
        modelValue: false,
        disabled: false,
        loading: false,
        activeText: '',
        inactiveText: '',
        size: SizeStateEnum.Medium,
    });

    const emit = defineEmits<SwitchEmits>();
    
    function onClick() {
        if(props.disabled || props.loading) {
            return;
        }
        const next = !props.modelValue;
        emit('update:modelValue', next);
        emit('change', next);
    }
    const baseClasses = useFormControl('vc-switch',props.size);
    const switchClasses = computed(() => {
        return [
            ...baseClasses.value,
            {'vc-switch--disabled': props.disabled},
            {'vc-switch--active': props.modelValue},
            {'vc-switch--loading': props.loading},
        ]
    });
</script>
<template>
    <button 
        type="button" 
        role="switch" 
        :disabled="disabled || loading"
        :aria-checked="modelValue" 
        :class="switchClasses"
        @click="onClick">
        <span v-if="loading" class="vc-switch__loading">
            <slot name="loading"></slot>
        </span>
        <span class="vc-switch__handle"></span>
        <span v-if="modelValue && activeText" class="vc-switch__active">{{ activeText }}</span>
        <span v-if="!modelValue && inactiveText" class="vc-switch__inactive">{{ inactiveText }}</span>
    </button>
</template>
