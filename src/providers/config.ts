import { readFileSync } from 'fs'

type Config = {
    permsInteger: number
    applicationId: string

    clientSecret: string
    token: string

    inviteLink: string
    endpoint: string
}

const config = JSON.parse(readFileSync('config.json', { encoding: 'utf8' })) as Config
export default config
