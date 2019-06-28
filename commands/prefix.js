module.exports = {
    name: ['prefix', 'respond'],
    description: 'Set up a custom prefix!',
    category: 'administration',
    permission: 'admin',
    main: async function (bot, message) {
        const Discord = require('discord.js');
        var stringSimilarity = require('string-similarity');
        let prediction;
        let predictionPercent = 0;

        if (!message.guild.member(bot.user).hasPermission('ADMINISTRATOR')) {
            return message.channel.send('Sorry, but I need administrator privileges to run the setup command!');
        }

        if (!message.guild.member(message.author).hasPermission('ADMINISTRATOR') && bot.devs.indexOf(message.author.id) < 0) {
            return message.channel.send('Sorry, but you need administrator privileges to run the setup command!');
        }

        var mongoUtil = require('../processes/mongoUtil');
        var db = mongoUtil.getDb();

        let yes = [
            'yes', 'yeah', 'yup', 'sure', 'ok', 'yep', 'y'
        ]
        let no = [
            'no', 'nah', 'nope', 'n'
        ]
        let update = [
            'update', 'change', 'replace', 'yes', 'yeah', 'yup', 'sure', 'ok', 'yep', 'y'
        ]
        let disable = [
            'no', 'nah', 'nope', 'n', 'disable', 'off', 'reset'
        ]
        const filter = m => m.author.id === message.author.id;

        async function predictionEngine(input, array1, array2) {
            return new Promise(result => {
                predictionPercent = 0;
                prediction = null;
                for (var i = 0; i < array1.length; i++) {
                    let predictionScore = stringSimilarity.compareTwoStrings(input, array1[i]) * 100
                    if (predictionScore > predictionPercent) {
                        predictionPercent = predictionScore;
                        prediction = array1[i];
                    }
                }
                for (var i = 0; i < array2.length; i++) {
                    let predictionScore = stringSimilarity.compareTwoStrings(input, array2[i]) * 100
                    if (predictionScore > predictionPercent) {
                        predictionPercent = predictionScore;
                        prediction = array2[i];
                    }
                }
                setTimeout(function () {
                    if (array1.indexOf(prediction) < 0) {      //if you say no
                        result(false)
                    } else if (array2.indexOf(prediction) < 0) {  //if you say yes
                        result(true)
                    }
                }, 1000)
            });
        }

        async function promptUser(msg) {
            return new Promise(result => {
                message.channel.send(msg)
                message.channel.awaitMessages(filter, {max: 1, time: 10000}).then(collected => {
                    if (collected.first()) {
                        if (collected.first().attachments.size == 0) {
                            if (collected.first().content) {
                                result(collected.first())
                            }
                        } else {
                            message.channel.send("Please don't send a picture during setup.");
                        }
                    }
                })
            });
        }

        async function ask(msg, array1, array2) {
            var reply = await promptUser(msg);
            var final = await predictionEngine(reply.content, array1, array2);
            return new Promise(result => {
                result(final)
            });
        }

        async function dataBaseCheck(table, query) {
            return new Promise(promise => {
                var guildQuery = {serverID: message.guild.id};
                db.collection(table).find(guildQuery).toArray(function (err, result) {
                    if (err) throw err;
                    if (result.length == 0) {
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
                db.collection(table).deleteMany(myquery, function (err, obj) {
                    if (err) throw err;
                    promise(obj.result.n + " document(s) deleted");
                    console.log(obj.result.n + " document(s) deleted");
                })
            })
        }

        async function dataBase(table, query) {
            var check = await dataBaseCheck(table, query);
            if (check) {
                var result = await removeOldDB(table);
                db.collection(table).insertOne(query, function (err, res) {
                    if (err) throw err;
                    console.log("1 document updated");
                })
            } else {
                db.collection(table).insertOne(query, function (err, res) {
                    if (err) throw err;
                    console.log("1 document inserted");
                })
            }
        }

        async function testSetup() {
            var result = await ask("This is a test yes/no function?", yes, no);
            if (result) {
                console.log("yes")
            } else {
                console.log("no")
            }
        }

        async function checkForPreifx() {
            var guildQuery = {serverID: message.guild.id};
            var check = await dataBaseCheck("prefix", guildQuery);
            if (check) {
                updatePrefix()
            } else {
                prefixSetup()
            }
        }
        async function updatePrefix(){
            var result = await ask("Hey there! I see you have a custom prefix already set up, do you want to update it or reset it to default?",update,disable)
            if(result){
                var result2 = await promptUser("Great! What do you want your custom prefix to be?")
                if(result2){
                    var query = { serverID: message.guild.id, prefix: result2.args[0]};
                    dataBase("prefix", query)
                    message.channel.send(`I have set this servers prefix to - ${result2.args[0]}`)
                }
            } else {
                var query = { serverID: message.guild.id};
                db.collection("prefix").deleteMany(query, function(err, obj) {
                    if (err) throw err;
                    console.log(obj.result.n + " document(s) deleted");
                })
                message.channel.send(`I have reset your prefix to the default - ${bot.prefix}`)
            }
        }
        async function prefixSetup(){
            var result = await promptUser("Hey there! What do you want your custom prefix to be?")
            if(result){
                var query = { serverID: message.guild.id, prefix: result.args[0]};
                dataBase("prefix", query)
                message.channel.send(`I have set this servers prefix to - ${result.args[0]}`)
            }
        }
        checkForPreifx()
    },
}