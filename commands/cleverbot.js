module.exports = {
    name: ['cl', 'ask', 'cleverbot'],
    description: 'This lets you talk to cleverbot!',
    category: 'fun',
    main: function (bot, message) {
        config = require('../config.json')
        if(!config.clbotUser || !config.clbotKey){
            return message.channel.send("I could not find cleverbot key or user data in your config file, so this module is disabled")
        }
        let trimmedContent = message.content.substring(message.content.indexOf(' ') + 1, message.content.length) || null;
        if(!trimmedContent){
            return message.channel.send("You need to add a query to use this! (!cl query)")
        }
        const cleverbot = require('cleverbot.io');
        let cl = new cleverbot(config.clbotUser, config.clbotKey);
        let sessionName  = "CLBOT"
        message.channel.send("Loading response...").then(msg => {
            cl.setNick(sessionName)
            cl.create(function (err, sessionName) {
                message.channel.startTyping();
                cl.ask(trimmedContent, function (err, response) {
                    msg.edit(response);
                    message.channel.stopTyping();
                });
            });
        })
    },
}