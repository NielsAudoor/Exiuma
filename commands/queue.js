module.exports = {
    name: ['queue'],
    description: 'Check out the music queue!',
    category: 'music',
    main: async function (bot, message) {
        if (bot.devs.indexOf(message.author.id) < 0) return message.channel.send('This command is very unstable so it is currently locked to developers only');
        var music = require('../processes/music');
        let queue = await music.queue(bot, message, message.member.voiceChannel)
        console.log(queue)
    }
}