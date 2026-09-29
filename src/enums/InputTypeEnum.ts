const InputTypeEnum = {
    Text: 'text',
    Password: 'password',
    Email: 'email',
    Number: 'number',
    Date: 'date',
    Time: 'time',
    DATETIME: 'datetime',
    FILE: 'file',
    COLOR: 'color',
    RANGE: 'range',
    CHECKBOX: 'checkbox',
    RADIO: 'radio',
    Select: 'select',
    MultipleSelect: 'multiple-select',
    Textarea: 'textarea',
    Button: 'button',
    Tel: 'tel',
    Url: 'url',
}

// 可选：导出值类型的 union，方便在 props 类型里用 
type InputType = (typeof InputTypeEnum)[keyof typeof InputTypeEnum];
// 即：type InputType = 'text' | 'password' | 'email' | 'number' | 'date' | 'time' | 'datetime' | 'file' | 'color' | 'range' | 'checkbox' | 'radio' | 'select' | 'multiple-select' | 'textarea' | 'button' | 'tel' | 'url'
export type { InputType };


export default InputTypeEnum;