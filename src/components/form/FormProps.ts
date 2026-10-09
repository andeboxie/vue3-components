import type { LabelPosition } from '@/enums/LabelPositionEnum';
import type FormRule from '@/components/form/FormRule';

export default interface FormProps {
    model: Record<string, unknown>;
    rules: Record<string, FormRule[]>;
    labelWidth?: string;
    labelPosition?: LabelPosition;
    inline?: boolean;
    disabled?: boolean;
}