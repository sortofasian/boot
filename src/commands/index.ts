import { ChatInputCommandInteraction } from 'discord.js'
import { votekick } from './votekick'

function slashCommand(interaction: ChatInputCommandInteraction) {
    console.log(
        `\n${interaction.createdAt}: ` +
            `New slash command "${interaction.commandName}" ` +
            `from ${interaction.user.username}` +
            `#${interaction.user.discriminator} ` +
            `(${interaction.user.id}) ` +
            `with options ${interaction.options.data.map(
                (option) => ` ${option.name}: ${option.value}`
            )}`
    )

    switch (interaction.commandName) {
        case 'votekick':
            votekick(interaction)
    }
}

export default slashCommand
