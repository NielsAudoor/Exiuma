module.exports = {
    scan: function (bot, callback) {
        const Discord = require('discord.js');
        var mongoUtil = require('../processes/mongoUtil');
        var db = mongoUtil.getDb();

        async function dataBaseCheck(query) {
            return new Promise(promise => {
                mongoUtil.getDb().collection("welcome").find(query).toArray(function (err, result) {
                    if (err) throw err;
                    if (result.length == 0) {    //if there is no database
                        promise(null)
                    } else {                    //if there is a database
                        promise(result[0])
                    }
                });
            })
        }
        async function sendWelcomeMessage(member){
            var query = {serverID: member.guild.id};
            var result = await dataBaseCheck(query);
            if(result !== null) {
                member.guild.channels.find(x => x.id === result.channelID.toString()).send(member+" "+result.message)
            }
        }
        bot.on('guildMemberAdd', member => {sendWelcomeMessage(member)});
    },
}