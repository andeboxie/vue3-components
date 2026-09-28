import type { VisualStyleState } from "@/enums/VisualStyleStateEnum";
import type { SizeState } from "@/enums/SizeStateEnum";
import type { NativeType } from "@/enums/NativeTypeEnum";

export default interface ButtonProps {
    type?: VisualStyleState;
    size?: SizeState;
    disabled?: boolean;
    loading?: boolean;
    nativeType?: NativeType;
    block?: boolean;
}

