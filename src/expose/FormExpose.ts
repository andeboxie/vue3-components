export default interface FormExpose {
    validate: () => Promise<boolean>;
    validateField: (name: string) => Promise<boolean>;
    resetFields: () => void;
    clearValidate: () => void;
}