import type { AlignState } from '@/enums/AlignStateEnum';
import type { TextColor } from '@/enums/TextColorEnum';

export default interface TypographyChildrenProps {
    component?: string;
    align?: AlignState;
    truncate?: boolean;
    strong?: boolean;
    italic?: boolean;
    color?: TextColor;
    size?: string | number;
}
