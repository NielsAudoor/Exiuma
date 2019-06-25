module.exports = {
    name: ['async', 'start', 'setup'],
    main: async function(bot, message) {
        const Discord = require('discord.js');
        var stringSimilarity = require('string-similarity');
        let enableLogChannel;
        let enableWelcomeChannel;
        let customGreeting
        let enableDadMode;
        let prediction;
        let predictionPercent = 0;
        let yes = [
            'yes', 'yeah', 'yup', 'sure', 'ok', 'yep',
        ]
        let no = [
            'no', 'nah', 'nope',
        ]
        const filter = m => m.author.id === message.author.id;
        async function LogChannelSetup() {
            message.channel.send("Do you want a log channel?").then(r => r.delete(10000))
            message.channel.awaitMessages(filter, {max: 1, time: 10000}).then(collecteda => {
                if(collecteda.first().content) {
                    for (i = 0; i < yes.length; i++) {
                        let predictionScore = stringSimilarity.compareTwoStrings(collecteda.first().content, yes[i]) * 100
                        if (predictionScore > predictionPercent) {
                            predictionPercent = predictionScore;
                            prediction = yes[i];
                            console.log(yes[i]+" - "+predictionScore)
                        }
                    }
                    for (i = 0; i < no.length; i++) {
                        let predictionScore = stringSimilarity.compareTwoStrings(collecteda.first().content, no[i]) * 100
                        if (predictionScore > predictionPercent) {
                            predictionPercent = predictionScore;
                            prediction = no[i];
                        }
                    }
                    console.log(prediction)
                    setTimeout(function() {
                        if (yes.indexOf(prediction) < 0) {      //if you say no
                            message.channel.send('Ok, I wont add a log channel!').then(r => r.delete(10000))
                            enableLogChannel = "Disabled";
                            WelcomeChannelSetup();
                        } else if(no.indexOf(prediction) < 0){  //if you say yes
                            message.channel.send('Ok, I will go ahead and add a log channel!').then(r => r.delete(10000))
                            enableLogChannel = "Enabled";
                            WelcomeChannelSetup();
                        }
                    },1000)
                }
            }).catch(err => {
                console.log(err);
            })
        }

        async function WelcomeChannelSetup() {
            message.channel.send("How do you feel about a welcome channel?").then(r => r.delete(10000))
            predictionPercent = 0;
            prediction = null;
            message.channel.awaitMessages(filter, {max: 1, time: 10000}).then(collectedb => {
                if(collectedb.first().content) {
                    for (i = 0; i < yes.length; i++) {
                        let predictionScore = stringSimilarity.compareTwoStrings(collectedb.first().content, yes[i]) * 100
                        if (predictionScore > predictionPercent) {
                            predictionPercent = predictionScore;
                            prediction = yes[i];
                            console.log(yes[i]+" - "+predictionScore)
                        }
                    }
                    for (i = 0; i < no.length; i++) {
                        let predictionScore = stringSimilarity.compareTwoStrings(collectedb.first().content, no[i]) * 100
                        if (predictionScore > predictionPercent) {
                            predictionPercent = predictionScore;
                            prediction = no[i];
                        }
                    }
                    console.log(prediction)
                    setTimeout(function() {
                        if (yes.indexOf(prediction) < 0) {      //if you say no
                            message.channel.send('Ok, I wont add a welcome channel!').then(r => r.delete(10000))
                            enableWelcomeChannel = "Disabled";
                            customGreeting = "Welcome channel not enabled"
                            DadModeSetup();
                        } else if(no.indexOf(prediction) < 0){  //if you say yes
                            message.channel.send('Great! do you want a custom greeting?').then(r => r.delete(10000))
                            enableWelcomeChannel = "Enabled";
                            predictionPercent = 0;
                            prediction = null;
                            message.channel.awaitMessages(filter, {max: 1, time: 10000}).then(collectedc => {
                                if(collectedc.first().content) {
                                    for (i = 0; i < yes.length; i++) {
                                        let predictionScore = stringSimilarity.compareTwoStrings(collectedc.first().content, yes[i]) * 100
                                        if (predictionScore > predictionPercent) {
                                            predictionPercent = predictionScore;
                                            prediction = yes[i];
                                            console.log(yes[i]+" - "+predictionScore)
                                        }
                                    }
                                    for (i = 0; i < no.length; i++) {
                                        let predictionScore = stringSimilarity.compareTwoStrings(collectedc.first().content, no[i]) * 100
                                        if (predictionScore > predictionPercent) {
                                            predictionPercent = predictionScore;
                                            prediction = no[i];
                                        }
                                    }
                                    console.log(prediction)
                                    setTimeout(function() {
                                        if (yes.indexOf(prediction) < 0) {      //if you say no
                                            message.channel.send('Sounds good! I will use the default greeting!').then(r => r.delete(10000))
                                            customGreeting = "Hello and welcome to the server!"

                                            DadModeSetup();
                                        } else if(no.indexOf(prediction) < 0){  //if you say yes
                                            message.channel.send('Fantastic! What do you want your custom greeting to be?').then(r => r.delete(10000))
                                            message.channel.awaitMessages(filter, {max: 1, time: 10000}).then(collectedd => {
                                                if(collectedd.first().content) {
                                                    message.channel.send(`Great I will set your custom greeting to "${collectedd.first().content}"!`).then(r => r.delete(10000))
                                                    customGreeting = collectedd.first().content;
                                                    DadModeSetup();
                                                }
                                            }).catch(err => {
                                                console.log(err);
                                            })
                                        }
                                    },1000)
                                }
                            }).catch(err => {
                                console.log(err);
                            })
                        }
                    },1000)
                }
            }).catch(err => {
                console.log(err);
            })
        }

        async function DadModeSetup(){
            message.channel.send("One last thing - Do you want me to make dad jokes?").then(r => r.delete(10000))
            predictionPercent = 0;
            prediction = null;
            message.channel.awaitMessages(filter, {max: 1, time: 10000}).then(collectede => {
                if(collectede.first().content) {
                    for (i = 0; i < yes.length; i++) {
                        let predictionScore = stringSimilarity.compareTwoStrings(collectede.first().content, yes[i]) * 100
                        if (predictionScore > predictionPercent) {
                            predictionPercent = predictionScore;
                            prediction = yes[i];
                            console.log(yes[i]+" - "+predictionScore)
                        }
                    }
                    for (i = 0; i < no.length; i++) {
                        let predictionScore = stringSimilarity.compareTwoStrings(collectede.first().content, no[i]) * 100
                        if (predictionScore > predictionPercent) {
                            predictionPercent = predictionScore;
                            prediction = no[i];
                        }
                    }
                    console.log(prediction)
                    if (yes.indexOf(prediction) < 0) {      //if you say no
                        message.channel.send('Ok, I wont wont make dad jokes ;)').then(r => r.delete(10000))
                        enableDadMode = "Disabled";
                        ReviewSetup()
                    } else if(no.indexOf(prediction) < 0){  //if you say yes
                        message.channel.send('Ok, I will be sure to make plenty of dad jokes ;)').then(r => r.delete(10000))
                        enableDadMode = "Enabled";
                        ReviewSetup()
                    }
                }
            }).catch(err => {
                console.log(err);
            })
        }

        async function ReviewSetup() {
            message.channel.send("Aaaand we are done! Here are the settings for your server:").then(r => r.delete(10000))
            var embed = new Discord.RichEmbed()
                .setTitle("Server Settings!")
                .addField('Log channel', "```"+enableLogChannel+"```")
                .addField('Welcome channel', "```"+enableWelcomeChannel+"```")
                .addField('Greeting', "```"+customGreeting+"```")
                .addField('Dad mode', "```"+enableDadMode+"```")
                .setThumbnail(message.guild.iconURL)
                .setColor([255,255,255]);
            message.channel.send(embed).then(r => r.delete(10000))
            setTimeout(function() {
                FinalizeSetup()
            },1000)
        }

        async function FinalizeSetup(){
            message.channel.send("Do these settings look ok to you?").then(r => r.delete(10000))
            predictionPercent = 0;
            prediction = null;
            message.channel.awaitMessages(filter, {max: 1, time: 10000}).then(collectedf => {
                if(collectedf.first().content) {
                    for (i = 0; i < yes.length; i++) {
                        let predictionScore = stringSimilarity.compareTwoStrings(collectedf.first().content, yes[i]) * 100
                        if (predictionScore > predictionPercent) {
                            predictionPercent = predictionScore;
                            prediction = yes[i];
                            console.log(yes[i]+" - "+predictionScore)

                        }
                    }
                    for (i = 0; i < no.length; i++) {
                        let predictionScore = stringSimilarity.compareTwoStrings(collectedf.first().content, no[i]) * 100
                        if (predictionScore > predictionPercent) {
                            predictionPercent = predictionScore;
                            prediction = no[i];
                        }
                    }
                    console.log(prediction)
                    setTimeout(function() {
                        if (yes.indexOf(prediction) < 0) {      //if you say no
                            message.channel.send('Well fuck you because this feature is still in developement and in this version you cant change them!').then(r => r.delete(10000))
                            message.channel.send('Goodbye!').then(r => r.delete(10000))
                        } else if(no.indexOf(prediction) < 0){  //if you say yes
                            message.channel.send('Great because I cant change them!').then(r => r.delete(10000))
                            message.channel.send('Goodbye!').then(r => r.delete(10000))
                        }
                    },1000)
                }
            }).catch(err => {
                console.log(err);
            })

        }

        setTimeout(function() {

        },1000)

        LogChannelSetup();

    },
}