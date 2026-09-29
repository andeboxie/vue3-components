export function getInputValue(event: InputEvent): string {
    return (event.target as HTMLInputElement).value || '';
}

export function getFocusValue(event: FocusEvent): string {
    return (event.target as HTMLInputElement).value || '';
}

export function getValue(event: Event): string {
    return (event.target as HTMLInputElement).value || '';
}