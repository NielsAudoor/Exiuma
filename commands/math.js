module.exports = {
    name: ['math','wolfram'],
    main: function(bot, message) {
        var wolfram = require('wolfram').createClient("VHXRY5-R4X5G9272P")
        const Discord = require('discord.js');
        let image = 0;
        let reactionTrigger = 0;        //0 =no reaction, 1=back, 2=forward&back, 3=forward
        const filter = (reaction, user) => user.id === message.author.id &&(reaction.emoji.name === '⬅' || reaction.emoji.name === '➡');

        if(message.content.includes("ip")){
            return;
        }

        async function reactionCatcher(msg) {
            setTimeout(function() {
                msg.clearReactions();
            }, 60000)
            msg.awaitReactions(filter, {max: 1, time: 60000}).then(collected => {
                if(collected){
                    if(collected.first().emoji.name === '➡'){
                        image++
                        msg.clearReactions()
                        updateImg(msg);
                    }
                    if(collected.first().emoji.name === '⬅'){
                        image--
                        msg.clearReactions()
                        updateImg(msg);
                    }
                }
            });
        }

        async function initialGrab() {
            wolfram.query(message.content , function(err, result) {
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
                                        }, 250)
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
            wolfram.query(message.content , function(err, result) {
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
                                    }, 250)
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