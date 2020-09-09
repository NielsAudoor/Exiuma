module.exports = {
    name: ['skip'],
    description: 'Skip a song!',
    category: 'music',
    main: function(bot, message) {
        //if (bot.devs.indexOf(message.author.id) < 0) return message.channel.send('This command is very unstable so it is currently locked to developers only');
        if(!message.member.voiceChannel) return message.channel.send("You have to be in a voice channel to use this command!")
        var music = require('../processes/music');
        //if (!message.guild.member(message.author).hasPermission('ADMINISTRATOR') && bot.devs.indexOf(message.author.id) < 0){
        if (!message.guild.member(message.author).hasPermission('ADMINISTRATOR') ){
            music.voteskip(bot, message, message.member.voiceChannel, function (err, client) {
                if (err) console.log(err);
            })
        } else {
            music.skip(bot, message, message.member.voiceChannel, function (err, client) {
                if (err) console.log(err);
            })
        }
    },
}