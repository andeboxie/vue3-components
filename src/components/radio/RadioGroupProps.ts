import type { DirectionState } from '@/enums/DirectionStateEnum';

export default interface RadioGroupProps {

    modelValue?: string | number;

    disabled?: boolean;

    direction?: DirectionState;
}