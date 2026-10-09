// FormItem provide 给内部控件的上下文
import type { Ref } from 'vue';

export default interface FormItemContext {
    // 字段名，关联 model 与 rules 的 key
    name: string;
    // 控件 id，关联 label[for] 与 aria
    controlId: string;
    // 错误信息节点 id，关联 aria-describedby
    errorId: string;
    // 当前是否处于错误状态，控件据此设置 aria-invalid
    invalid: Ref<boolean>;
    // 控件值变化时上报
    setValue: (value: unknown) => void;
    // 控件 blur 时上报
    handleBlur: () => void;
    // 标记已触碰（首次提交后启用 change 实时校验）
    markChanged: () => void;
    // 是否禁用（来自 Form disabled）
    disabled: Ref<boolean>;
}
