import { getCheckedValue } from '@/utils/Event';

interface CheckProps {
    disabled?: boolean;
}

export function useCheckEvent(
    emit: (event: string, ...args: unknown[]) => void,
    props: CheckProps
) {
    function handleChange(e: Event) {
        if (props.disabled) {
            return;
        }
        const value = getCheckedValue(e);
        emit('update:modelValue', value);
        emit('change', value);
    }
    return {
        handleChange,
    };
}
