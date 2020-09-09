module.exports = {
    scan: function (bot, callback) {
        const Discord = require('discord.js');
        var mongoUtil = require('../processes/mongoUtil');
        var db = mongoUtil.getDb();

        async function dataBaseCheck(query) {
            return new Promise(promise => {
                mongoUtil.getDb().collection("streamRole").find(query).toArray(function (err, result) {
                    if (err) throw err;
                    if (result.length == 0) {    //if there is no database
                        promise(null)
                    } else {                    //if there is a database
                        promise(result[0])
                    }
                });
            })
        }
        async function memberUpdate(oldMember, newMember){
            if (oldMember.presence.game) {
                if (newMember.presence.game) {
                    if (oldMember.presence.game.streaming !== newMember.presence.game.streaming) {
                        //console.log("Flag 1")
                        var query = {ServerID: newMember.guild.id};
                        var result = await dataBaseCheck(query);
                        //console.log(result)
                        if(result !== null){
                            //console.log("Flag 2")
                            if (newMember.presence.game.streaming) {
                                //console.log("Flag 3")
                                if (newMember.guild.roles.find('id', result.RoleID)) {
                                    newMember.addRole(newMember.guild.roles.find('id', result.RoleID));
                                } else {
                                    console.log("Something went wrong when adding a role")
                                }
                            } else {
                                if (newMember.guild.roles.find('id', result.RoleID)) {
                                    newMember.removeRole(newMember.guild.roles.find('id', result.RoleID));
                                } else {
                                    console.log("Something went wrong when removiong a role")
                                }
                            }
                        }
                    }
                }
            }
        }
        bot.on('presenceUpdate', (oldMember, newMember) => {memberUpdate(oldMember, newMember)})
    },
}