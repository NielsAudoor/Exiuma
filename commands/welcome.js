module.exports = {
    name: ['welcome', 'greeting'],
    description: 'Set up a welcome channel!',
    category: 'administration',
    main: async function (bot, message) {
        const Discord = require('discord.js');
        var stringSimilarity = require('string-similarity');
        let WelcomeChannel;
        let customGreeting;
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
            'no', 'nah', 'nope', 'n', 'disable', 'off',
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
        async function checkForWelcome() {
            var guildQuery = {serverID: message.guild.id};
            var check = await dataBaseCheck("welcome", guildQuery);
            if (check) {
                updateWelcome()
            } else {
                welcomeSetup()
            }
        }
        async function updateWelcome(){
            var result = await ask("I see that you have a welcome channel already set up! Do you want to update your settings or disable it?", update, disable);
            if(result){
                var result2 = await promptUser("Great! What channel would you like to use? (#channel)")
                if(result2){
                    if(result2.mentions.channels.first()){
                        console.log("Checkpoint 3")
                        WelcomeChannel = result2.mentions.channels.first().id
                        message.channel.send("Your welcome channel has been updated!")
                        greetingSetup()
                    } else {
                        channelNotDetected()
                    }
                }
            } else {
                var myquery = {serverID: message.guild.id};
                db.collection("welcome").deleteMany(myquery, function(err, obj) {
                    if (err) throw err;
                    console.log(obj.result.n + " document(s) deleted");
                })
                message.channel.send('The welcome channel has been disabled!')
            }
        }
        async function welcomeSetup(){
            var result = await ask("Hey there! Would you like me to make a new welcome channel?", yes, no)
            if (result){
                message.guild.createChannel('Welcome!', {
                    type: 'text',
                    permissionOverwrites: [{
                        id: message.guild.id,
                        deny: ['SEND_MESSAGES'],
                        allow: ['READ_MESSAGES']
                    }]
                }).then(channel => {
                    WelcomeChannel = channel.id
                    greetingSetup()
                })
            } else {
                var result2 = await ask("Would you like me to use a pre-existing channel?", yes, no)
                if(result2){
                    var result3 = await promptUser("Great! What channel would you like to use? (#channel)")
                    if(result3.content){
                        if(result3.mentions){
                            if(result3.mentions.channels){
                                if(result3.mentions.channels.first()){
                                    WelcomeChannel = result3.mentions.channels.first().id
                                    //take this out
                                    message.channel.send("Your welcome channel has been updated!")
                                    greetingSetup()
                                }
                            }
                        }
                    }
                } else {

                }
            }
        }
        async function greetingSetup(){
            var result = await ask("Do you want a custom greeting?", yes, no);
            if(result){
                var result2 = await promptUser("What would you like your greeting to be?")
                if(result2){
                    message.channel.send(`Ok! I will set your welcome message to ${result2.content}`)
                    var query = { serverID: message.guild.id, channelID: WelcomeChannel, message: result2.content};
                    dataBase("welcome", query)
                    finalizeSetup()
                }
            } else {
                message.channel.send("Ok I will use the default greeting!")
                var query = { serverID: message.guild.id, channelID: WelcomeChannel, message: "Hello and welcome to the server!"};
                dataBase("welcome", query)
                finalizeSetup()
            }
        }
        async function channelNotDetected(){
            message.channel.send("You need to put the # before the channel name (#channel)")
            var result2 = await promptUser("What channel should I use? (#channel)");
            if(result2.mentions.channels.first()){
                WelcomeChannel = result2.mentions.channels.first().id
                greetingSetup()
            } else {
                channelNotDetected();
            }
        }
        async function finalizeSetup(){
            message.channel.send("You should be all set up!")
        }
        checkForWelcome();
    },
}