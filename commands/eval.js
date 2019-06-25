module.exports = {
    name: ['eval', 'evaluate'],
    main: function (bot, message) {
        const Discord = require('discord.js');

        cleantext = function (text) {
            if (typeof text === 'string') { return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203)); } else {
                return text;
            }
        };

        if (bot.devs.indexOf(message.author.id) < 0) {
            return message.channel.send('Sorry, you need developer permissions to run this command');
        }
        let arg = message.content.split(/\s+/g);
        var code = arg.join(' ');
        try {
            var code = message.content;
            var evaled = eval(code);
            if (typeof evaled !== 'string') {
                evaled = require('util').inspect(evaled);
            }
            var embed = new Discord.RichEmbed()
                .setAuthor(`Evaluation Complete`, message.guild.iconURL)
                .setColor([0, 255, 0])
                .addField('**Input:**', `\`\`\`js\n${message.content}\`\`\``)
                .addField('**Output:**', `\`\`\`js\n${cleantext(evaled)}\`\`\``);
            message.channel.send(embed);
        } catch (err) {
            var errembed = new Discord.RichEmbed()
                .setAuthor(`Evaluation Failed`, message.guild.iconURL)
                .setColor([255, 0, 0])
                .addField('**Input:**', `\`\`\`js\n${message.content}\`\`\``)
                .addField('**ERROR:**', `\`\`\`${cleantext(err)}\`\`\``);
            message.channel.send(errembed);
        }

        return null;
    },
};