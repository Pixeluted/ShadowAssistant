const { MessageEmbed } = require('discord.js')
const fs = require('fs')
const getFiles = require('../get-files')

module.exports = (client) => {

    const testingGuild = '893782530879258635'
    const theTestingGuild = client.guilds.cache.get(testingGuild)

    const GuildCommands = theTestingGuild.commands
    const GlobalCommands = client.application?.commands

    const slashCommandsFiles = getFiles('./slash_commands', '.js')

    const registeredCommands = {}

    for (const slashCommand of slashCommandsFiles){
        const split = slashCommand.replace(/\\/g, '/').split('/')
        const commandName = split[split.length - 1].replace('.js', '')

        let slashCommandFile = require(`../slash_commands/${commandName}`)
        if (slashCommandFile.default) slashCommandFile = slashCommandFile.default

        if (slashCommandFile.guildOnly === true){
            GuildCommands?.create({
                name: commandName,
                description: slashCommandFile.description,
                options: slashCommandFile.options
            })
        } else {
            GlobalCommands?.create({
                name: commandName,
                description: slashCommandFile.description,
                options: slashCommandFile.options
            })
        }

        registeredCommands[commandName.toLowerCase()] = slashCommandFile

    }

    
    console.log(registeredCommands)

    client.on('interactionCreate', (interaction) => {
        if (!interaction.isCommand()) {
            return;
        }

        const { commandName, options } = interaction

        if (registeredCommands[commandName.toLowerCase()]){
            
            try {
                registeredCommands[commandName.toLowerCase()].callback(interaction, options, client)
            } catch (error) {
                const ownerUser = client.users.cache.get('333625102836957199')

                const errorEmbed = new MessageEmbed()
                    .setTitle('**ERROR**')
                    .setDescription('Error has occured in slash command handler! ERROR: ' + error.toString())
                    .setColor('RED')

                ownerUser.send({
                    embeds: [errorEmbed]
                })

                console.log(error)
            }

        }
    })
}