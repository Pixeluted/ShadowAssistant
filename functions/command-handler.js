const { MessageEmbed } = require('discord.js')
const fs = require('fs')
const getFiles = require('../get-files')

module.exports = (client) => {
    const commands = {}

    const fileSuffix = '.js'

    const commandFiles = getFiles('./commands', fileSuffix)

    for (const command of commandFiles){
        const split = command.replace(/\\/g, '/').split('/')
        const commandName = split[split.length - 1].replace(fileSuffix, '')

        let commandFile = require(`../commands/${commandName}`)
        if (command.default) commandFile = commandFile.default

        commands[commandName.toLowerCase()] = commandFile
    }

    console.log(commands)

    client.on('messageCreate', (message) => {
        if (message.author.bot || !message.content.startsWith('.')){
            return;
        }

        const args = message.content.slice(1).split(/ +/)
        const commandName = args.shift().toLowerCase()

        if (!commands[commandName]){
            return;
        }

        try {
            commands[commandName].callback(message, client, ...args)
        } catch (error) {
            const ownerUser = client.users.cache.get('333625102836957199')

            const errorEmbed = new MessageEmbed()
                .setTitle('**ERROR**')
                .setDescription('Error has occured in command handler! ERROR: ' + error.toString())
                .setColor('RED')

            ownerUser.send({
                embeds: [errorEmbed]
            })

            console.log(error)
        }
    })
}