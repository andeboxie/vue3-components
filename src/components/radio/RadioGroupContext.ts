import type { DirectionState } from '@/enums/DirectionStateEnum';
import type { Ref } from 'vue';

export default interface RadioGroupContext {

    modelValue?: Ref<string | number>;

    disabled?: Ref<boolean>;

    direction?: Ref<DirectionState>;

    // 同组 input 共享的 name 属性，用于键盘方向键原生互斥（A-01 / A-02）
    name?: Ref<string>;

    toggle?: (value: string | number) => void;
}