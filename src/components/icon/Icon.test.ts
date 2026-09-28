import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import VcIcon from './Icon.vue'

describe('VcIcon', () => {
    describe('渲染与 DOM', () => {
        // B-01 根元素为 <i> 标签，class 始终含 vc-icon
        it('T-01: 根元素为 I 标签且 class 含 vc-icon', () => {
            const wrapper = mount(VcIcon, {
                props: { name: 'check' },
            })
            expect(wrapper.element.tagName).toBe('I')
            expect(wrapper.classes()).toContain('vc-icon')
        })

        // B-02 ariaLabel 不传时，aria-hidden 为 'true'
        it('T-02: 不传 ariaLabel 时 aria-hidden 为 true', () => {
            const wrapper = mount(VcIcon, {
                props: { name: 'check' },
            })
            expect(wrapper.attributes('aria-hidden')).toBe('true')
        })

        // B-02 ariaLabel 有值时，设置 aria-label，不设 aria-hidden
        it('T-03: 传 ariaLabel 时设 aria-label 且无 aria-hidden', () => {
            const wrapper = mount(VcIcon, {
                props: { name: 'check', ariaLabel: '保存' },
            })
            expect(wrapper.attributes('aria-label')).toBe('保存')
            expect(wrapper.attributes('aria-hidden')).toBeUndefined()
        })

        // B-03 根元素内联 style 必含 font-size 与 color
        it('T-04: style 含 font-size 与 color', () => {
            const wrapper = mount(VcIcon, {
                props: { name: 'check' },
            })
            expect(wrapper.element.style.fontSize).not.toBe('')
            expect(wrapper.element.style.color).not.toBe('')
        })

        // B-04 内部渲染 svg 子节点，fill 为 currentColor
        it('T-05: 内部 svg 存在且 fill 为 currentColor', () => {
            const wrapper = mount(VcIcon, {
                props: { name: 'check' },
            })
            const svg = wrapper.find('svg')
            expect(svg.exists()).toBe(true)
            expect(svg.attributes('fill')).toBe('currentColor')
        })

        // B-05 spin=true 时根元素 class 含 vc-icon--spin
        it('T-06: spin=true 时 class 含 vc-icon--spin', () => {
            const wrapper = mount(VcIcon, {
                props: { name: 'check', spin: true },
            })
            expect(wrapper.classes()).toContain('vc-icon--spin')
        })
    })

    describe('图标加载', () => {
        // B-06 name 对应 SVG 存在时渲染对应内容
        it('T-07: name=check 时 svg 存在', () => {
            const wrapper = mount(VcIcon, {
                props: { name: 'check' },
            })
            expect(wrapper.find('svg').exists()).toBe(true)
        })

        // B-07 name 不存在对应 SVG 时渲染空 <i>，不报错
        it('T-08: name 不存在时无 svg 且不报错', () => {
            const wrapper = mount(VcIcon, {
                props: { name: 'not-exist' },
            })
            expect(wrapper.find('svg').exists()).toBe(false)
            expect(wrapper.element.tagName).toBe('I')
        })
    })

    describe('尺寸与颜色', () => {
        // B-08 size 为 number 16 时 style.font-size 为 '16px'
        it('T-09: size=16 时 font-size 为 16px', () => {
            const wrapper = mount(VcIcon, {
                props: { name: 'check', size: 16 },
            })
            expect(wrapper.element.style.fontSize).toBe('16px')
        })

        // B-09 size 为 string '2rem' 时 style.font-size 为 '2rem'
        it('T-10: size=2rem 时 font-size 为 2rem', () => {
            const wrapper = mount(VcIcon, {
                props: { name: 'check', size: '2rem' },
            })
            expect(wrapper.element.style.fontSize).toBe('2rem')
        })

        // B-10 color 为 'red' 时 style.color 为 'red'
        it('T-11: color=red 时 style.color 为 red', () => {
            const wrapper = mount(VcIcon, {
                props: { name: 'check', color: 'red' },
            })
            expect(wrapper.element.style.color).toBe('red')
        })

        // B-11 SVG 内部 fill 继承自父（fill="currentColor"）
        it('T-12: svg 的 fill 为 currentColor', () => {
            const wrapper = mount(VcIcon, {
                props: { name: 'check', color: 'red' },
            })
            expect(wrapper.find('svg').attributes('fill')).toBe('currentColor')
        })
    })

    describe('边界条件', () => {
        // E-03 name 为空字符串时渲染空 <i>，不报错
        it('T-14: name 为空字符串时不报错且根元素含 vc-icon', () => {
            const wrapper = mount(VcIcon, {
                props: { name: '' },
            })
            expect(wrapper.find('svg').exists()).toBe(false)
            expect(wrapper.classes()).toContain('vc-icon')
        })
    })
})
