import type { SizeState } from "@/enums/SizeStateEnum";
import type AutosizeProps from "@/components/textarea/AutosizeProps";

export default interface TextareaProps {
    modelValue?: string;
    placeholder?: string;
    disabled?: boolean;
    readonly?: boolean;
    clearable?: boolean;
    maxlength?: number;
    rows?: number;
    autosize?: boolean | AutosizeProps;
    size?: SizeState;
}