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
        message.channel.send({
            embed: {
                color: 13383519,
                author: {name: `Music - Up Next`},
                thumbnail: {url: queue[1].thumbnail,},
                fields: [
                    {name: 'Song Name', value: `[${"```"+queue[1].title+"```"}](${queue[1].url})`},
                    {name: 'Channel Name', value: "```"+queue[1].channel+"```"},
                ],
            },
        });
    }
}