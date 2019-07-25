module.exports = {
    name: ['vc', 'dynamicvc', 'newvc'],
    description: 'Make a new dynamic VC!',
    category: 'administration',
    permission: 'admin',
    main: async function (bot, message) {
        if (!message.guild.member(bot.user).hasPermission('ADMINISTRATOR')) {
            return message.channel.send('Sorry, but I need administrator privileges to run the vc command!');
        }
        const Discord = require('discord.js');
        var stringSimilarity = require('string-similarity');
        let prediction;
        let predictionPercent = 0;
        var mongoUtil = require('../processes/mongoUtil');
        var db = mongoUtil.getDb();
        let channelname;
        let channelid

        if (!message.guild.member(bot.user).hasPermission('ADMINISTRATOR')) {
            return message.channel.send('Sorry, but I need administrator privileges to run the setup command!');
        }

        if (!message.guild.member(message.author).hasPermission('ADMINISTRATOR') && bot.devs.indexOf(message.author.id) < 0) {
            return message.channel.send('Sorry, but you need administrator privileges to run the setup command!');
        }

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
        let dynamicArray = [
            'dymic', 'changing', 'd'
        ]
        let staticArray = [
            'static', 's'
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
        async function initSetup(){     //This is going to be scrapped because you cant mention a voice channel
            var result = await ask("Sure thing! Do you want me to make a new channel?", yes, no)
            if(result){
                newChannel()
            }else{
                existingChannel()
            }
        }
        async function newChannel(){
            var result = await promptUser("What channel do you this channel to be called?")
            if(result){
                setTimeout(function () {
                    channelname = result.content
                    message.guild.createChannel("+["+result.content+"]", { type: 'voice' }).then((channel) => {
                        console.log(channelname)
                        channelid = channel.id
                        dynamicSetup()
                    })
                }, 250)
            }
        }
        async function dynamicSetup(){
            var result = await ask("Do you want this channel name to be static or dynamic?", staticArray, dynamicArray)
            if(result){
                db.collection("dynamicVC").insertOne({name: channelname , serverID: message.guild.id, channelID: channelid, dynamic: false}, function (err, res) {
                    if (err) throw err;
                    console.log("1 document updated");
                    message.channel.send("You should be set up!")
                })
            } else {
                db.collection("dynamicVC").insertOne({name: channelname, serverID: message.guild.id, channelID: channelid, dynamic: true}, function (err, res) {
                    if (err) throw err;
                    console.log("1 document updated");
                    message.channel.send("You should be set up!")
                })
            }
        }
        newChannel()
    },
}