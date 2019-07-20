module.exports = {
    name: ['play'],
    description: 'Play some music!',
    category: 'music',
    main: async function(bot, message) {
        //if (bot.devs.indexOf(message.author.id) < 0) return message.channel.send('This command is very unstable so it is currently locked to developers only');
        var music = require('../processes/music');
        const Discord = require('discord.js');
        let query = message.content.substring(message.content.indexOf(' ') + 1, message.content.length) || null;
        var vcChannelFailEmbed = new Discord.RichEmbed()
            .setAuthor('Music - Error')
            .setColor([255, 120, 120])
            .setDescription(`You have to be connected to a voice channel to use this!`);
        var lookupFailEmbed = new Discord.RichEmbed()
            .setAuthor('Music - Error')
            .setColor([255, 120, 120])
            .setDescription(`You have to give me something to play!`);
        if(!message.args[1]) return message.channel.send(lookupFailEmbed)
        if(!message.member.voiceChannel) return message.channel.send(vcChannelFailEmbed)
        let queriedData = await music.queryData(query)
        let parsedData = await music.parseData(queriedData, 0)
        message.member.voiceChannel.join().then(connection => {
            music.play(bot, message, connection, parsedData, function (err, client) {
                if (err) console.log(err);
            }).catch(console.error);
        });
    },
}