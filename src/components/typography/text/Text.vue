<script setup lang="ts">
import type TextProps from '@/components/typography/text/TextProps';
import TextLevelEnum from '@/enums/TextLevelEnum';
import AlignStateEnum from '@/enums/AlignStateEnum';
import TextColorEnum from '@/enums/TextColorEnum';
import { computed } from 'vue';
import { useTypography } from '@/composables/UseTypography';
import { useSizableStyle } from '@/composables/UseSizableStyle';

defineOptions({
    name: "VcTypographyText",
});

const props = withDefaults(defineProps<TextProps>(), {
    level: TextLevelEnum.BODY,
    component: 'span',
    align: AlignStateEnum.LEFT,
    truncate: false,
    strong: false,
    italic: false,
    color: TextColorEnum.DEFAULT,
    size: '1em',
});

const textClass = computed(() => {
    return [
        ...useTypography('vc-text', props.align, props.truncate, props.strong, props.italic, props.color),
        `vc-text--${props.level}`,
    ];
});

const textStyle = useSizableStyle(() => props.size);

const defaultTag = computed(() => {
    if (props.component) return props.component
    return props.level;
});
</script>

<template>
    <component :is="defaultTag" :class="textClass" :style="textStyle">
        <slot></slot>
    </component>
</template>