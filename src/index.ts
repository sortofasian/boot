import slashCommand from './commands'
import Discord from './providers/discord'

console.log('\nListening for slash commands')

Discord.on('interactionCreate', (interaction) => {
    if (interaction.isChatInputCommand()) slashCommand(interaction)
})
