module.exports = {
    name: ['img', 'image', 'picture'],
    description: 'Search google images!',
    category: 'fun',
    main: function(bot, message) {
        const Discord = require('discord.js');
        var gis = require('g-i-s');
        const filter = (reaction, user) => user.id === message.author.id &&(reaction.emoji.name === '⬅' || reaction.emoji.name === '➡');
        let page = 0
        let reactionTrigger = 0;        //0 =no reaction, 1=back, 2=forward&back, 3=forward
        let trimmedContent = message.content.substring(message.content.indexOf(' ') + 1, message.content.length) || null;
        if(!trimmedContent){
            return message.channel.send("You need to add a query to use this! (!img query)")
        }

        async function reactionCatcher(msg) {
            var clrReactions = setTimeout(function() {
                msg.clearReactions();
            }, 60000)
            msg.awaitReactions(filter, {max: 1, time: 60000}).then(collected => {
                if(collected){
                    if(collected.first()){
                        if(collected.first().emoji.name === '➡'){
                            page++
                            clearTimeout(clrReactions);
                            msg.clearReactions()
                            updateImg(msg);
                        }
                        if(collected.first().emoji.name === '⬅'){
                            page--
                            clearTimeout(clrReactions);
                            msg.clearReactions()
                            updateImg(msg);
                        }
                    }
                }
            });
        }

        async function generateReactions(msg){
            if(page+1 > 1 && page+1 <100){
                msg.react("⬅");
                setTimeout(function() {
                    msg.react("➡");
                }, 750)
            } else if(page == 0) {
                msg.react("➡");
            } else if(page+1 == 100){
                msg.react("⬅");
            }
            if(reactionTrigger !== 0){
                reactionCatcher(msg)
            }
        }

        async function updateImg(msg) {
            gis(trimmedContent, logResults);
            function logResults(error, results) {
                if (error) {
                    console.log(error);
                }
                else {
                    console.log(JSON.stringify(results, null, '  '))
                    if(results[page]){
                        if(msg == null) {
                            var embed = new Discord.RichEmbed()
                                .setAuthor(`${trimmedContent} - ${page+1}/${results.length} results`)
                                .setColor([255, 255, 255])
                                .setImage(results[page].url)
                                .setTimestamp();
                            message.channel.send(embed).then(msg => {
                                generateReactions(msg)
                                reactionCatcher(msg)
                            })
                        } else {
                            var embed = new Discord.RichEmbed()
                                .setAuthor(`${trimmedContent} - ${page+1}/${results.length} results`)
                                .setColor([255, 255, 255])
                                .setImage(results[page].url)
                                .setTimestamp();
                            msg.edit(embed)
                            setTimeout(function() {
                                generateReactions(msg)
                                reactionCatcher(msg)
                            },300)
                        }
                    }
                }
            }
        }
        updateImg(null);
    },
};