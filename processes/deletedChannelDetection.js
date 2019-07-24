module.exports = {
    scan: function (bot, callback) {
        const Discord = require('discord.js');
        var mongoUtil = require('../processes/mongoUtil');
        var db = mongoUtil.getDb();

        async function dataBaseCheck(table,query) {
            return new Promise(promise => {
                mongoUtil.getDb().collection(table).find(query).toArray(function (err, result) {
                    if (err) throw err;
                    if (result.length == 0) {    //if there is no database
                        promise(null)
                    } else {                    //if there is a database
                        promise(result[0])
                    }
                });
            })
        }
        async function checkPrefix(channel){
            var query = {serverID: channel.guild.id};
            var result = await dataBaseCheck("prefix", query);
            var prefix;
            return new Promise(promise => {
                if (result) {
                    promise(result.prefix)
                } else {
                    promise(bot.prefix)
                }
            })
        }
        async function checkDB(channel){
            var query = {serverID: channel.guild.id};
            var prefix = await dataBaseCheck("prefix",query);
            let channelID;
            let channels = channel.guild.channels;
            channelLoop:
                for (let c of channels) {
                    let channelType = c[1].type;
                    if (channelType === "text") {
                        channelID = c[0];
                        break channelLoop;
                    }
                }
            var result = await dataBaseCheck("logging",query);
                if(result){
                    if (result.channelID !== null) {
                        if(result.channelID == channel.id){
                            bot.channels.get(channel.guild.systemChannelID || channelID).send(`Hey there! I just noticed that you deleted the channel that was used for logging. If you want to use this feature in the future, you can use ${prefix.prefix}logs to set it up again!`)
                            mongoUtil.getDb().collection("logging").deleteMany(query, function(err, obj) {
                                if (err) throw err;
                                console.log(obj.result.n + " document(s) deleted");
                            })
                    }
                }
            }
            var result = await dataBaseCheck("welcome",query);
            if(result){
                if (result.channelID !== null) {
                    if(result.channelID == channel.id){
                        bot.channels.get(channel.guild.systemChannelID || channelID).send(`Hey there! I just noticed that you deleted the welcome channel. If you want to use this feature in the future, you can use ${prefix.prefix}welcome to set it up again!`)
                        mongoUtil.getDb().collection("welcome").deleteMany(query, function(err, obj) {
                            if (err) throw err;
                            console.log(obj.result.n + " document(s) deleted");
                        })
                    }
                }
            }
            var query2 = {serverID: channel.guild.id, channelID: channel.id};
            var result = await dataBaseCheck("dynamicVC",query);
            if(result){
                if (result.channelID !== null) {
                    if(result.channelID == channel.id){
                        bot.channels.get(channel.guild.systemChannelID || channelID).send(`Hey there! I just noticed that you deleted a dynamic voice channel. If you want to use this feature in the future, you can use ${prefix.prefix}vc to set it up again!`)
                        mongoUtil.getDb().collection("dynamicVC").deleteOne(query2, function(err, obj) {
                            if (err) throw err;
                            console.log(obj.result.n + " document(s) deleted");
                        })
                    }
                }
            }
        }
        bot.on('channelDelete', channel => {checkDB(channel)});
    },
}