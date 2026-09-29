<script lang="ts" setup>
import type IconProps from "@/components/icon/IconProps";
import { computed } from "vue";
import { useIcon } from "@/components/icon/UseIcon";
import { useSizableStyle } from "@/composables/UseSizableStyle";
import SvgModeStateEnum from "@/enums/SvgModeStateEnum";



defineOptions({
  name: "VcIcon",
});

const props = withDefaults(defineProps<IconProps>(), {
  size: '1em',
  color: 'currentColor',
  spin: false,
  ariaLabel: undefined,
  mode: SvgModeStateEnum.SINGLE,
});

const iconClasses = computed(() => {
    return ['vc-icon', ...(props.spin ? ['vc-icon--spin'] : [])];
});

// 使用通用 composable 计算 size/color 样式
const iconStyle = useSizableStyle(() => props.size, () => props.color);

const iconAttrs = computed(() => {
    return {
        'aria-label': props.ariaLabel !== undefined ? props.ariaLabel : undefined,
        'aria-hidden': props.ariaLabel !== undefined ? undefined : true,
    }
});


const svgContent = computed(() => {
    return useIcon(props.name);
}); // 4. 类型断言：TS 中明确 modules 的值是字符串类型

</script>

<template>
    <i 
     :class="iconClasses"
     :style="iconStyle"
     v-bind="iconAttrs"
     v-html="svgContent || ''"
    >
    </i>
</template>