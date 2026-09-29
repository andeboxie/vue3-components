import type { ParagraphLevel } from '@/enums/ParagraphLevelEnum';
import type TypographyChildrenProps from '@/components/typography/TypographyChildrenProps';

export default interface ParagraphProps extends TypographyChildrenProps {
    level?: ParagraphLevel;
}