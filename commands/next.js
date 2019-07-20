module.exports = {
    name: ['next'],
    description: 'Check out the next song in queue!',
    category: 'music',
    main: async function (bot, message) {
        const Discord = require('discord.js');
        let desc = "**Music Queue:**\n"
        //if (bot.devs.indexOf(message.author.id) < 0) return message.channel.send('This command is very unstable so it is currently locked to developers only');
        var music = require('../processes/music');
        let queue = await music.queue(bot, message, message.member.voiceChannel)
        if(!queue[0])return message.channel.send("I could not find any music in queue!")
        if(!queue[1])return message.channel.send("I could only find one song in queue!")
        var playEmbed = new Discord.RichEmbed()
            .setAuthor('Music - Up Next')
            .addField('Song Name', "```"+queue[1].title+"```")
            .addField('Channel Name', "```"+queue[1].channel+"```")
            .setThumbnail(queue[1].thumbnail)
            .setColor([204, 55, 95])
        message.channel.send(playEmbed);
    }
}