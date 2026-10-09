import type { InjectionKey } from 'vue';
import type FormItemContext from '@/components/form/FormItemContext';

export const formItemContextKey: InjectionKey<FormItemContext | undefined> = Symbol('vc-form-item');
