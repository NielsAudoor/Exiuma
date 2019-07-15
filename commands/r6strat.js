module.exports = {
    name: ['r6strat','siegestrat', 'rainbowstrat', 'siegeplan', 'r6plan', 'rainbowplan'],
    description: 'Generate a terrible strat for R6!',
    category: 'fun',
    main: function (bot, message) {
        const Discord = require('discord.js');
        var stringSimilarity = require('string-similarity');
        const filter = m => m.author.id === message.author.id;
        var attackDescription = [
            'Kill the bottom fragger! They are holding us back!',
            'The entire team can only move when a teammate is firing their weapon',
            'Each Squad Member is assigned an enemy to kill, you are only allowed to kill your target',
            'All players must take Recruit with an LMG, when firing your weapon you must empty the entire magazine before reloading.',
            'All FBI recruits with riot shields, revolvers, smoke grenades, and stun grenades',
            'Everyone must take breaching charges, and the team must breach and enter OBJ at the same as each other',
            'All players must take GSG9 Recruit with the M870 and have to rush the OBJ as a group',
            'The entire team must stay on any floor that the objective is not on, killing enemies through the ceiling or floor underneath',
            'The entire team must take anti-roamers and cannot enter the OBJ. (Jackal, Lion, Dokkaebi, Blitz, Montagne)',
            'Shotguns only',
            'Glaz, Fuze and Spetznaz recruits only',
            'Have the bottom fragger as the assigned VIP, they must take a 3 speed operator, and if they die, the rest of the team must commit suicide.',
            'Smoke Grenades and Knives only',
            'No hardbreaches allowed',
        ];
        var attackTitle = [
            'No Freeloaders',
            'Covering Fire',
            'Contracts',
            'Rambo',
            'The Great Wall of Shields',
            'Clearing the Objective',
            'Rushin and Rockin',
            'What Floor',
            'Cat and Mouse',
            'Slugs, slugs, and more slugs!',
            'For Russia',
            'The VIP',
            'Making it personal',
            'Doing it the hard way',
        ];
        var defenseDescription = [
            'All Spetznaz recruits with auto shotguns, two players must take Tachanka and Kapkan, if Tachanka dies, the team must commit suicide with Nitro Cells',
            'Everyone must kill themselves at the start of the round, and the top scoring player must prove their worth by getting an ace',
            'Everyone must take barbed wire and fill the OBJ with wire',
            'Tachanka places his turret and someone must always been on it.',
            'Everyone must take deployable shields and place them around the OBJ',
            'The team must destroy all cameras inside the building during Prep Phase',
            'During Prep Phase the team must take down all barricades on windows and doors',
            'All teammates must run outside and cannot enter the building again until getting a kill',
            'All must equip supressed pistols and cannot sprint',
            'After Prep Phase everyone must remain prone for the entire round',
            '3 Speed operators and melee only',
            'Nobody gets to leave objective room',
        ];
        var defenseTitle = [
            'Lord Tachanka',
            'Prove your Worth',
            'Venus Fly Trap',
            'Mounted Gunner',
            'Cardboard Fort',
            'Denying yourself the intel',
            'Letting in a breeze',
            'Early Bird',
            'Shhhh!',
            'Ground Huggers',
            'Too Fast',
            'Spawn Camping',
        ];


        let attack = [
            'attacking', 'attack', 'a'
        ]
        let defense = [
            'defending', 'defend', 'd', 'defense'
        ]
        async function predictionEngine(input, array1, array2) {
            return new Promise(result => {
                predictionPercent = 0;
                prediction = null;
                for (i = 0; i < array1.length; i++) {
                    let predictionScore = stringSimilarity.compareTwoStrings(input, array1[i]) * 100
                    if (predictionScore > predictionPercent) {
                        predictionPercent = predictionScore;
                        prediction = array1[i];
                    }
                }
                for (i = 0; i < array2.length; i++) {
                    let predictionScore = stringSimilarity.compareTwoStrings(input, array2[i]) * 100
                    if (predictionScore > predictionPercent) {
                        predictionPercent = predictionScore;
                        prediction = array2[i];
                    }
                }
                setTimeout(function () {
                    if (array1.indexOf(prediction) < 0) {      //if you say no
                        result(false)
                    } else if (array2.indexOf(prediction) < 0) {  //if you say yes
                        result(true)
                    }
                }, 1000)
            });
        }
        async function promptUser(msg) {
            return new Promise(result => {
                message.channel.send(msg)
                message.channel.awaitMessages(filter, { max: 1, time: 30000 }).then(collected => {
                    if(collected.first()){
                        if (collected.first().attachments.size == 0) {
                            if (collected.first().content) {
                                result(collected.first())
                            }
                        } else {
                            message.channel.send("Please don't send a picture during setup.");
                        }
                    }
                })
            });
        }
        async function ask(msg, array1, array2) {
            var reply = await promptUser(msg);
            var final = await predictionEngine(reply.content, array1, array2);
            return new Promise(result => {
                result(final)
            });
        }

        async function grabStrat() {
            var result = await ask("Are you attacking or defending?", attack, defense);
            if (result) {
                let attackVar = Math.floor(Math.random() * attackDescription.length)
                var embed = new Discord.RichEmbed()
                    .setAuthor(`Good luck with this attack strategy!`, message.guild.iconURL)
                    .setColor([83, 188, 165])
                    .addField(`**${attackTitle[attackVar]}**`, `\`\`\`\n${attackDescription[attackVar]}\`\`\``)
                    .setFooter('Please only play strat in a 5 man group!')
                    .setTimestamp();
                message.channel.send(embed);
            } else {
                let defenseVar = Math.floor(Math.random() * defenseDescription.length)
                var embed = new Discord.RichEmbed()
                    .setAuthor(`Good luck with this defense strategy!`, message.guild.iconURL)
                    .setColor([83, 188, 165])
                    .addField(`**${defenseTitle[defenseVar]}**`, `\`\`\`\n${defenseDescription[defenseVar]}\`\`\``)
                    .setFooter('Please only play strat in a 5 man group!')
                    .setTimestamp();
                message.channel.send(embed);
            }
        }
        grabStrat()
    },
};