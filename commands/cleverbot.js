module.exports = {
    name: ['cl', 'ask', 'cleverbot'],
    main: function (bot, message) {
        config = require('./config.json')
        const cleverbot = require('cleverbot.io');
        let cl = new cleverbot(config.clbotUser, config.clbotKey);
        let sessionName  = "CLBOT"
        message.channel.send("Loading response...").then(msg => {
            cl.setNick(sessionName)
            cl.create(function (err, sessionName) {
                message.channel.startTyping();
                cl.ask(message.content, function (err, response) {
                    msg.edit(response);
                    message.channel.stopTyping();
                });
            });
        })
    },
}