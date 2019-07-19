module.exports = {
    name: ['help', 'documentation', 'docs'],
    description:'ignore',
    main: function(bot, message) {
        const readdir = require('fs').readdir;
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
        async function checkPrefix(){
            var query = {serverID: message.guild.id};
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

        async function getTitle(f){
            let desc
            for (s = 0; s < require(`./${f}`).name.length; s++) {
                let name = require(`./${f}`).name[s];
                bot.commands.set(name, require(`./${f}`));
                if(!desc){
                    desc="["+name
                }else{
                    if(s==name.length){
                        desc+=name
                    }else{
                        desc+=name+"]\n"
                    }
                }
            }
            return desc
        }
        async function getDescription(f){
            let name = require(`./${f}`).description+"\n\n";
            return name
        }
        async function assembleMessage(){
            var prefix = await checkPrefix();
            let prefixDisc = `**Here are the my commands! | The prefix for ${message.guild.name} is currently set to ${prefix}**\n\n`
            readdir('./commands/', (err, files) => {
                let administrationDisc = "**Administration commands:**\n```"
                let developerDisc = "**Developer commands:**\n```"
                let utilityDisc = "**Utility commands:**\n```"
                let funDisc = "**Fun commands:**\n```"
                let moderationDisc = "**Moderation commands:**\n```"
                let musicDisc = "**Music commands:**\n```"
                if (err) throw err;
                files.forEach(f => {
                    let title;
                    for (var s = 0; s < require(`./${f}`).name.length; s++) {
                        let name = require(`./${f}`).name[s];
                        bot.commands.set(name, require(`./${f}`));
                        if(!title && require(`./${f}`).name.length !== 1){
                            title="["+name+", "
                        }else if(!title && require(`./${f}`).name.length == 1){
                            title="["+name+"] - "
                        } else{
                            if(s<require(`./${f}`).name.length-1){
                                title+=name+", "
                            }else{
                                title+=name+"] - "
                            }
                        }
                    }
                    let description = require(`./${f}`).description+"\n\n";
                    if(description !== 'ignore'+"\n\n"){
                        let category = require(`./${f}`).category
                        if(category == 'administration'){
                            administrationDisc+=title+description
                        }
                        if(category == 'developer'){
                            developerDisc+=title+description
                        }
                        if(category == 'utility'){
                            utilityDisc+=title+description
                        }
                        if(category == 'fun'){
                            funDisc+=title+description
                        }
                        if(category == 'moderation'){
                            moderationDisc+=title+description
                        }
                        if(category == 'music'){
                            musicDisc+=title+description
                        }
                    }
                })
                let desc = prefixDisc+administrationDisc+"```\n"+utilityDisc+"```\n"+funDisc+"```\n"+developerDisc+"```\n"+moderationDisc+"```\n"+musicDisc+"```"
                var embed = new Discord.RichEmbed()
                //.setAuthor(`Here are my commands!` )
                    .setThumbnail(bot.user.avatarURL)
                    .setColor([255, 255, 255])
                    .setDescription(desc);
                message.author.send(embed)
                message.channel.send(`Check your inbox ${message.author.username} 📬`)
            })
        }
        assembleMessage()
    },
}