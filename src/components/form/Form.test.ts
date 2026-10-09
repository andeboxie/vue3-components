import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, defineComponent, reactive, inject, nextTick } from 'vue';
import VcForm from '@/components/form/Form.vue';
import VcFormItem from '@/components/form/FormItem.vue';
import { formItemContextKey } from '@/keys/FormItemContextKey';
import type FormRule from '@/components/form/FormRule';

// 简单 stub 控件：注入 FormItemContext，上报 setValue/handleBlur/markChanged
const StubControl = defineComponent({
    name: 'StubControl',
    setup() {
        const ctx = inject(formItemContextKey, undefined);
        return () => h('input', {
            id: ctx?.controlId,
            disabled: ctx?.disabled?.value,
            'aria-invalid': ctx?.invalid?.value ? 'true' : undefined,
            'aria-describedby': ctx?.errorId,
            onInput: (e: Event) => {
                const val = (e.target as HTMLInputElement).value;
                ctx?.setValue(val);
                ctx?.markChanged();
            },
            onBlur: () => ctx?.handleBlur(),
        });
    },
});

// 挂载辅助：单字段表单
function createForm(
    model: Record<string, unknown>,
    rules: Record<string, FormRule[]> = {},
    formItemName = 'name',
    formItemProps: Record<string, unknown> = {},
    formProps: Record<string, unknown> = {},
) {
    const wrapper = mount(VcForm, {
        props: { model, rules, ...formProps },
        slots: {
            default: () => h(VcFormItem, { name: formItemName, ...formItemProps }, {
                default: () => h(StubControl),
            }),
        },
    });
    return { wrapper, model };
}

// 挂载辅助：双字段表单
function createTwoFieldForm(
    model: Record<string, unknown>,
    rules: Record<string, FormRule[]>,
) {
    const wrapper = mount(VcForm, {
        props: { model, rules },
        slots: {
            default: () => [
                h(VcFormItem, { name: 'field1', label: '字段1' }, { default: () => h(StubControl) }),
                h(VcFormItem, { name: 'field2', label: '字段2' }, { default: () => h(StubControl) }),
            ],
        },
    });
    return { wrapper, model };
}

