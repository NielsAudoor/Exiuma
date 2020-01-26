module.exports = {
    name: ['invite', 'join'],
    description: 'Invite me to your server!',
    category: 'utility',
    main: function (bot, message) {
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
                    name: '**Invite Link:**',
                    value: '[```Click here to invite me to your server!```](https://discordapp.com/oauth2/authorize?client_id=592462460766650368&scope=bot&permissions=8)',
                },
                ],
            },
        });
    },
}