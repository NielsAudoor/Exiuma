module.exports = {
    scan: function (bot, callback) {
        const Discord = require('discord.js');
        var servers = {}
        function arrayRemove(arr, value) {
            return arr.filter(function(ele){
                return ele != value;
            });
        }
        async function queryDB(member){
            return new Promise(promise => {
                var mongoUtil = require('../processes/mongoUtil');
                var db = mongoUtil.getDb();
                var guildQuery = {serverID: member.guild.id, channelID: member.voiceChannel.id};
                db.collection("dynamicVC").find(guildQuery).toArray(function (err, result) {
                    if (err) throw err;
                    if (result.length == 0) {
                        promise(null)
                    } else {
                        promise(result)
                    }
                });
            })
        }
        async function dynamicVc(oldMember, newMember){
            if(newMember.voiceChannel && !oldMember.voiceChannel){ //if just joined voice channel
                let result = await queryDB(newMember)
                if(result) {
                    if (newMember.voiceChannel.id == result[0].channelID) {
                        if (!servers[newMember.guild.id]) {
                            servers[newMember.guild.id] = {
                                channels: [],
                                list: 0
                            };
                        }
                        var server = servers[newMember.guild.id]
                        if (server) {
                            if (newMember.guild.member(bot.user).hasPermission("MANAGE_CHANNELS")) {
                                newMember.guild.createChannel("[" + result[0].name + " - " + (server.channels.length + 1) + "]", {type: 'voice'}).then((channel) => {
                                    if (newMember.guild.channels.find(c => c.id == result[0].channelID).parentID) {
                                        channel.setParent(newMember.guild.channels.find(c => c.id == result[0].channelID).parentID)
                                    }
                                    var server = servers[newMember.guild.id]
                                    newMember.setVoiceChannel(channel)
                                    server.channels.push(channel)
                                    server.list++
                                    if (result[0].dynamic == true) {
                                        dynamicTitle(oldMember, newMember, true, channel, server.list)
                                    }
                                })
                            } else {
                                let channelID;
                                let channels = newMember.guild.channels;
                                channelLoop:
                                    for (let c of channels) {
                                        let channelType = c[1].type;
                                        if (channelType === "text") {
                                            channelID = c[0];
                                            break channelLoop;
                                        }
                                    }
                                var embed = new Discord.RichEmbed()
                                    .setAuthor('DynamicVC - Error')
                                    .setColor([255, 120, 120])
                                    .setDescription(`I am missing permissions to make a dynamic vc work - Manage Channels`);
                                bot.channels.get(newMember.guild.systemChannelID || channelID).send(embed)
                            }
                        }
                    }
                }
            } else if(newMember.voiceChannel && oldMember.voiceChannel){   //if changed voice channel
                if(newMember.voiceChannel !== oldMember.voiceChannel){
                    let result = await queryDB(newMember)
                    if(result){
                        if(newMember.voiceChannel.id == result[0].channelID){
                            if (!servers[newMember.guild.id]) {
                                servers[newMember.guild.id] = {
                                    channels: [],
                                    list: 0
                                };
                            }
                            var server = servers[newMember.guild.id]
                            console.log("multiple channels")
                            if(server.list){
                                if(newMember.guild.member(bot.user).hasPermission("MANAGE_CHANNELS")) {
                                    newMember.guild.createChannel("[" + result[0].name + " - " + (server.list + 1) + "]", {type: 'voice'}).then((channel) => {
                                        if (newMember.guild.channels.find(c => c.id == result[0].channelID).parentID) {
                                            channel.setParent(newMember.guild.channels.find(c => c.id == result[0].channelID).parentID)
                                        }
                                        var server = servers[newMember.guild.id]
                                        newMember.setVoiceChannel(channel)
                                        server.channels.push(channel)
                                        server.list++
                                        if (result[0].dynamic == true) {
                                            dynamicTitle(oldMember, newMember, true, channel, server.list)
                                        }
                                    })
                                } else {
                                    let channelID;
                                    let channels = newMember.guild.channels;
                                    channelLoop:
                                        for (let c of channels) {
                                            let channelType = c[1].type;
                                            if (channelType === "text") {
                                                channelID = c[0];
                                                break channelLoop;
                                            }
                                        }
                                    var embed = new Discord.RichEmbed()
                                        .setAuthor('DynamicVC - Error')
                                        .setColor([255, 120, 120])
                                        .setDescription(`I am missing permissions to make a dynamic vc work - Manage Channels`);
                                    bot.channels.get(newMember.guild.systemChannelID || channelID).send(embed)
                                }
                            } else {
                                if(newMember.guild.member(bot.user).hasPermission("MANAGE_CHANNELS")) {
                                    newMember.guild.createChannel("[" + result[0].name + " - 1]", {type: 'voice'}).then((channel) => {
                                        if (newMember.guild.channels.find(c => c.id == result[0].channelID).parentID) {
                                            channel.setParent(newMember.guild.channels.find(c => c.id == result[0].channelID).parentID)
                                        }
                                        var server = servers[newMember.guild.id]
                                        newMember.setVoiceChannel(channel)
                                        server.channels.push(channel)
                                        server.list++
                                        if (result[0].dynamic == true) {
                                            dynamicTitle(oldMember, newMember, true, channel, server.list)
                                        }
                                    })
                                } else {
                                    let channelID;
                                    let channels = newMember.guild.channels;
                                    channelLoop:
                                        for (let c of channels) {
                                            let channelType = c[1].type;
                                            if (channelType === "text") {
                                                channelID = c[0];
                                                break channelLoop;
                                            }
                                        }
                                    var embed = new Discord.RichEmbed()
                                        .setAuthor('DynamicVC - Error')
                                        .setColor([255, 120, 120])
                                        .setDescription(`I am missing permissions to make a dynamic vc work - Manage Channels`);
                                    bot.channels.get(newMember.guild.systemChannelID || channelID).send(embed)
                                }
                            }

                        }
                    } else if(newMember.voiceChannel.id !== oldMember.voiceChannel.id){
                        var server = servers[newMember.guild.id]
                        if(server){
                            if(server.channels){
                                for(let i = 0; i<server.channels.length; i++){
                                    if(server.channels[i]){
                                        if(server.channels[i].members.map(r => r.user.username).length < 1){
                                            server.channels[i].delete()
                                            server.list--
                                            delete server.channels[i]
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            else if(!newMember.voiceChannel && oldMember.voiceChannel){ //if just left voice channel
                var server = servers[newMember.guild.id]
                if(server){
                    if(server.channels){
                        for(let i = 0; i<server.channels.length; i++){
                            if(server.channels[i]){
                                if(server.channels[i].members.map(r => r.user.username).length < 1){
                                    server.channels[i].delete()
                                    server.list--
                                    delete server.channels[i]
                                }
                            }
                        }
                    }
                }
            }
        }
        async function dynamicTitle(oldMember, newMember, override, channel, number) {
            if (!servers[newMember.guild.id]) {
                servers[newMember.guild.id] = {
                    channels: [],
                    list: 0
                };
            }
            var server = servers[newMember.guild.id]
            if (override) {
                let desc;
                setTimeout(function () {
                    for (let i = 0; i < channel.members.map(r => r.user.username).length; i++) {
                        if (channel.members.array()[i].presence.game) {
                            console.log(channel.members.array()[i].presence.game.name)
                            if (!desc) {
                                desc = channel.members.array()[i].presence.game.name
                            } else {
                                desc += ", " + channel.members.array()[i].presence.game.name
                            }
                        }
                    }
                    channel.setBitrate(96)
                    setTimeout(function () {
                        if (desc) {
                            channel.setName("[" + desc + " - " + number + "]")
                        }
                    }, 1000)
                }, 1000)
            }
        }
        //bot.on('presenceUpdate', (oldMember, newMember) => {dynamicTitle(oldMember, newMember, false, null, null)});
        bot.on('voiceStateUpdate', (oldMember, newMember) => {dynamicVc(oldMember, newMember)});
    }
}