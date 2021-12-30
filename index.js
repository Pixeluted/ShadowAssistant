const DiscordJS = require('discord.js')
const fs = require('fs')
const dotenv = require('dotenv')
dotenv.config();

const client = new DiscordJS.Client({
    intents: [
        DiscordJS.Intents.FLAGS.GUILDS,
        DiscordJS.Intents.FLAGS.GUILD_MESSAGES,
        DiscordJS.Intents.FLAGS.GUILD_MEMBERS,
        DiscordJS.Intents.FLAGS.GUILD_PRESENCES,
        DiscordJS.Intents.FLAGS.DIRECT_MESSAGES
    ]
});

client.on('ready', () => {
   const functionFiles = fs.readdirSync('./functions')

   for (const file of functionFiles){
       const module = require(`./functions/${file}`)
       module(client)
   }
})

client.login(process.env.TOKEN)