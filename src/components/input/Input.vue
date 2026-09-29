<script setup lang="ts">
import type InputProps from '@/components/input/InputProps';
import type InputEmits from '@/emits/InputEmits';
import SizeStateEnum from '@/enums/SizeStateEnum';
import InputTypeEnum from '@/enums/InputTypeEnum';
import { getInputValue, getValue } from '@/utils/Event';
import { useFormControl } from '@/composables/UseFormControl';

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

function handleUpdateValue(value: string) {
    emit('update:modelValue', value);
}

function handleInput(e: InputEvent) {
    if (props.disabled || props.readonly) {
        return; 
    }
    handleUpdateValue(getInputValue(e));
}

function handleBlur(e: FocusEvent) {
    if (props.disabled) {
        return; 
    }
    emit('blur', e);
}

function handleFocus(e: FocusEvent) {
    if (props.disabled) {
        return; 
    }
    emit('focus', e);
}

function handleClear(e: FocusEvent) {
    if (props.disabled || props.readonly) {
         return; 
    }
    handleUpdateValue('');
    emit('clear', e);
}

function handleChange(e: Event) {
    if (props.disabled || props.readonly) {
         return; 
    }
    emit('change', getValue(e));
}

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