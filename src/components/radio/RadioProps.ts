import type { SizeState } from "@/enums/SizeStateEnum";

export default interface RadioProps {
    value?: string | number;
    label?: string;
    disabled?: boolean;
    size?: SizeState;
}
