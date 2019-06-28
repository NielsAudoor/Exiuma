module.exports = {
    name: ['ping', 'pong', 'latency'],
    description: 'Check bot latency!',
    category: 'utility',
    main: function(bot, message) {
        message.channel.send(`${Math.round(bot.ping)} ms`)
    },
};