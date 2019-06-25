module.exports = {
    name: ['r6', 'rainbow', 'siege'],
    main: function(bot, message) {
        const RainbowSixApi = require('rainbowsix-api-node');
        var stringSimilarity = require('string-similarity');
        const filter = m => m.author.id === message.author.id;
        let prediction;
        let username;
        let platform;
        let predictionPercent = 0;
        let pcPlatform = [
            "pc", "steam", "uplay","computer"
        ]
        let xboxPlatform = [
            'xbox','one', 'xone'
        ]
        let psPlatform = [
            'playstation', 'ps4'
        ]
        async function getPlatform() {
            message.channel.send("What platform are you playing on?")
            message.channel.awaitMessages(filter, {max: 1, time: 10000}).then(collected => {
                if(collected.first().content) {
                    for (i = 0; i < pcPlatform.length; i++) {
                        let predictionScore = stringSimilarity.compareTwoStrings(collected.first().content, pcPlatform[i]) * 100
                        if (predictionScore > predictionPercent) {
                            predictionPercent = predictionScore;
                            prediction = 'uplay';
                        }
                    }
                    for (i = 0; i < xboxPlatform.length; i++) {
                        let predictionScore = stringSimilarity.compareTwoStrings(collected.first().content, xboxPlatform[i]) * 100
                        if (predictionScore > predictionPercent) {
                            predictionPercent = predictionScore;
                            prediction = 'xone';
                        }
                    }
                    for (i = 0; i < psPlatform.length; i++) {
                        let predictionScore = stringSimilarity.compareTwoStrings(collected.first().content, psPlatform[i]) * 100
                        if (predictionScore > predictionPercent) {
                            predictionPercent = predictionScore;
                            prediction = 'ps4';
                        }
                    }
                    platform = prediction;
                    console.log(prediction)
                    getUsername(platform)
                }
            }).catch(err => {
                console.log(err);
            })
        }
        async function getUsername(platform) {
            message.channel.send("What is your username?")
            message.channel.awaitMessages(filter, {max: 1, time: 10000}).then(collected => {
                if(collected.first().content) {
                    username = collected.first().content;
                    console.log(username)
                    parseData(platform, username);
                }
            }).catch(err => {
                console.log(err);
            })
        }
        async function parseData(platform, username) {
            message.channel.send("Grabbing your profile...").then(msg => {
                const R6 = new RainbowSixApi();
                R6.stats(username, platform, true).then(response => {
                    console.log(response);
                }).catch(error => {
                    console.error(error)
                });
            });
        }
        getPlatform()
    },
}