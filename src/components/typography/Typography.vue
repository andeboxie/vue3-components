<script lang="ts">
import VcTypographyTitle from '@/components/typography/title/Title.vue';
import VcTypographyParagraph from '@/components/typography/paragraph/Paragraph.vue';
import VcTypographyText from '@/components/typography/text/Text.vue';

defineOptions({
    name: "VcTypography",
});



</script>

<template>
    <VcTypographyTitle>
        <slot name="title"></slot>
    </VcTypographyTitle>
    <VcTypographyParagraph>
        <slot name="paragraph"></slot>
    </VcTypographyParagraph>
    <VcTypographyText>
        <slot name="text"></slot>
    </VcTypographyText>

</template>