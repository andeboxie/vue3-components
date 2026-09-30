import type { InjectionKey } from 'vue';
import type CheckboxGroupContext from '@/components/checkbox/CheckboxGroupContext';


export const checkboxGroupContextKey: InjectionKey<CheckboxGroupContext | undefined> = Symbol('vc-checkbox-group');