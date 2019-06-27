module.exports = {
    name: ['dadmode', 'dad', 'joke'],
    main: function(bot, message) {
        const Discord = require('discord.js');
        var mongoUtil = require('../processes/mongoUtil');
        var db = mongoUtil.getDb();
        var stringSimilarity = require('string-similarity');

        if (!message.guild.member(message.author).hasPermission('ADMINISTRATOR') && bot.devs.indexOf(message.author.id) < 0) {
            return message.channel.send('Sorry, but you need administrator privileges to enable dad mode!');
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
        async function predictionEngine(input) {
            return new Promise(result => {
                predictionPercent = 0;
                prediction = null;
                for (i = 0; i < yes.length; i++) {
                    let predictionScore = stringSimilarity.compareTwoStrings(input, yes[i]) * 100
                    if (predictionScore > predictionPercent) {
                        predictionPercent = predictionScore;
                        prediction = yes[i];
                    }
                }
                for (i = 0; i < no.length; i++) {
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
                message.channel.awaitMessages(filter, { max: 1, time: 10000 }).then(collected => {
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
        async function checkForDadMode() {
            var guildQuery = {serverID: message.guild.id};
            var check = await dataBaseCheck("logging", guildQuery);
            if (check) {
                disableDadMode()
            } else {
                enableDadMode()
            }
        }
        async function enableDadMode(){
            var result = await ask("Dad mode is not currently enabled, would you like me to enable it?")
            if (result) {
                var query = { serverID: message.guild.id};
                dataBase("dadmode", query)
                message.channel.send("You should be all set up!")
            } else {
                message.channel.send("Ok I will leave it alone!")
            }
        }
        async function disableDadMode(){
            var result = await ask("Dad mode is already enabled, would you like me to disable it?");
            if (result) {
                var query = { serverID: message.guild.id};
                dataBase("dadmode", query)
                message.channel.send("You should be all set up!")
            } else {
                message.channel.send("Ok I will leave it alone!")
            }
        }
        checkForDadMode()
    },
}