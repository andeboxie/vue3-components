import type { InputType } from "@/enums/InputTypeEnum";
import type { SizeState } from "@/enums/SizeStateEnum";

export default interface InputProps {
    modelValue?: string;
    type?: InputType;
    placeholder?: string;
    disabled?: boolean;
    readonly?: boolean;
    clearable?: boolean;
    maxlength?: number;
    prefix?: string;
    suffix?: string;
    size?: SizeState;
}
