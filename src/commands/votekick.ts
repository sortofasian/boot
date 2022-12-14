import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    DiscordAPIError,
    SlashCommandBooleanOption,
    SlashCommandBuilder,
    SlashCommandIntegerOption,
    SlashCommandUserOption,
    User
} from 'discord.js'

export const votekickCmd = new SlashCommandBuilder()
    .setName('votekick')
    .setDescription('Initiate a votekick')
    .addUserOption(
        new SlashCommandUserOption()
            .setName('user')
            .setRequired(true)
            .setDescription('User to kick')
    )
    .addBooleanOption(
        new SlashCommandBooleanOption()
            .setName('reinvite')
            .setDescription('Send an invite to the kicked user. Defaults to false')
    )
    /*    .addIntegerOption(
        new SlashCommandIntegerOption()
            .setName('threshold')
            .setDescription(
                'Minimum number of users to initiate the kick. Defaults to 25% of the server'
            )
            .setMinValue(1)
    )*/
    .toJSON()

export async function votekick(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser('user') as User
    if (!user || user === null) {
        console.log('ERROR: Interaction is missing user option\n')
        interaction.reply('Internal error: Interaction is missing user option')
        return
    }
    const username = `${user.username}#${user.discriminator}`

    let agreeingUsers: string[] = []
    /*let threshold = interaction.options.getInteger('threshold', false) as number
    if (threshold === null) threshold = Math.round((interaction.guild?.memberCount as number) / 4)*/
    const threshold = Math.round((interaction.guild?.memberCount as number) / 4)

    let kickButton = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId('kick')
            .setLabel(`KICK (0/${threshold})`)
            .setStyle(ButtonStyle.Danger)
    )
    const reply = await interaction
        .reply({
            content: `@here\nVotekick initiated on <@${user.id}>`,
            components: [kickButton]
        })
        .catch((err) => console.log('ERROR: Could not reply to interaction: ' + err))
    if (!reply) return

    const click = reply.createMessageComponentCollector()
    click.on('collect', async (click) => {
        if (click.customId === 'kick') {
            if (agreeingUsers.includes(click.user.id)) {
                click.reply({
                    ephemeral: true,
                    content: 'look i know you really hate them but chill. one vote please.'
                })
                return
            } else agreeingUsers.push(click.user.id)

            kickButton.components[0].setLabel(`KICK (${agreeingUsers.length}/${threshold})`)
            await click.update({ components: [kickButton] })
            if (agreeingUsers.length >= threshold) kick()
        }
    })

    async function kick() {
        try {
            if (interaction.options.getBoolean('reinvite')) {
                const invite = await interaction.guild?.invites.create(interaction.channelId, {
                    maxUses: 1,
                    reason: `${username} was votekicked`
                })
                if (!invite) {
                    console.log('ERROR: Could not create an invite back to the server')
                    return
                }

                await user
                    .send(`For some reason, someone decided you should come back: ${invite.url}`)
                    .catch((err) => {
                        console.log('ERROR: Could not send message to user')
                        interaction.editReply(
                            `Couldn't reinvite ${username}; use this link: ` + invite.url
                        )
                    })
            }
            await interaction.guild?.members.kick(user)
            await interaction.editReply({
                content: `${username} was booted with a final count of ${agreeingUsers.length} votes against them.`,
                components: []
            })
        } catch (err) {
            if (err instanceof DiscordAPIError) {
                await interaction.editReply({ content: 'Internal error', components: [] })
                if (err.code === 50013) {
                    console.log(`ERROR: Insufficient perms to kick`)
                    interaction.editReply(`Could not kick ${username}: Insufficient perms`)
                } else console.log('ERROR: Could not kick user: ' + err)
            } else throw err
        }
    }
}
