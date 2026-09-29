import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import VcInput from './Input.vue'

describe('VcInput', () => {
    // 渲染与 DOM
    // B-01 根元素含 vc-input，内部渲染原生 input
    it('T-01: 根元素含 vc-input 且内部有 input', () => {
        const wrapper = mount(VcInput)
        expect(wrapper.classes()).toContain('vc-input')
        expect(wrapper.find('input').exists()).toBe(true)
    })

    // B-02 type 透传给原生 input 的 type 属性
    it('T-02: type=password 时 input type 为 password', () => {
        const wrapper = mount(VcInput, {
            props: { type: 'password' },
        })
        expect(wrapper.find('input').attributes('type')).toBe('password')
    })

    // B-03 placeholder 透传
    it('T-03: placeholder 透传给 input', () => {
        const wrapper = mount(VcInput, {
            props: { placeholder: '请输入' },
        })
        expect(wrapper.find('input').attributes('placeholder')).toBe('请输入')
    })

    // B-04 disabled=true 时原生 disabled
    it('T-04: disabled=true 时 input disabled 属性存在', () => {
        const wrapper = mount(VcInput, {
            props: { disabled: true },
        })
        expect(wrapper.find('input').attributes('disabled')).toBeDefined()
    })

    // B-05 readonly=true 时原生 readonly
    it('T-05: readonly=true 时 input readonly 属性存在', () => {
        const wrapper = mount(VcInput, {
            props: { readonly: true },
        })
        expect(wrapper.find('input').attributes('readonly')).toBeDefined()
    })

    // B-06 maxlength 透传
    it('T-06: maxlength=10 时 input maxlength 为 10', () => {
        const wrapper = mount(VcInput, {
            props: { maxlength: 10 },
        })
        expect(wrapper.find('input').attributes('maxlength')).toBe('10')
    })

    // v-model
    // B-07 modelValue 同步到 input value
    it('T-07: modelValue=hello 时 input value 为 hello', () => {
        const wrapper = mount(VcInput, {
            props: { modelValue: 'hello' },
        })
        expect((wrapper.find('input').element as HTMLInputElement).value).toBe('hello')
    })

    // B-08 输入时触发 update:modelValue
    it('T-08: 输入 hi 时触发 update:modelValue 载荷 hi', async () => {
        const wrapper = mount(VcInput)
        const input = wrapper.find('input')
        await input.setValue('hi')
        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toHaveLength(1)
        expect(emitted![0][0]).toBe('hi')
    })

    // B-09 disabled 时输入不触发 update:modelValue
    it('T-09: disabled 时输入不触发 update:modelValue', async () => {
        const wrapper = mount(VcInput, {
            props: { disabled: true },
        })
        const input = wrapper.find('input')
        await input.setValue('hi')
        expect(wrapper.emitted('update:modelValue') ?? []).toHaveLength(0)
    })

    // 清空
    // B-10 clearable 且 modelValue 非空时显示清空按钮
    it('T-10: clearable+modelValue 非空时存在 vc-input__clear', () => {
        const wrapper = mount(VcInput, {
            props: { clearable: true, modelValue: 'x' },
        })
        expect(wrapper.find('.vc-input__clear').exists()).toBe(true)
    })

    // B-11 clearable 且 modelValue 为空时不显示清空按钮
    it('T-11: clearable+modelValue 为空时不显示清空按钮', () => {
        const wrapper = mount(VcInput, {
            props: { clearable: true, modelValue: '' },
        })
        expect(wrapper.find('.vc-input__clear').exists()).toBe(false)
    })

    // B-12 点击清空按钮触发 update 空串 与 clear 事件
    it('T-12: 点击清空按钮触发 update 空串 和 clear 事件', async () => {
        const wrapper = mount(VcInput, {
            props: { clearable: true, modelValue: 'x' },
        })
        await wrapper.find('.vc-input__clear').trigger('click')
        const updateEmitted = wrapper.emitted('update:modelValue')
        expect(updateEmitted).toHaveLength(1)
        expect(updateEmitted![0][0]).toBe('')
        expect(wrapper.emitted('clear')).toHaveLength(1)
    })

    // 前后置
    // B-13 prefix prop 有值时渲染 vc-input__prefix
    it('T-13: prefix prop 有值时存在 vc-input__prefix 且文本含 $', () => {
        const wrapper = mount(VcInput, {
            props: { prefix: '$' },
        })
        const prefix = wrapper.find('.vc-input__prefix')
        expect(prefix.exists()).toBe(true)
        expect(prefix.text()).toContain('$')
    })

    // B-14 suffix prop 有值时渲染 vc-input__suffix
    it('T-14: suffix prop 有值时存在 vc-input__suffix 且文本含 元', () => {
        const wrapper = mount(VcInput, {
            props: { suffix: '元' },
        })
        const suffix = wrapper.find('.vc-input__suffix')
        expect(suffix.exists()).toBe(true)
        expect(suffix.text()).toContain('元')
    })

    // B-15 prefix slot 覆盖 prefix prop
    it('T-15: prefix slot 覆盖 prefix prop', () => {
        const wrapper = mount(VcInput, {
            props: { prefix: '$' },
            slots: { prefix: '<span>icon</span>' },
        })
        const prefix = wrapper.find('.vc-input__prefix')
        expect(prefix.text()).toContain('icon')
        expect(prefix.text()).not.toContain('$')
    })

    // 尺寸
    // B-16 size=small 时根 class 含 vc-input--small
    it('T-16: size=small 时根 class 含 vc-input--small', () => {
        const wrapper = mount(VcInput, {
            props: { size: 'small' },
        })
        expect(wrapper.classes()).toContain('vc-input--small')
    })

    // B-17 size=large 时根 class 含 vc-input--large
    it('T-17: size=large 时根 class 含 vc-input--large', () => {
        const wrapper = mount(VcInput, {
            props: { size: 'large' },
        })
        expect(wrapper.classes()).toContain('vc-input--large')
    })

    // 焦点
    // B-18 聚焦时触发 focus 事件
    it('T-18: 聚焦时触发 focus 事件', async () => {
        const wrapper = mount(VcInput)
        await wrapper.find('input').trigger('focus')
        expect(wrapper.emitted('focus')).toHaveLength(1)
    })

    // B-19 失焦时触发 blur 事件
    it('T-19: 失焦时触发 blur 事件', async () => {
        const wrapper = mount(VcInput)
        await wrapper.find('input').trigger('blur')
        expect(wrapper.emitted('blur')).toHaveLength(1)
    })

    // B-20 失焦且值变化时触发 change 事件，载荷为新值
    it('T-20: 值变化且失焦时触发 change 载荷为新值', async () => {
        const wrapper = mount(VcInput, {
            props: { modelValue: 'a' },
        })
        const input = wrapper.find('input')
        await input.setValue('b')
        await input.trigger('blur')
        const emitted = wrapper.emitted('change')
        expect(emitted).toHaveLength(1)
        expect(emitted![0][0]).toBe('b')
    })

    // 边界
    // E-02 clearable 与 readonly 同时为 true 时不显示清空按钮
    it('T-21: clearable+readonly 时不显示清空按钮', () => {
        const wrapper = mount(VcInput, {
            props: { clearable: true, readonly: true, modelValue: 'x' },
        })
        expect(wrapper.find('.vc-input__clear').exists()).toBe(false)
    })

    // a11y
    // A-03 清空按钮 aria-label 为 清空
    it('T-22: 清空按钮 aria-label 为 清空', () => {
        const wrapper = mount(VcInput, {
            props: { clearable: true, modelValue: 'x' },
        })
        expect(wrapper.find('.vc-input__clear').attributes('aria-label')).toBe('清空')
    })
})
