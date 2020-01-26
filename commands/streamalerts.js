module.exports = {
    name: ['streamalerts', 'stream'],
    description: 'Get notified when you go live!',
    category: 'utility',
    main: async function (bot, message) {
        const Discord = require('discord.js');
        const filter = m => m.author.id === message.author.id;
        var stringSimilarity = require('string-similarity');
        var mongoUtil = require('../processes/mongoUtil');
        var db = mongoUtil.getDb();
        let prediction;
        let predictionPercent = 0;
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
                message.channel.awaitMessages(filter, {max: 1, time: 30000}).then(collected => {
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
                db.collection(table).find(query).toArray(function (err, result) {
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
        async function startSetup(){
            var result = await promptUser("Hey there! Who would you like to set up stream alerts for?")
            if(result){
                if(result.mentions.members.first()){
                    parseUser(result.mentions.members.first())
                } else {
                    message.channel.send("Sorry I didn't quite catch that! (make sure to mention the user! IE: @user)")
                    startSetup()
                }
            }
        }
        async function parseUser(user){
            var query = {serverID: message.guild.id, userID: user.id};
            let result = await dataBaseCheck('streamAlert', query)
            if(result){ //if user is already in db
                previousUserSetup(user)
            } else {    //if user is not in db
                newUserSetup(user)
            }
        }
        async function newUserSetup(user){

        }
        async function previousUserSetup(user){
            let result = await ask("Alerts are already set up for this user! Would you like to update the settings or disbale alerts?", update, disable)
            if(result){ //update
                getChannel(user)
            } else {    //disable

            }
        }
        async function getChannel(user){
            let result = await promptUser("What channel do you want me to send alerts on?")
            if(result){
                if(result.mentions.channels.first()){
                    finalizeSetup(user,result.mentions.channels.first().id)
                } else {
                    message.channel.send("Sorry I didn't quite catch that! (make sure to mention the channel! IE: #channel)")
                    getChannel(user)
                }
            }
        }
        async function finalizeSetup(user,channel){
            var query = {serverID: message.guild.id, userID: user.id, channelID:channel};
            dataBase('streamAlert', query)
            message.channel.send("You should be all set up!")
        }
        startSetup()
    }
}