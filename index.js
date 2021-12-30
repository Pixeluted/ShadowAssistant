import DiscordJS, { Intents, Message, MessageActionRow, MessageButton, MessageEmbed } from 'discord.js'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config();

const client = new DiscordJS.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.DIRECT_MESSAGES
    ]
});

function arrayRemove(arr, value) { 
    
    return arr.filter(function(ele){ 
        return ele != value; 
    });
}

client.on('ready',async () => {

    const guildId = '893782530879258635'
    const guild = client.guilds.cache.get(guildId)


    let commands
    if (guild){
        commands = guild.commands
    } else {
        commands = client.application?.commands
    }

    commands?.create({
        name: 'nickname',
        description: 'Nastaví vám vaší přezdívku!',
        options: [
            {
                name: 'nickname',
                description: 'Zadejte vaši novou přezdívku',
                required: true,
                type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING
            }
        ]
    })


    const Activities = ['Grand Theft Auto V', 'Roblox', 'Minecraft']
    let current = 0
    client.user.setActivity(Activities[0], {type: 'PLAYING'})

    setInterval(() => {
        if (current > 2){
            client.user.setActivity(Activities[0], {type: 'PLAYING'})
            current = 0
        } else {
            client.user.setActivity(Activities[current + 1], {type: 'PLAYING'})
            current = current + 1 
        }
    },60000)



    console.log('Ready!')
})

