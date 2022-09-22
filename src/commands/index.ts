import { ChatInputCommandInteraction } from 'discord.js'
import { votekick } from './votekick'

function slashCommand(interaction: ChatInputCommandInteraction) {
    console.log(
        `${interaction.createdTimestamp}: ` +
            `New slash command "${interaction.commandName}" ` +
            `from ${interaction.user.username}` +
            `#${interaction.user.discriminator} ` +
            `(${interaction.user.id})`
    )

    switch (interaction.commandName) {
        case 'votekick':
            votekick(interaction)
    }
}

export default slashCommand
