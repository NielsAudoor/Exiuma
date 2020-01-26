module.exports = {
    name: ['queue'],
    description: 'Check out the music queue!',
    category: 'music',
    main: async function (bot, message) {
        const Discord = require('discord.js');
        let desc = "**Music Queue:**\n"
        //if (bot.devs.indexOf(message.author.id) < 0) return message.channel.send('This command is very unstable so it is currently locked to developers only');
        var music = require('../processes/music');
        let queue = await music.queue(bot, message, message.member.voiceChannel)
        if(!queue[0])return message.channel.send("I could not find any music in queue!")
        for(let i=0; i < queue.length; i++){
            if(i==0){
                desc+="Now Playng - "+queue[i].title+"\n"
            }else{
                desc+=(i)+" - "+queue[i].title+"\n"
            }
        }
        var embed = new Discord.RichEmbed()
            .setThumbnail(bot.avatarURL)
            .setColor([204, 55, 95])
            .setDescription(desc);
        message.channel.send(embed)
    }
}