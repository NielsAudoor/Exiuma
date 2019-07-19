module.exports = {
    name: ['resume'],
    description: 'Resume your music!',
    category: 'music',
    main: function(bot, message) {
        var music = require('../processes/music');
        if(!message.member.voiceChannel) return message.channel.send("You have to be in a voice channel to use this command!")
        music.resume(bot, message, message.member.voiceChannel, function (err, client) {
            if (err) console.log(err);
        })
    },
}