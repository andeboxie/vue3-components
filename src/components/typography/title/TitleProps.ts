import type TypographyChildrenProps from '@/components/typography/TypographyChildrenProps';
import type { TitleLevel } from '@/enums/TitleLevelEnum';

export default interface TitleProps extends TypographyChildrenProps {
    level: TitleLevel;
}