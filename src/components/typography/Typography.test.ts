import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import VcTitle from './title/Title.vue'
import VcText from './text/Text.vue'
import VcParagraph from './paragraph/Paragraph.vue'

describe('VcTypography', () => {
    describe('VcTitle', () => {
        // B-01 默认渲染 <h1>，class 含 vc-title 与 vc-title--1
        it('T-01: 默认渲染 H1 且 class 含 vc-title vc-title--1', () => {
            const wrapper = mount(VcTitle)
            expect(wrapper.element.tagName).toBe('H1')
            expect(wrapper.classes()).toContain('vc-title')
            expect(wrapper.classes()).toContain('vc-title--1')
        })

        // B-02 level=3 时渲染 <h3>，class 含 vc-title--3
        it('T-02: level=3 时渲染 H3 且 class 含 vc-title--3', () => {
            const wrapper = mount(VcTitle, {
                props: { level: 3 },
            })
            expect(wrapper.element.tagName).toBe('H3')
            expect(wrapper.classes()).toContain('vc-title--3')
        })

        // B-05 component='div' 时根元素为 DIV，class 仍含 vc-title--1
        it('T-03: component=div 时渲染 DIV 且 class 含 vc-title--1', () => {
            const wrapper = mount(VcTitle, {
                props: { component: 'div' },
            })
            expect(wrapper.element.tagName).toBe('DIV')
            expect(wrapper.classes()).toContain('vc-title--1')
        })

        // B-07 align=center 时 class 含 vc-title--center
        it('T-04: align=center 时 class 含 vc-title--center', () => {
            const wrapper = mount(VcTitle, {
                props: { align: 'center' },
            })
            expect(wrapper.classes()).toContain('vc-title--center')
        })

        // B-08 truncate=true 时 class 含 vc-title--truncate
        it('T-05: truncate=true 时 class 含 vc-title--truncate', () => {
            const wrapper = mount(VcTitle, {
                props: { truncate: true },
            })
            expect(wrapper.classes()).toContain('vc-title--truncate')
        })

        // B-09 strong=true 时 class 含 vc-title--strong
        it('T-06: strong=true 时 class 含 vc-title--strong', () => {
            const wrapper = mount(VcTitle, {
                props: { strong: true },
            })
            expect(wrapper.classes()).toContain('vc-title--strong')
        })

        // B-11 color=primary 时 class 含 vc-title--primary
        it('T-07: color=primary 时 class 含 vc-title--primary', () => {
            const wrapper = mount(VcTitle, {
                props: { color: 'primary' },
            })
            expect(wrapper.classes()).toContain('vc-title--primary')
        })

        // B-12 default slot 内容渲染为根元素子节点
        it('T-08: default slot 文本渲染', () => {
            const wrapper = mount(VcTitle, {
                slots: { default: 'Hello' },
            })
            expect(wrapper.text()).toContain('Hello')
        })

        // B-13 slot 为空时根元素内部为空
        it('T-09: 不传 slot 时文本为空', () => {
            const wrapper = mount(VcTitle)
            expect(wrapper.text()).toBe('')
        })
    })

    describe('VcText', () => {
        // B-03 默认渲染 <span>，class 含 vc-text 与 vc-text--body
        it('T-10: 默认渲染 SPAN 且 class 含 vc-text vc-text--body', () => {
            const wrapper = mount(VcText)
            expect(wrapper.element.tagName).toBe('SPAN')
            expect(wrapper.classes()).toContain('vc-text')
            expect(wrapper.classes()).toContain('vc-text--body')
        })

        // B-03 level='caption' 时 class 含 vc-text--caption
        it('T-11: level=caption 时 class 含 vc-text--caption', () => {
            const wrapper = mount(VcText, {
                props: { level: 'caption' },
            })
            expect(wrapper.classes()).toContain('vc-text--caption')
        })

        // B-10 italic=true 时 class 含 vc-text--italic
        it('T-12: italic=true 时 class 含 vc-text--italic', () => {
            const wrapper = mount(VcText, {
                props: { italic: true },
            })
            expect(wrapper.classes()).toContain('vc-text--italic')
        })

        // B-05 component='div' 时根元素为 DIV，class 含 vc-text--body
        it('T-13: component=div 时渲染 DIV 且 class 含 vc-text--body', () => {
            const wrapper = mount(VcText, {
                props: { component: 'div' },
            })
            expect(wrapper.element.tagName).toBe('DIV')
            expect(wrapper.classes()).toContain('vc-text--body')
        })
    })

    describe('VcParagraph', () => {
        // B-04 默认渲染 <p>，class 含 vc-paragraph 与 vc-paragraph--body
        it('T-14: 默认渲染 P 且 class 含 vc-paragraph vc-paragraph--body', () => {
            const wrapper = mount(VcParagraph)
            expect(wrapper.element.tagName).toBe('P')
            expect(wrapper.classes()).toContain('vc-paragraph')
            expect(wrapper.classes()).toContain('vc-paragraph--body')
        })

        // B-04 level='lead' 时 class 含 vc-paragraph--lead
        it('T-15: level=lead 时 class 含 vc-paragraph--lead', () => {
            const wrapper = mount(VcParagraph, {
                props: { level: 'lead' },
            })
            expect(wrapper.classes()).toContain('vc-paragraph--lead')
        })

        // B-07 align='right' 时 class 含 vc-paragraph--right
        it('T-16: align=right 时 class 含 vc-paragraph--right', () => {
            const wrapper = mount(VcParagraph, {
                props: { align: 'right' },
            })
            expect(wrapper.classes()).toContain('vc-paragraph--right')
        })
    })

    describe('共性与边界', () => {
        // B-14 三个组件修饰符 class 前缀正确
        it('T-17: 三个组件修饰符 class 前缀正确', () => {
            const opts = { strong: true, italic: true, color: 'danger' as const }
            const title = mount(VcTitle, { props: opts })
            const text = mount(VcText, { props: opts })
            const para = mount(VcParagraph, { props: opts })

            expect(title.classes()).toContain('vc-title--strong')
            expect(title.classes()).toContain('vc-title--italic')
            expect(title.classes()).toContain('vc-title--danger')

            expect(text.classes()).toContain('vc-text--strong')
            expect(text.classes()).toContain('vc-text--italic')
            expect(text.classes()).toContain('vc-text--danger')

            expect(para.classes()).toContain('vc-paragraph--strong')
            expect(para.classes()).toContain('vc-paragraph--italic')
            expect(para.classes()).toContain('vc-paragraph--danger')
        })

        // E-03 align 传非法值时不加对应 class，不报错
        it('T-18: align 传非法值时不加 vc-title--xxx', () => {
            const wrapper = mount(VcTitle, {
                props: { align: 'xxx' as any },
            })
            expect(wrapper.classes()).not.toContain('vc-title--xxx')
        })

        // E-04 color 传非法值时不加对应 class，不报错
        it('T-19: color 传非法值时不加 vc-text--xxx', () => {
            const wrapper = mount(VcText, {
                props: { color: 'xxx' as any },
            })
            expect(wrapper.classes()).not.toContain('vc-text--xxx')
        })

        // A-01 level=4 时渲染 H4（不能是 div role=heading）
        it('T-20: level=4 时渲染 H4', () => {
            const wrapper = mount(VcTitle, {
                props: { level: 4 },
            })
            expect(wrapper.element.tagName).toBe('H4')
        })
    })
})
