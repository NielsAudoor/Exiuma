module.exports = {
    name: ['uptime', 'alive'],
    main: function (bot, message) {
        let uptimeseconds = bot.uptime / 1000;
        let uptimeminutes = bot.uptime / 60000;
        let uptimehours = bot.uptime / 3600000;
        let uptimedays = bot.uptime / 43200000;

        if (uptimeseconds < 60) {
            message.channel.send(Math.round(uptimeseconds) + ' seconds');
        }
        if (uptimeseconds > 60 && uptimeminutes < 60) {
            message.channel.send(Math.round(uptimeminutes) + ' minutes');
        }
        if (uptimeminutes > 60 && uptimehours < 24) {
            message.channel.send(Math.round(uptimehours) + ' hours');
        }
        if (uptimehours > 24) {
            message.channel.send(Math.round(uptimedays) + ' days');
        }
    },
};