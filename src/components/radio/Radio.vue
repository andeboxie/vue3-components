<script setup lang="ts">

import SizeStateEnum from '@/enums/SizeStateEnum';
import type RadioProps  from '@/components/radio/RadioProps';
import type RadioEmits  from '@/emits/RadioEmits';
import type RadioGroupContext from '@/components/radio/RadioGroupContext';
import { useCheckEvent } from '@/composables/UseCheckEvent';
import { isNotEmpty } from '@/utils/function';
import { radioGroupKey } from '@/keys/RadioGroupKey';
import { inject, computed } from 'vue';

defineOptions({
    name: "VcRadio",
});

const props = withDefaults(defineProps<RadioProps>(), {
    value: '',
    disabled: false,
    label: '',
    size: SizeStateEnum.Medium,
});

const emit = defineEmits<RadioEmits<string | number>>();

const { handleChange } = useCheckEvent(emit as (event: string, ...args: unknown[]) => void, props);

const radioClasses = computed(() => {
    return [
        'vc-radio',
        `vc-radio--${props.size}`,
        {
            'vc-radio--checked': isChecked.value,
        },
        {
            'vc-radio--disabled': isDisabled.value,
        },
    ];
});

const group = inject<RadioGroupContext | undefined>(radioGroupKey, undefined);

const isInGroup = computed(() => !!group && isNotEmpty(props.value));

const isDisabled = computed(() => props.disabled || !!group?.disabled?.value);

const isChecked = computed(() => isInGroup.value 
    ? group!.modelValue?.value === props.value 
    : false);

function onChange(e: Event) {
    if (isDisabled.value || isChecked.value) {
		return;
	}
	if (isInGroup.value) {
		group!.toggle!(props.value as string | number);
	} else {
		handleChange(e); // 触发 change 事件
	}
}

</script>

<template>
    <label
     :class="radioClasses"
    >
        <input
         type="radio"
         :value="props.value"
         :disabled="isDisabled"
         :checked="isChecked"
         :name="group?.name?.value"
         @change="onChange" />
        <span v-if="$slots.default" class="vc-radio__default"><slot></slot></span>
        <span v-if="props.label" class="vc-radio__label">{{ props.label }}</span>
    </label>
</template>