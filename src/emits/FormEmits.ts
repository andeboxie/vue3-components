export default interface FormEmits {
    submit: [values: Record<string, unknown>];

    validate: [valid: boolean, fields?: Record<string, string>];
}
