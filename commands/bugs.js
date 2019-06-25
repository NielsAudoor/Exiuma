module.exports = {
    name: ['bug', 'bugs', 'debug'],
    main: function(bot, message) {
        const readdir = require('fs').readdir;

        if (bot.devs.indexOf(message.author.id) < 0) {
            return message.channel.send('Sorry, you need developer permissions to run this command');
        }
        let failedLoads = 0;

        readdir('./commands/', (err, files) => {
            if (err) throw err;
            message.channel.send(`Loading ${files.length} commands...`).then(msg => {
                files.forEach(f => {
                    try {
                        for (s = 0; s < require(`./${f}`).name.length; s++) {
                            let name = require(`./${f}`).name[s];
                            bot.commands.set(name, require(`./${f}`));
                            msg.edit(msg.content + `\nloading ${name}`)
                        }
                    } catch (e) {
                        message.channel.send(`Unable to load command ${f}: ${e}`);
                        failedLoads++
                    }
                });
                if(failedLoads !== 0){
                    msg.edit(msg.content + `\n`+":x: "+files.length-failedLoads+"files loaded successfully, "+failedLoads+"file(s) failed to load")

                    //message.channel.send(files.length-failedLoads+"files loaded successfully, "+failedLoads+"file(s) failed to load");
                } else {
                    msg.edit(msg.content + `\n`+":white_check_mark: All files loaded, no errors detected!");
                }
            })
        });
    },
}