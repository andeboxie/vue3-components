<script setup lang="ts">
import type SelectOptionProps from "@/components/select/option/SelectOptionProps";

defineOptions({
    name: "VcSelectOption",
});

// 纯展示组件：状态由父级计算后传入，点击事件上报给父级判定
interface Props {
    // 选项数据（label/value/disabled）
    option: SelectOptionProps;
    // 是否选中（父级按 value === modelValue 计算）
    selected?: boolean;
    // 是否高亮（父级按 index === highlightIndex 计算）
    highlighted?: boolean;
    // 选项节点 id，用于关联 aria-controls / aria-activedescendant
    optionId?: string;
}

withDefaults(defineProps<Props>(), {
    selected: false,
    highlighted: false,
    optionId: undefined,
});

const emit = defineEmits<{
    // 点击时上报，载荷为该选项数据，由父级 onOptionClick 统一判定
    click: [option: SelectOptionProps];
}>();
</script>

<template>
    <div
        :id="optionId"
        class="vc-select-option"
        :class="{
            'vc-select-option--selected': selected,
            'vc-select-option--disabled': option.disabled,
            'vc-select-option--highlighted': highlighted,
        }"
        role="option"
        :aria-selected="selected"
        @click="emit('click', option)"
    >
        {{ option.label }}
    </div>
</template>
