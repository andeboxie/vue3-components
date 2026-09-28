<script setup lang="ts">
import type ButtonProps from "@/components/button/ButtonProps";
import VisualStyleStateEnum from "@/enums/VisualStyleStateEnum";
import SizeStateEnum from "@/enums/SizeStateEnum";
import NativeTypeEnum from "@/enums/NativeTypeEnum";
import { computed } from "vue";

// 定义组件选项：用 defineOptions()
defineOptions({
  name: "VcButton",
});

// 定义 props：用 defineProps + TS 类型字面量
const props = withDefaults(defineProps<ButtonProps>(), {
  type: VisualStyleStateEnum.Default,
  size: SizeStateEnum.Medium,
  disabled: false,
  loading: false,
  nativeType: NativeTypeEnum.Button,
  block: false,
});

// 定义 emits：用 defineEmits<{ click: [e: MouseEvent] }>()
const emit = defineEmits<{ click: [e: MouseEvent] }>();
function handleClick(e: MouseEvent) {
  if (props.disabled || props.loading) {
    return;
  }
  emit('click', e);
}

// 计算按钮类名：用 computed()
const buttonClasses = computed(() => {
  return ['vc-button', `vc-button--${props.type}`, `vc-button--${props.size}`, ...(props.block ? ['vc-button--block'] : [])];
});


</script>

<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    :type="nativeType"
    :aria-busy="loading"
    @click="handleClick"
  >
    <span v-if="loading" class="vc-button__loading">
      <slot name="loading"></slot>
    </span>
    <slot></slot>
  </button>
</template>

