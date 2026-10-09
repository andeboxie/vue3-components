import type { InjectionKey } from 'vue';
import type FormContext from '@/components/form/FormContext';

export const formContextKey: InjectionKey<FormContext | undefined> = Symbol('vc-form');
