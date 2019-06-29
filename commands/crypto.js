module.exports = {
    name: ['crypto', 'cryptocurrency', 'bitcoin'],
    description: 'Check the prices of current cryptocoins using their respective symbol!',
    category: 'utility',
    main: function (bot, message) {
        const Discord = require('discord.js');
        global.fetch = require('node-fetch')
        const cc = require('cryptocompare')
        config = require('../config.json')
        cc.setApiKey(config.crypto)
        let trimmedContent = message.content.substring(message.content.indexOf(' ') + 1, message.content.length) || null;
        if(!trimmedContent) {
            return message.channel.send("You need to add a query to use this! (!crypto query)")
        }
        cc.price(trimmedContent.toUpperCase(), 'USD').then(price => {
            message.channel.send("the price of " + trimmedContent.toUpperCase() + " is currently " + price.USD + " USD");
        }).catch(err => {
            message.channel.send("Please use a valid symbol for the coin you are looking for.")
        })
    },
};