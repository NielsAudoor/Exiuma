const Discord = require('discord.js');
const bot = new Discord.Client();
const readdir = require('fs').readdir;
var stringSimilarity = require('string-similarity');
config = require('./config.json')

bot.devs = [
    '247015447885512714', '200949063061864448',
];
bot.prefix = '!'
bot.commands = new Discord.Collection();

//functions
bot.sleep = function (milliseconds) {
    let start = new Date().getTime();
    for (let i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
};

//bot startup
bot.on('ready', () => {
    console.log("Booting up...");
    readdir('./commands/', (err, files) => {
        if (err) throw err;
        console.log(`Loading ${files.length} commands...`);
        files.forEach(f => {
            try {
                for (s = 0; s < require(`./commands/${f}`).name.length; s++) {
                    let name = require(`./commands/${f}`).name[s];
                    //console.log(require(`./commands/${f}`).name[s]);
                    bot.commands.set(name, require(`./commands/${f}`));
                }
            } catch (e) {
                console.log(`Unable to load command ${f}: ${e}`);
            }
        });
        console.log(`Commands loaded!`);
    });
});

//message listener
bot.on('message', message =>{
    if (message.author.bot) {
        if (message.author.equals(bot.user)) {
            console.log(message.guild.name + ' - ' + message.content);
            return;
        } else {
            return;
        }
    }
    
    message.args = message.content.split(/\s+/g);
    message.content = message.content.substring(message.content.indexOf(' ') + 1, message.content.length) || null;
    let command = message.args[0].slice(bot.prefix.length).toLowerCase()
    if (!message.args[0].startsWith(bot.prefix)) {
        return;
    }
    if(message.channel.type == 'dm'){
        return;
    }
    let cmd;
    let predictionPercent = 0;
    let predictionCommand;
    let predictionCommandName;
    let unknownCommandFlag = 0;

    for(i = 0; i< bot.commands.array().length; i++) {
        for(j=0; j<bot.commands.array()[i].name.length; j++){
            let predictionScore = stringSimilarity.compareTwoStrings(command , bot.commands.array()[i].name[j])*100
            if(predictionScore > predictionPercent){
                predictionPercent = predictionScore
                predictionCommand = bot.commands.array()[i]
                predictionCommandName = bot.commands.array()[i].name[j]
                console.log(bot.commands.array()[i].name[j]+" - "+predictionScore+"%")
            }
        }
    }

    let roundedPredictionPercent = predictionPercent
    if (roundedPredictionPercent === 100){
        roundedPredictionPercent = predictionPercent.toString().substring(0, 3)
    } else {
        roundedPredictionPercent = predictionPercent.toString().substring(0, 2)
    }

    if(predictionPercent < 75 && predictionPercent > 0){
        unknownCommandFlag = 1;
        message.channel.send(`I could not find that command, did you mean !${predictionCommandName}? (${roundedPredictionPercent}% match)`).then(msg => {
            msg.react("✅");
            bot.on('messageReactionAdd', (messageReaction, user) => {
                if(messageReaction.emoji == "✅"){
                    if(messageReaction.count > 1){
                        if(user.id = message.author.id) {
                            msg.edit(`Got it! Running !${predictionCommandName}...`);
                            msg.clearReactions()
                            if(unknownCommandFlag){
                                try {
                                    predictionCommand.main(bot, message);
                                    unknownCommandFlag = 0;
                                } catch (err2) {
                                    console.log(err2)
                                }
                            }
                        }
                    } else {
                        setTimeout(function() {
                            msg.clearReactions()
                        },10000)
                    }
                }
            })
        })
    } else if (predictionPercent > 75){
        unknownCommandFlag = 0;
        cmd = predictionCommand;
    } else if (predictionPercent === 0){
        message.channel.send("I could not find that command")
        return;
    }

    if(command){
        console.log(message.author.username+` (${message.guild.name}) - `+message.content+` (${roundedPredictionPercent}%)`);
    }

    try {
        if(cmd && !unknownCommandFlag) {
            cmd.main(bot, message);
        }
    } catch (err2) {
        console.log(err2)
    }

    /*
    var arraycommands = bot.commands.array();
    console.log(arraycommands)
    for (var i = 0; i < arraycommands.length; i++) {
        for(var j = 0; j <arraycommands[i].length; j++){
            if (arraycommands[i][j] === message) {
                console.log("works");
            } 
        }
        
    }
     */
});

bot.login(config.token);