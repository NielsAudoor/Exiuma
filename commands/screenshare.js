module.exports = {
    name: ['screenshare', 'videochat'],
    description: 'Generate a discord screenshare link!',
    category: 'utility',
    main: function(bot, message) {
        if(!message.member.voiceChannel){
            return message.channel.send("You need to be in a voice channel to use this!")
        }

        var link = `http://www.discordapp.com/channels/${message.guild.id}/${message.member.voiceChannel.id}`
        message.channel.send({
            embed: {
                color: 4388001,
                author: {
                    name: `Sure thing ${message.author.username}!`,
                    icon_url: message.guild.iconURL,
                },
                thumbnail: {
                    url: bot.user.avatarURL,
                },
                fields: [{
                    name: '**Video Link:**',
                    value: `[\`\`\`Click here for the video call link!\`\`\`\](${link})`,
                },
                ],
            },
        });
    },
}