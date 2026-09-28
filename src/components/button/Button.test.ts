import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import VcButton from './Button.vue'
import VisualStyleStateEnum from '@/enums/VisualStyleStateEnum'
import SizeStateEnum from '@/enums/SizeStateEnum'
import NativeTypeEnum from '@/enums/NativeTypeEnum'

describe('VcButton', () => {
    describe('Props', () => {
        // B-01 根元素始终含 vc-button
        it('T-01: 根元素含 vc-button', () => {
            const wrapper = mount(VcButton)
            expect(wrapper.classes()).toContain('vc-button');
        });
        // B-02 type=primary 时映射 vc-button--primary（BEM 双横线）
        it('T-02: type=primary 时类名含 vc-button--primary', () => {
            const wrapper = mount(VcButton, {
                props: {
                    type: VisualStyleStateEnum.Primary,
                }
            })
            expect(wrapper.classes()).toContain('vc-button--primary');
        });
        // B-02 不传 type 时默认 default，同样带 vc-button--default
        it('T-03: 不传 type 默认含 vc-button--default', () => {
            const wrapper = mount(VcButton)
            expect(wrapper.classes()).toContain('vc-button--default');
        });
        // B-03 size=small 时映射 vc-button--small
        it('T-04: size=small 时类名含 vc-button--small', () => {
            const wrapper = mount(VcButton, {
                props: {
                    size: SizeStateEnum.Small,
                }
            })
            expect(wrapper.classes()).toContain('vc-button--small');
        });
        // B-03 不传 size 时默认 medium
        it('T-05: 不传 size 默认含 vc-button--medium', () => {
            const wrapper = mount(VcButton)
            expect(wrapper.classes()).toContain('vc-button--medium');
        });
        // B-04 block=true 时映射 vc-button--block
        it('T-06: block=true 时类名含 vc-button--block', () => {
            const wrapper = mount(VcButton, {
                props: {
                    block: true,
                }
            })
            expect(wrapper.classes()).toContain('vc-button--block');
        });
        // B-05 根元素必须是原生 <button>，用 tagName 而不是 classes
        it('T-07: 根元素标签为 BUTTON', () => {
            const wrapper = mount(VcButton)
            expect(wrapper.element.tagName).toBe('BUTTON');
        });
        // B-06 nativeType 透传给原生 <button> 的 type 属性
        it('T-08: nativeType=submit 时 type 属性为 submit', () => {
            const wrapper = mount(VcButton, {
                props: {
                    nativeType: NativeTypeEnum.Submit,
                }
            })
            expect(wrapper.attributes('type')).toBe('submit');
        });
        // B-07 default slot 内容渲染为按钮内部子节点，slots 与 props 是两个不同参数
        it('T-09: default slot 文本为 点我', () => {
            const wrapper = mount(VcButton, {
                slots: {
                    default: '点我',
                }
            })
            expect(wrapper.text()).toBe('点我');
        });
        // B-08 loading=true 时按钮内部出现 vc-button__loading 节点
        it('T-10: loading=true 时存在 vc-button__loading 节点', () => {
            const wrapper = mount(VcButton, {
                props: {
                    loading: true,
                }
            })
            expect(wrapper.find('.vc-button__loading').exists()).toBe(true);
        });
        // B-09 disabled=true 时原生禁用，点击不触发 click 事件
        it('T-11: disabled=true 时点击不触发 click', async () => {
            const wrapper = mount(VcButton, {
                props: {
                    disabled: true,
                }
            })
            await wrapper.trigger('click')
            expect(wrapper.emitted('click') ?? []).toHaveLength(0);
        });
        // B-09 disabled=true 时根元素带原生 disabled 属性
        it('T-12: disabled=true 时根元素 disabled 属性存在', () => {
            const wrapper = mount(VcButton, {
                props: {
                    disabled: true,
                }
            })
            expect(wrapper.attributes('disabled')).toBeDefined();
        });
        // B-10 loading=true 等价禁用，点击不触发 click
        it('T-13: loading=true 时点击不触发 click', async () => {
            const wrapper = mount(VcButton, {
                props: {
                    loading: true,
                }
            })
            await wrapper.trigger('click')
            expect(wrapper.emitted('click') ?? []).toHaveLength(0);
        });
        // B-11 正常状态点击触发一次 click，载荷为 MouseEvent
        it('T-14: 正常点击触发一次 click 且载荷为 MouseEvent', async () => {
            const wrapper = mount(VcButton)
            await wrapper.trigger('click')
            const emitted = wrapper.emitted('click')
            expect(emitted).toHaveLength(1);
            expect(emitted![0][0]).toBeInstanceOf(MouseEvent);
        });
        // B-12 disabled 与 loading 同时为 true，以 disabled 优先，不触发 click
        it('T-15: disabled 与 loading 同时为 true 时点击不触发 click', async () => {
            const wrapper = mount(VcButton, {
                props: {
                    disabled: true,
                    loading: true,
                }
            })
            await wrapper.trigger('click')
            expect(wrapper.emitted('click') ?? []).toHaveLength(0);
        });
        // B-13 提供 loading slot 时，替换默认加载图标内容
        it('T-16: 提供 loading slot 时显示自定义内容', () => {
            const wrapper = mount(VcButton, {
                props: {
                    loading: true,
                },
                slots: {
                    loading: '⟳',
                }
            })
            expect(wrapper.find('.vc-button__loading').text()).toContain('⟳');
        });
        // B-14 不传 default slot 时按钮内部为空且不报错
        it('T-17: 不传 default slot 时按钮文本为空', () => {
            const wrapper = mount(VcButton)
            expect(wrapper.text()).toBe('');
        });
        // A-03 loading=true 时根元素带 aria-busy="true"
        it('T-18: loading=true 时 aria-busy 为 true', () => {
            const wrapper = mount(VcButton, {
                props: {
                    loading: true,
                }
            })
            expect(wrapper.attributes('aria-busy')).toBe('true');
        });
    })
})
