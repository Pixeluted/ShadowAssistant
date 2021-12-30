const { Interaction } = require('discord.js')

module.exports = {
    description: 'Fun Command',
    guildOnly: true,
    options: [],
    callback: (Interaction, options, client) => {
        Interaction.reply({
            content: 'Pong',
            ephemeral: true
        })
    }
}