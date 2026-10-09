<script setup lang="ts">
import { computed, ref, inject, provide, onMounted, onUnmounted, useId } from 'vue';
import type { Ref } from 'vue';
import type FormItemProps from '@/components/form/FormItemProps';
import type FormItemContext from '@/components/form/FormItemContext';
import type { FormItemApi } from '@/components/form/FormContext';
import { formContextKey } from '@/keys/FormContextKey';
import { formItemContextKey } from '@/keys/FormItemContextKey';
import { validateField } from '@/components/form/validators';
import { isNotEmpty } from '@/utils/function';
import LabelPositionEnum from '@/enums/LabelPositionEnum';

defineOptions({
    name: 'VcFormItem',
});

const props = withDefaults(defineProps<FormItemProps>(), {
    required: false,
    showMessage: true,
});

// 注入 Form 上下文
const formContext = inject(formContextKey, undefined);

// 生成唯一 id
const controlId = useId();
const errorId = `${controlId}-error`;

// 本地状态
const error = ref('');
const touched = ref(false);

const hasError = computed(() => error.value !== '');

// --- 字段值读写 ---
function getValue(): unknown {
    if (!formContext) return undefined;
    return formContext.model.value[props.name];
}

function setValue(value: unknown): void {
    if (!formContext) return;
    formContext.model.value[props.name] = value;
}

// --- 校验 ---
async function validate(): Promise<boolean> {
    if (!formContext) return true;
    // E-01：无 rules 始终通过
    const rules = formContext.rules.value[props.name] ?? [];
    if (rules.length === 0) return true;
    const value = getValue();
    const result = validateField(rules, value);
    error.value = result ?? '';
    // 首次校验后标记触碰，启用 change 实时校验
    touched.value = true;
    return result === null;
}

function reset(): void {
    error.value = '';
}

function clearError(): void {
    error.value = '';
}

function getError(): string {
    return error.value;
}

// --- FormItemApi（注册给 Form） ---
const itemApi: FormItemApi = {
    validate,
    reset,
    clearError,
    getError,
    getValue,
    setValue,
};

// --- 注册/注销 ---
onMounted(() => {
    formContext?.addField(props.name, itemApi);
});

onUnmounted(() => {
    formContext?.removeField(props.name);
});

// --- 触发时机 ---
// B-14：trigger='blur' 时在 blur 校验
function handleBlur(): void {
    if (!formContext) return;
    const rules = formContext.rules.value[props.name] ?? [];
    const hasBlurTrigger = rules.some(r => r.trigger === 'blur');
    if (hasBlurTrigger) {
        validate();
    }
}

// B-15：change 时校验（仅在该字段已被触碰/提交后）
function markChanged(): void {
    if (!touched.value) return;
    if (!formContext) return;
    const rules = formContext.rules.value[props.name] ?? [];
    // 默认 trigger 为 'change'
    const hasChangeTrigger = rules.some(r => (r.trigger ?? 'change') === 'change');
    if (hasChangeTrigger) {
        validate();
    }
}

// --- provide 给控件 ---
const fallbackDisabled = ref(false);
const disabledRef: Ref<boolean> = formContext?.disabled ?? fallbackDisabled;

const itemContext: FormItemContext = {
    name: props.name,
    controlId,
    errorId,
    invalid: hasError,
    setValue,
    handleBlur,
    markChanged,
    disabled: disabledRef,
};
provide(formItemContextKey, itemContext);

// --- label 相关 ---
const haveLabel = computed(() => isNotEmpty(props.label));

const labelClasses = computed(() => [
    'vc-form-item__label',
    { 'vc-form-item__required': props.required },
]);

const labelPosition = formContext?.labelPosition?.value ?? LabelPositionEnum.Right;
const labelWidth = formContext?.labelWidth?.value;

const labelStyle = computed(() => {
    if (labelPosition === LabelPositionEnum.Top) {
        return { width: '100%', textAlign: 'left' as const };
    }
    return {
        width: labelWidth || '100px',
        textAlign: labelPosition as 'left' | 'right',
    };
});

const itemClasses = computed(() => [
    'vc-form-item',
    { 'vc-form-item--error': hasError.value },
    { 'vc-form-item--label-top': labelPosition === LabelPositionEnum.Top },
]);
</script>
<template>
    <div :class="itemClasses">
        <label
            v-if="haveLabel"
            :for="controlId"
            :style="labelStyle"
            :class="labelClasses"
        >
            {{ label }}
            <span v-if="required" class="vc-form-item__required" aria-hidden="true">*</span>
        </label>
        <div class="vc-form-item__content">
            <slot />
        </div>
        <slot name="error" :error="error" :error-id="errorId">
            <div
                v-if="hasError && showMessage"
                :id="errorId"
                class="vc-form-item__error"
            >
                {{ error }}
            </div>
        </slot>
    </div>
</template>
