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
            console.log("check 1")
            if(newMember.voiceChannel && !oldMember.voiceChannel){ //if just joined voice channel
                console.log("check 2")
                let result = await queryDB(newMember)
                if(newMember.voiceChannel.id == result[0].channelID){
                    if (!servers[newMember.guild.id]) {
                        servers[newMember.guild.id] = {
                            channels: [],
                            list: 0
                        };
                    }
                    var server = servers[newMember.guild.id]
                    console.log("check 3")
                    if(server){
                        newMember.guild.createChannel("["+result[0].name+" - "+(server.channels.length+1)+"]", { type: 'voice' }).then((channel) => {
                            if(newMember.guild.channels.find(c => c.id == result[0].channelID).parentID){
                                channel.setParent(newMember.guild.channels.find(c => c.id == result[0].channelID).parentID)
                            }
                            var server = servers[newMember.guild.id]
                            newMember.setVoiceChannel(channel)
                            server.channels.push(channel)
                            server.list++
                        })
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
                                newMember.guild.createChannel("["+result[0].name+" - "+(server.list+1)+"]", { type: 'voice' }).then((channel) => {
                                    if(newMember.guild.channels.find(c => c.id == result[0].channelID).parentID){
                                        channel.setParent(newMember.guild.channels.find(c => c.id == result[0].channelID).parentID)
                                    }
                                    var server = servers[newMember.guild.id]
                                    newMember.setVoiceChannel(channel)
                                    server.channels.push(channel)
                                    server.list++
                                })
                            } else {
                                newMember.guild.createChannel("["+result[0].name+" - 1]", { type: 'voice' }).then((channel) => {
                                    if(newMember.guild.channels.find(c => c.id == result[0].channelID).parentID){
                                        channel.setParent(newMember.guild.channels.find(c => c.id == result[0].channelID).parentID)
                                    }
                                    var server = servers[newMember.guild.id]
                                    newMember.setVoiceChannel(channel)
                                    server.channels.push(channel)
                                    server.list++
                                })
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
        bot.on('voiceStateUpdate', (oldMember, newMember) => {dynamicVc(oldMember, newMember)});
    }
}