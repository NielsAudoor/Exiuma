module.exports = {
    name: ['startmurdermystery', 'murdermystery'],
    description: 'Start up a murder mystery!!',
    category: 'developer',
    main: async function (bot, message) {
        if (bot.devs.indexOf(message.author.id) < 0) return message.channel.send('This command is very unstable so it is currently locked to developers only. Sorry about that!');
        var murdermystery = require('../processes/murdermystery');
        murdermystery.start(bot, message, "Welcome to the murder mystery! Click the check mark to join the game!")
    }
}