module.exports = {
    name: ['stop'],
    description: 'Stop your music!',
    category: 'music',
    main: function(bot, message) {
        //if (bot.devs.indexOf(message.author.id) < 0) return message.channel.send('This command is very unstable so it is currently locked to developers only');
        if (!message.guild.member(message.author).hasPermission('ADMINISTRATOR') && bot.devs.indexOf(message.author.id) < 0) return message.channel.send('Sorry, but you need administrator privileges to run the stop command!');
        var music = require('../processes/music');
        if(!message.member.voiceChannel) return message.channel.send("You have to be in a voice channel to use this command!")
        music.stop(bot, message, message.member.voiceChannel, function (err, client) {
            if (err) console.log(err);
        })
    },
}