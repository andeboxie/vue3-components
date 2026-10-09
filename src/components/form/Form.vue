<script setup lang="ts">
import { computed, provide, toRef, onMounted } from 'vue';
import LabelPositionEnum from '@/enums/LabelPositionEnum';
import type FormProps from '@/components/form/FormProps';
import type FormEmits from '@/emits/FormEmits';
import type FormExpose from '@/expose/FormExpose';
import type { FormItemApi } from '@/components/form/FormContext';
import type FormContext from '@/components/form/FormContext';
import { formContextKey } from '@/keys/FormContextKey';

defineOptions({
    name: 'VcForm',
});

const props = withDefaults(defineProps<FormProps>(), {
    rules: () => ({}),
    labelPosition: LabelPositionEnum.Right,
    inline: false,
    disabled: false,
});

const emit = defineEmits<FormEmits>();

// 字段注册表：name -> FormItemApi
const fields = new Map<string, FormItemApi>();

// 初始值快照（resetFields 用）
let initialValues: Record<string, unknown> = {};

onMounted(() => {
    // 深拷贝初始值快照（reactive proxy 不能用 structuredClone，用 JSON 方案）
    initialValues = JSON.parse(JSON.stringify(props.model));
});

const formClasses = computed(() => {
    return [
        'vc-form',
        { 'vc-form--inline': props.inline },
        { 'vc-form--disabled': props.disabled },
    ];
});

// --- 字段注册/注销 ---
function addField(name: string, itemApi: FormItemApi) {
    fields.set(name, itemApi);
}

function removeField(name: string) {
    fields.delete(name);
}

// --- 校验 ---
async function validate(): Promise<boolean> {
    const errors: Record<string, string> = {};
    let valid = true;
    for (const [name, itemApi] of fields) {
        const ok = await itemApi.validate();
        if (!ok) {
            valid = false;
            const msg = itemApi.getError();
            if (msg) errors[name] = msg;
        }
    }
    emit('validate', valid, errors);
    return valid;
}

async function validateField(name: string): Promise<boolean> {
    const itemApi = fields.get(name);
    if (!itemApi) {
        return true;
    }
    const ok = await itemApi.validate();
    const errors: Record<string, string> = {};
    if (!ok) {
        const msg = itemApi.getError();
        if (msg) errors[name] = msg;
    }
    emit('validate', ok, errors);
    return ok;
}

// --- 重置/清错 ---
function resetFields(): void {
    // 恢复初始值
    for (const key in initialValues) {
        (props.model as Record<string, unknown>)[key] = JSON.parse(JSON.stringify(initialValues[key]));
    }
    // 清空全部错误
    for (const [, itemApi] of fields) {
        itemApi.reset();
    }
}

function clearValidate(): void {
    for (const [, itemApi] of fields) {
        itemApi.clearError();
    }
}

// --- 提交 ---
async function handleSubmit() {
    const ok = await validate();
    if (ok) {
        emit('submit', { ...props.model });
    }
}

// --- provide 上下文给 FormItem ---
const context: FormContext = {
    model: toRef(props, 'model'),
    rules: toRef(props, 'rules'),
    disabled: toRef(props, 'disabled'),
    labelWidth: toRef(props, 'labelWidth'),
    labelPosition: toRef(props, 'labelPosition'),
    addField,
    removeField,
    validate,
    validateField,
    resetFields,
    clearValidate,
};
provide(formContextKey, context);

// --- Expose ---
defineExpose<FormExpose>({
    validate,
    validateField,
    resetFields,
    clearValidate,
});
</script>
<template>
    <form :class="formClasses" @submit.prevent="handleSubmit">
        <slot />
    </form>
</template>
