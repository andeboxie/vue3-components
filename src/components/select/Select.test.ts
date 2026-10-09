import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import VcSelect from './Select.vue'

// 基础选项夹具
const baseOptions = [
    { label: '选项A', value: 'a' },
    { label: '选项B', value: 'b' },
    { label: '选项C', value: 'c' },
]

// 含禁用项的选项夹具
const optionsWithDisabled = [
    { label: '选项A', value: 'a' },
    { label: '选项B', value: 'b', disabled: true },
    { label: '选项C', value: 'c' },
]

describe('VcSelect', () => {
    // 触发器
    // B-01 根元素 class 含 vc-select，含触发器节点 vc-select__control
    it('T-01: 根元素含 vc-select 且存在 vc-select__control', () => {
        const wrapper = mount(VcSelect, {
            props: { options: baseOptions },
        })
        expect(wrapper.classes()).toContain('vc-select')
        expect(wrapper.find('.vc-select__control').exists()).toBe(true)
    })

    // B-02 未选中时触发器显示 placeholder（class vc-select__placeholder）
    it('T-02: 未选中时触发器显示 placeholder', () => {
        const wrapper = mount(VcSelect, {
            props: { options: baseOptions },
        })
        expect(wrapper.find('.vc-select__control').text()).toContain('请选择')
        expect(wrapper.find('.vc-select__placeholder').exists()).toBe(true)
    })

    // B-03 选中值后触发器显示该选项的 label（不是 value）
    it('T-03: 选中后触发器显示对应 label', () => {
        const wrapper = mount(VcSelect, {
            props: { options: baseOptions, modelValue: 'a' },
        })
        expect(wrapper.find('.vc-select__control').text()).toContain('选项A')
    })

    // 展开/收起
    // B-05 点击触发器展开面板（含全部 options），触发 visible-change(true)
    it('T-04: 点击 control 展开面板并 emit visible-change(true)', async () => {
        const wrapper = mount(VcSelect, {
            props: { options: baseOptions },
        })
        await wrapper.find('.vc-select__control').trigger('click')
        expect(wrapper.find('.vc-select__dropdown').exists()).toBe(true)
        expect(wrapper.findAll('[role="option"]').length).toBe(3)
        const emitted = wrapper.emitted('visible-change')
        expect(emitted).toBeTruthy()
        expect(emitted![0][0]).toBe(true)
    })

    // B-06 再次点击触发器收起面板，触发 visible-change(false)
    it('T-05: 展开后再点 control 收起并 emit visible-change(false)', async () => {
        const wrapper = mount(VcSelect, {
            props: { options: baseOptions },
        })
        const control = wrapper.find('.vc-select__control')
        await control.trigger('click')
        await control.trigger('click')
        expect(wrapper.find('.vc-select__dropdown').exists()).toBe(false)
        const emitted = wrapper.emitted('visible-change')
        expect(emitted).toBeTruthy()
        expect(emitted![emitted!.length - 1][0]).toBe(false)
    })

    // 选项选中
    // B-09 点击未禁用选项触发 update:modelValue，载荷为该选项 value
    it('T-06: 点击选项 emit update:modelValue，载荷为该选项 value', async () => {
        const wrapper = mount(VcSelect, {
            props: { options: baseOptions },
        })
        await wrapper.find('.vc-select__control').trigger('click')
        await wrapper.findAll('[role="option"]')[0].trigger('click')
        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toBeTruthy()
        expect(emitted![0][0]).toBe('a')
    })

    // B-08 选中任意选项后自动收起面板
    it('T-07: 选中选项后面板自动收起', async () => {
        const wrapper = mount(VcSelect, {
            props: { options: baseOptions },
        })
        await wrapper.find('.vc-select__control').trigger('click')
        await wrapper.findAll('[role="option"]')[1].trigger('click')
        expect(wrapper.find('.vc-select__dropdown').exists()).toBe(false)
    })

    // B-10 选中变化同时触发 change
    it('T-08: 选中同时 emit change，载荷为新值', async () => {
        const wrapper = mount(VcSelect, {
            props: { options: baseOptions },
        })
        await wrapper.find('.vc-select__control').trigger('click')
        await wrapper.findAll('[role="option"]')[1].trigger('click')
        const emitted = wrapper.emitted('change')
        expect(emitted).toBeTruthy()
        expect(emitted![0][0]).toBe('b')
    })

    // B-11 点击 disabled 选项：不选中、不收起、不触发事件
    it('T-09: 点击 disabled 选项无事件且面板仍展开', async () => {
        const wrapper = mount(VcSelect, {
            props: { options: optionsWithDisabled },
        })
        await wrapper.find('.vc-select__control').trigger('click')
        // optionsWithDisabled 中第二项（value=b）为禁用项
        await wrapper.findAll('[role="option"]')[1].trigger('click')
        expect(wrapper.emitted('update:modelValue')).toBeUndefined()
        expect(wrapper.emitted('change')).toBeUndefined()
        expect(wrapper.find('.vc-select__dropdown').exists()).toBe(true)
    })

    // B-12 当前选中项在面板中有选中样式 class 且 aria-selected="true"
    it('T-10: 选中项含 --selected 且 aria-selected=true', async () => {
        const wrapper = mount(VcSelect, {
            props: { options: baseOptions, modelValue: 'a' },
        })
        await wrapper.find('.vc-select__control').trigger('click')
        const selected = wrapper.findAll('[role="option"]')[0]
        expect(selected.classes()).toContain('vc-select-option--selected')
        expect(selected.attributes('aria-selected')).toBe('true')
    })

    // B-13 点击已选中选项：收起面板但不触发 update/change（值不变）
    it('T-11: 点击已选中项只收起面板，无 update/change', async () => {
        const wrapper = mount(VcSelect, {
            props: { options: baseOptions, modelValue: 'a' },
        })
        await wrapper.find('.vc-select__control').trigger('click')
        await wrapper.findAll('[role="option"]')[0].trigger('click')
        expect(wrapper.emitted('update:modelValue')).toBeUndefined()
        expect(wrapper.emitted('change')).toBeUndefined()
        expect(wrapper.find('.vc-select__dropdown').exists()).toBe(false)
    })

    // B-07 展开时点击面板外部，面板收起
    it('T-12: 展开后点击组件外部面板收起', async () => {
        const wrapper = mount(VcSelect, {
            props: { options: baseOptions },
        })
        await wrapper.find('.vc-select__control').trigger('click')
        expect(wrapper.find('.vc-select__dropdown').exists()).toBe(true)
        // 模拟点击组件外部（document 上的全局监听应判定为外部点击）
        document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        await wrapper.vm.$nextTick()
        expect(wrapper.find('.vc-select__dropdown').exists()).toBe(false)
    })

    // 清空
    // B-14 clearable=true 且有选中值时显示清空按钮；无值时不显示（防两个都渲染）
    it('T-13: clearable 有值时显示清空按钮，无值时不显示', () => {
        const withValue = mount(VcSelect, {
            props: { options: baseOptions, modelValue: 'a', clearable: true },
        })
        expect(withValue.find('.vc-select__clear').exists()).toBe(true)

        const noValue = mount(VcSelect, {
            props: { options: baseOptions, clearable: true },
        })
        expect(noValue.find('.vc-select__clear').exists()).toBe(false)
    })

    // B-15 点击清空按钮触发 update:modelValue（载荷 ''）与 clear
    it('T-14: 点击清空 emit update 载荷空串且有 clear', async () => {
        const wrapper = mount(VcSelect, {
            props: { options: baseOptions, modelValue: 'a', clearable: true },
        })
        await wrapper.find('.vc-select__clear').trigger('click')
        const update = wrapper.emitted('update:modelValue')
        expect(update).toBeTruthy()
        expect(update![0][0]).toBe('')
        expect(wrapper.emitted('clear')).toBeTruthy()
    })

    // B-16 清空按钮点击不触发面板展开（需阻止冒泡）
    it('T-15: 点击清空后面板未展开', async () => {
        const wrapper = mount(VcSelect, {
            props: { options: baseOptions, modelValue: 'a', clearable: true },
        })
        await wrapper.find('.vc-select__clear').trigger('click')
        expect(wrapper.find('.vc-select__dropdown').exists()).toBe(false)
    })

    // 键盘操作
    // B-17 触发器聚焦时按 ArrowDown 展开面板
    it('T-16: 按 ArrowDown 展开面板', async () => {
        const wrapper = mount(VcSelect, {
            props: { options: baseOptions },
        })
        const control = wrapper.find('.vc-select__control')
        await control.trigger('keydown', { key: 'ArrowDown' })
        expect(wrapper.find('.vc-select__dropdown').exists()).toBe(true)
    })

    // B-18 面板展开时按 ArrowDown 移动高亮项（跳过 disabled）
    it('T-17: ArrowDown 移动高亮并跳过 disabled 项', async () => {
        const wrapper = mount(VcSelect, {
            props: { options: optionsWithDisabled, modelValue: 'a' },
        })
        const control = wrapper.find('.vc-select__control')
        await control.trigger('click')
        // 初始高亮在选中项 a（index 0），ArrowDown 后应跳过禁用的 b 落在 c
        await control.trigger('keydown', { key: 'ArrowDown' })
        const options = wrapper.findAll('[role="option"]')
        expect(options[2].classes()).toContain('vc-select-option--highlighted')
        expect(options[1].classes()).not.toContain('vc-select-option--highlighted')
    })

    // B-19 高亮项上按 Enter：选中该项
    it('T-18: 高亮项按 Enter 选中该项', async () => {
        const wrapper = mount(VcSelect, {
            props: { options: baseOptions, modelValue: 'b' },
        })
        const control = wrapper.find('.vc-select__control')
        await control.trigger('click')
        // 高亮从选中项 b（index 1）移到 c 后回车选中
        await control.trigger('keydown', { key: 'ArrowDown' })
        await control.trigger('keydown', { key: 'Enter' })
        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toBeTruthy()
        expect(emitted![0][0]).toBe('c')
    })

    // B-20 按 Escape：收起面板
    it('T-19: 展开后按 Escape 收起面板', async () => {
        const wrapper = mount(VcSelect, {
            props: { options: baseOptions },
        })
        const control = wrapper.find('.vc-select__control')
        await control.trigger('click')
        expect(wrapper.find('.vc-select__dropdown').exists()).toBe(true)
        await control.trigger('keydown', { key: 'Escape' })
        expect(wrapper.find('.vc-select__dropdown').exists()).toBe(false)
    })

    // 禁用与尺寸
    // B-21 disabled=true 时点击不展开
    it('T-20: disabled 时点击 control 不展开面板', async () => {
        const wrapper = mount(VcSelect, {
            props: { options: baseOptions, disabled: true },
        })
        await wrapper.find('.vc-select__control').trigger('click')
        expect(wrapper.find('.vc-select__dropdown').exists()).toBe(false)
    })

    // B-22 size 映射 class vc-select--{size}
    it('T-21: size=small 时含 vc-select--small', () => {
        const wrapper = mount(VcSelect, {
            props: { options: baseOptions, size: 'small' },
        })
        expect(wrapper.classes()).toContain('vc-select--small')
    })
})
