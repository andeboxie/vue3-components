<script setup lang="ts">
import type InputProps from '@/components/input/InputProps';
import type InputEmits from '@/emits/InputEmits';
import SizeStateEnum from '@/enums/SizeStateEnum';
import InputTypeEnum from '@/enums/InputTypeEnum';
import { useInputEvents } from '@/composables/UseInputEvents';
import { useFormControl } from '@/composables/UseFormControl';

defineOptions({
    name: "VcInput",
});

const props = withDefaults(defineProps<InputProps>(), {
    modelValue: '',
    type: InputTypeEnum.Text,
    placeholder: '',
    disabled: false,
    readonly: false,
    clearable: false,
    size: SizeStateEnum.Medium,
}); 

const emit = defineEmits<InputEmits<string>>();

const { handleInput, handleBlur, handleFocus, handleClear, handleChange } = useInputEvents(emit as (event: string, ...args: unknown[]) => void, props);



const inputClasses = useFormControl('vc-input', props.size);


</script>

<template>
    <div :class="inputClasses">
        <span v-if="$slots.prefix" class="vc-input__prefix"><slot name="prefix" /></span>
        <span v-else-if="prefix" class="vc-input__prefix">{{ prefix }}</span>
        <input 
         :value="modelValue ?? ''"
         :type="type"
         :placeholder="placeholder"
         :readonly="readonly"
         :maxlength="maxlength && maxlength > 0 ? maxlength : undefined"
         :disabled="disabled"
         @input="handleInput"
         @blur="handleBlur"
         @focus="handleFocus"
         @change="handleChange"
         />
        <span v-if="$slots.suffix" class="vc-input__suffix"><slot name="suffix" /></span>
        <span v-else-if="suffix" class="vc-input__suffix">{{ suffix }}</span>
        <span v-if="clearable && modelValue && !readonly && !disabled" class="vc-input__clear" aria-label="清空" @click="handleClear"></span>
    </div>
</template>