import type TypographyChildrenProps from '@/components/typography/TypographyChildrenProps';

import type { TextLevel } from '@/enums/TextLevelEnum';

export default interface TextProps extends TypographyChildrenProps {
    level?: TextLevel;
}