const Discord = require('discord.js');
const bot = new Discord.Client();
const readdir = require('fs').readdir;
bot.prefix('!')

bot.commands = new Discord.Collection();

readdir('./commands/', (err, files) => {
    if (err) throw err;
    console.log(`Loading ${files.length} commands!`);
    files.forEach(f => {
        if(f !== "Images") {
            try {
                (`./commands/${f}`).synonym.forEach(s => {
                    let synonym = require(`./commands/${f}`).name;
                    bot.commands.set(synonym, require(`./commands/${f}`));
                })

            } catch (e) {
                console.log(`Unable to load command ${f}: ${e}`);
            }
        }
    });
    console.log(`Commands loaded!`);
});

bot.on('message', message =>{
    if(message.channel.type == 'dm'){
        return;
    }
    bot.commands.forEach(element => {
        console.log(element);
    });
})

bot.login(config.token);