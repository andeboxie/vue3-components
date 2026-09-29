import type BaseEmits from '@/emits/BaseEmits';

export default interface ButtonEmits<T> extends BaseEmits {
    // 点击事件，用于组件内部抛出点击信号
    click: [item: T];
}