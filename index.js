const Discord = require('discord.js');
const bot = new Discord.Client();
const readdir = require('fs').readdir;
var stringSimilarity = require('string-similarity');
config = require('./config.json')
var mongoUtil = require('./processes/mongoUtil');
var logging = require('./processes/logging');
var welcome = require('./processes/welcome');
var deletedChannelDetection = require('./processes/deletedChannelDetection');
var dynamicVC = require('./processes/dynamicVc');
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
async function reactionCatcher(msg, predictionCommand, unknownCommandFlag, predictionCommandName, filter, message, prefix) {
    setTimeout(function () {
        msg.clearReactions();
    }, 10000)
    msg.awaitReactions(filter, { max: 1, time: 10000 }).then(collected => {
        if (collected) {
            if(collected.first()){
                if (collected.first().emoji.name === "✅") {
                    msg.clearReactions()
                    msg.edit(`Got it! Running ${prefix+predictionCommandName}...`);
                    if (unknownCommandFlag) {
                        try {
                            predictionCommand.main(bot, message);
                            unknownCommandFlag = 0;
                        } catch (err2) {
                            console.log(err2)
                        }
                    }
                }
            }
        }
    });
}
async function dataBaseCheck(table, query) {
    return new Promise(promise => {
        mongoUtil.getDb().collection(table).find(query).toArray(function (err, result) {
            if (err) throw err;
            if (result.length == 0) {    //if there is no database
                promise(null)
            } else {                    //if there is a database
                promise(result[0])
            }
        });
    })
}
async function checkPrefix(message){
    var query = {serverID: message.guild.id};
    var result = await dataBaseCheck("prefix", query);
    var prefix;
    return new Promise(promise => {
        if (result) {
            promise(result.prefix)
        } else {
            promise(bot.prefix)
        }
    })
}
//persistent processes
mongoUtil.connectToServer(function (err, client) {
    if (err) console.log(err);
});
logging.scan(bot, function (err, client) {
    if (err) console.log(err);
});
welcome.scan(bot, function (err, client) {
    if (err) console.log(err);
});
deletedChannelDetection.scan(bot, function (err, client) {
    if (err) console.log(err);
});
dynamicVC.scan(bot, function (err, client) {
    if (err) console.log(err);
});
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
                    bot.commands.set(name, require(`./commands/${f}`));
                }
            } catch (e) {
                console.log(`Unable to load command ${f}: ${e}`);
            }
        });
        console.log(`Commands loaded!`);
    });
    bot.user.setActivity(`${bot.prefix}help | ${bot.prefix}whatisprefix`);
});
async function messageHandler(message) {
    if (message.channel.type == 'dm') {
        return;
    }
    message.args = message.content.split(/\s+/g);
    let trimmedContent = message.content.substring(message.content.indexOf(' ') + 1, message.content.length) || null;
    let command = message.args[0].slice(bot.prefix.length).toLowerCase()
    var query = {serverID: message.guild.id};
    let result = await checkPrefix(message)
    if (result) {
        if (message.args[0].startsWith(result)) {
            if(message.content == result){return}
            let cmd;
            let predictionPercent = 0;
            let predictionCommand;
            let predictionCommandName;
            let unknownCommandFlag = 0;

            //console.log stuff
            if (message.author.bot) {
                if (message.author.equals(bot.user)) {
                    console.log(message.guild.name + ' - ' + trimmedContent);
                    return;
                } else {
                    return;
                }
            }

            //prediction engine
            for (var i = 0; i < bot.commands.array().length; i++) {
                for (var j = 0; j < bot.commands.array()[i].name.length; j++) {
                    let predictionScore = stringSimilarity.compareTwoStrings(command, bot.commands.array()[i].name[j]) * 100
                    if (predictionScore > predictionPercent) {
                        predictionPercent = predictionScore
                        predictionCommand = bot.commands.array()[i]
                        predictionCommandName = bot.commands.array()[i].name[j]
                        //console.log(bot.commands.array()[i].name[j] + " - " + predictionScore + "%")
                    }
                }
            }
            let roundedPredictionPercent = predictionPercent
            if (roundedPredictionPercent === 100) {
                roundedPredictionPercent = predictionPercent.toString().substring(0, 3)
            } else {
                roundedPredictionPercent = predictionPercent.toString().substring(0, 2)
            }
            if (predictionPercent < 75 && predictionPercent > 0) {
                unknownCommandFlag = 1;
                message.channel.send(`I could not find that command, did you mean ${result+predictionCommandName}? (${roundedPredictionPercent}% match)`).then(msg => {
                    msg.react("✅");
                    const filter = (reaction, user) => user.id === message.author.id && reaction.emoji.name === "✅";
                    reactionCatcher(msg, predictionCommand, unknownCommandFlag, predictionCommandName, filter, message, result);
                })
            } else if (predictionPercent > 75) {
                unknownCommandFlag = 0;
                cmd = predictionCommand;
            } else if (predictionPercent === 0) {
                //commented out because niels is a scrub
                //message.channel.send("I could not find that command")
                return;
            }

            if (command) {
                console.log(message.author.username + ` (${message.guild.name}) - ` + trimmedContent + ` (${roundedPredictionPercent}%)`);
            }

            //actually running the command
            try {
                if (cmd && !unknownCommandFlag) {
                    cmd.main(bot, message);
                }
            } catch (err2) {
                console.log(err2)
            }
        } else if(message.content == bot.prefix+"help"){
            let cmd
            for (var i = 0; i < bot.commands.array().length; i++) {
                for (var j = 0; j < bot.commands.array()[i].name.length; j++) {
                    if(bot.commands.array()[i].name[j]=="help"){
                        console.log(bot.commands.array()[i].name[j])
                        cmd = bot.commands.array()[i]
                    }
                }
            }
            try {
                cmd.main(bot, message);
            } catch (err2) {
                console.log(err2)
            }
        } else if(message.content == bot.prefix+"whatisprefix"){
            return message.channel.send("This server's prefix is set to - "+result)
        }
    }
}
bot.on('message', message => {messageHandler(message)});
bot.login(config.token);