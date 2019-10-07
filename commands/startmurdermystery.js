module.exports = {
    name: ['startmurdermystery', 'murdermystery'],
    description: 'Start up a murder mystery!!',
    category: 'fun',
    main: async function (bot, message) {
        var murdermystery = require('../processes/murdermystery');
        murdermystery.start(bot, message, "Welcome to the murder mystery! Type 'Join' to join the game!")

    }
}