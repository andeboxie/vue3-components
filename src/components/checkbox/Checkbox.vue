<script setup lang="ts">
import type CheckboxProps from '@/components/checkbox/CheckboxProps';
import type CheckboxGroupContext from '@/components/checkbox/CheckboxGroupContext';
import type CheckboxEmits from '@/emits/CheckboxEmits';
import SizeStateEnum from '@/enums/SizeStateEnum';
import { useCheckEvent } from '@/composables/UseCheckEvent';
import { computed, inject } from 'vue';
import { checkboxGroupContextKey } from '@/keys/CheckboxGroupKey';
import { isNotEmpty } from '@/utils/function';



defineOptions({
    name: "VcCheckbox",
});

const props = withDefaults(defineProps<CheckboxProps>(), {
    modelValue: false,
    label: '',
    value: '',
    disabled: false,
    indeterminate: false,
    size: SizeStateEnum.Medium,
});

const emit = defineEmits<CheckboxEmits<boolean>>();

const { handleChange } = useCheckEvent(emit as (event: string, ...args: unknown[]) => void, props);

const checkboxClasses = computed(() => {
    return [
        'vc-checkbox',
        `vc-checkbox--${props.size}`,
        {
            'vc-checkbox--disabled': isDisabled.value,
            'vc-checkbox--indeterminate': props.indeterminate,
            'vc-checkbox--checked': isChecked.value,
        }
    ];
});

const  group = inject<CheckboxGroupContext | undefined>(checkboxGroupContextKey, undefined);

// 无 value 不参与 Group 收集，退回独立模式
const isInGroup = computed(() => !!group && isNotEmpty(props.value));

// 任一 disabled 即禁用（响应式）
const isDisabled = computed(() => props.disabled || !!group?.disabled.value);

// Group 模式 checked 由 Group 数组派生，独立模式用 modelValue
const isChecked = computed(() => isInGroup.value 
	? group!.modelValue.value.includes(props.value as string | number) 
	: props.modelValue); 

function onChange(e: Event) {
	if (isDisabled.value) {
		return;
	}
	if (isInGroup.value) {
		group!.toggle(props.value as string | number); // 切换 Group 数组
	} else {
		handleChange(e); // 触发 change 事件
	}
}
</script>

<template>
    <label :class="checkboxClasses">
        <input
         :class="['vc-checkbox__input']"
         type="checkbox" 
         :checked="isChecked" 
         :disabled="isDisabled"
         :value="value"
         :indeterminate="indeterminate" 
         @change="onChange" 
        />
        <span class="vc-checkbox__inner" aria-hidden="true"></span>
        <span v-if="$slots.default" class="vc-checkbox__default"><slot /></span>
        <span v-else-if="label" class="vc-checkbox__label">{{ label }}</span>
    </label>
</template>

<style lang="sass" scoped>

.vc-checkbox {
    // 行内块元素
    display: inline-flex;
    // 垂直居中
    align-items: center;
    // 水平间距
    gap: $spacing-sm;
    // 鼠标指针
    cursor: pointer;

    // 禁用状态
    &--disabled {
        // 禁用状态下的光标
        cursor: not-allowed;
        // 禁用状态下的透明度
        opacity: 0.6;
    }

    // 原生 input 视觉隐藏但保留聚焦与 Space 切换能力
    &__input {
			// 绝对定位
			position: absolute;
			// 宽度
			width: 1px;
			// 高度
			height: 1px;
			// 透明度
			opacity: 0;
			// 外边距
			margin: 0;
    }

		&__inner {
			// 宽度
			width: 16px;
			// 高度
			height: 16px;
			// 边框
			border: 1px solid $color-muted;
			// 圆角
			border-radius: $radius-sm;
			// 过渡
			transition: $transition-fast;
			// 相对定位
			position: relative;
			// 不压缩
			flex-shrink: 0;
		}

		// 定义公共的“激活/高亮”状态样式
		%checkbox-active-state {
			background: $color-primary;
			border-color: $color-primary;

			&::after {
				content: '';
      	position: absolute;
			}
		}

		// 选中态：兄弟选择器依赖 input 紧邻 inner
		&__input:checked + &__inner {
			@extend %checkbox-active-state; // 继承公共样式

			// 选中态下的伪元素
			&::after {
				left: 4px;
				top: 1px;
				width: 5px;
				height: 9px;
				border solid #fff
				border-width: 0 2px 2px 0;
				// 旋转 45 度
				transform: rotate(45deg);
			}
		}

		// 不确定态：原生 :indeterminate 伪类，横线
		&__input:indeterminate + &__inner {
			@extend %checkbox-active-state; // 继承公共样式

			&::after {
				left: 2px;
				top: 6px;
				width: 10px;
				height: 2px;
				background: #fff;
			}
		}
}

</style>