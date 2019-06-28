module.exports = {
    name: ['profile', 'aboutme', 'info'],
    description: 'Retrieve some information about you or others!',
    category: 'utility',
    main: function(bot, message) {
        const Discord = require('discord.js');

        let toProfile = message.mentions.users.first();
        if (!toProfile) {
            let nickname;
            if(message.guild.member(message.author).nickname){
                nickname = message.guild.member(message.author).nickname
            } else {
                nickname = message.author.username
            }
            var embed = new Discord.RichEmbed()
                .setTitle("Here is what i could find about you!")
                .addField('Nickname', "```"+nickname+"```")
                .addField('Full username', "```"+message.author.tag+"```")
                .addField('User ID', "```"+message.author.id+"```")
                .addField('Created on', "```"+message.author.createdAt.toDateString()+"```")
                .setThumbnail(message.author.avatarURL)
                .setColor(message.guild.member(message.author).highestRole.color);
            message.channel.send(embed);
        } else {
            let nickname;
            if(message.guild.member(toProfile).nickname){
                nickname = message.guild.member(toProfile).nickname
            } else {
                nickname = toProfile.username
            }
            var embed = new Discord.RichEmbed()
                .setTitle(`Here is what i could find about ${toProfile.username}!`)
                .addField('Nickname', "```"+nickname+"```")
                .addField('Full username', "```"+toProfile.tag+"```")
                .addField('User ID', "```"+toProfile.id+"```")
                .addField('Created on', "```"+toProfile.createdAt.toDateString()+"```")
                .setThumbnail(toProfile.avatarURL)
                .setColor(message.guild.member(toProfile).highestRole.color);
            message.channel.send(embed)
        }
    },
};