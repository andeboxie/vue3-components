import type { SizeState } from "@/enums/SizeStateEnum";
import type SelectOptionProps from "./option/SelectOptionProps";

export default interface SelectProps {
    modelValue?: string | number;
    options?: SelectOptionProps[];
    placeholder?: string;
    disabled?: boolean;
    clearable?: boolean;
    size?: SizeState
}