module.exports = {
    name: ['streamrole', 'streamperm'],
    description: 'ignore',
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
            var result = await promptUser("Hey there! what role would you like to set up stream alerts for?")
            if(result){
                if(result.mentions.roles.first()){
                    parseRole(result.mentions.roles.first())
                } else {
                    message.channel.send("Sorry I didn't quite catch that! (make sure to mention the role! IE: @role)")
                    startSetup()
                }
            }
        }
        async function parseRole(role){
            var query = {serverID: message.guild.id, userID: role.id};
            let result = await dataBaseCheck('streamRole', query)
            if(result){ //if user is already in db
                previousRoleSetup(role)
            } else {    //if user is not in db
                newRoleSetup(role)
            }
        }
        async function newRoleSetup(role){
            finalizeSetup(role)
        }
        async function previousRoleSetup(role){
            let result = await ask("This is already set up as a streamer role! Whould you like to disable it?", yes, no)
            if(result){ //yes
                var myquery = {RoleID: role.id};
                db.collection("streamRole").deleteMany(myquery, function(err, obj) {
                    if (err) throw err;
                    console.log(obj.result.n + " document(s) deleted");
                })
                return message.channel.send("Ok I have gone ahead and disabled that role!")
            } else {    //no
                return message.channel.send("Ok you should be all set up!")
            }
        }
        async function finalizeSetup(role){
            var query = {RoleID: role.id, ServerID: message.guild.id};
            dataBase('streamRole', query)
            message.channel.send("You should be all set up!")
        }
        startSetup()
    }
}