import type { SizeState } from "@/enums/SizeStateEnum";

export default interface CheckboxProps {
    modelValue?: boolean;
    label?: string;
    value?: string | number;
    disabled?: boolean;
    indeterminate?: boolean;
    size?: SizeState;
}
