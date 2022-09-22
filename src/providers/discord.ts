import { createInterface } from 'readline'
import config from './config'
import { votekickCmd } from '../commands/votekick'
import { Command } from '../discord'
import fetch from 'node-fetch'
import { Client, GatewayIntentBits } from 'discord.js'

const requestedCommands = [votekickCmd] as Array<Command>
const commandUrl = `${config.endpoint}/applications/${config.applicationId}/commands`

function compareObject<T extends object>(
    existing: T,
    requested: T,
    matchAllKeys: boolean
): boolean {
    return Object.keys(requested).every((key) => {
        // Seperate tests for objects
        if (Object(requested[key as keyof T]) === requested[key as keyof T]) {
            if (Array.isArray(requested[key as keyof T])) {
                // Run compareObject for every requested option against all existing options
                return (requested[key as keyof T] as unknown as Array<T>).every(
                    (requestedOption) => {
                        const arr = existing[key as keyof T] as unknown as Array<T>
                        if (!arr) return false
                        return arr.some((existingOption) =>
                            compareObject<T>(existingOption, requestedOption, matchAllKeys)
                        )
                    }
                )
            } else {
                // Run compareObject on nested object
                compareObject<T>(
                    existing[key as keyof object],
                    requested[key as keyof object],
                    matchAllKeys
                )
            }
        }

        // Use existing defaults
        if (requested[key as keyof T] === undefined) return true
        // Fail if key missing
        if (matchAllKeys && !Object.keys(existing).includes(key)) return false
        // Fail if key mismatch
        if (
            existing[key as keyof T] !== requested[key as keyof T] &&
            existing[key as keyof T] !== undefined
        )
            return false

        // Keys are similar :)
        return true
    })
}

const existingCommands = (await fetch(commandUrl, {
    headers: { Authorization: 'Bot ' + config.token }
}).then((res) => res.json())) as Array<Command>

// Run compare for every requested command against all existing commands
const commandsOutdated = !requestedCommands.every((requestedCommand) =>
    existingCommands.some((existingCommand) =>
        compareObject(existingCommand, requestedCommand, false)
    )
)

if (commandsOutdated) {
    const response = await new Promise((resolve) => {
        createInterface({ input: process.stdin, output: process.stdout }).question(
            `Update slash commands? (y/n): `,
            (response) => {
                resolve(response)
            }
        )
    })

    if (response === 'y' || response === 'Y') {
        console.log(`Updating slash commands...`)

        await fetch(commandUrl, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bot ' + config.token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestedCommands)
        }).then((res) => res.json())

        console.log('Update complete')
    } else console.log(`NOTE: Slash commands will be out of date`)
}

const Discord = new Client({
    allowedMentions: { parse: ['everyone'] },
    intents: [GatewayIntentBits.Guilds]
})
await Discord.login(config.token)

export default Discord
