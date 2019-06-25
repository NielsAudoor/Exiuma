module.exports = {
    name: ['img', 'image', 'picture'],
    main: function(bot, message) {
        const Discord = require('discord.js');
        var gis = require('g-i-s');
        const filter = (reaction, user) => user.id === message.author.id &&(reaction.emoji.name === '⬅' || reaction.emoji.name === '➡');
        let page = 0

        async function reactionCatcher(msg) {
            setTimeout(function() {
                msg.clearReactions();
            }, 60000)
            msg.awaitReactions(filter, {max: 1, time: 60000}).then(collected => {
                console.log(collected.first().emoji.name)
                if(collected.first().emoji.name === '➡'){
                    console.log("next page")
                    page++
                    msg.clearReactions()
                    updateImg(msg);
                }
                if(collected.first().emoji.name === '⬅'){
                    console.log("last page")
                    page--
                    msg.clearReactions()
                    updateImg(msg);
                }
            });
        }

        async function updateImg(msg) {
            gis(message.content, logResults);
            function logResults(error, results) {
                if (error) {
                    console.log(error);
                }
                else {
                    if(msg == null) {
                        var embed = new Discord.RichEmbed()
                            .setAuthor(`${message.content} - ${page+1}/${results.length} results`)
                            .setColor([255, 255, 255])
                            .setImage(results[page].url)
                            .setTimestamp();
                        message.channel.send(embed).then(msg => {
                            if (page > 0) {
                                msg.react("⬅");
                                msg.react("➡");
                            } else {
                                msg.react("➡");
                            }
                            reactionCatcher(msg)
                        })
                    } else {
                        var embed = new Discord.RichEmbed()
                            .setAuthor(`${message.content} - ${page+1}/${results.length} results`)
                            .setColor([255, 255, 255])
                            .setImage(results[page].url)
                            .setTimestamp();
                        msg.edit(embed)
                        if (page > 0 && page < results.length-1) {
                            msg.react("⬅");
                            setTimeout(function() {
                                msg.react("➡");
                            }, 250)
                        } else if (page >= reults.length-1){
                            msg.react("⬅");
                        } else if (page === 0){
                            msg.react("➡");
                        }
                        reactionCatcher(msg)
                    }
                }
            }
        }
        updateImg(null);
    },
};