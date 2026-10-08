import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import { h } from 'vue'
import VcRadio from './Radio.vue'
import VcRadioGroup from './RadioGroup.vue'

describe('VcRadio', () => {
    // 渲染
    // B-01 Radio 根 class 含 vc-radio，内部含原生 input[type=radio]
    it('T-01: 根元素含 vc-radio 且内部有 input[type=radio]', () => {
        const wrapper = mount(VcRadio, {
            props: { value: 'a', label: 'A' },
        })
        expect(wrapper.classes()).toContain('vc-radio')
        expect(wrapper.find('input[type="radio"]').exists()).toBe(true)
    })

    // B-02 Radio label 文本渲染（vc-radio__label）
    it('T-02: label=选项A 时渲染 vc-radio__label 文本', () => {
        const wrapper = mount(VcRadio, {
            props: { value: 'a', label: '选项A' },
        })
        const label = wrapper.find('.vc-radio__label')
        expect(label.exists()).toBe(true)
        expect(label.text()).toContain('选项A')
    })

    // B-03 RadioGroup 根 class 含 vc-radio-group，direction 映射 class vc-radio-group--{direction}
    it('T-03: Group direction=vertical 时含 vc-radio-group--vertical', () => {
        const wrapper = mount(VcRadioGroup, {
            props: { direction: 'vertical' },
        })
        expect(wrapper.classes()).toContain('vc-radio-group')
        expect(wrapper.classes()).toContain('vc-radio-group--vertical')
    })

    // 选中（Group 内）
    // B-04 Group modelValue 等于某 Radio value 时该 Radio 选中
    it('T-04: Group modelValue=a 且含 Radio value=a，该 Radio checked 且含 --checked', () => {
        const wrapper = mount(VcRadioGroup, {
            props: { modelValue: 'a' },
            slots: {
                default: () => h(VcRadio, { value: 'a', label: 'A' }),
            },
        })
        const input = wrapper.find('input[type="radio"]')
        expect((input.element as HTMLInputElement).checked).toBe(true)
        // 取 Radio 根元素（input 的父 label）
        const radioRoot = wrapper.findComponent(VcRadio)
        expect(radioRoot.classes()).toContain('vc-radio--checked')
    })

    // B-05 点击未选中 Radio 时 Group 触发 update:modelValue（载荷为该 Radio value）
    it('T-05: Group modelValue=a 时点击 value=b 的 Radio，Group emit update:modelValue=b', async () => {
        const wrapper = mount(VcRadioGroup, {
            props: { modelValue: 'a' },
            slots: {
                default: () => [
                    h(VcRadio, { value: 'a', label: 'A' }),
                    h(VcRadio, { value: 'b', label: 'B' }),
                ],
            },
        })
        // 找到 value=b 的 radio（第二个）
        const inputs = wrapper.findAll('input[type="radio"]')
        const inputB = inputs[1]
        await inputB.setValue(true)
        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toBeTruthy()
        expect(emitted![0][0]).toBe('b')
    })

    // B-06 点击已选中 Radio 时不触发事件（值不变）
    it('T-06: 点击已选中 Radio，Group 无 update:modelValue', async () => {
        const wrapper = mount(VcRadioGroup, {
            props: { modelValue: 'a' },
            slots: {
                default: () => h(VcRadio, { value: 'a', label: 'A' }),
            },
        })
        // 已选中项再点击
        await wrapper.find('input[type="radio"]').setValue(true)
        expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    })

    // B-07 选中变化同时触发 Group 的 change 事件
    it('T-07: 切换选中触发 Group change 事件，载荷为新的 value', async () => {
        const wrapper = mount(VcRadioGroup, {
            props: { modelValue: 'a' },
            slots: {
                default: () => [
                    h(VcRadio, { value: 'a', label: 'A' }),
                    h(VcRadio, { value: 'b', label: 'B' }),
                ],
            },
        })
        const inputs = wrapper.findAll('input[type="radio"]')
        await inputs[1].setValue(true)
        const emitted = wrapper.emitted('change')
        expect(emitted).toBeTruthy()
        expect(emitted![0][0]).toBe('b')
    })

    // 禁用
    // B-08 Radio disabled=true 或 Group disabled=true 时不可点击
    it('T-08: Group disabled=true 时点击子 Radio 无事件', async () => {
        const wrapper = mount(VcRadioGroup, {
            props: { disabled: true, modelValue: 'a' },
            slots: {
                default: () => [
                    h(VcRadio, { value: 'a', label: 'A' }),
                    h(VcRadio, { value: 'b', label: 'B' }),
                ],
            },
        })
        const inputs = wrapper.findAll('input[type="radio"]')
        await inputs[1].setValue(true)
        expect(wrapper.emitted('update:modelValue')).toBeUndefined()
        expect(wrapper.emitted('change')).toBeUndefined()
    })

    // B-09 禁用 Radio class 含 vc-radio--disabled
    it('T-09: 单项 disabled=true 时含 vc-radio--disabled', () => {
        const wrapper = mount(VcRadio, {
            props: { value: 'a', label: 'A', disabled: true },
        })
        expect(wrapper.classes()).toContain('vc-radio--disabled')
    })

    // 互斥
    // B-10 Group 内同一时刻只有一个 Radio 选中
    it('T-10: 选中 a 后点 b，a 取消、b 选中', async () => {
        const wrapper = mount(VcRadioGroup, {
            props: {
                modelValue: 'a',
                // 让 props 跟随 update:modelValue 同步，模拟 v-model 双向绑定
                'onUpdate:modelValue': async (val: string | number) => {
                    await wrapper.setProps({ modelValue: val })
                },
            },
            slots: {
                default: () => [
                    h(VcRadio, { value: 'a', label: 'A' }),
                    h(VcRadio, { value: 'b', label: 'B' }),
                ],
            },
        })
        const inputs = wrapper.findAll('input[type="radio"]')
        // 初始 a 选中、b 未选中
        expect((inputs[0].element as HTMLInputElement).checked).toBe(true)
        expect((inputs[1].element as HTMLInputElement).checked).toBe(false)
        // 点击 b
        await inputs[1].setValue(true)
        // Group modelValue 变 b，重渲后 a 取消、b 选中
        const inputsAfter = wrapper.findAll('input[type="radio"]')
        expect((inputsAfter[1].element as HTMLInputElement).checked).toBe(true)
        expect((inputsAfter[0].element as HTMLInputElement).checked).toBe(false)
    })

    // 单独使用
    // B-11 Radio 无 Group context 时，点击通过自身 emit（仅保证不报错）
    it('T-11: 无 Group 时点击不报错', async () => {
        const wrapper = mount(VcRadio, {
            props: { value: 'a', label: 'A' },
        })
        // 只要点击不抛错就算过
        await wrapper.find('input[type="radio"]').setValue(true)
        expect(true).toBe(true)
    })

    // 可访问性
    // A-01 / A-02 同组 Radio 的 input 共享相同 name 属性（保证键盘方向键原生互斥）
    it('T-12: Group 内多个 Radio 的 input 共享相同 name', () => {
        const wrapper = mount(VcRadioGroup, {
            props: { modelValue: 'a' },
            slots: {
                default: () => [
                    h(VcRadio, { value: 'a', label: 'A' }),
                    h(VcRadio, { value: 'b', label: 'B' }),
                ],
            },
        })
        const inputs = wrapper.findAll('input[type="radio"]')
        expect(inputs.length).toBe(2)
        const nameA = (inputs[0].element as HTMLInputElement).name
        const nameB = (inputs[1].element as HTMLInputElement).name
        // 都有 name
        expect(nameA).toBeTruthy()
        expect(nameB).toBeTruthy()
        // 两个 name 相同
        expect(nameA).toBe(nameB)
    })

    // A-03 文本点击可选中（<label> 关联 input）
    // jsdom 不模拟 label click → input change 联动，改为验证结构：label 包裹 input（隐式关联）
    it('T-13: label 包裹 input 实现文本点击可选中（A-03）', () => {
        const wrapper = mount(VcRadio, {
            props: { value: 'a', label: '选项A' },
        })
        const label = wrapper.find('label')
        expect(label.exists()).toBe(true)
        // label 内含 input（隐式关联，浏览器原生支持点击 label 切换 input）
        expect(label.find('input[type="radio"]').exists()).toBe(true)
    })
})
