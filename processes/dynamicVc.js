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
                                parent: [],
                                list: 0
                            };
                        }
                        var server = servers[newMember.guild.id]
                        if (server) {
                            if (newMember.guild.member(bot.user).hasPermission("MANAGE_CHANNELS")) {
                                server.list++
                                newMember.guild.createChannel("[" + result[0].name + " - " + (server.list) + "]", {type: 'voice'}).then((channel) => {
                                    if (newMember.guild.channels.find(c => c.id == result[0].channelID).parentID) {
                                        channel.setParent(newMember.guild.channels.find(c => c.id == result[0].channelID).parentID)
                                    }
                                    var server = servers[newMember.guild.id]
                                    newMember.setVoiceChannel(channel)
                                    server.channels.push(channel)
                                    server.parent.push(result[0].channelID)
                                    //console.log("List - "+server.list)
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
                                    parent: [],
                                    list: 0
                                };
                            }
                            var server = servers[newMember.guild.id]
                            if(server.list){
                                if(newMember.guild.member(bot.user).hasPermission("MANAGE_CHANNELS")) {
                                    server.list++
                                    newMember.guild.createChannel("[" + result[0].name + " - " + (server.list) + "]", {type: 'voice'}).then((channel) => {
                                        if (newMember.guild.channels.find(c => c.id == result[0].channelID).parentID) {
                                            channel.setParent(newMember.guild.channels.find(c => c.id == result[0].channelID).parentID)
                                        }
                                        var server = servers[newMember.guild.id]
                                        newMember.setVoiceChannel(channel)
                                        server.channels.push(channel)
                                        server.parent.push(result[0].channelID)
                                        //console.log("List - "+server.list)
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
                                    server.list++
                                    newMember.guild.createChannel("[" + result[0].name + " - 1]", {type: 'voice'}).then((channel) => {
                                        if (newMember.guild.channels.find(c => c.id == result[0].channelID).parentID) {
                                            channel.setParent(newMember.guild.channels.find(c => c.id == result[0].channelID).parentID)
                                        }
                                        var server = servers[newMember.guild.id]
                                        newMember.setVoiceChannel(channel)
                                        server.channels.push(channel)
                                        server.parent.push(result[0].channelID)
                                        //console.log("List - "+server.list)
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
                    } else if(newMember.voiceChannel.id !== oldMember.voiceChannel.id){ //if just changed voice channel
                        var server = servers[newMember.guild.id]
                        if(server){
                            if(server.channels){
                                for(let i = 0; i<server.channels.length; i++){
                                    if(server.channels[i]){
                                        if(server.channels[i].members.map(r => r.user.username).length < 1){
                                            server.channels[i].delete()
                                            server.list--
                                            //console.log("List - "+server.list)
                                            delete server.channels[i]
                                            delete server.parent[i]
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
                                    //console.log("List - "+server.list)
                                    delete server.channels[i]
                                    delete server.parent[i]
                                }
                            }
                        }
                    }
                }
            }
            if(newMember.voiceChannel){
                var server = servers[newMember.guild.id]
                if(server){
                    if(server.channels) {
                        for (let i = 0; i < server.channels.length; i++) {
                            if(newMember.voiceChannel && server.channels[i]){
                                if(server.channels[i].id == newMember.voiceChannel.id) {
                                    //console.log(newMember.user.username+" has connected to recognized channel")
                                    if(newMember.presence.game){
                                        if(!newMember.bot){
                                            dynamicTitle(oldMember, newMember, true, newMember.voiceChannel, server.list)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if(oldMember.voiceChannel && !newMember.voiceChannel){
                var server = servers[oldMember.guild.id]
                if(server) {
                    if (server.channels) {
                        for (let i = 0; i < server.channels.length; i++) {
                            if(oldMember.voiceChannel && server.channels[i]){
                                if(server.channels[i].id == oldMember.voiceChannel.id) {
                                    //console.log(oldMember.user.username+" has disconnected from a recognized channel")
                                    if(oldMember.presence.game){
                                        if(!oldMember.bot){
                                            dynamicTitle(oldMember, newMember, true, oldMember.voiceChannel, server.list)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if(oldMember.voiceChannel){
                var server = servers[oldMember.guild.id]
                if(server){
                    if(server.channels) {
                        for (let i = 0; i < server.channels.length; i++) {
                            if(oldMember.voiceChannel && server.channels[i]){
                                if(server.channels[i].id == oldMember.voiceChannel.id) {
                                    //console.log(newMember.user.username+" has connected to recognized channel")
                                    if(oldMember.presence.game){
                                        if(!oldMember.bot){
                                            dynamicTitle(oldMember, newMember, true, oldMember.voiceChannel, server.list)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        async function gameChangeDetection(oldMember, newMember){
            if(oldMember.presence.game !== newMember.presence.game){
                if(oldMember.presence.game && !newMember.presence.game){
                    if(oldMember.voiceChannel){
                        var server = servers[oldMember.guild.id]
                        if(server) {
                            if (server.channels) {
                                for (let i = 0; i < server.channels.length; i++) {
                                    if(oldMember.voiceChannel && server.channels[i]){
                                        if(server.channels[i].id == oldMember.voiceChannel.id) {
                                            if(oldMember.presence.game){
                                                if(!oldMember.bot){
                                                    dynamicTitle(oldMember, newMember, true, oldMember.voiceChannel, server.list)
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                } else if(!oldMember.presence.game && newMember.presence.game){
                    if(newMember.voiceChannel){
                        var server = servers[newMember.guild.id]
                        if(server) {
                            if (server.channels) {
                                for (let i = 0; i < server.channels.length; i++) {
                                    if(newMember.voiceChannel && server.channels[i]){
                                        if(server.channels[i].id == newMember.voiceChannel.id) {
                                            if(newMember.presence.game){
                                                if(!newMember.bot){
                                                    dynamicTitle(oldMember, newMember, true, newMember.voiceChannel, server.list)

                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                } else {
                    if(newMember.voiceChannel){
                        var server = servers[newMember.guild.id]
                        if(server) {
                            if (server.channels) {
                                for (let i = 0; i < server.channels.length; i++) {
                                    if(newMember.voiceChannel && server.channels[i]){
                                        if(server.channels[i].id == newMember.voiceChannel.id) {
                                            if(newMember.presence.game){
                                                if(!newMember.bot){
                                                    dynamicTitle(oldMember, newMember, true, newMember.voiceChannel, server.list)
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        async function dynamicTitle(oldMember, newMember, override, channel, number) {
            if(newMember.user.bot || oldMember.user.bot)return
            if (!servers[newMember.guild.id]) {
                servers[newMember.guild.id] = {
                    channels: [],
                    parent: [],
                    list: 0
                };
            }
            var server = servers[newMember.guild.id]
            if (override) {
                let desc;
                setTimeout(function () {
                    let games = [];
                    for (let i = 0; i < channel.members.map(r => r.user.username).length; i++) {
                        if (channel.members.array()[i].presence.game) {
                            if (!desc) {
                                if (!channel.members.array()[i].user.equals(bot.user)) {
                                    desc = channel.members.array()[i].presence.game.name
                                    games.push(channel.members.array()[i].presence.game.name);
                                }
                            } else {
                                if(games.indexOf(channel.members.array()[i].presence.game.name) < 0){
                                    if (!channel.members.array()[i].user.equals(bot.user)) {
                                        desc += ", " + channel.members.array()[i].presence.game.name
                                        games.push(channel.members.array()[i].presence.game.name);
                                    }
                                } else {
                                    //console.log("Multiple instances of the same game detected")
                                }
                            }
                        }
                    }
                    channel.setBitrate(96)
                    let parentChannel;
                    for(let i=0;i<server.channels.length;i++){
                        if(server.channels[i] && channel){
                            if(server.channels[i].id == channel.id){
                                parentChannel = server.parent[i]
                                //console.log("Parent Channel Found!")
                            }
                        }
                    }
                    //need to add some kind of check to make sure the channel is dynamic - can probably use parent id
                    setTimeout(function () {
                        if(games.length < 1){
                            //console.log(newMember.guild.channels.get(parentChannel).name.toString().substring(2,newMember.guild.channels.get(parentChannel).name.toString().length-1))
                            if(newMember.guild.channels.get(parentChannel)){
                                channel.setName("[" + newMember.guild.channels.get(parentChannel).name.toString().substring(2,newMember.guild.channels.get(parentChannel).name.toString().length-1)+" - "+number+"]")
                            }
                        }else if(games.length>0 && games.length<3){
                            if (desc) {
                                //console.log(`Setting channel name to - ${desc}`)
                                channel.setName("[" + desc + " - " + number + "]")
                            }
                        }else if(games.length>=3){
                            if (desc) {
                                channel.setName("[" + newMember.guild.channels.get(parentChannel).name.toString().substring(2,newMember.guild.channels.get(parentChannel).name.toString().length-1)+" - "+number+"]")
                            }
                        }
                    }, 1000)
                }, 1000)
            }
        }
        bot.on('presenceUpdate', (oldMember, newMember) => {gameChangeDetection(oldMember, newMember)});
        bot.on('voiceStateUpdate', (oldMember, newMember) => {dynamicVc(oldMember, newMember)});
    }
}