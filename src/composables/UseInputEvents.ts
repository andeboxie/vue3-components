import { getInputValue, getValue } from '@/utils/Event';

interface InputProps {
    disabled?: boolean;
    readonly?: boolean;
}

// 抽取 Input/Textarea 共享的 5 个事件 handler 
// emit 类型用泛型约束事件名，载荷由调用处保证为 string
export function useInputEvents(
    emit: (event: string, ...args: unknown[]) => void,
    props: InputProps
) {
    function handleUpdateValue(value: string) {
        emit('update:modelValue', value);
    }

    function handleInput(e: InputEvent) {
        if (props.disabled || props.readonly) {
            return;
        }
        handleUpdateValue(getInputValue(e));
    }

    function handleBlur(e: FocusEvent) {
        if (props.disabled) {
            return;
        }
        emit('blur', e);
    }

    function handleFocus(e: FocusEvent) {
        if (props.disabled) {
            return;
        }
        emit('focus', e);
    }

    function handleClear(e: FocusEvent) {
        if (props.disabled || props.readonly) {
            return;
        }
        handleUpdateValue('');
        emit('clear', e);
    }

    function handleChange(e: Event) {
        if (props.disabled || props.readonly) {
            return;
        }
        emit('change', getValue(e));
    }
    return {
        handleUpdateValue,
        handleInput,
        handleBlur,
        handleFocus,
        handleClear,
        handleChange,
    };
}
