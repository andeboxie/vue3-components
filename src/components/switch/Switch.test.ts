import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import VcSwitch from './Switch.vue'

describe('VcSwitch', () => {
    // 渲染
    // B-01 根元素 class 含 vc-switch，角色为开关 role="switch"
    it('T-01: 根元素 class 含 vc-switch 且 role=switch', () => {
        const wrapper = mount(VcSwitch)
        expect(wrapper.classes()).toContain('vc-switch')
        expect(wrapper.attributes('role')).toBe('switch')
    })

    // B-02 modelValue=true 时根 class 含 vc-switch--active，aria-checked="true"
    it('T-02: modelValue=true 时含 --active 且 aria-checked=true', () => {
        const wrapper = mount(VcSwitch, {
            props: { modelValue: true },
        })
        expect(wrapper.classes()).toContain('vc-switch--active')
        expect(wrapper.attributes('aria-checked')).toBe('true')
    })

    // B-03 modelValue=false 时 aria-checked="false"
    it('T-03: 默认关闭态 aria-checked=false', () => {
        const wrapper = mount(VcSwitch)
        expect(wrapper.attributes('aria-checked')).toBe('false')
    })

    // B-04 内部含滑块节点 vc-switch__handle
    it('T-04: 内部存在 vc-switch__handle 滑块', () => {
        const wrapper = mount(VcSwitch)
        expect(wrapper.find('.vc-switch__handle').exists()).toBe(true)
    })

    // B-05 activeText 有值且开启时显示；inactiveText 有值且关闭时显示
    // 两个文本同时传入时，每个状态只应显示对应那一个
    it('T-05: 开启只显示 activeText，关闭只显示 inactiveText', () => {
        const activeWrapper = mount(VcSwitch, {
            props: { modelValue: true, activeText: '开', inactiveText: '关' },
        })
        expect(activeWrapper.text()).toContain('开')
        expect(activeWrapper.text()).not.toContain('关')

        const inactiveWrapper = mount(VcSwitch, {
            props: { modelValue: false, activeText: '开', inactiveText: '关' },
        })
        expect(inactiveWrapper.text()).toContain('关')
        expect(inactiveWrapper.text()).not.toContain('开')
    })

    // 切换
    // B-06 关闭态点击触发 update:modelValue，载荷 true
    it('T-06: 关闭态点击 emit update:modelValue=true', async () => {
        const wrapper = mount(VcSwitch, {
            props: { modelValue: false },
        })
        await wrapper.find('button').trigger('click')
        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toBeTruthy()
        expect(emitted![0][0]).toBe(true)
    })

    // B-07 开启态点击触发 update:modelValue，载荷 false
    it('T-07: 开启态点击 emit update:modelValue=false', async () => {
        const wrapper = mount(VcSwitch, {
            props: { modelValue: true },
        })
        await wrapper.find('button').trigger('click')
        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toBeTruthy()
        expect(emitted![0][0]).toBe(false)
    })

    // B-08 切换同时触发 change，载荷为新值
    it('T-08: 点击同时 emit change，载荷为新值', async () => {
        const wrapper = mount(VcSwitch, {
            props: { modelValue: false },
        })
        await wrapper.find('button').trigger('click')
        const emitted = wrapper.emitted('change')
        expect(emitted).toBeTruthy()
        expect(emitted![0][0]).toBe(true)
    })

    // 禁用与加载
    // B-09 disabled=true 点击无事件，class 含 vc-switch--disabled
    it('T-09: disabled 时点击无事件且含 --disabled', async () => {
        const wrapper = mount(VcSwitch, {
            props: { disabled: true },
        })
        expect(wrapper.classes()).toContain('vc-switch--disabled')
        await wrapper.find('button').trigger('click')
        expect(wrapper.emitted('update:modelValue')).toBeUndefined()
        expect(wrapper.emitted('change')).toBeUndefined()
    })

    // B-10 loading=true 点击无事件，class 含 vc-switch--loading
    it('T-10: loading 时点击无事件且含 --loading', async () => {
        const wrapper = mount(VcSwitch, {
            props: { loading: true },
        })
        expect(wrapper.classes()).toContain('vc-switch--loading')
        await wrapper.find('button').trigger('click')
        expect(wrapper.emitted('update:modelValue')).toBeUndefined()
        expect(wrapper.emitted('change')).toBeUndefined()
    })

    // 尺寸
    // B-12 size 映射 class vc-switch--{size}
    it('T-11: size=small 时含 vc-switch--small', () => {
        const wrapper = mount(VcSwitch, {
            props: { size: 'small' },
        })
        expect(wrapper.classes()).toContain('vc-switch--small')
    })
})
