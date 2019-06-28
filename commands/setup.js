module.exports = {
    name: ['start', 'setup'],
    description: 'Setup your server!',
    category: 'administration',
    main: async function (bot, message) {
        const Discord = require('discord.js');
        var stringSimilarity = require('string-similarity');
        let enableLogChannel;
        let enableWelcomeChannel;
        let customGreeting
        let enableDadMode;
        let prediction;
        let predictionPercent = 0;
        let WelcomeChannelID

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
        let voice = [
            'voice', 'audio', 'sound'
        ]
        let text = [
            'text', 'type', 'letter', 'normal'
        ]
        const filter = m => m.author.id === message.author.id;
        async function predictionEngine(input, array1, array2) {
            return new Promise(result => {
                predictionPercent = 0;
                prediction = null;
                for (i = 0; i < array1.length; i++) {
                    let predictionScore = stringSimilarity.compareTwoStrings(input, array1[i]) * 100
                    if (predictionScore > predictionPercent) {
                        predictionPercent = predictionScore;
                        prediction = array1[i];
                    }
                }
                for (i = 0; i < array2.length; i++) {
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
                message.channel.awaitMessages(filter, { max: 1, time: 10000 }).then(collected => {
                    if(collected.first()){
                        if (collected.first().attachments.size == 0) {
                            if (collected.first().content) {
                                result(collected.first().content)
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
            var final = await predictionEngine(reply, array1, array2);
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
        async function testSetup() {
            var result = await ask("This is a test yes/no function?", yes, no);
            if (result) {
                console.log("yes")
            } else {
                console.log("no")
            }
        }
        async function logChannelSetup() {
            var result = await ask("Do you want a log channel?", yes, no);
            if (result) {    //if yes
                message.channel.send('Ok, I will go ahead and add a log channel!')
                message.guild.createChannel('Logs', {
                    type: 'text',
                    permissionOverwrites: [{
                        id: message.guild.id,
                        deny: ['SEND_MESSAGES'],
                        allow: ['READ_MESSAGES']
                    }]
                }).then(channel => {
                    var query = { serverID: message.guild.id, channelID: channel.id };
                    dataBase("logging", query)
                })
                WelcomeChannelSetup();
            } else {        //if no
                message.channel.send('Ok, I wont add a log channel!')
                WelcomeChannelSetup();
            }
        }
        async function WelcomeChannelSetup() {
            var result = await ask("Do you want a welcome channel?", yes, no);
            if (result) {   //if yes
                message.guild.createChannel('Welcome!', {
                    type: 'text',
                    permissionOverwrites: [{
                        id: message.guild.id,
                        deny: ['SEND_MESSAGES'],
                        allow: ['READ_MESSAGES']
                    }]
                }).then(channel => {
                    WelcomeChannelID = channel.id
                })
                var result2 = await ask("Great! do you want a custom greeting?", yes, no);
                if (result2) {   //if yes
                    var result3 = await promptUser('Fantastic! What do you want your custom greeting to be?');
                    message.channel.send(`Great I will set your custom greeting to "${result3}"!`)
                    var query = { serverID: message.guild.id, channelID: WelcomeChannelID, message: result3};
                    await dataBase("welcome", query)
                    customCommandSetup();
                } else {        //if no
                    message.channel.send('Sounds good! I will use the default greeting!')
                    var query = { serverID: message.guild.id, channelID: WelcomeChannelID, message: customGreeting};
                    await dataBase("welcome", query)
                    customCommandSetup();
                }
            } else {        //if no
                message.channel.send('Ok, I wont add a welcome channel!')
                customCommandSetup();
            }
        }
        //taken out because it was not working right - might fully remove it later
        async function DadModeSetup() {
            var result = await ask("One last thing - Do you want me to make dad jokes?", yes, no);
            if (result) {
                message.channel.send('Ok, I will be sure to make plenty of dad jokes ;)')
                var query = { serverID: message.guild.id};
                await dataBase("dadmode", query)
                customCommandSetup()
            } else {
                message.channel.send('Ok, I wont wont make dad jokes ;)')
                customCommandSetup()
            }
        }
        async function customCommandSetup() {
            var result = await ask("Do you want any custom channels?", yes, no);
            if (result) {
                var result2 = await ask("Do you want this to be a text or voice channel?", text, voice);
                if(result2){
                    var result3 = await promptUser('Fantastic! What do you want your new text channel to be called?');
                    message.channel.send(`Great I will make a channel called "${result3}"!`)
                    var result4 = await ask("Does this look ok?", yes, no);
                    if(result4){
                        message.guild.createChannel(result3, { type: 'text' })
                        customCommandSetup2()
                    } else {
                        message.channel.send("Ok lets start over =P")
                        customCommandSetup()
                    }
                } else {
                    var result3 = await promptUser('Fantastic! What do you want your new voice channel to be called?');
                    message.channel.send(`Great I will make a channel called "${result3}"!`)
                    var result4 = await ask("Does this look ok?", yes, no);
                    if(result4){
                        message.guild.createChannel(result3, { type: 'voice' })
                        customCommandSetup2()
                    } else {
                        message.channel.send("Ok lets start over =P")
                        customCommandSetup()
                    }
                }
            } else {
                ReviewSetup()
            }
        }
        async function customCommandSetup2() {
            var result = await ask("Do you want any more custom channels?", yes, no);
            if (result) {
                var result2 = await ask("Do you want this to be a text or voice channel?", text, voice);
                if(result2){
                    var result3 = await promptUser('Fantastic! What do you want your new text channel to be called?');
                    message.channel.send(`Great I will make a channel called "${result3}"!`)
                    var result4 = await ask("Does this look ok?", yes, no);
                    if(result4){
                        message.guild.createChannel(result3, { type: 'text' })
                        customCommandSetup2()
                    } else {
                        message.channel.send("Ok lets start over =P")
                        customCommandSetup()
                    }
                } else {
                    var result3 = await promptUser('Fantastic! What do you want your new voice channel to be called?');
                    message.channel.send(`Great I will make a channel called "${result3}"!`)
                    var result4 = await ask("Does this look ok?", yes, no);
                    if(result4){
                        message.guild.createChannel(result3, { type: 'voice' })
                        customCommandSetup2()
                    } else {
                        message.channel.send("Ok lets start over =P")
                        customCommandSetup()
                    }
                }
            } else {
                ReviewSetup()
            }
        }
        async function retrieveSettings() {
            return new Promise(result => {
                var query = {serverID: message.guild.id};
                db.collection("logging").find(query).toArray(function (err, result) {
                    if (err) throw err;
                    if(result.length == 0) {
                        enableLogChannel = "Disabled"
                    } else {
                        if(message.guild.channels.find(x => x.id === result[0].channelID.toString())) {
                            console.log(message.guild.channels.find(x => x.id === result[0].channelID.toString()).name)
                            enableLogChannel = "#"+message.guild.channels.find(x => x.id === result[0].channelID.toString()).name
                        } else {
                            enableLogChannel = "Disabled"
                        }
                    }
                });
                db.collection("welcome").find(query).toArray(function (err, result) {
                    if (err) throw err;
                    if(result.length == 0) {
                        enableWelcomeChannel = "Disabled"
                        customGreeting = "The welcome channel is disabled"
                    } else {
                        if(message.guild.channels.find(x => x.id === result[0].channelID.toString())) {
                            enableWelcomeChannel = "#"+message.guild.channels.find(x => x.id === result[0].channelID.toString()).name
                            customGreeting = result[0].message
                        } else {
                            enableWelcomeChannel = "Disabled"
                            customGreeting = "The welcome channel is disabled"
                        }
                    }
                });
                setTimeout(function () {
                    result([enableLogChannel, enableWelcomeChannel, customGreeting])
                }, 1000)
            });
        }

        async function ReviewSetup() {
            var result = await retrieveSettings()
            message.channel.send("Aaaand we are done! Here are the settings for your server!")
            var embed = new Discord.RichEmbed()                                         //i need to redo this so it pulls database info
                .setTitle("Server Settings!")
                .addField('Log channel', "```" + result[0] + "```")
                .addField('Welcome channel', "```" + result[1] + "```")
                .addField('Greeting', "```" + result[2] + "```")
                .setThumbnail(message.guild.iconURL)
                .setColor([255, 255, 255]);
            message.channel.send(embed)
            setTimeout(function () {
                //FinalizeSetup()
            }, 1000)
        }
        //taken out because it is useless
        async function FinalizeSetup() {
            var result = await ask("Do these settings look ok to you?", yes, no);
            if (result) {
                message.channel.send('Great because I cant change them!')
                message.channel.send('Goodbye!')
            } else {
                message.channel.send('Well too bad because I cant change them!')
                message.channel.send('Goodbye!')
            }
        }
        logChannelSetup()
    },
}