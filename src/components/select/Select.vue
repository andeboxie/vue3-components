<script setup lang="ts">
import type SelectProps from "@/components/select/SelectProps";
import SizeStateEnum from "@/enums/SizeStateEnum";
import type SelectOptionProps from "@/components/select/option/SelectOptionProps";
import type SelectEmits from "@/emits/SelectEmits";
import { useFormControl } from "@/composables/UseFormControl";
import VcSelectOption from "@/components/select/option/SelectOption.vue";
import { computed, ref, onMounted, onUnmounted, useId, inject } from 'vue';
import { formItemContextKey } from '@/keys/FormItemContextKey';

defineOptions({
    name: "VcSelect",
});

const props = withDefaults(defineProps<SelectProps>(), {
    modelValue: '',
    options: (): SelectOptionProps[] => [],
    placeholder: '请选择',
    disabled: false,
    clearable: false,
    size: SizeStateEnum.Medium,
});

const emit = defineEmits<SelectEmits>();
// 注入 FormItem 上下文（无 context 时独立工作）
const formItemContext = inject(formItemContextKey, undefined);
// 合并禁用：Form disabled 或自身 disabled
const isDisabled = computed(() => props.disabled || formItemContext?.disabled.value === true);
const isOpen = ref(false);
const baseClasses = useFormControl('vc-select',props.size);
const selectClasses = computed(() => {
    return [
        ...baseClasses.value,
        {'vc-select--disabled': isDisabled.value},
        {'vc-select--clearable': props.clearable},
        {'vc-select--dropdown': isOpen.value},
    ];
});

const selectValue = computed(() => {
    return props.options.find(option => option.value === props.modelValue)?.label || props.placeholder;
});

// 是否有命中选项的选中值（modelValue 不在任何选项中时显示 placeholder，E-02）
const hasSelection = computed(() => {
    return props.options.some(option => option.value === props.modelValue);
});

const rootRef = ref<HTMLElement>();
const controlRef = ref<HTMLElement>();
// 高亮项索引，初始为当前选中项的 index（spec 实现提示）
const highlightIndex = ref(-1);
const dropdownId = `vc-select-dropdown-${useId()}`;

// A-04 高亮项通过 aria-activedescendant 关联
const activeDescendantId = computed(() => {
    return highlightIndex.value >= 0 ? `${dropdownId}-option-${highlightIndex.value}` : undefined;
});

// B-14/E-04 clearable 且有选中值且未禁用时显示清空按钮
const showClear = computed(() => {
    return props.clearable && !isDisabled.value && hasSelection.value;
});

const openDropdown = () => {
    if (isDisabled.value || isOpen.value) return;
    isOpen.value = true;
    emit('visible-change', true);
    highlightIndex.value = props.options.findIndex(option => option.value === props.modelValue);
};

const closeDropdown = () => {
    if (!isOpen.value) return;
    isOpen.value = false;
    emit('visible-change', false);
};

// B-21 disabled 时点击不展开（jsdom 会绕过原生 disabled，必须 JS 守卫）
const onControlClick = () => {
    if (isDisabled.value) return;
    if (isOpen.value) {
        closeDropdown();
    } else {
        openDropdown();
    }
};

const onOptionClick = (option: SelectOptionProps) => {
    // B-11 禁用项：不选中、不收起、不触发事件
    if (option.disabled) return;
    // B-13 点击已选中项：收起面板但不触发 update/change
    if (option.value === props.modelValue) {
        closeDropdown();
        return;
    }
    emit('update:modelValue', option.value);
    emit('change', option.value);
    // 上报表单上下文
    formItemContext?.setValue(option.value);
    formItemContext?.markChanged();
    // B-08 选中后自动收起
    closeDropdown();
};

// B-15 清空：载荷 ''，不动面板状态；模板用 @click.stop 阻止冒泡（B-16）
const onClear = () => {
    emit('update:modelValue', '');
    emit('clear');
    // 上报表单上下文
    formItemContext?.setValue('');
    formItemContext?.markChanged();
};

// B-07 点击组件外部收起面板
const onDocumentClick = (e: MouseEvent) => {
    if (rootRef.value && !rootRef.value.contains(e.target as Node)) {
        closeDropdown();
    }
};

// B-18 方向键移动高亮，循环边界并跳过 disabled
const moveHighlight = (step: number) => {
    const len = props.options.length;
    if (len === 0) return;
    let next = highlightIndex.value;
    for (let i = 0; i < len; i++) {
        next = (next + step + len) % len;
        if (!props.options[next].disabled) {
            highlightIndex.value = next;
            return;
        }
    }
};

const onKeydown = (e: KeyboardEvent) => {
    if (isDisabled.value) return;
    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            // B-17 关闭时按 ArrowDown 展开
            if (!isOpen.value) {
                openDropdown();
                break;
            }
            moveHighlight(1);
            break;
        case 'ArrowUp':
            e.preventDefault();
            if (isOpen.value) {
                moveHighlight(-1);
            }
            break;
        case 'Enter':
        case ' ':
            e.preventDefault();
            // B-17 关闭时按 Enter / Space 展开
            if (!isOpen.value) {
                openDropdown();
                break;
            }
            // B-19 高亮项上按 Enter 选中该项
            if (highlightIndex.value >= 0) {
                onOptionClick(props.options[highlightIndex.value]);
            }
            break;
        case 'Escape':
            // B-20 收起面板，焦点回到触发器
            if (isOpen.value) {
                closeDropdown();
                controlRef.value?.focus();
            }
            break;
    }
};

const focus = () => controlRef.value?.focus();
const blur = () => controlRef.value?.blur();
defineExpose({ focus, blur });

onMounted(() => {
    document.addEventListener('click', onDocumentClick);
});
onUnmounted(() => {
    document.removeEventListener('click', onDocumentClick);
});
</script>

<template>
    <div ref="rootRef" :class="selectClasses">
        <div
            ref="controlRef"
            class="vc-select__control"
            role="combobox"
            aria-haspopup="listbox"
            :aria-expanded="isOpen"
            :aria-controls="dropdownId"
            :aria-activedescendant="activeDescendantId"
            :tabindex="isDisabled ? -1 : 0"
            :id="formItemContext?.controlId"
            :aria-describedby="formItemContext?.errorId"
            :aria-invalid="formItemContext?.invalid.value === true ? 'true' : undefined"
            @click="onControlClick"
            @keydown="onKeydown"
            @blur="formItemContext?.handleBlur()"
        >
            <span :class="hasSelection ? 'vc-select__value' : 'vc-select__placeholder'">{{ selectValue }}</span>
            <slot></slot>
            <span v-if="showClear" class="vc-select__clear" @click.stop="onClear">×</span>
        </div>
        <div v-if="isOpen" :id="dropdownId" class="vc-select__dropdown" role="listbox">
            <VcSelectOption
                v-for="(option, index) in options"
                :key="`${option.value}-${index}`"
                :option="option"
                :option-id="`${dropdownId}-option-${index}`"
                :selected="option.value === modelValue"
                :highlighted="index === highlightIndex"
                @click="onOptionClick"
            />
        </div>
    </div>
</template>
