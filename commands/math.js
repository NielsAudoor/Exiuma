module.exports = {
    name: ['math','wolfram'],
    description: 'Search Wolfram Alpha!',
    category: 'fun',
    main: function(bot, message) {
        config = require('../config.json')

        if(!config.wolframkey){
            return message.channel.send("I could not find a wolfram key in your config file, so this module is disabled")
        }

        let trimmedContent = message.content.substring(message.content.indexOf(' ') + 1, message.content.length) || null;
        var wolfram = require('wolfram').createClient(config.wolframkey)
        const Discord = require('discord.js');
        let image = 0;
        let reactionTrigger = 0;        //0 =no reaction, 1=back, 2=forward&back, 3=forward
        const filter = (reaction, user) => user.id === message.author.id &&(reaction.emoji.name === '⬅' || reaction.emoji.name === '➡');
        if(!trimmedContent){
            return message.channel.send("You need to add a query to use this! (!wolfram query)")
        }
        if(message.content.includes("ip")){
            return;
        }
        async function reactionCatcher(msg) {
            var clrReactions = setTimeout(function() {
                msg.clearReactions();
            }, 60000)
            msg.awaitReactions(filter, {max: 1, time: 60000}).then(collected => {
                if(collected){
                    if(collected.first()){
                        if(collected.first().emoji.name === '➡'){
                            image++
                            clearTimeout(clrReactions);
                            msg.clearReactions()
                            updateImg(msg);
                        }
                        if(collected.first().emoji.name === '⬅'){
                            image--
                            clearTimeout(clrReactions);
                            msg.clearReactions()
                            updateImg(msg);
                        }
                    }
                }
            });
        }
        async function initialGrab() {
            wolfram.query(trimmedContent , function(err, result) {
                if(result.length-1 > image && image > 0){
                    reactionTrigger = 2
                } else if (result.length >= image && image <= 0){
                    reactionTrigger = 3
                } else if (image >= result.length-1) {
                    reactionTrigger = 1
                } else if (result.length == 1){
                    reactionTrigger = 0
                }
                console.log(result.length)
                if(result[1]) {
                    result = result[1];
                    if(result.subpods){
                        result = result.subpods
                            if(result[0].image) {
                                var embed = new Discord.RichEmbed()
                                    .setAuthor(`Here is what I found:`, message.author.avatarURL)
                                    .setColor([255, 255, 255])
                                    .setImage(result[0].image);
                                message.channel.send(embed).then(msg => {
                                    if(reactionTrigger == 1){
                                        msg.react("⬅");
                                    } else if(reactionTrigger == 2) {
                                        msg.react("⬅");
                                        setTimeout(function() {
                                            msg.react("➡");
                                        }, 750)
                                    } else if(reactionTrigger == 3){
                                        msg.react("➡");
                                    }
                                    if(reactionTrigger !== 0){
                                        reactionCatcher(msg)
                                    }
                                })
                            } else {
                                message.channel.send("I have encountered an error: code 1")
                            }
                    } else {
                        message.channel.send("I have encountered an error: code 2")
                    }
                } else {
                    message.channel.send("I was unable to pull data for that request")
                }
            })
        }
        async function updateImg(msg) {
            wolfram.query(trimmedContent , function(err, result) {
                if(result.length-1 > image && image > 0){
                    reactionTrigger = 2
                } else if (result.length >= image && image <= 0){
                    reactionTrigger = 3
                } else if (image >= result.length-1) {
                    reactionTrigger = 1
                } else if (result.length == 1){
                    reactionTrigger = 0
                }
                console.log(result.length)
                if(err) throw err
                if(result[image]) {
                    result = result[image];
                    if(result.subpods){
                        result = result.subpods
                        if(result[0].image) {
                            var embed = new Discord.RichEmbed()
                                .setAuthor(`Here is what I found:`, message.author.avatarURL)
                                .setColor([255, 255, 255])
                                .setImage(result[0].image);
                            msg.edit(embed)
                                if(reactionTrigger == 1){
                                    msg.react("⬅");
                                } else if(reactionTrigger == 2) {
                                    msg.react("⬅");
                                    setTimeout(function() {
                                        msg.react("➡");
                                    }, 750)
                                } else if(reactionTrigger == 3){
                                    msg.react("➡");
                                }
                                if(reactionTrigger !== 0){
                                    reactionCatcher(msg)
                                }
                        } else {
                            message.channel.send("I have encountered an error: code 1")
                        }
                    } else {
                        message.channel.send("I have encountered an error: code 2")
                    }
                } else {
                    message.channel.send("I was unable to pull data for that request")
                }
            })
        }
        initialGrab()
    },
};