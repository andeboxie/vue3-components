<script setup lang="ts">
import type InputProps from '@/components/input/InputProps';
import type InputEmits from '@/emits/InputEmits';
import SizeStateEnum from '@/enums/SizeStateEnum';
import InputTypeEnum from '@/enums/InputTypeEnum';
import { useInputEvents } from '@/composables/UseInputEvents';
import { useFormControl } from '@/composables/UseFormControl';
import { computed, inject } from 'vue';
import { formItemContextKey } from '@/keys/FormItemContextKey';

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

// 注入 FormItem 上下文（无 context 时独立工作）
const formItemContext = inject(formItemContextKey, undefined);

// 合并禁用：Form disabled 或自身 disabled
const isDisabled = computed(() => props.disabled || formItemContext?.disabled.value === true);

// 包装事件处理：在原有行为后上报 FormItem
const onInput = (e: InputEvent) => {
    if (isDisabled.value || props.readonly) return;
    handleInput(e);
    if (formItemContext) {
        const target = e.target as HTMLInputElement;
        formItemContext.setValue(target.value);
        formItemContext.markChanged();
    }
};

const onBlur = (e: FocusEvent) => {
    if (isDisabled.value) return;
    handleBlur(e);
    formItemContext?.handleBlur();
};

const onClear = (e: FocusEvent) => {
    if (isDisabled.value || props.readonly) return;
    handleClear(e);
    if (formItemContext) {
        formItemContext.setValue('');
        formItemContext.markChanged();
    }
};

// change 事件也上报（供 trigger='change' 的字段）
const onChange = (e: Event) => {
    if (isDisabled.value || props.readonly) return;
    handleChange(e);
};

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
         :disabled="isDisabled"
         :id="formItemContext?.controlId"
         :aria-describedby="formItemContext?.errorId"
         :aria-invalid="formItemContext?.invalid.value === true ? 'true' : undefined"
         @input="onInput"
         @blur="onBlur"
         @focus="handleFocus"
         @change="onChange"
        />
        <span v-if="$slots.suffix" class="vc-input__suffix"><slot name="suffix" /></span>
        <span v-else-if="suffix" class="vc-input__suffix">{{ suffix }}</span>
        <span v-if="clearable && modelValue && !readonly && !isDisabled" class="vc-input__clear" aria-label="清空" @click="onClear"></span>
    </div>
</template>
