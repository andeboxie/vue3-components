import { computed, toValue, type ComputedRef, type CSSProperties, type MaybeRefOrGetter } from 'vue';

/**
 * 通用尺寸样式 composable
 * 将 size（number | string）与 color 转换为内联 style 对象
 * @param size - 图标尺寸，number 时按 px 处理，string 时原样作为 CSS 值
 * @param color - CSS color 值
 * @returns 包含 fontSize 与 color 的 computed style 对象
 */
export function useSizableStyle(
    size: MaybeRefOrGetter<number | string>,
    color: MaybeRefOrGetter<string>,
): ComputedRef<CSSProperties> {
    return computed(() => {
        const s = toValue(size);
        return {
            fontSize: typeof s === 'number' ? `${s}px` : s,
            color: toValue(color),
        };
    });
}
