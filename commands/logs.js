module.exports = {
    name: ['logs', 'logging',],
    description: 'Set up a log channel!',
    category: 'administration',
    main: function(bot, message) {
        const Discord = require('discord.js');
        var mongoUtil = require('../processes/mongoUtil');
        var db = mongoUtil.getDb();
        var stringSimilarity = require('string-similarity');

        if (!message.guild.member(bot.user).hasPermission('ADMINISTRATOR')) {
            return message.channel.send('Sorry, but I need administrator privileges to run the setup command!');
        }

        if (!message.guild.member(message.author).hasPermission('ADMINISTRATOR') && bot.devs.indexOf(message.author.id) < 0) {
            return message.channel.send('Sorry, but you need administrator privileges to run the log command!');
        }

        let prediction;
        let predictionPercent = 0;
        let yes = [
            'yes', 'yeah', 'yup', 'sure', 'ok', 'yep', 'enable', 'on', 'update'
        ]
        let no = [
            'no', 'nah', 'nope', 'disable', 'off'
        ]
        const filter = m => m.author.id === message.author.id;
        async function getModeratorRole(){
            return new Promise(result => {
                let lowestPos = 5000
                let lowestRole;
                let moderators = []
                for(var i=0; i<message.guild.roles.map(r => r.name).length; i++){
                    if(message.guild.roles.map(r => r)[i].hasPermission('MANAGE_MESSAGES')){
                        moderators.push(message.guild.roles.map(r => r)[i])
                    }
                }
                result(moderators)
            })
        }
        async function predictionEngine(input) {
            return new Promise(result => {
                predictionPercent = 0;
                prediction = null;
                for (var i = 0; i < yes.length; i++) {
                    let predictionScore = stringSimilarity.compareTwoStrings(input, yes[i]) * 100
                    if (predictionScore > predictionPercent) {
                        predictionPercent = predictionScore;
                        prediction = yes[i];
                    }
                }
                for (var i = 0; i < no.length; i++) {
                    let predictionScore = stringSimilarity.compareTwoStrings(input, no[i]) * 100
                    if (predictionScore > predictionPercent) {
                        predictionPercent = predictionScore;
                        prediction = no[i];
                    }
                }
                setTimeout(function () {
                    if (yes.indexOf(prediction) < 0) {      //if you say disable
                        result(false)
                    } else if (no.indexOf(prediction) < 0) {  //if you say enable
                        result(true)
                    }
                }, 1000)
            });
        }
        async function promptUser(msg) {
            return new Promise(result => {
                message.channel.send(msg)
                message.channel.awaitMessages(filter, { max: 1, time: 30000 }).then(collected => {
                    if(collected.first()){
                        if (collected.first().attachments.size == 0) {
                            if (collected.first()) {
                                result(collected.first())
                            }
                        } else {
                            message.channel.send("Please don't send a picture during setup.");
                        }
                    }
                })
            });
        }
        async function ask(msg) {
            var reply = await promptUser(msg);
            var final = await predictionEngine(reply.content);
            return new Promise(result => {
                result(final)
            });
        }
        async function dataBaseCheck(table, query) {
            return new Promise(promise => {
                var guildQuery = {serverID: message.guild.id};
                db.collection(table).find(guildQuery).toArray(function (err, result) {
                    if (err) throw err;
                    if(result.length == 0) {
                        promise(false)
                    } else {
                        promise(true)
                    }
                });
            })
        }
        async function removeOldDB(table) {
            return new Promise(promise => {
                var myquery = {serverID: message.guild.id};
                db.collection(table).deleteMany(myquery, function(err, obj) {
                    if (err) throw err;
                    promise(obj.result.n + " document(s) deleted");
                    console.log(obj.result.n + " document(s) deleted");
                })
            })
        }
        async function dataBase(table, query) {
            var check = await dataBaseCheck(table, query);
            if(check) {
                var result = await removeOldDB(table);
                db.collection(table).insertOne(query, function(err, res) {
                    if (err) throw err;
                    console.log("1 document updated");
                })
            }else {
                db.collection(table).insertOne(query, function(err, res) {
                    if (err) throw err;
                    console.log("1 document inserted");
                })
            }
        }
        async function checkForLogging() {
            var guildQuery = {serverID: message.guild.id};
            var check = await dataBaseCheck("logging", guildQuery);
            if (check) {
                updateLogging()
            } else {
                loggingSetup()
            }
        }
        async function updateLogging() {
            var result = await ask("I see you have logging enabled right now! Do you want to update your settings or disable it?");
            if (result) {
                var result2 = await promptUser("Ok! What channel should I use? (#channelname)");
                if(result2.mentions.channels.first()){
                    var query = { serverID: message.guild.id, channelID: result2.mentions.channels.first().id};
                    dataBase("logging", query)
                    message.channel.send("You should be all set up!")
                } else {
                    channelNotDetected()
                }
            } else {
                var myquery = {serverID: message.guild.id};
                db.collection("logging").deleteMany(myquery, function(err, obj) {
                    if (err) throw err;
                    console.log(obj.result.n + " document(s) deleted");
                })
                message.channel.send('Logging has been disabled!')
            }
        }
        async function loggingSetup() {
            var result = await ask("Hey there! Do you want me to make a new channel for logging?");
            if (result) {
                message.channel.send('Ok, I will go ahead and add a log channel!')
                var modRole = await getModeratorRole()
                if(modRole){
                    console.log(modRole.length)
                    message.guild.createChannel('Logs', "text").then(channel => {
                            channel.overwritePermissions(message.guild.id, {
                                VIEW_CHANNEL: false
                            })
                            for(var i=0; i<modRole.length;i++){
                                channel.overwritePermissions(modRole[i].id, {
                                    VIEW_CHANNEL: true,
                                    SEND_MESSAGES: false
                                })
                            }
                            var query = { serverID: message.guild.id, channelID: channel.id };
                            dataBase("logging", query)
                        })
                }else{
                    message.guild.createChannel('Logs', "text").then(channel => {
                            channel.overwritePermissions(message.guild.id, {
                                VIEW_CHANNEL: false
                            })
                            message.channel.send("I was unable to find a moderator role on this server, so you will need to set that up yourself")
                            var query = { serverID: message.guild.id, channelID: channel.id };
                            dataBase("logging", query)
                        })
                }
                message.channel.send("You should be all set up!")
            } else {
                var result2 = await promptUser("Ok! What channel should I use? (#channel)");
                if(result2.mentions.channels.first()){
                    var query = { serverID: message.guild.id, channelID: result2.mentions.channels.first().id};
                    dataBase("logging", query)
                    message.channel.send("You should be all set up!")
                }
                else {
                    channelNotDetected()
                }
            }
        }
        async function channelNotDetected(){
            message.channel.send("You need to put the # before the channel name (#channel)")
            var result2 = await promptUser("What channel should I use? (#channel)");
            if(result2.mentions.channels.first()){
                var query = { serverID: message.guild.id, channelID: result2.mentions.channels.first().id};
                dataBase("logging", query)
                message.channel.send("You should be all set up!")
            } else {
                channelNotDetected();
            }
        }
        checkForLogging()
    },
}