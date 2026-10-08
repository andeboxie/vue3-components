import type { InjectionKey } from 'vue';
import type RadioGroupContext from '@/components/radio/RadioGroupContext';


export const radioGroupKey: InjectionKey<RadioGroupContext | undefined> = Symbol('vc-radio-group');
