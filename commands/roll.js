module.exports = {
    name: ['roll', 'r', 'dice'],
    description: 'Roll some dice!',
    category: 'fun',
    main: function (bot, message) {
        const Discord = require('discord.js');
        let msg = message.content.substring(message.content.indexOf(' ') + 1, message.content.length) || null;
        let diceNum = msg.substring(0, msg.indexOf('d')) || null;
        let endNum = msg.substring(msg.indexOf('d') + 1, msg.length) || null;
        if(msg === `${bot.prefix}r`)return message.channel.send("Please use the format !r{number of dice}d{max dice value}");
        let rolling;
        if (diceNum && endNum) {
            rolling = diceNum + "d" + endNum;
        }
        let total = 0;
        let desc = "(";
        for(let i = 0; i < diceNum; i++) {
            let critHit = false;
            let rand = Math.floor(Math.random() * (endNum)) + 1;
            if(rand-1 === endNum-1) critHit = true;
            if(rand === 1)  critHit = true;
            if(i === diceNum-1){
                if(critHit) desc += rand.toString(); //+ " - Critical Hit!)";
                else desc += rand.toString() + ")";
            } else {
                if(critHit) desc += rand.toString(); // + " - Critical Hit!,";
                else desc += rand.toString() + ",";
            }
            desc+=" ";
            total += rand;
        }
        const embed = new Discord.RichEmbed()
            .setColor('#00ffff')
            .setTitle(`Lets roll the dice ${message.author.username}! 🎲`)
            .setDescription("```Rolling " + rolling + "```\n```Result: " + desc + "```\n```Total: " + total + "```")
            .setThumbnail(message.author.avatarURL)
            .setFooter(`DND lad 2020 - Soos Kitashi`)
            .setTimestamp();
        message.channel.send(embed);
    },
};