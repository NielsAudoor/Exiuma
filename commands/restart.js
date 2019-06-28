
module.exports = {
    name: ['restart', 'reload', 'reboot'],
    description: 'Restart the bot!',
    category: 'developer',
    main: function(bot, message) {
        var pm2 = require('pm2');
        if (bot.devs.indexOf(message.author.id) < 0) {
            return message.channel.send('Sorry, you need developer permissions to run this command');
        } else {
            message.channel.send('Restarting....')
            setTimeout(function() {
                pm2.restart('index')
            }, 1500);
        }
    },
};