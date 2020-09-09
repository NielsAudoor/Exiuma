module.exports = {
    name: ['roll', 'r', 'dice'],
    description: 'Roll some dice!',
    category: 'fun',
    main: function (bot, message) {
        const Discord = require('discord.js');
        async function genNumber(max, amount, modifier) {
            return new Promise(result => {
                let output = [];
                for (let i = 0; i < amount; i++) {
                    output.push(parseInt(Math.floor(Math.random() * (max)) + 1)+parseInt(modifier))
                }
                result(output);
            })
        }
        async function assembleMessage(){
            let intent = await getIntent();
            let nums = await genNumber(intent.maxNum, intent.diceNum, intent.modifier)
            let rolling;
            if(intent.modifier > 0) rolling = `${intent.diceNum}d${intent.maxNum}+${intent.modifier}...`
            else rolling = `${intent.diceNum}d${intent.maxNum}...`
            if(!intent.diceNum || !intent.maxNum) return message.channel.send("Please use the format r {dicenum}d{dicemax}+{modifier}")
            console.log(`Parsing ${intent.diceNum}d${intent.maxNum}+${intent.modifier}...`)
            let numString = "(";
            let total = 0;
            for(let i=0; i<nums.length;i++){
                total = parseInt(total) + parseInt(nums[i])
                if((parseInt(nums[i]) - parseInt(intent.modifier)) == parseInt(intent.maxNum))nums[i] = "="+nums[i]+"="
                if((parseInt(nums[i]) - parseInt(intent.modifier)) == parseInt(1))nums[i] = "-"+nums[i]+"-"
                if(i == nums.length-1) numString += nums[i];
                else numString += nums[i] + ", ";
            }
            numString += ")"
            const embed = new Discord.RichEmbed()
                .setColor('#00ffff')
                .setTitle(`Lets roll the dice ${message.author.username}! 🎲`)
                .setDescription("Rolling: ```" + rolling + "```Result: ```" + numString + "```Total: ```" + total + "```")
                .setThumbnail(message.author.avatarURL)
                .setFooter(`DND lad 2020 - Soos Kitashi`)
                .setTimestamp();
            await message.channel.send(embed);
        }
        async function getIntent(){
            return new Promise(result => {
                let intent = {diceNum: null, maxNum: null, modifier: null,}
                let msg = message.content.substring(message.content.indexOf(' ') + 1, message.content.length) || null;
                intent.diceNum = msg.substring(0, msg.indexOf('d'));
                if (msg.indexOf('+') > 0) {
                    intent.maxNum = msg.substring(msg.indexOf('d') + 1, msg.indexOf('+'));
                    intent.modifier = msg.substring(msg.indexOf('+') + 1, msg.length);
                } else {
                    intent.maxNum = msg.substring(msg.indexOf('d') + 1, msg.length);
                    intent.modifier = 0;
                }
                result(intent);
            })
        }
        assembleMessage()
    },
};