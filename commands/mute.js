module.exports = {
    name: ['mute', 'silence'],
    description: 'Mute all members in a voice channel',
    category: 'utility',
    main: function(bot, message) {
        const Discord = require('discord.js');
        if (!message.guild.member(message.author).hasPermission('ADMINISTRATOR') && bot.devs.indexOf(message.author.id) < 0) {
            return message.channel.send('Sorry, but you need administrator privileges to run this command!');
        }
        var vcChannelFailEmbed = new Discord.RichEmbed()
            .setAuthor('Error')
            .setColor([255, 120, 120])
            .setDescription(`You have to be connected to a voice channel to use this!`);
        var permFailEmbed = new Discord.RichEmbed()
            .setAuthor('Error')
            .setColor([255, 120, 120])
            .setDescription(`Sorry I don't have the permission to do this!`);
        if (!message.guild.member(bot.user).hasPermission('ADMINISTRATOR')) return message.channel.send(permFailEmbed);
        if(!message.member.voiceChannel) return message.channel.send(vcChannelFailEmbed);
        for(let i=0;i<message.member.voiceChannel.members.array().length;i++){
            message.member.voiceChannel.members.array()[i].setMute(true);
        }
    },
}