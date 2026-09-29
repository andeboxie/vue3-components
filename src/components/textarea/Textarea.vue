<script setup lang="ts">
import SizeStateEnum from '@/enums/SizeStateEnum';
import type TextareaProps from '@/components/textarea/TextareaProps';
import type TextareaEmits from '@/emits/TextareaEmits';
import type AutosizeProps from '@/components/textarea/AutosizeProps';
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useFormControl } from '@/composables/UseFormControl';
import { useInputEvents } from '@/composables/UseInputEvents';




defineOptions({
    name: "VcTextarea",
});

const props = withDefaults(defineProps<TextareaProps>(), {
    modelValue: '',
    placeholder: '',
    disabled: false,
    readonly: false,
    clearable: false,
    rows: 3,
    autosize: false,
    size: SizeStateEnum.Medium,
});
const emit = defineEmits<TextareaEmits<string>>();

const { handleInput, handleBlur, handleFocus, handleClear, handleChange } = useInputEvents(emit as (event: string, ...args: unknown[]) => void, props);



const textareaRef = ref<HTMLTextAreaElement>();

// 读取行高, jsdom/computedStyle 拿不到时回退为 18px
function getLineHeight() {
    const ta = textareaRef.value;
    if (!ta) {
        return 18;
    }
    const lh = parseFloat(window.getComputedStyle(ta).lineHeight);
    return isNaN(lh) ? 18 : lh;
}

function resize() {
    const ta = textareaRef.value;
    if (!ta) {
        return;
    }
    // autosize 关闭：清空内联样式，让原生 rows 生效，避免高度计算错误
    if (!props.autosize) {
        ta.style.height = '';
        ta.style.overflowY = '';
        return;
    }
    // 解析 minRows / maxRows
    const autosize: AutosizeProps = typeof props.autosize === 'object' ? props.autosize : {};
    const min = autosize.minRows;
    const max = autosize.maxRows;
    const lineHeight = getLineHeight();
    const minHeight = min ? min * lineHeight : 0;
    const maxHeight = (max && (!min || max >= min)) ? max * lineHeight : Infinity;

    // 关键：先设 auto 让浏览器按内容重新算 scrollHeight
    ta.style.height = 'auto';
    const scrollHeight = ta.scrollHeight;
    const clamped = Math.max(minHeight, Math.min(maxHeight, scrollHeight));
    ta.style.height = `${clamped}px`;
    ta.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
}


const textareaClasses = useFormControl('vc-textarea', props.size);
const getRows = computed(() => Math.max(1, props.rows ?? 1));


watch([() => props.autosize, () => props.modelValue], () => {
    nextTick(resize);
})

onMounted(resize);

</script>

<template>
    <div :class="textareaClasses">
        <textarea
         ref="textareaRef"
         :value="modelValue ?? ''"
         :placeholder="placeholder"
         :disabled="disabled"
         :readonly="readonly"
         :rows="getRows"
         :maxlength="maxlength"
         @input="handleInput"
         @change="handleChange"
         @blur="handleBlur"
         @focus="handleFocus" 
        />
         <span v-if="clearable && modelValue && !readonly && !disabled" class="vc-textarea__clear" aria-label="清空" @click="handleClear"></span>
    </div>
</template>