export function isNotEmpty(value: unknown): value is string | number | boolean | object | Array<any> {
    return value !== undefined && value !== null && value !== '';
}

export function isEmpty(value: unknown): value is string | number | boolean | object | Array<any> {
    return !isNotEmpty(value);
}

export function isArray(value: unknown): value is Array<any> {
    return Array.isArray(value);
}

export function isObject(value: unknown): value is object {
    return typeof value === 'object' && value !== null;
}
