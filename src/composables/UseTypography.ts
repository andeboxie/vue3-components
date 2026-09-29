import AlignStateEnum from "@/enums/AlignStateEnum";
import TextColorEnum from "@/enums/TextColorEnum";
import type { AlignState } from "@/enums/AlignStateEnum";
import type { TextColor } from "@/enums/TextColorEnum";

const alignValues = Object.values(AlignStateEnum);
const colorValues = Object.values(TextColorEnum);

/**
 * 用于生成 Typography 组件的 class 名
 * @param prefix 组件前缀
 * @param align 对齐状态
 * @param truncate 是否截断
 * @param strong 是否加粗
 * @param italic 是否斜体
 * @param color 文字颜色
 * @returns class 名数组
 */
export function useTypography(
    prefix: string,
    align?: AlignState,
    truncate?: boolean,
    strong?: boolean,
    italic?: boolean,
    color?: TextColor,
) {
    return [
        prefix,
        // 仅当 align 为合法枚举值时才生成 class
        ...(align && alignValues.includes(align) ? [`${prefix}--${align}`] : []),
        ...(truncate ? [`${prefix}--truncate`] : []),
        ...(strong ? [`${prefix}--strong`] : []),
        ...(italic ? [`${prefix}--italic`] : []),
        // 仅当 color 为合法枚举值时才生成 class
        ...(color && colorValues.includes(color) ? [`${prefix}--${color}`] : []),
    ];
}