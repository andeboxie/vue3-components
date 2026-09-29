<script setup lang="ts">
import type TitleProps from '@/components/typography/title/TitleProps';
import TitleLevelEnum from '@/enums/TitleLevelEnum';
import AlignStateEnum from '@/enums/AlignStateEnum';
import TextColorEnum from '@/enums/TextColorEnum';
import { computed } from 'vue';
import { useTypography } from '@/composables/UseTypography';
import { useSizableStyle } from '@/composables/UseSizableStyle';

defineOptions({
    name: "VcTypographyTitle",
});

const props = withDefaults(defineProps<TitleProps>(), {
    level: TitleLevelEnum.H1,
    align: AlignStateEnum.LEFT,
    truncate: false,
    strong: false,
    italic: false,
    color: TextColorEnum.DEFAULT,
    size: '1em',
});

const titleClass = computed(() => {
    return [
        ...useTypography('vc-title', props.align, props.truncate, props.strong, props.italic, props.color),
        `vc-title--${props.level}`,
    ];
});

const titleStyle = useSizableStyle(() => props.size);

const defaultTag = computed(() => {
    if (props.component) return props.component
    return `h${props.level}`;
});
</script>

<template>
    <component :is="defaultTag" :class="titleClass" :style="titleStyle">
        <slot></slot>
    </component>
</template>