const activeRequests = {}

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) {
        return;
    }

    const { commandName, options } = interaction

    if (commandName === 'nickname'){
        if (interaction.guild.members.cache.get(client.user.id).permissions.has("MANAGE_NICKNAMES")) {
            if (interaction.guild.members.cache.get(client.user.id).roles.highest <= interaction.member.roles.highest){
                interaction.reply({
                    content: 'Nemám dostatečné permise k nastavení přezdívky protože vaše role má vetši permisi než bot!',
                    ephemeral: true
                })
                return;
            }
            const newNickname = options.getString('nickname')

            interaction.member.setNickname(newNickname, 'User has used command!')
            interaction.reply({
                content: 'Vaše přezdívka byla nastavena na ' + newNickname,
                ephemeral: true
            })
        } else {
            interaction.reply({
                content: 'Nemám dostatečné permisi abych mohl nastavit vám vaši přezdívku!',
                ephemeral: true
            })
        }
    }else if (commandName === 'post'){
        const greetingEmbed = new MessageEmbed()
            .setTitle('**Poslaní žadosti**')
            .setDescription('Prosím vyberte kategorii kde pošlete žádost')
            .setColor('BLUE')
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setLabel('Fotografie')
                    .setEmoji('📷')
                    .setStyle('PRIMARY')
                    .setCustomId('category_photo')
            )
            .addComponents(
                new MessageButton()
                    .setLabel('VIP Servery')
                    .setEmoji('⭐')
                    .setStyle('PRIMARY')
                    .setCustomId('category_vipServer')
            )

        const greetedMessage = await interaction.member.send({
            embeds: [greetingEmbed],
            components: [row]
        })
        
        interaction.reply({
            content: 'Prosím zkontrolujte si přímé zprávy!',
            ephemeral: true
        })


        const filter = (btnInteraction) => {
            return interaction.user.id === btnInteraction.user.id
        }

        const categorySellectCollector = greetedMessage.channel.createMessageComponentCollector({
            filter,
            max: 1,
            time: 1000 * 60
        })

        let category
        let sub_category

        let image
        let previewPost

        let theGameFor
        let theLink
        categorySellectCollector.on('collect', (btnInterect) => {
            if (btnInterect.customId == 'category_photo'){
                category = 'Photo'

                const selectSubCategoryEmbed = new MessageEmbed()
                    .setTitle('**Vyberte pod-kategorie**')
                    .setDescription('Prosím vyberte na jakou hru tato fotka je')
                    .setColor('BLUE')
                
                const selectSubCategoryRow = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setLabel('Minecraft')
                            .setStyle('PRIMARY')
                            .setCustomId('subcategory_minecraft')
                            .setEmoji('⛏')
                    )
                    .addComponents(
                        new MessageButton()
                            .setLabel('Roblox')
                            .setStyle('PRIMARY')
                            .setCustomId('subcategory_roblox')
                    )
                    .addComponents(
                        new MessageButton()
                            .setLabel('Grand Theft Auto V')
                            .setStyle('PRIMARY')
                            .setEmoji('🚔')
                            .setCustomId('subcategory_gtav')
                    )

                btnInterect.reply({
                    embeds: [selectSubCategoryEmbed],
                    components: [selectSubCategoryRow]
                })

                const subCategoryCollector = btnInterect.channel.createMessageComponentCollector({
                    filter,
                    max: 1,
                    time: 1000 * 60
                })

                subCategoryCollector.on('collect', (subInteract) => {
                    sub_category = subInteract.customId

                    const imageEmbed = new MessageEmbed()
                        .setTitle('**Obrázek**')
                        .setDescription('Prosím pošlete obrázek který chcete poslat!')
                        .setColor('BLUE')

                    subInteract.reply({
                        embeds: [imageEmbed]
                    })

                    setTimeout(async () => {
                        const filter2 = (message) => {
                            return !client.user.id === message.author.id
                        }
    
                        subInteract.channel.awaitMessages({
                           filter2,
                           max: 1,
                           time: 1000 * 60,
                           errors: ['time']
                       })
                       .then(async collected => {
                            console.log('yeees')
                            const messageaaa = collected.first()
                            
                            if (messageaaa.attachments.size > 0){
                                image = messageaaa.attachments.first()

                                if (sub_category === 'subcategory_minecraft') {
                                    sub_category = 'Minecraft'
                                } else if (sub_category === 'subcategory_roblox') {
                                    sub_category = 'Roblox'
                                } else if (sub_category === 'subcategory_gtav') {
                                    sub_category = 'Grand Theft Auto V'
                                }

                                const sender = messageaaa

                                previewPost = 'Tuto fotku poslal <@' + messageaaa.author.id + '>'

                                await messageaaa.channel.send({
                                    content: previewPost,
                                    files: [image]
                                })

                                const confirmEmbed = new MessageEmbed()
                                    .setTitle('**Jste si jistí?**')
                                    .setDescription('Pokud souhlasíte vaše fotka bude poslaná na schválení, pokud ne nic se nepošle')
                                    .setColor('BLUE')

                                const confirmRow = new MessageActionRow()
                                    .addComponents(
                                        new MessageButton()
                                            .setLabel('Ano')
                                            .setStyle('SUCCESS')
                                            .setCustomId('yes_sent')
                                    )
                                    .addComponents(
                                        new MessageButton()
                                            .setLabel('Ne')
                                            .setStyle('DANGER')
                                            .setCustomId('dont_sent')
                                    )

                                messageaaa.channel.send({
                                    embeds: [confirmEmbed],
                                    components: [confirmRow]
                                })

                                const confirmCollector = subInteract.channel.createMessageComponentCollector({
                                    filter,
                                    max: 1,
                                    time: 1000 * 60
                                })
                                
                                confirmCollector.on('collect', async (confimIter) => {
                                    if (confimIter.customId === 'yes_sent'){
                                        const infoEmbed = new MessageEmbed()
                                            .setTitle('**Posláno**')
                                            .setDescription('Vaš požadavek byl poslán k schválení. Pokud bude schválen bude poslán do kategorie ktery jsi vybral!')
                                            .setColor('GREEN')

                                        confimIter.reply({
                                            embeds: [infoEmbed]
                                        })

                                        const approvalChannel = client.channels.cache.get('925790570822107196')

                                        const approveMessage = await approvalChannel.send({
                                            content: previewPost,
                                            files: [image]
                                        })

                                        activeRequests[approveMessage.id] = {
                                            Poster: interaction.member,
                                            Category: category,
                                            Sub_category: sub_category,
                                            final_Post: previewPost,
                                            theImage: image
                                        }

                                        return;
                                    }else if (confimIter.customId === 'dont_send') {
                                        const infoEmbed = new MessageEmbed()
                                            .setTitle('**Zrušeno**')
                                            .setDescription('Vaš požadavek byl zrušen!')
                                            .setColor('RED')

                                        confimIter.reply({
                                            embeds: [infoEmbed]
                                        })

                                        return;
                                    }
                                })
                            } else {
                                const failedEmbed = new MessageEmbed()
                                    .setTitle('**Invalidní fotka**')
                                    .setDescription('Tohle není fotka debile')
                                    .setColor('RED')

                                messageaaa.channel.send({
                                    embeds: [failedEmbed]
                                })

                                return;
                            }
                       }).catch(error => {
                        console.log(error);
                       })
                    }, 1000);

                   
                })
            } else if (btnInterect.customId === 'category_vipServer') {
                const infoEmbed = new MessageEmbed()
                    .setTitle('**Není hotové**')
                    .setDescription('Omlouváme se ale tato sekce ješte není hotová. Prosím zkus te to jindy.')
                    .setColor('BLUE')

                btnInterect.reply({
                    embeds: [infoEmbed]
                })
            }
        })
    }
})


