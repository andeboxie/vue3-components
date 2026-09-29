<script setup lang="ts">
import type ParagraphProps from '@/components/typography/paragraph/ParagraphProps';
import ParagraphLevelEnum from '@/enums/ParagraphLevelEnum';
import AlignStateEnum from '@/enums/AlignStateEnum';
import TextColorEnum from '@/enums/TextColorEnum';
import { computed } from 'vue';
import { useTypography } from '@/composables/UseTypography';
import { useSizableStyle } from '@/composables/UseSizableStyle';

defineOptions({
    name: "VcTypographyParagraph",
});

const props = withDefaults(defineProps<ParagraphProps>(), {
    level: ParagraphLevelEnum.BODY,
    component: 'p',
    align: AlignStateEnum.LEFT,
    truncate: false,
    strong: false,
    italic: false,
    color: TextColorEnum.DEFAULT,
    size: '1em',
});

const paragraphClass = computed(() => {
    return [
        ...useTypography('vc-paragraph', props.align, props.truncate, props.strong, props.italic, props.color),
        `vc-paragraph--${props.level}`,
    ];
});

const paragraphStyle = useSizableStyle(() => props.size);

const defaultTag = computed(() => {
    if (props.component) return props.component
    return props.level;
});
</script>

<template>
    <component :is="defaultTag" :class="paragraphClass" :style="paragraphStyle">
        <slot></slot>
    </component>
</template>