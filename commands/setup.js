module.exports = {
    name: ['async', 'start', 'setup'],
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

        if (!message.guild.member(message.author).hasPermission('ADMINISTRATOR') && bot.devs.indexOf(message.author.id) < 0) {
            return message.channel.send('Sorry, but you need administrator privileges to run the setup command!');
        }

        var mongoUtil = require('../processes/mongoUtil');
        var db = mongoUtil.getDb();

        let yes = [
            'yes', 'yeah', 'yup', 'sure', 'ok', 'yep',
        ]
        let no = [
            'no', 'nah', 'nope',
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
                    if (yes.indexOf(prediction) < 0) {      //if you say no
                        result(false)
                    } else if (no.indexOf(prediction) < 0) {  //if you say yes
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
                        }                    else {
                            message.channel.send("Please don't send a picture during setup.");
                        }
                    }
                })
            });
        }
        async function ask(msg) {
            var reply = await promptUser(msg);
            var final = await predictionEngine(reply);
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
            var result = await ask("This is a test yes/no function?");
            if (result) {
                console.log("yes")
            } else {
                console.log("no")
            }
        }
        async function logChannelSetup() {
            var result = await ask("Do you want a log channel?");
            if (result) {    //if yes
                message.channel.send('Ok, I will go ahead and add a log channel!')
                enableLogChannel = "Enabled";
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
                enableLogChannel = "Disabled";
                WelcomeChannelSetup();
            }
        }
        async function WelcomeChannelSetup() {
            var result = await ask("Do you want a welcome channel?");
            if (result) {   //if yes
                enableWelcomeChannel = "Enabled";
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
                var result2 = await ask("Great! do you want a custom greeting?");
                if (result2) {   //if yes
                    var result3 = await promptUser('Fantastic! What do you want your custom greeting to be?');
                    message.channel.send(`Great I will set your custom greeting to "${result3}"!`)
                    customGreeting = result3;
                    var query = { serverID: message.guild.id, channelID: WelcomeChannelID, greeting: customGreeting};
                    await dataBase("welcome", query)
                    DadModeSetup();
                } else {        //if no
                    message.channel.send('Sounds good! I will use the default greeting!')
                    customGreeting = "Hello and welcome to the server!"
                    var query = { serverID: message.guild.id, channelID: WelcomeChannelID, greeting: customGreeting};
                    await dataBase("welcome", query)
                    DadModeSetup();
                }
            } else {        //if no
                message.channel.send('Ok, I wont add a welcome channel!')
                enableWelcomeChannel = "Disabled";
                customGreeting = "Welcome channel not enabled"
                DadModeSetup();
            }
        }
        async function DadModeSetup() {
            var result = await ask("One last thing - Do you want me to make dad jokes?");
            if (result) {
                message.channel.send('Ok, I will be sure to make plenty of dad jokes ;)')
                enableDadMode = "Enabled";
                var query = { serverID: message.guild.id};
                await dataBase("dadmode", query)
                customCommandSetup()
            } else {
                message.channel.send('Ok, I wont wont make dad jokes ;)')
                enableDadMode = "Disabled";
                customCommandSetup()
            }
        }
        async function customCommandSetup() {
            var result = await ask("Do you want any custom channels?");
            if (result) {
                var result2 = await promptUser('Fantastic! What do you want your new channel to be called?');
                message.channel.send(`Great I will make a channel called "${result2}"!`)
                var result3 = await ask("Does this look ok?");
                if(result3){
                    message.guild.createChannel(result2, { type: 'text' })
                    customCommandSetup2()
                } else {
                    message.channel.send("Ok lets start over =P")
                    customCommandSetup()
                }
            } else {
                ReviewSetup()
            }
        }
        async function customCommandSetup2() {
            var result = await ask("Do you want any more custom channels?");
            if (result) {
                var result2 = await promptUser('Fantastic! What do you want your new channel to be called?');
                message.channel.send(`Great I will make a channel called "${result2}"!`)
                var result3 = await ask("Does this look ok?");
                if(result3){
                    message.guild.createChannel(result2, { type: 'text' })
                    customCommandSetup2()
                } else {
                    message.channel.send("Ok lets start over =P")
                    customCommandSetup2()
                }
            } else {
                ReviewSetup()
            }
        }
        async function ReviewSetup() {
            message.channel.send("Aaaand we are done! Here are the settings for your server:")
            var embed = new Discord.RichEmbed()
                .setTitle("Server Settings!")
                .addField('Log channel', "```" + enableLogChannel + "```")
                .addField('Welcome channel', "```" + enableWelcomeChannel + "```")
                .addField('Greeting', "```" + customGreeting + "```")
                .addField('Dad mode', "```" + enableDadMode + "```")
                .setThumbnail(message.guild.iconURL)
                .setColor([255, 255, 255]);
            message.channel.send(embed)
            setTimeout(function () {
                FinalizeSetup()
            }, 1000)
        }
        async function FinalizeSetup() {
            var result = await ask("Do these settings look ok to you?");
            if (result) {
                message.channel.send('Great because I cant change them!')
                message.channel.send('Goodbye!')
            } else {
                message.channel.send('Well fuck you because this feature is still in developement and in this version you cant change them!')
                message.channel.send('Goodbye!')
            }
        }
        logChannelSetup()
    },
}