client.on('messageCreate', async (Message) => {
    if (Message.content === '.visualtest'){
        const embed = new MessageEmbed()
            .setTitle('**Test**')
            .setDescription('Test')
            .setFooter('Prompt will end in XX:XX minutes *')
            .setColor('GREEN')

        Message.channel.send({
            embeds: [embed]
        })
    } else if (Message.content.startsWith('.approve')){
        const theGuildMember = Message.guild.members.cache.get(Message.author.id)

      if (theGuildMember.permissions.has('MANAGE_NICKNAMES')) {
        const args = Message.content.split(" ")
        const approvalChannel = client.channels.cache.get('925790570822107196')
        const theMessage = approvalChannel.messages.cache.get(args[1])
        

        if (theMessage.author.id === client.user.id){
           const postData = activeRequests[args[1]]

           if (postData.Sub_category === 'Roblox'){
               const RobloxChannel = client.channels.cache.get('925790477700190269')

               const thePost = await RobloxChannel.send({
                   content: postData.final_Post,
                   files: [postData.theImage]
               })
            
               const infoEmbed = new MessageEmbed()
                    .setTitle('**Přijato**')
                    .setDescription('Vaše fotka byla přijata!')
                    .setColor('GREEN')

                const infoRow = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setLabel('Ukázat fotku')
                            .setURL(thePost.url)
                            .setStyle('LINK')
                    )

                postData.Poster.send({
                    embeds: [infoEmbed],
                    components: [infoRow]
                })

                //arrayRemove(activeRequests, args[1])
           }else if (postData.Sub_category == 'Minecraft') {
            const MinecraftChannel = client.channels.cache.get('925790526173765663')

            const thePost = await MinecraftChannel.send({
                content: postData.final_Post,
                files: [postData.theImage]
            })
         
            const infoEmbed = new MessageEmbed()
                 .setTitle('**Přijato**')
                 .setDescription('Vaše fotka byla přijata!')
                 .setColor('GREEN')

             const infoRow = new MessageActionRow()
                 .addComponents(
                     new MessageButton()
                         .setLabel('Ukázat fotku')
                         .setURL(thePost.url)
                         .setStyle('LINK')
                 )

             postData.Poster.send({
                 embeds: [infoEmbed],
                 components: [infoRow]
             })

             //arrayRemove(activeRequests, args[1])
           } else if (postData.Sub_category === 'Grand Theft Auto V'){
            const GrandTheftAutoChannel = client.channels.cache.get('925790501939064832')

            const thePost = await GrandTheftAutoChannel.send({
                content: postData.final_Post,
                files: [postData.theImage]
            })
         
            const infoEmbed = new MessageEmbed()
                 .setTitle('**Přijato**')
                 .setDescription('Vaše fotka byla přijata!')
                 .setColor('GREEN')

             const infoRow = new MessageActionRow()
                 .addComponents(
                     new MessageButton()
                         .setLabel('Ukázat fotku')
                         .setURL(thePost.url)
                         .setStyle('LINK')
                 )

             postData.Poster.send({
                 embeds: [infoEmbed],
                 components: [infoRow]
             })

             //arrayRemove(activeRequests, args[1])
           }

           const infoEmbed = new MessageEmbed()
                    .setTitle('**Žádost přijata**')
                    .setDescription('Žádost uživatele <@' + postData.Poster.id + '> byla přijata!')
                    .setColor('BLUE')
            
            Message.channel.send({
                embeds: [infoEmbed]
            })
        }
      }
    } else if (Message.content.startsWith('.deny')) {
        const theGuildMember = Message.guild.members.cache.get(Message.author.id)

        if (theGuildMember.permissions.has('MANAGE_NICKNAMES')) {
            const args = Message.content.split(" ")
            const approvalChannel = client.channels.cache.get('925790570822107196')
            const theMessage = approvalChannel.messages.cache.get(args[1])
            const reason = args.slice(2).join(" ")
            const postData = activeRequests[args[1]]
            
            if (theMessage.author.id === client.user.id){
    
                const deniedEmbed = new MessageEmbed()
                    .setTitle('**Zamítnuto**')
                    .setDescription('Váš obrázek byl zamítnut kvuli ' + reason)
                    .setColor('RED')
    
                postData.Poster.send({
                    embeds: [deniedEmbed]
                })
    
    
                const infoEmbed = new MessageEmbed()
                    .setTitle('**Žádost zamítnuta**')
                    .setDescription('Žádost uživatele <@' + postData.Poster.id + '> byla zamítnuta kvuli ' + reason + ' !')
                    .setColor('BLUE')
            
                Message.channel.send({
                    embeds: [infoEmbed]
                })
                //arrayRemove(activeRequests, args[1])
            }
        }
     }
        
})

client.login(process.env.TOKEN)