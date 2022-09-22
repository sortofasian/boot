export type Command = {
    name: string
    description: string
    options: Array<Option>
    default_member_permissions?: string
}
export type Option = {
    required?: boolean
    type: number
    name: string
    description: string
    options: Array<Option>
    choices?: Array<{ name: string; value: string }>
}
