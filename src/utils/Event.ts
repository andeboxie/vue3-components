export function getInputValue(event: InputEvent): string {
    return (event.target as HTMLInputElement).value || '';
}

export function getValue(event: Event): string {
    return (event.target as HTMLInputElement).value || '';
}

export function getCheckedValue(e: Event) {
    const target = e.target as HTMLInputElement;
    return target.checked;
}