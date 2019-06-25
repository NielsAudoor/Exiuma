module.exports = {
    name: ['ping', 'pong', 'latency'],
    main: function(bot, message) {
        message.channel.send(`${Math.round(bot.ping)} ms`)
    },
};