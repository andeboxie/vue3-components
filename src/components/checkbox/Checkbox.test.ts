import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import { h } from 'vue'
import VcCheckbox from './Checkbox.vue'
import VcCheckboxGroup from './CheckboxGroup.vue'

describe('VcCheckbox', () => {
    // 渲染
    // B-01 根元素 class 含 vc-checkbox，内部有原生 input[type=checkbox]
    it('T-01: 根元素含 vc-checkbox 且内部有 input[type=checkbox]', () => {
        const wrapper = mount(VcCheckbox)
        expect(wrapper.classes()).toContain('vc-checkbox')
        expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true)
    })

    // B-03 label prop 渲染文本节点 vc-checkbox__label
    it('T-02: label=同意 时渲染 vc-checkbox__label 文本', () => {
        const wrapper = mount(VcCheckbox, {
            props: { label: '同意' },
        })
        const label = wrapper.find('.vc-checkbox__label')
        expect(label.exists()).toBe(true)
        expect(label.text()).toContain('同意')
    })

    // B-04 default slot 覆盖 label prop
    it('T-03: default slot 覆盖 label prop', () => {
        const wrapper = mount(VcCheckbox, {
            props: { label: 'prop文本' },
            slots: { default: '自定义' },
        })
        expect(wrapper.text()).toContain('自定义')
        expect(wrapper.text()).not.toContain('prop文本')
    })

    // B-05 modelValue=true 时 input checked=true 且根 class 含 --checked
    it('T-04: modelValue=true 时 checked 为 true 且含 vc-checkbox--checked', () => {
        const wrapper = mount(VcCheckbox, {
            props: { modelValue: true },
        })
        expect((wrapper.find('input').element as HTMLInputElement).checked).toBe(true)
        expect(wrapper.classes()).toContain('vc-checkbox--checked')
    })

    // B-06 点击未选中项触发 update:modelValue 载荷 true
    it('T-05: 点击未选中项，update:modelValue 载荷为 true', async () => {
        const wrapper = mount(VcCheckbox, {
            props: { modelValue: false },
        })
        await wrapper.find('input').setValue(true)
        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toBeTruthy()
        expect(emitted![0][0]).toBe(true)
    })

    // B-07 点击已选中项触发 update:modelValue 载荷 false
    it('T-06: 点击已选中项，update:modelValue 载荷为 false', async () => {
        const wrapper = mount(VcCheckbox, {
            props: { modelValue: true },
        })
        await wrapper.find('input').setValue(false)
        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toBeTruthy()
        expect(emitted![0][0]).toBe(false)
    })

    // B-08 点击同时触发 change，载荷为新值
    it('T-07: 点击触发 change，载荷为新值', async () => {
        const wrapper = mount(VcCheckbox, {
            props: { modelValue: false },
        })
        await wrapper.find('input').setValue(true)
        const emitted = wrapper.emitted('change')
        expect(emitted).toBeTruthy()
        expect(emitted![0][0]).toBe(true)
    })

    // B-09 indeterminate=true 时根 class 含 --indeterminate
    it('T-08: indeterminate=true 时含 vc-checkbox--indeterminate', () => {
        const wrapper = mount(VcCheckbox, {
            props: { indeterminate: true },
        })
        expect(wrapper.classes()).toContain('vc-checkbox--indeterminate')
    })

    // B-10 indeterminate 透传到原生 input 的 indeterminate property
    it('T-09: indeterminate=true 时原生 input.indeterminate 为 true', () => {
        const wrapper = mount(VcCheckbox, {
            props: { indeterminate: true },
        })
        expect((wrapper.find('input').element as HTMLInputElement).indeterminate).toBe(true)
    })

    // B-11 不确定态点击，update:modelValue 载荷为 true
    it('T-10: indeterminate=true 时点击，update:modelValue 载荷为 true', async () => {
        const wrapper = mount(VcCheckbox, {
            props: { indeterminate: true, modelValue: false },
        })
        await wrapper.find('input').setValue(true)
        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toBeTruthy()
        expect(emitted![0][0]).toBe(true)
    })

    // B-12 disabled=true 时点击不触发任何事件
    it('T-11: disabled=true 时点击不触发事件', async () => {
        const wrapper = mount(VcCheckbox, {
            props: { disabled: true },
        })
        await wrapper.find('input').trigger('click')
        expect(wrapper.emitted('update:modelValue')).toBeUndefined()
        expect(wrapper.emitted('change')).toBeUndefined()
    })

    // B-13 disabled=true 时根 class 含 --disabled
    it('T-12: disabled=true 时含 vc-checkbox--disabled', () => {
        const wrapper = mount(VcCheckbox, {
            props: { disabled: true },
        })
        expect(wrapper.classes()).toContain('vc-checkbox--disabled')
    })

    // B-16 size 映射 class vc-checkbox--{size}
    it('T-13: size=large 时含 vc-checkbox--large', () => {
        const wrapper = mount(VcCheckbox, {
            props: { size: 'large' },
        })
        expect(wrapper.classes()).toContain('vc-checkbox--large')
    })

    // B-02 自定义方框节点存在
    it('T-14: 存在 vc-checkbox__inner 节点', () => {
        const wrapper = mount(VcCheckbox)
        expect(wrapper.find('.vc-checkbox__inner').exists()).toBe(true)
    })

    // B-14 Group 中点击子项通知 Group 更新选中数组
    it('T-15: Group 中点击子项，Group update:modelValue 载荷为 [value]', async () => {
        const wrapper = mount(VcCheckboxGroup, {
            props: { modelValue: [] },
            slots: {
                default: () => h(VcCheckbox, { value: 'a', label: 'A' }),
            },
        })
        await wrapper.find('input[type="checkbox"]').setValue(true)
        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toBeTruthy()
        expect(emitted![0][0]).toEqual(['a'])
    })

    // B-15 Group disabled=true 时子 input disabled
    it('T-16: Group disabled=true 时子 input disabled 存在', () => {
        const wrapper = mount(VcCheckboxGroup, {
            props: { disabled: true },
            slots: {
                default: () => h(VcCheckbox, { value: 'a', label: 'A' }),
            },
        })
        expect((wrapper.find('input').element as HTMLInputElement).disabled).toBe(true)
    })

    // E-02 Group 中无 value 的子项点击不触发 Group 更新
    it('T-17: Group 中无 value 的子项点击，Group 无 update:modelValue', async () => {
        const wrapper = mount(VcCheckboxGroup, {
            props: { modelValue: [] },
            slots: {
                // 不传 value prop
                default: () => h(VcCheckbox, { label: '无值' }),
            },
        })
        await wrapper.find('input[type="checkbox"]').setValue(true)
        expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    })
})
