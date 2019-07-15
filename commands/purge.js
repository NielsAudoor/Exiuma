module.exports = {
    name: ['purge', 'delete', 'nuke'],
    description: 'Delete a certain amount of messages',
    category: 'moderation',
    main: function (bot, message) {
        const Discord = require('discord.js');
        let purger = message.author;
        let purgeamount;
        let messageDeleteCount = 0;
        if (!message.guild.member(message.author).hasPermission('MANAGE_MESSAGES') && bot.devs.indexOf(message.author.id) < 0) {
            return message.channel.send('You cant do this');
        }
        const filter = m => m.author.id === message.author.id;
        async function promptUser(msg) {
            return new Promise(result => {
                message.channel.send(msg)
                message.channel.awaitMessages(filter, { max: 1, time: 30000 }).then(collected => {
                    if(collected.first()){
                        if (collected.first().attachments.size == 0) {
                            if (collected.first().content) {
                                result(collected.first())
                            }
                        } else {
                            message.channel.send("Please don't send a picture during setup.");
                        }
                    }
                })
            });
        }
        async function getPurgeAmount(){
            messageDeleteCount++
            var result = await promptUser('How many messages do you want to purge?');
            if(result){
                messageDeleteCount++
                if(!isNaN(result.content)) {
                    purgeamount = result.content;
                    message.channel.bulkDelete(parseInt(purgeamount)+parseInt(messageDeleteCount));
                    message.channel.send(`${purgeamount} messages were deleted by ${purger}`);
                } else {
                    messageDeleteCount++
                    message.channel.send("You have to send a number!")
                    repromptUser()
                }
            }
        }
        async function repromptUser(){
            messageDeleteCount++
            var result = await promptUser('How many messages do you want to purge?');
            if(result){
                if(!isNaN(result.content+messageDeleteCount)) {
                    purgeamount = result.content;
                    message.channel.bulkDelete(parseInt(purgeamount)+parseInt(messageDeleteCount));
                    message.channel.send(`${purgeamount} messages were deleted by ${purger}`);
                } else {
                    messageDeleteCount++
                    message.channel.send("You have to send a number!")
                    repromptUser()
                }
            }
        }
        getPurgeAmount()
    },
};