const fs = require('fs')
const getFiles = require('../get-files')

module.exports = (client) => {

    const testingGuild = '893782530879258635'
    const theTestingGuild = client.guilds.cache.get(testingGuild)

    const GuildCommands = theTestingGuild.commands
    const GlobalCommands = client.application?.commands

    const slashCommandsFiles = getFiles('./slash_commands')
    console.log(slashCommandsFiles)

    const registeredCommands = {}

    for (const slashCommand of slashCommandsFiles){
        const split = slashCommand.replace(/\\/g, '/').split('/')
        const commandName = split[split.length - 1].replace(fileSuffix, '')

        let slashCommandFile = require(`../slash_commands/${commandName}`)
        if (slashCommandFile.default) slashCommandFile = slashCommandFile.default
        console.log(slashCommandFile)

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

        registeredCommands[commandName.toLowerSpace()] = slashCommandFile

    }

    
    console.log(registeredCommands)

    client.on('interactionCreate', (interaction) => {
        if (!interaction.isCommand()) {
            return;
        }

        const { commandName, options } = interaction


    })
}