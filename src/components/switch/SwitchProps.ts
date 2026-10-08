import type { SizeState } from "@/enums/SizeStateEnum";

export default interface SwitchProps {
    modelValue?: boolean;
    disabled?: boolean;
    loading?: boolean;
    activeText?: string;
    inactiveText?: string;
    size?: SizeState;
}