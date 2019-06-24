const Discord = require('discord.js');
const bot = new Discord.Client();
const readdir = require('fs').readdir;

config = require('./config.json')
bot.prefix = '!'

bot.commands = new Discord.Collection();

bot.on('ready', () => {
    readdir('./commands/', (err, files) => {
        if (err) throw err;
        console.log(`Loading ${files.length} commands!`);
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

    console.log("ready");
});

bot.on('message', message =>{
    message.args = message.content.split(/\s+/g);
    message.content = message.content.substring(message.content.indexOf(' ') + 1, message.content.length) || null;
    let command = message.args.shift().slice(bot.prefix.length).toLowerCase();
    let cmd;
    
    for(i = 0; i< bot.commands.array().length; i++) {
        for(j=0; j<bot.commands.array()[i].name.length; j++){
            if(bot.commands.array()[i].name[j] === command){
                console.log("command found")
                cmd = bot.commands.array()[i];
            }
        }
    }

    if(command){
        console.log(message.content);
    }

    if(message.channel.type == 'dm'){
        return;
    }

    if (!cmd) {
        
        return;
    }

    try {
        cmd.main(bot, message);
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