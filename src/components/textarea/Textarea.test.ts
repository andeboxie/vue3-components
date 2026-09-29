import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import VcTextarea from './Textarea.vue'

describe('VcTextarea', () => {
    // 渲染
    // B-01 根元素含 vc-textarea，内部渲染原生 textarea
    it('T-01: 根元素含 vc-textarea 且有 textarea', () => {
        const wrapper = mount(VcTextarea)
        expect(wrapper.classes()).toContain('vc-textarea')
        expect(wrapper.find('textarea').exists()).toBe(true)
    })

    // B-02 placeholder 透传
    it('T-02: placeholder 透传给 textarea', () => {
        const wrapper = mount(VcTextarea, {
            props: { placeholder: '描述' },
        })
        expect(wrapper.find('textarea').attributes('placeholder')).toBe('描述')
    })

    // B-03 disabled 透传
    it('T-03: disabled=true 时 textarea disabled 属性存在', () => {
        const wrapper = mount(VcTextarea, {
            props: { disabled: true },
        })
        expect(wrapper.find('textarea').attributes('disabled')).toBeDefined()
    })

    // B-04 rows 透传
    it('T-04: rows=5 时 textarea rows 为 5', () => {
        const wrapper = mount(VcTextarea, {
            props: { rows: 5 },
        })
        expect(wrapper.find('textarea').attributes('rows')).toBe('5')
    })

    // v-model
    // B-05 modelValue 含换行时 textarea 值一致
    it('T-05: modelValue=a\\nb 时 textarea 值为 a\\nb', () => {
        const wrapper = mount(VcTextarea, {
            props: { modelValue: 'a\nb' },
        })
        expect((wrapper.find('textarea').element as HTMLTextAreaElement).value).toBe('a\nb')
    })

    // B-06 输入触发 update:modelValue
    it('T-06: 输入 hi 时触发 update:modelValue 载荷 hi', async () => {
        const wrapper = mount(VcTextarea)
        const ta = wrapper.find('textarea')
        await ta.setValue('hi')
        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toHaveLength(1)
        expect(emitted![0][0]).toBe('hi')
    })

    // B-07 readonly 时输入不触发 update:modelValue
    it('T-07: readonly 时输入不触发 update:modelValue', async () => {
        const wrapper = mount(VcTextarea, {
            props: { readonly: true },
        })
        const ta = wrapper.find('textarea')
        await ta.setValue('hi')
        expect(wrapper.emitted('update:modelValue') ?? []).toHaveLength(0)
    })

    // 清空
    // B-08 clearable 且值非空时显示清空按钮
    it('T-08: clearable+modelValue 非空时存在 vc-textarea__clear', () => {
        const wrapper = mount(VcTextarea, {
            props: { clearable: true, modelValue: 'x' },
        })
        expect(wrapper.find('.vc-textarea__clear').exists()).toBe(true)
    })

    // B-09 点击清空按钮触发 update 空串 和 clear 事件
    it('T-09: 点击清空按钮触发 update 空串 和 clear 事件', async () => {
        const wrapper = mount(VcTextarea, {
            props: { clearable: true, modelValue: 'x' },
        })
        await wrapper.find('.vc-textarea__clear').trigger('click')
        const updateEmitted = wrapper.emitted('update:modelValue')
        expect(updateEmitted).toHaveLength(1)
        expect(updateEmitted![0][0]).toBe('')
        expect(wrapper.emitted('clear')).toHaveLength(1)
    })

    // autosize（B-10 ~ B-12）：jsdom 不做真实布局（scrollHeight 恒为 0），
    // 且自适应高度的 JS 逻辑尚未实现，这三条暂 skip，
    // 留待实现完成 + 真实浏览器/e2e 环境再补
    it.skip('T-10: autosize=true 内容增加时高度增长（B-10）', () => { })
    it.skip('T-11: autosize={maxRows:5} 超过 5 行不再增长（B-11）', () => { })
    it.skip('T-12: autosize={minRows:2} 初始不小于 2 行（B-12）', () => { })

    // 尺寸与焦点
    // B-13 size 映射为 class
    it('T-13: size=small 时根 class 含 vc-textarea--small', () => {
        const wrapper = mount(VcTextarea, {
            props: { size: 'small' },
        })
        expect(wrapper.classes()).toContain('vc-textarea--small')
    })

    // B-14 focus / blur 触发对应事件
    it('T-14: 触发 focus 和 blur 有对应事件', async () => {
        const wrapper = mount(VcTextarea)
        const ta = wrapper.find('textarea')
        await ta.trigger('focus')
        expect(wrapper.emitted('focus')).toHaveLength(1)
        await ta.trigger('blur')
        expect(wrapper.emitted('blur')).toHaveLength(1)
    })

    // B-15 失焦且值变化时触发 change
    it('T-15: 改值后 blur 触发 change 载荷为新值', async () => {
        const wrapper = mount(VcTextarea, {
            props: { modelValue: 'a' },
        })
        const ta = wrapper.find('textarea')
        await ta.setValue('b')
        await ta.trigger('blur')
        const emitted = wrapper.emitted('change')
        expect(emitted).toHaveLength(1)
        expect(emitted![0][0]).toBe('b')
    })

    // 边界
    // E-02 clearable + readonly 时不显示清空按钮
    it('T-16: clearable+readonly 时不显示清空按钮', () => {
        const wrapper = mount(VcTextarea, {
            props: { clearable: true, readonly: true, modelValue: 'x' },
        })
        expect(wrapper.find('.vc-textarea__clear').exists()).toBe(false)
    })

    // E-03 rows<1 视为 1
    it('T-17: rows=0 时 textarea rows 为 1', () => {
        const wrapper = mount(VcTextarea, {
            props: { rows: 0 },
        })
        expect(wrapper.find('textarea').attributes('rows')).toBe('1')
    })

    // A-02 清空按钮 aria-label
    it('T-18: 清空按钮 aria-label 为 清空', () => {
        const wrapper = mount(VcTextarea, {
            props: { clearable: true, modelValue: 'x' },
        })
        expect(wrapper.find('.vc-textarea__clear').attributes('aria-label')).toBe('清空')
    })

    // autosize=false 时 style.height 为空（验证关闭逻辑不污染内联样式）
    it('T-19: autosize=false 时 textarea style.height 为空', () => {
        const wrapper = mount(VcTextarea)
        expect((wrapper.find('textarea').element as HTMLTextAreaElement).style.height).toBe('')
    })
})
