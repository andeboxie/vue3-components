import type { AlignState } from '@/enums/AlignStateEnum';
import type { TextColor } from '@/enums/TextColorEnum';
import type { Component } from 'vue';

export default interface TypographyChildrenProps {
    component?: string | Component;
    align?: AlignState;
    truncate?: boolean;
    strong?: boolean;
    italic?: boolean;
    color?: TextColor;
    size?: string | number;
}
