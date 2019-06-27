module.exports = {
    scan: function (bot, callback) {
        const Discord = require('discord.js');
        var mongoUtil = require('../processes/mongoUtil');
        var db = mongoUtil.getDb();

        async function dataBaseCheck(query) {
            return new Promise(promise => {
                mongoUtil.getDb().collection("logging").find(query).toArray(function (err, result) {
                    if (err) throw err;
                    if(result.length == 0) {    //if there is no database
                        promise(null)
                    } else {                    //if there is a database
                        promise(result[0].channelID)
                    }
                });
            })
        }
        async function guildMemberUpdate(oldMember, newMember){
            var query = {serverID: newMember.guild.id};
            var result = await dataBaseCheck(query);
            if(result !== null){
                if(newMember.guild.channels.find(x => x.id === result.toString())) {
                    if (oldMember.displayName !== newMember.displayName) {
                        var embed = new Discord.RichEmbed()
                            .setAuthor(`A member has changed their nickname! 🏷`)
                            .setThumbnail(newMember.avatarURL)
                            .setColor([0, 175, 175])
                            .addField('**Previous Nickname:**', `\`\`\`${oldMember.displayName}\`\`\``)
                            .addField('**Current Nickname:**', `\`\`\`${newMember.displayName}\`\`\``)
                        newMember.guild.channels.find(x => x.id === result.toString()).send(embed)
                    }
                    if (newMember.roles.map(r => r.name).length !== oldMember.roles.map(r => r.name).length) {
                        if (newMember.roles.map(r => r.name).length > oldMember.roles.map(r => r.name).length) {
                            desc = `Role Given:\n`;
                            for (var i = 0; i < newMember.roles.map(r => r.name).length; i++) {
                                if (!oldMember.roles.find("name", newMember.roles.map(r => r.name)[i])) {
                                    desc = desc + `\`\`\`${newMember.roles.map(r => r.name)[i]}\`\`\``
                                }
                            }
                            var embed = new Discord.RichEmbed()
                                .setAuthor(`${newMember.displayName} has gained a role!`)
                                .setThumbnail(newMember.avatarURL)
                                .setColor([0, 255, 0])
                                .setDescription(desc);
                            newMember.guild.channels.find(x => x.id === result.toString()).send(embed);
                        } else {
                            desc = `Role Taken:\n`;
                            for (var i = 0; i < oldMember.roles.map(r => r.name).length; i++) {
                                if (!newMember.roles.find("name", oldMember.roles.map(r => r.name)[i])) {
                                    desc = desc + `\`\`\`${oldMember.roles.map(r => r.name)[i]}\`\`\``
                                }
                            }
                            var embed = new Discord.RichEmbed()
                                .setAuthor(`${newMember.displayName} has lost a role`)
                                .setThumbnail(newMember.avatarURL)
                                .setColor([255, 0, 0])
                                .setDescription(desc);
                            newMember.guild.channels.find(x => x.id === result.toString()).send(embed);
                        }
                    }
                }
            }
        }
        async function messageDelete(message){
            var query = {serverID: message.guild.id};
            var result = await dataBaseCheck(query);
            if(result !== null) {
                if (message.guild.channels.find(x => x.id === result.toString())) {
                    var embed = new Discord.RichEmbed()
                        .setAuthor(`A message from ${message.author.username} has been deleted`)
                        .setThumbnail(message.author.avatarURL)
                        .setColor([245, 129, 66])
                        .addField('**Channel:**', `\`\`\`${"#"+message.guild.channels.find(x => x.id === result.toString()).name}\`\`\``)
                        .addField('**Content:**', `\`\`\`${message.content}\`\`\``)
                    message.guild.channels.find(x => x.id === result.toString()).send(embed)
                }
            }
        }
        async function guildBanAdd(guild, user){
            var query = {serverID: guild.id};
            var result = await dataBaseCheck(query);
            if(result !== null) {
                if (guild.channels.find(x => x.id === result.toString())) {
                    var embed = new Discord.RichEmbed()
                        .setAuthor(`A member has been banned 🔨`)
                        .setThumbnail(user.avatarURL)
                        .setColor([245, 50, 50])
                        .setDescription(`\`\`\`${user.username}\`\`\``);
                    guild.channels.find(x => x.id === result.toString()).send(embed)
                }
            }
        }
        async function guildBanRemove(guild, user){
            var query = {serverID: guild.id};
            var result = await dataBaseCheck(query);
            if(result !== null) {
                if (guild.channels.find(x => x.id === result.toString())) {
                    var embed = new Discord.RichEmbed()
                        .setAuthor(`A member has been unbanned 👍` )
                        .setThumbnail(user.avatarURL)
                        .setColor([50, 245, 50])
                        .setDescription(`\`\`\`${user.username}\`\`\``);
                    guild.channels.find(x => x.id === result.toString()).send(embed)
                }
            }
        }
        async function guildMemberRemove(member){
            var query = {serverID: member.guild.id};
            var result = await dataBaseCheck(query);
            if(result !== null) {
                if (member.guild.channels.find(x => x.id === result.toString())) {
                    var embed = new Discord.RichEmbed()
                        .setAuthor(`A member has left your server 😥`)
                        .setThumbnail(member.user.avatarURL)
                        .setColor([245, 50, 50])
                        .setDescription(`\`\`\`${member.user.username}\`\`\`\n You now have ${member.guild.memberCount} members`);
                    member.guild.channels.find(x => x.id === result.toString()).send(embed)
                }
            }
        }
        async function guildMemberAdd(member){
            var query = {serverID: member.guild.id};
            var result = await dataBaseCheck(query);
            if(result !== null) {
                if (member.guild.channels.find(x => x.id === result.toString())) {
                    var embed = new Discord.RichEmbed()
                        .setThumbnail(member.user.avatarURL)
                        .setAuthor(`A member has joined your server! 😄`)
                        .setColor([50, 245, 50])
                        .setDescription(`\`\`\`${member.user.username}\`\`\`\n You now have ${member.guild.memberCount} members!`);
                    member.guild.channels.find(x => x.id === result.toString()).send(embed)
                }
            }
        }
        async function messageUpdate(oldMessage, newMessage){
            var query = {serverID: newMessage.guild.id};
            var result = await dataBaseCheck(query);
            if(result !== null) {
                if (newMessage.guild.channels.find(x => x.id === result.toString())) {
                    if(oldMessage.content !== newMessage.content) {
                        var embed = new Discord.RichEmbed()
                            .setAuthor(`A message from ${newMessage.author.username} has been edited`)
                            .setThumbnail(newMessage.author.avatarURL)
                            .setColor([0, 175, 175])
                            .addField('**Channel:**', `\`\`\`${"#" + newMessage.guild.channels.find(x => x.id === result.toString()).name}\`\`\``)
                            .addField('**Old Message:**', `\`\`\`${oldMessage.content}\`\`\``)
                            .addField('**New Message:**', `\`\`\`${newMessage.content}\`\`\``)
                        newMessage.guild.channels.find(x => x.id === result.toString()).send(embed)
                    }
                }
            }
        }

        bot.on('guildBanAdd', (guild, user) => {guildBanAdd(guild, user)});
        bot.on('guildBanRemove', (guild, user) => {guildBanRemove(guild, user)});
        bot.on('messageUpdate', (oldMessage, newMessage) => {messageUpdate(oldMessage, newMessage)});
        bot.on('messageDelete', message => {messageDelete(message)});
        bot.on('guildMemberUpdate', (oldMember, newMember) => {guildMemberUpdate(oldMember, newMember)});
        bot.on('guildMemberRemove', member => {guildMemberRemove(member)});
        bot.on('guildMemberAdd', member => {guildMemberAdd(member)});
        bot.on('messageDeleteBulk', messages => {
            //empty for now
        });
    },
};