describe('VcForm', () => {
    // B-01
    it('T-01: 根元素为 form 且 class 含 vc-form', () => {
        const { wrapper } = createForm({});
        const root = wrapper.find('form');
        expect(root.exists()).toBe(true);
        expect(root.classes()).toContain('vc-form');
    });

    // B-02
    it('T-02: FormItem label 有值时渲染 vc-form-item__label', () => {
        const { wrapper } = createForm({}, {}, 'name', { label: '名称' });
        const label = wrapper.find('.vc-form-item__label');
        expect(label.exists()).toBe(true);
        expect(label.text()).toContain('名称');
    });

    // B-04
    it('T-03: required=true 时显示必填标记', () => {
        const { wrapper } = createForm({}, {}, 'name', { label: '名称', required: true });
        expect(wrapper.find('.vc-form-item__required').exists()).toBe(true);
    });

    // B-07
    it('T-04: 原生 submit 事件被 preventDefault', async () => {
        const { wrapper } = createForm({});
        const formEl = wrapper.find('form').element as HTMLFormElement;
        const event = new Event('submit', { bubbles: true, cancelable: true });
        formEl.dispatchEvent(event);
        expect(event.defaultPrevented).toBe(true);
    });

    // B-05
    it('T-05: 必填字段有值时提交触发 submit 事件', async () => {
        const { wrapper } = createForm(
            { name: 'test' },
            { name: [{ required: true, message: '必填' }] },
        );
        await wrapper.find('form').trigger('submit');
        await nextTick();
        const submitEvents = wrapper.emitted('submit');
        expect(submitEvents).toBeTruthy();
        expect(submitEvents![0][0]).toEqual({ name: 'test' });
    });

    // B-06
    it('T-06: 必填字段为空时提交不触发 submit 且显示错误', async () => {
        const { wrapper } = createForm(
            { name: '' },
            { name: [{ required: true, message: '必填' }] },
        );
        await wrapper.find('form').trigger('submit');
        await nextTick();
        expect(wrapper.emitted('submit')).toBeFalsy();
        const validateEvents = wrapper.emitted('validate');
        expect(validateEvents).toBeTruthy();
        expect(validateEvents![0][0]).toBe(false);
        expect(wrapper.find('.vc-form-item__error').exists()).toBe(true);
    });

    // B-09
    it('T-07: required 规则值为空时显示 message', async () => {
        const { wrapper } = createForm(
            { name: '' },
            { name: [{ required: true, message: '名称必填' }] },
        );
        await wrapper.vm.validate();
        expect(wrapper.find('.vc-form-item__error').text()).toBe('名称必填');
    });

    // B-10
    it('T-08: min=2 值为 a 时校验失败', async () => {
        const { wrapper } = createForm(
            { name: 'a' },
            { name: [{ min: 2, message: '太短' }] },
        );
        const result = await wrapper.vm.validate();
        expect(result).toBe(false);
    });

    // B-11
    it('T-09: pattern 规则不匹配时校验失败', async () => {
        const { wrapper } = createForm(
            { phone: 'abc' },
            { phone: [{ pattern: /^1\d{10}$/, message: '手机号格式错误' }] },
            'phone',
        );
        const result = await wrapper.vm.validate();
        expect(result).toBe(false);
    });

    // B-12
    it('T-10: validator 返回字符串时以该字符串为错误信息', async () => {
        const { wrapper } = createForm(
            { name: 'test' },
            { name: [{ validator: () => '自定义错误' }] },
        );
        await wrapper.vm.validate();
        expect(wrapper.find('.vc-form-item__error').text()).toBe('自定义错误');
    });

    // B-13
    it('T-11: 多条规则按顺序执行，首条失败即停止', async () => {
        const { wrapper } = createForm(
            { name: 'a' },
            {
                name: [
                    { min: 2, message: '太短' },
                    { pattern: /^abc$/, message: '不匹配' },
                ]
            },
        );
        await wrapper.vm.validate();
        const error = wrapper.find('.vc-form-item__error');
        expect(error.text()).toBe('太短');
    });

    // B-17
    it('T-12: validate 全通过时 resolve true', async () => {
        const { wrapper } = createForm(
            { name: 'test' },
            { name: [{ required: true }] },
        );
        const result = await wrapper.vm.validate();
        expect(result).toBe(true);
    });

    // B-18
    it('T-13: validateField 仅校验指定字段', async () => {
        const { wrapper } = createTwoFieldForm(
            { field1: '', field2: '' },
            {
                field1: [{ required: true, message: '字段1必填' }],
                field2: [{ required: true, message: '字段2必填' }],
            },
        );
        await wrapper.vm.validateField('field1');
        await nextTick();
        // 仅 field1 有错误
        const errorItems = wrapper.findAll('.vc-form-item--error');
        expect(errorItems.length).toBe(1);
    });

    // B-19
    it('T-14: resetFields 恢复初始值并清空错误', async () => {
        const model = reactive({ name: 'initial' });
        const wrapper = mount(VcForm, {
            props: {
                model,
                rules: { name: [{ required: true, message: '必填' }] },
            },
            slots: {
                default: () => h(VcFormItem, { name: 'name', label: '名称' }, {
                    default: () => h(StubControl),
                }),
            },
        });
        // 修改值为空触发校验错误
        model.name = '';
        await wrapper.vm.validate();
        expect(wrapper.find('.vc-form-item__error').exists()).toBe(true);
        // 重置
        wrapper.vm.resetFields();
        await nextTick();
        expect(model.name).toBe('initial');
        expect(wrapper.find('.vc-form-item__error').exists()).toBe(false);
    });

    // B-20
    it('T-15: clearValidate 清空错误但值不变', async () => {
        const model = reactive({ name: '' });
        const wrapper = mount(VcForm, {
            props: {
                model,
                rules: { name: [{ required: true, message: '必填' }] },
            },
            slots: {
                default: () => h(VcFormItem, { name: 'name', label: '名称' }, {
                    default: () => h(StubControl),
                }),
            },
        });
        // 触发校验产生错误
        await wrapper.vm.validate();
        expect(wrapper.find('.vc-form-item__error').exists()).toBe(true);
        // 清错
        wrapper.vm.clearValidate();
        await nextTick();
        expect(wrapper.find('.vc-form-item__error').exists()).toBe(false);
        // 值不变
        expect(model.name).toBe('');
    });

    // B-22
    it('T-16: 字段错误态 class 含 vc-form-item--error', async () => {
        const { wrapper } = createForm(
            { name: '' },
            { name: [{ required: true, message: '必填' }] },
        );
        await wrapper.vm.validate();
        expect(wrapper.find('.vc-form-item').classes()).toContain('vc-form-item--error');
    });

    // E-01
    it('T-17: 字段无 rules 时校验通过', async () => {
        const { wrapper } = createForm({ name: 'anything' }, {});
        const result = await wrapper.vm.validate();
        expect(result).toBe(true);
    });

    // E-03
    it('T-18: required 无 message 时显示默认文案', async () => {
        const { wrapper } = createForm(
            { name: '' },
            { name: [{ required: true }] },
        );
        await wrapper.vm.validate();
        expect(wrapper.find('.vc-form-item__error').text()).toBe('该字段为必填项');
    });

    // B-21
    it('T-19: Form disabled 时控件禁用', () => {
        const { wrapper } = createForm({}, {}, 'name', {}, { disabled: true });
        const input = wrapper.find('input');
        expect((input.element as HTMLInputElement).disabled).toBe(true);
    });

    // A-02
    it('T-20: 字段错误时控件 aria-invalid 且 aria-describedby 指向错误节点', async () => {
        const { wrapper } = createForm(
            { name: '' },
            { name: [{ required: true, message: '必填' }] },
        );
        await wrapper.vm.validate();
        const input = wrapper.find('input');
        expect(input.attributes('aria-invalid')).toBe('true');
        const errorId = input.attributes('aria-describedby');
        expect(errorId).toBeTruthy();
        expect(wrapper.find(`#${errorId}`).exists()).toBe(true);
    });

    // B-08
    it('T-21: validate 事件载荷含 valid 与错误表', async () => {
        const { wrapper } = createForm(
            { name: '' },
            { name: [{ required: true, message: '必填' }] },
        );
        await wrapper.vm.validate();
        const events = wrapper.emitted('validate');
        expect(events).toBeTruthy();
        const [valid, fields] = events![0] as [boolean, Record<string, string>];
        expect(valid).toBe(false);
        expect(fields.name).toBe('必填');
    });

    // B-14
    it('T-22: trigger=blur 时 change 不校验，blur 时校验', async () => {
        const model = reactive({ name: '' });
        const wrapper = mount(VcForm, {
            props: {
                model,
                rules: { name: [{ required: true, message: '必填', trigger: 'blur' }] },
            },
            slots: {
                default: () => h(VcFormItem, { name: 'name', label: '名称' }, {
                    default: () => h(StubControl),
                }),
            },
        });
        // change 不校验：触发 input 变化
        await wrapper.find('input').setValue('a');
        await nextTick();
        expect(wrapper.find('.vc-form-item__error').exists()).toBe(false);
        // blur 校验
        await wrapper.find('input').trigger('blur');
        await nextTick();
        // blur 后值有值，清空触发 blur 校验
        // 先把值清空再 blur
        await wrapper.find('input').setValue('');
        await wrapper.find('input').trigger('blur');
        await nextTick();
        expect(wrapper.find('.vc-form-item__error').exists()).toBe(true);
    });

    // B-15
    it('T-23: 首次提交后 change 实时校验', async () => {
        const model = reactive({ name: '' });
        const wrapper = mount(VcForm, {
            props: {
                model,
                rules: { name: [{ required: true, message: '必填' }] },
            },
            slots: {
                default: () => h(VcFormItem, { name: 'name', label: '名称' }, {
                    default: () => h(StubControl),
                }),
            },
        });
        // 提交前：change 不校验
        await wrapper.find('input').setValue('a');
        await nextTick();
        await wrapper.find('input').setValue('');
        await nextTick();
        expect(wrapper.find('.vc-form-item__error').exists()).toBe(false);
        // 提交触发校验
        await wrapper.find('form').trigger('submit');
        await nextTick();
        expect(wrapper.find('.vc-form-item__error').exists()).toBe(true);
        // 修正值后：change 实时校验，错误消失
        await wrapper.find('input').setValue('correct');
        await nextTick();
        expect(wrapper.find('.vc-form-item__error').exists()).toBe(false);
    });

    // A-01
    it('T-24: label 的 for 关联控件 id', () => {
        const { wrapper } = createForm(
            { name: '' },
            {},
            'name',
            { label: '名称' },
        );
        const label = wrapper.find('label');
        const input = wrapper.find('input');
        expect(label.attributes('for')).toBe(input.attributes('id'));
    });

    // A-03
    it('T-25: 必填星号对屏幕阅读器隐藏', () => {
        const { wrapper } = createForm(
            { name: '' },
            {},
            'name',
            { label: '名称', required: true },
        );
        const star = wrapper.find('span.vc-form-item__required');
        expect(star.exists()).toBe(true);
        expect(star.attributes('aria-hidden')).toBe('true');
    });

    // E-02
    it('T-26: rules 引用 model 中不存在的字段时 required 失败', async () => {
        const model = reactive({ name: 'test' });
        const wrapper = mount(VcForm, {
            props: {
                model,
                rules: { missing: [{ required: true, message: '必填' }] },
            },
            slots: {
                default: () => h(VcFormItem, { name: 'missing', label: '缺失字段' }, {
                    default: () => h(StubControl),
                }),
            },
        });
        const result = await wrapper.vm.validate();
        expect(result).toBe(false);
        expect(wrapper.find('.vc-form-item__error').text()).toBe('必填');
    });

    // E-04
    it('T-27: validator 抛异常时视为校验失败', async () => {
        const { wrapper } = createForm(
            { name: 'test' },
            { name: [{ validator: () => { throw new Error('crash'); }, message: '校验异常' }] },
        );
        const result = await wrapper.vm.validate();
        expect(result).toBe(false);
        expect(wrapper.find('.vc-form-item__error').text()).toBe('校验异常');
    });

    // E-05
    it('T-28: resetFields 后再次提交以重置后的值重新校验', async () => {
        const model = reactive({ name: 'initial' });
        const wrapper = mount(VcForm, {
            props: {
                model,
                rules: { name: [{ required: true, message: '必填' }] },
            },
            slots: {
                default: () => h(VcFormItem, { name: 'name', label: '名称' }, {
                    default: () => h(StubControl),
                }),
            },
        });
        // 改空 → 提交失败
        model.name = '';
        await wrapper.find('form').trigger('submit');
        await nextTick();
        expect(wrapper.emitted('submit')).toBeFalsy();
        // 重置
        wrapper.vm.resetFields();
        await nextTick();
        expect(model.name).toBe('initial');
        // 清错后再次提交：值非空应通过
        const submitEvents = wrapper.emitted('submit');
        expect(submitEvents).toBeFalsy(); // 重置前没有成功提交
        await wrapper.find('form').trigger('submit');
        await nextTick();
        const afterResetSubmit = wrapper.emitted('submit');
        expect(afterResetSubmit).toBeTruthy();
        expect(afterResetSubmit![0][0]).toEqual({ name: 'initial' });
    });

    // B-03
    it('T-29: labelPosition=top 时 label 样式为全宽左对齐', () => {
        const model = reactive({ name: '' });
        const wrapper = mount(VcForm, {
            props: {
                model,
                rules: {},
                labelPosition: 'top',
            },
            slots: {
                default: () => h(VcFormItem, { name: 'name', label: '名称' }, {
                    default: () => h(StubControl),
                }),
            },
        });
        const label = wrapper.find('label');
        const style = label.attributes('style') || '';
        expect(style).toContain('width: 100%');
        expect(style).toContain('text-align: left');
        // FormItem 根元素有 top 修饰符
        expect(wrapper.find('.vc-form-item').classes()).toContain('vc-form-item--label-top');
    });
});
