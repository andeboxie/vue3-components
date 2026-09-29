import { computed } from 'vue';
import type { SizeState } from '@/enums/SizeStateEnum';


export function useFormControl(
    prefix: string,
    size: SizeState,
) {
    return computed(() => {
        return [`${prefix}`, `${prefix}--${size}`];
    });
}
