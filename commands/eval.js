module.exports = {
    name: ['eval', 'evaluate'],
    description: 'Run code on the fly!',
    category: 'developer',
    main: function (bot, message) {
        const Discord = require('discord.js');
        let trimmedContent = message.content.substring(message.content.indexOf(' ') + 1, message.content.length) || null;
        if(!trimmedContent) {
            return message.channel.send("You need to add a query to use this! (!eval query)")
        }
        //dev check
        if (bot.devs.indexOf(message.author.id) < 0) {
            return message.channel.send('Sorry, you need developer permissions to run this command');
        }

        //making the data usable
        cleantext = function (text) {
            if (typeof text === 'string') { return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203)); } else {
                return text;
            }
        };
        let arg = trimmedContent.split(/\s+/g);
        var code = arg.join(' ');
        //running eval
        try {
            var code = trimmedContent;
            var evaled = eval(code);
            if (typeof evaled !== 'string') {
                evaled = require('util').inspect(evaled);
            }
            var embed = new Discord.RichEmbed()
                .setAuthor(`Evaluation Complete`, message.guild.iconURL)
                .setColor([0, 255, 0])
                .addField('**Input:**', `\`\`\`js\n${trimmedContent}\`\`\``)
                .addField('**Output:**', `\`\`\`js\n${cleantext(evaled)}\`\`\``);
            message.channel.send(embed);
        } catch (err) {
            var errembed = new Discord.RichEmbed()
                .setAuthor(`Evaluation Failed`, message.guild.iconURL)
                .setColor([255, 0, 0])
                .addField('**Input:**', `\`\`\`js\n${trimmedContent}\`\`\``)
                .addField('**ERROR:**', `\`\`\`${cleantext(err)}\`\`\``);
            message.channel.send(errembed);
        }
        return null;
    },
};