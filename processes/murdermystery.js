const Discord = require('discord.js');
var servers = {};
let roundCounter = 0;
let minPlayers = 3;
let shots = 2;
let nightTimer = 15000;
let townMessageTimer = 5000;
let dayTimer = 15000;
let joinTimer = 15000;
let lynchTimer = 15000;
let numberEmojis = ["1⃣","2⃣","3⃣","4⃣","5⃣","6⃣","7⃣","8⃣","9⃣"]
let townMessageStart = [
    "Terrible news everyone! ",
    "I dont know how you slept through all that screaming! ",
]
let causeOfDeath = [
    "strangled",
    "savagely beaten",
    "shot",
    "stabbed",
]
let murderWeapon = [
    "gun",
    "wrench",
    "whip",
    "can of tuna",
    "singular oreo",
    "belt",
    "fuzzy slipper",
]
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
function arrayRemove(arr, value) {
    return arr.filter(function(ele){
        return ele != value;
    });
}
async function reactionCatcher(filter, type, m, array, server) {
    let collectedFlag = false;
    if(type == 0){//murderer
        m.awaitReactions(filter, {max: 1, time: 55000}).then(collected => {
            if (collected) {
                if (collected.first()) {
                    for (let i = 0; i < numberEmojis.length; i++) {
                        if (collected.first().emoji.name == numberEmojis[i]) {
                            collectedFlag = true;
                            m.clearReactions()
                            var embed = new Discord.RichEmbed()
                                .setAuthor(`${server.keyRoles.murderer.username} You are the murderer!`)
                                .setColor([255, 255, 255])
                                .setDescription(m.guild.members.find(members=> members.id == array[i]).user.username+" is a dead man.");
                            m.edit(embed)
                            let duplicateFlag = false;
                            for(let k=0;k<server.dead.length;k++){
                                if(server.dead[k]==array[i]){
                                    duplicateFlag = true
                                }
                            }
                            if(!duplicateFlag){
                                server.dead.push(array[i]);
                                server.alive = arrayRemove(server.alive, array[i])
                            }
                            server.roundEvents.murdered.id = array[i]
                            server.roundEvents.murdered.username = m.guild.members.find(members=> members.id == array[i]).user.username
                        }
                    }
                }
            }
        });
    } else if (type == 1){//sheriff
        m.awaitReactions(filter, {max: 1, time: 55000}).then(collected => {
            if (collected) {
                if (collected.first()) {
                    for (let i = 0; i < numberEmojis.length; i++) {
                        if (collected.first().emoji.name == numberEmojis[i]) {
                            m.clearReactions()
                            var embed = new Discord.RichEmbed()
                                .setAuthor(`${server.keyRoles.sheriff.username} You are the sheriff!`)
                                .setColor([255, 255, 255])
                                .setDescription(m.guild.members.find(members=> members.id == array[i]).user.username+" has been shot.");
                            m.edit(embed)
                            let duplicateFlag = false;
                            for(let k=0;k<server.dead.length;k++){
                                if(server.dead[k]==array[i]){
                                    duplicateFlag = true
                                }
                            }
                            if(!duplicateFlag){
                                server.dead.push(array[i]);
                                server.alive = arrayRemove(server.alive, array[i])
                            }
                            server.roundEvents.shot.id = array[i];
                            server.roundEvents.shot.username = m.guild.members.find(members=> members.id == array[i]).user.username
                            deathDuplicateDeletor(server, array[i])
                            shots--;
                        }
                    }
                }
            }
        });
    } else if (type == 2) {//jailor
        m.awaitReactions(filter, {max: 1, time: 55000}).then(collected => {
            if (collected) {
                if (collected.first()) {
                    for (let i = 0; i < numberEmojis.length; i++) {
                        if (collected.first().emoji.name == numberEmojis[i]) {
                            m.clearReactions()
                            var embed = new Discord.RichEmbed()
                                .setAuthor(`${server.keyRoles.sheriff.username} You are the sheriff!`)
                                .setColor([255, 255, 255])
                                .setDescription(m.guild.members.find(members=> members.id == array[i]).user.username+" will be jailed next round.");
                            m.edit(embed)
                            server.roundEvents.jailed.id = array[i];
                            server.roundEvents.jailed.username = m.guild.members.find(members=> members.id == array[i]).user.username
                        }
                    }
                }
            }
        });
    } else if(type == 3){//lynch - 30 second timer - depricated
    } else if(type == 4){
        m.awaitReactions(filter, {max: 1, time: 55000}).then(collected => {
            if (collected) {
                if (collected.first()) {
                    for (let i = 0; i < numberEmojis.length; i++) {
                        if (collected.first().emoji.name == numberEmojis[i]) {
                            m.clearReactions()
                            var embed = new Discord.RichEmbed()
                                .setAuthor(`${server.keyRoles.medic.username} You are the nurse!`)
                                .setColor([255, 255, 255])
                                .setDescription(m.guild.members.find(members=> members.id == array[i]).user.username+" has been healed!");
                            m.edit(embed)
                            server.alive.push(array[i]);
                            server.dead = arrayRemove(server.dead, array[i])
                            server.roundEvents.healed.id = array[i];
                            server.roundEvents.healed.username = m.guild.members.find(members=> members.id == array[i]).user.username
                        }
                    }
                }
            }
        });
    }
}

async function lynch(message, server,){
    let desc = "It's time to lynch someone! Who do you want to see go?\n"
    for(let i=0;i<server.alive;i++){
        if(message.guild.members.find(members=> members.id == server.alive[i])){
            desc+= numberEmojis[i]+" - "+message.guild.members.find(members=> members.id == server.alive[i]).user.username+"\n"
        }
    }
    var embed = new Discord.RichEmbed()
        .setAuthor(`Lets kill someone that is probably innocent!`)
        .setColor([255, 255, 255])
        .setDescription(desc);
    server.channels.dayChannel.send(embed).then(m => {
        for(let i=0;i<server.alive.length;i++) {
            setTimeout(function () {
                m.react(numberEmojis[i])
            },250)
        }
        setTimeout(function() {
            for(let i=0;i<numberEmojis.length;i++){
                if(m.reactions.get(numberEmojis[i])){
                    console.log(`REACTION ${i+1} - ${m.reactions.get(numberEmojis[i]).count-1} COLLECTED`)
                }
            }
        },lynchTimer)
/*
            let filter = guild => guild.id === message.guild.id
        const collector = message.createReactionCollector(filter, { time: 25000 });
        collector.on('end', collected => {
            console.log(collected)
        });
        /*
        setTimeout(function () {
            m.clearReactions()
        }, lynchTimer)
        */
    })
}
async function startupPrompt(msg, message, server, bot) {
    const filter = m => m.guild.id === message.guild.id;
    message.channel.send(msg).then(m => {
        m.react("✅")
        setTimeout(function () {
            if(m.reactions.get("✅")){
                if(m.reactions.get("✅").count-1>=minPlayers){
                    for(let i=0;i<m.reactions.get("✅").users.array().length;i++){
                        if(!m.reactions.get("✅").users.array()[i].bot){
                            server.playerIDs.push(m.reactions.get("✅").users.array()[i].id)
                            server.unpickedIDs.push(m.reactions.get("✅").users.array()[i].id)
                            server.alive.push(m.reactions.get("✅").users.array()[i].id)
                            server.playerNames.push(m.reactions.get("✅").users.array()[i].username)
                            server.unpickedNames.push(m.reactions.get("✅").users.array()[i].username)
                        }
                    }
                    console.log(server)
                    let desc;
                    for(let i=0;i<server.playerNames.length;i++){
                        if (!desc) {
                            desc = server.playerNames
                        } else {
                            desc += ", " + server.playerNames
                        }
                    }
                    m.delete()
                    message.channel.send(`The game is about to start! Here is our list of players - ${desc}!`)
                    setTimeout(function () {
                        generateChannels(message, server);
                    },5000)
                } else {
                    m.clearReactions()
                    m.edit(`Sorry, but there were not enough players to start a game!`)
                }
            }
        },20000)
        /* depricated stuff
            message.channel.awaitMessages(filter, { max: 10, time: 30000 }).then(collected => {
            if(collected.first()) {
                let desc;
                if(collected.array().length >= minPlayers){
                    for (let i = 0; i < collected.array().length; i++) {
                        if (collected.array()[i].content.toLowerCase() == "join")
                            if (collected.array()[i].author.id !== bot.user.id) {
                            let duplicateFlag = false;
                            for(let k=0; k<server.playerIDs.length;k++){
                                if(collected.array()[i].author.id == server.playerIDs[k]){
                                    duplicateFlag = true;
                                }
                            }
                            if(!duplicateFlag){
                                server.playerIDs.push(collected.array()[i].author.id)
                                server.unpickedIDs.push(collected.array()[i].author.id)
                                server.alive.push(collected.array()[i].author.id)
                                server.playerNames.push(collected.array()[i].author.username)
                                server.unpickedNames.push(collected.array()[i].author.username)
                                if (!desc) {
                                    desc = collected.array()[i].author.username
                                } else {
                                    desc += ", " + collected.array()[i].author.username
                                }
                                collected.array()[i].delete();
                            }
                        }
                    }
                    setTimeout(function () {
                        m.delete()
                        message.channel.send(`The game is about to start! Here is our list of players - ${desc}!`)
                        generateChannels(message, server);
                        //console.log(server);
                    },500)
                } else {
                    m.delete()
                    message.channel.send(`Sorry, but there were not enough players to start a game!`)
                }
            }
        })
        */
    })
}
async function generateRoles(server){
    return new Promise(result => {
        let rand;
        rand = getRandomInt(server.unpickedIDs.length)    //picks medic
        server.keyRoles.medic.id = server.unpickedIDs[rand]
        server.keyRoles.medic.username = server.unpickedNames[rand]
        server.unpickedIDs = arrayRemove(server.unpickedIDs, server.unpickedIDs[rand]);
        server.unpickedNames = arrayRemove(server.unpickedNames, server.unpickedNames[rand]);
        setTimeout(function () {
            rand = getRandomInt(server.unpickedIDs.length)    //picks murderer
            server.keyRoles.murderer.id = server.unpickedIDs[rand]
            server.keyRoles.murderer.username = server.unpickedNames[rand]
            server.unpickedIDs = arrayRemove(server.unpickedIDs, server.unpickedIDs[rand]);
            server.unpickedNames = arrayRemove(server.unpickedNames, server.unpickedNames[rand]);
        }, 500)
        setTimeout(function () {
            rand = getRandomInt(server.unpickedIDs.length)    //picks sheriff
            server.keyRoles.sheriff.id = server.unpickedIDs[rand]
            server.keyRoles.sheriff.username = server.unpickedNames[rand]
            server.unpickedIDs = arrayRemove(server.unpickedIDs, server.unpickedIDs[rand]);
            server.unpickedNames = arrayRemove(server.unpickedNames, server.unpickedNames[rand]);
        }, 1000)
        setTimeout(function () {
            server.citizen = server.unpickedIDs
            result(true)
        },1500)
    })
}
async function generateChannels(message, server) {     //called after startup prompt
    let check = await generateRoles(server);                                    //generating roles

    message.guild.createChannel("Murderer-Controls", {type: 'text'}).then((murdererChannel) => {
        murdererChannel.overwritePermissions(message.guild.id, {
            VIEW_CHANNEL: false
        })
        murdererChannel.overwritePermissions(server.keyRoles.murderer.id, {
            VIEW_CHANNEL: true,
            SEND_MESSAGES: false
        })
        if (message.channel.parentID) {
            murdererChannel.setParent(message.channel.parentID)
        }
        server.channels.murderChannel = murdererChannel
    })
    message.guild.createChannel("Sheriff-Controls", {type: 'text'}).then((sheriffChannel) => {
        sheriffChannel.overwritePermissions(message.guild.id, {
            VIEW_CHANNEL: false
        })
        sheriffChannel.overwritePermissions(server.keyRoles.sheriff.id, {
            VIEW_CHANNEL: true,
            SEND_MESSAGES: false
        })
        if (message.channel.parentID) {
            sheriffChannel.setParent(message.channel.parentID)
        }
        server.channels.sheriffChannel = sheriffChannel
    })
    message.guild.createChannel("Nurse-Controls", {type: 'text'}).then((nurseChannel) => {
        nurseChannel.overwritePermissions(message.guild.id, {
            VIEW_CHANNEL: false
        })
        nurseChannel.overwritePermissions(server.keyRoles.medic.id, {
            VIEW_CHANNEL: true,
            SEND_MESSAGES: false
        })
        if (message.channel.parentID) {
            nurseChannel.setParent(message.channel.parentID)
        }
        server.channels.medicChannel = nurseChannel
    })
    message.guild.createChannel("Questioning-Room", {type: 'text'}).then((jailorChannel) => {
        jailorChannel.overwritePermissions(message.guild.id, {
            VIEW_CHANNEL: false
        })
        jailorChannel.overwritePermissions(server.keyRoles.sheriff.id, {
            VIEW_CHANNEL: true,
            SEND_MESSAGES: true
        })
        if (message.channel.parentID) {
            jailorChannel.setParent(message.channel.parentID)
        }
        server.channels.jail.jailorChannel = jailorChannel
    })
    message.guild.createChannel("Lockup", {type: 'text'}).then((jailedChannel) => {
        jailedChannel.overwritePermissions(message.guild.id, {
            VIEW_CHANNEL: false
        })
        if (message.channel.parentID) {
            jailedChannel.setParent(message.channel.parentID)
        }
        server.channels.jail.jailedChannel = jailedChannel
    })
    message.guild.createChannel("Town-Chat", {type: 'text'}).then((dayChannel) => {
        dayChannel.overwritePermissions(message.guild.id, {
            VIEW_CHANNEL: false,
        })
        for(let i=0;i<server.playerIDs.length;i++){
            dayChannel.overwritePermissions(server.playerIDs[i], {
                VIEW_CHANNEL: true,
                SEND_MESSAGES: false
            })
        }
        if (message.channel.parentID) {
            dayChannel.setParent(message.channel.parentID)
        }
        server.channels.dayChannel = dayChannel
        setTimeout(function () {
            nightMode(message, server, true)
        },1000)
    })
}
async function nightMode(message, server, isStarting){
    nightChannelPerms(message, server, isStarting)
    generateNightMessages(message, server, isStarting)
    setTimeout(function () {
        dayMode(message, server, isStarting)
    }, nightTimer)
}
async function dayMode(message, server, isStarting){
    dayChannelPerms(message, server, isStarting)
    generateDayMessages(message, server, isStarting)
    setTimeout(function () {
        newRound(message, server)
    }, lynchTimer+townMessageTimer)
}
async function nightChannelPerms(message, server, isStarting){
    server.channels.dayChannel.overwritePermissions(message.guild.id, {
        VIEW_CHANNEL: false,
    })
    for(let i=0;i<server.dead.length;i++){
        server.channels.dayChannel.overwritePermissions(server.dead[i], {
            VIEW_CHANNEL: false,
        })
    }
    for(let i=0;i<server.alive.length;i++){
        server.channels.dayChannel.overwritePermissions(server.alive[i], {
            VIEW_CHANNEL: false,
        })
    }
    if(server.roundEvents.jailed.id){
        console.log("JAILED - "+server.roundEvents.jailed.id)

        server.channels.jail.jailedChannel.overwritePermissions(server.roundEvents.jailed.id, {
            VIEW_CHANNEL: true,
            SEND_MESSAGES: true,
        })
    }
    server.channels.jail.jailorChannel.overwritePermissions(server.keyRoles.sheriff.id, {
        VIEW_CHANNEL: true,
        SEND_MESSAGES: true,
    })
}
async function dayChannelPerms(message, server, isStarting){
    server.channels.dayChannel.overwritePermissions(message.guild.id, {
        VIEW_CHANNEL: false,
    })
    for(let i=0;i<server.dead.length;i++){
        server.channels.dayChannel.overwritePermissions(server.dead[i], {
            VIEW_CHANNEL: true,
            SEND_MESSAGES: false
        })
    }
    for(let i=0;i<server.alive.length;i++){
        server.channels.dayChannel.overwritePermissions(server.alive[i], {
            VIEW_CHANNEL: true,
            SEND_MESSAGES: true
        })
    }
    server.channels.jail.jailedChannel.delete()
    setTimeout(function () {
        message.guild.createChannel("Lockup", {type: 'text'}).then((jailedChannel) => {
            jailedChannel.overwritePermissions(message.guild.id, {
                VIEW_CHANNEL: false
            })
            if (message.channel.parentID) {
                jailedChannel.setParent(message.channel.parentID)
            }
            server.channels.jail.jailedChannel = jailedChannel
        })
    },250)
    server.channels.jail.jailorChannel.overwritePermissions(server.keyRoles.sheriff.id, {
        VIEW_CHANNEL: true,
        SEND_MESSAGES: false,
    })
}
async function generateDayMessages(message, server, isStarting){
    generateTownMessage(message, server, isStarting)
    if(!isStarting){
        setTimeout(function () {
            lynch(message, server,)
        },townMessageTimer)
    }
}
async function generateNightMessages(message, server, isStarting){
    let jailed = 1234
    if(server.roundEvents.pastJailed){
        jailed = server.roundEvents.pastJailed
    }
    let murdererAlive = true
    let sheriffAlive = true
    let medicAlive = true;
    for(let i=0;i<server.dead.length;i++){
        if(server.dead[i]==server.keyRoles.murderer.id){
            murdererAlive = false;
        }
        if(server.dead[i]==server.keyRoles.sheriff.id){
            sheriffAlive = false;
        }
        if(server.dead[i]==server.keyRoles.medic.id){
            medicAlive = false;
        }
    }
    if(jailed.id !== server.keyRoles.murderer.id && murdererAlive){
        generateMurdererMessage(message, server, isStarting)
    }
    if(jailed.id !== server.keyRoles.medic.id && medicAlive){
        generateNurseMessage(message, server, isStarting)
    }
    if(sheriffAlive){
        generateDetectiveMessage(message, server, isStarting)
        generateJailorMessage(message, server, isStarting)
    }
}
async function generateMurdererMessage(message, server, isStarting){
    if(isStarting){
        server.channels.murderChannel.send(`<@${server.keyRoles.murderer.id}> You have been chosen as the murderer!`)
    } else {
        let killable = arrayRemove(server.alive, server.keyRoles.murderer.id);
        let desc = "Who would you like to kill?\n"
        for(let i=0;i<killable.length;i++){
            desc+= numberEmojis[i]+" - "+message.guild.members.find(members=> members.id == killable[i]).user.username+"\n"
        }
        var embed = new Discord.RichEmbed()
            .setAuthor(`${server.keyRoles.murderer.username} You are the murderer!`)
            .setColor([255, 255, 255])
            .setDescription(desc);
        server.channels.murderChannel.send(embed).then(m => {
            for(let i=0;i<killable.length;i++) {
                setTimeout(function () {
                    m.react(numberEmojis[i])
                },250)
            }
            let filter = (reaction, user) => user.id === server.keyRoles.murderer.id;
            reactionCatcher(filter, 0, m, killable, server)
            setTimeout(function () {
                m.delete()
            }, nightTimer)
        })
    }
}
async function generateDetectiveMessage(message, server, isStarting){
    if(isStarting){
        server.channels.sheriffChannel.send(`<@${server.keyRoles.sheriff.id}> You have been chosen as the sheriff!`)
    } else {
        if(shots>0){
            let investigatable = arrayRemove(server.alive, server.keyRoles.sheriff.id);
            let desc = "Who would you like to shoot? You have " + shots.toString() + " shots left\n"
            for(let i=0;i<investigatable.length;i++){
                desc+= numberEmojis[i]+" - "+message.guild.members.find(members=> members.id == investigatable[i]).user.username+"\n"
            }
            var embed = new Discord.RichEmbed()
                .setAuthor(`${server.keyRoles.sheriff.username} You are the sheriff!`)
                .setColor([255, 255, 255])
                .setDescription(desc);
            server.channels.sheriffChannel.send(embed).then(m => {
                for(let i=0;i<investigatable.length;i++) {
                    setTimeout(function () {
                        m.react(numberEmojis[i])
                    },250)
                }
                let filter = (reaction, user) => user.id === server.keyRoles.sheriff.id;
                reactionCatcher(filter, 1, m, investigatable, server)
                setTimeout(function () {
                    m.delete()
                }, nightTimer)
            })
        } else {
            let desc = "You used all your shots!"
            var embed = new Discord.RichEmbed()
                .setAuthor(`${server.keyRoles.sheriff.username} You are the sheriff!`)
                .setColor([255, 255, 255])
                .setDescription(desc);
            server.channels.sheriffChannel.send(embed)
        }
    }
}
async function generateJailorMessage(message, server, isStarting){
    if(isStarting){
    } else {
        let jailable = arrayRemove(server.alive, server.keyRoles.sheriff.id);
        let desc = "Who would you like to jail?\n"
        for(let i=0;i<jailable.length;i++){
            desc+= numberEmojis[i]+" - "+message.guild.members.find(members=> members.id == jailable[i]).user.username+"\n"
        }
        var embed = new Discord.RichEmbed()
            .setAuthor(`${server.keyRoles.sheriff.username} You are the sheriff!`)
            .setColor([255, 255, 255])
            .setDescription(desc);
        server.channels.sheriffChannel.send(embed).then(m => {
            for(let i=0;i<jailable.length;i++) {
                setTimeout(function () {
                    m.react(numberEmojis[i])
                },250)
            }
            let filter = (reaction, user) => user.id === server.keyRoles.sheriff.id;
            reactionCatcher(filter, 2, m, jailable, server)
            setTimeout(function () {
                m.delete()
            }, nightTimer)
        })
    }
}
async function generateNurseMessage(message, server, isStarting){
    if(isStarting){
        server.channels.medicChannel.send(`<@${server.keyRoles.medic.id}> You have been selected as the nurse!`)
    } else {
        let healable = server.dead
        let desc;
        if(healable.length > 0){
            desc = "Who would you like to heal?\n"
            for(let i=0;i<healable.length;i++){
                desc+= numberEmojis[i]+" - "+message.guild.members.find(members=> members.id == healable[i]).user.username+"\n"
            }
        } else {
            desc = "Everyone is alive!"
        }
        var embed = new Discord.RichEmbed()
            .setAuthor(`${server.keyRoles.medic.username} You are the nurse!`)
            .setColor([255, 255, 255])
            .setDescription(desc);
        server.channels.medicChannel.send(embed).then(m => {
            for(let i=0;i<healable.length;i++) {
                setTimeout(function () {
                    m.react(numberEmojis[i])
                },250)
                setTimeout(function () {
                    m.delete()
                }, nightTimer)
            }
            let filter = (reaction, user) => user.id === server.keyRoles.medic.id;
            reactionCatcher(filter, 4, m, healable, server)
        })
    }
}
async function generateTownMessage(message, server, isStarting) {
    if(server.roundEvents.shot.id && server.roundEvents.murdered.id){
        if(server.roundEvents.shot.id == server.roundEvents.murdered.id){
            let role = await getRole(server, server.roundEvents.murdered.id)
            var embed = new Discord.RichEmbed()
                .setThumbnail(message.guild.members.find(members=> members.id == server.roundEvents.murdered.id).user.avatarURL)
                .setAuthor(`Town News! - Day `+server.roundCounter)
                .setColor([255, 255, 255])
                .setDescription(townMessageStart[getRandomInt(townMessageStart.length)] + " Last night, **" + server.roundEvents.murdered.username + "** was " + causeOfDeath[getRandomInt(causeOfDeath.length)] + " with a " + murderWeapon[getRandomInt(murderWeapon.length)] + " and then shot by the sheriff. They were a beloved member of the community and will be missed.\n\nRole - "+role);
            server.channels.dayChannel.send(embed)
        } else if (server.roundEvents.shot.id == server.keyRoles.murderer){
            var embed = new Discord.RichEmbed()
                .setThumbnail(message.guild.members.find(members=> members.id == server.roundEvents.shot.id).user.avatarURL)
                .setAuthor(`Town News!`)
                .setColor([255, 255, 255])
                .setDescription("Good News! **" + server.roundEvents.shot.username+ "** who was confirmed to be a murderer, was shot dead by the sheriff!\n\n");
            server.channels.dayChannel.send(embed)
        }else{
            let role = await getRole(server, server.roundEvents.murdered.id)
            var embed = new Discord.RichEmbed()
                .setThumbnail(message.guild.members.find(members=> members.id == server.roundEvents.murdered.id).user.avatarURL)
                .setAuthor(`Town News! - Day `+server.roundCounter)
                .setColor([255, 255, 255])
                .setDescription(townMessageStart[getRandomInt(townMessageStart.length)] + " Last night, **" + server.roundEvents.murdered.username + "** was " + causeOfDeath[getRandomInt(causeOfDeath.length)] + " with a " + murderWeapon[getRandomInt(murderWeapon.length)] + ". They were a beloved member of the community and will be missed.\n\nRole - "+role);
            server.channels.dayChannel.send(embed)
            let role2 = await getRole(server, server.roundEvents.shot.id)
            var embed2 = new Discord.RichEmbed()
                .setThumbnail(message.guild.members.find(members=> members.id == server.roundEvents.shot.id).user.avatarURL)
                .setAuthor(`Town News! - Day `+server.roundCounter)
                .setColor([255, 255, 255])
                .setDescription("In other news, **" + server.roundEvents.shot.username + "** was accidentally shot by the sheriff. This was a tragic accident and it hopefully wont happen again.\n\nRole - "+role2);
            server.channels.dayChannel.send(embed2)
        }
    } else if(server.roundEvents.shot.id && !server.roundEvents.murdered.id){
        if(server.roundEvents.shot.id == server.keyRoles.murderer.id){
            var embed = new Discord.RichEmbed()
                .setThumbnail(message.guild.members.find(members=> members.id == server.roundEvents.shot.id).user.avatarURL)
                .setAuthor(`Town News! - Day `+server.roundCounter)
                .setColor([255, 255, 255])
                .setDescription("Good News! **" + server.roundEvents.shot.username+ "** who was confirmed to be a murderer, was shot dead by the sheriff!\n\n");
            server.channels.dayChannel.send(embed)
        } else {
            let role = await getRole(server, server.roundEvents.shot.id)
            var embed = new Discord.RichEmbed()
                .setThumbnail(message.guild.members.find(members=> members.id == server.roundEvents.shot.id).user.avatarURL)
                .setAuthor(`Town News! - Day `+server.roundCounter)
                .setColor([255, 255, 255])
                .setDescription("In other news, **" + server.roundEvents.shot.username + "** was accidentally shot by the sheriff. This was a tragic accident and it hopefully wont happen again.\n\nRole - "+role);
            server.channels.dayChannel.send(embed)
        }
    } else if(!server.roundEvents.shot.id && server.roundEvents.murdered.id){
        let role = await getRole(server, server.roundEvents.murdered.id)
        var embed = new Discord.RichEmbed()
            .setThumbnail(message.guild.members.find(members=> members.id == server.roundEvents.murdered.id).user.avatarURL)
            .setAuthor(`Town News! - Day `+server.roundCounter)
            .setColor([255, 255, 255])
            .setDescription(townMessageStart[getRandomInt(townMessageStart.length)] + " Last night, **" + server.roundEvents.murdered.username + "** was " + causeOfDeath[getRandomInt(causeOfDeath.length)] + " with a " + murderWeapon[getRandomInt(murderWeapon.length)] + ". They were a beloved member of the community and will be missed.\n\nRole - "+role);
        server.channels.dayChannel.send(embed)
    } else {
        if(!server.roundEvents.healed.id){
            var embed = new Discord.RichEmbed()
                .setAuthor(`Town News! - Day `+server.roundCounter)
                .setColor([255, 255, 255])
                .setDescription("What a lovely morning in paradise! Nothing happened last night!");
            server.channels.dayChannel.send(embed)
        }
    }
    if(server.roundEvents.healed.id){
        var embed = new Discord.RichEmbed()
            .setThumbnail(message.guild.members.find(members=> members.id == server.roundEvents.healed.id).user.avatarURL)
            .setAuthor(`Town News! - Day `+server.roundCounter)
            .setColor([255, 255, 255])
            .setDescription("A miricale has occured! The healer was able to bring **" +server.roundEvents.healed.username+ "** back to life!");
        server.channels.dayChannel.send(embed)
    }
    console.log("DEAD - "+server.dead)
    console.log("ALIVE - "+server.alive)
}
async function newRound(message, server){
    let murdererDead = false;
    for(let i=0;i<server.dead.length;i++){
        if(server.keyRoles.murderer.id==server.dead[i]){
            murdererDead = true
        }
    }
    let sheriffDead = false;
    for(let i=0;i<server.dead.length;i++){
        if(server.keyRoles.sheriff.id==server.dead[i]){
            sheriffDead = true
        }
    }
    let citizensAlive = 0
    for(let i=0;i<server.alive.length;i++){
        if(server.alive[i]!==server.keyRoles.murderer.id){
            citizensAlive++
        }
    }
    if(citizensAlive == 0 && !murdererDead){
        deleteChannels(server)
        message.channel.send("<@"+server.keyRoles.murderer.id+"> won as the murderer!")
    }else if (citizensAlive > 0 && murdererDead){
        deleteChannels(server)
        message.channel.send("Citizens win!")
    }else if(citizensAlive == 0 && murdererDead) {
        deleteChannels(server)
        message.channel.send("Tie - everyone died")
    } else {
        //new round
        //server.roundData[server.roundCounter] = server.roundEvents;
        server.roundEvents.pastJailed = server.roundEvents.jailed.id
        resetVariables(server)
        server.roundCounter++;
        nightMode(message, server, false)
        //sendLynchMessage(message, bot, server, false, dayChannel)
    }
}
async function resetVariables(server){
    server.roundEvents.shot.id = null;
    server.roundEvents.shot.username = null;
    server.roundEvents.murdered.id = null;
    server.roundEvents.murdered.username = null;
    server.roundEvents.healed.id = null;
    server.roundEvents.healed.username = null;
    server.roundEvents.jailed.id = null;
    server.roundEvents.jailed.username = null;
}
async function deleteChannels(server){
    server.channels.medicChannel.delete()
    server.channels.sheriffChannel.delete()
    server.channels.murderChannel.delete()
    server.channels.dayChannel.delete()
    server.channels.jail.jailorChannel.delete()
    server.channels.jail.jailedChannel.delete()
}
async function deathDuplicateDeletor(server, id){
    return new Promise(result => {
        for (let i = 0; i < server.dead.length; i++) {
            if (server.dead[i] == id) {
                server.dead = arrayRemove(server.dead, id);
            }
        }
    })
}
async function isDead(server, id){
    return new Promise(result => {
        let flag = false;
        for (let i = 0; i < server.dead.length; i++) {
            if (id == server.dead[i]){
                flag = true;
            }
        }
        result(flag)
    })
}
async function isJailed(server, id){
    return new Promise(result => {
        let flag = false;
        if(server.roundEvents.jailed.id){
            if(server.roundEvents.jailed.id == id){
                flag = true;
            }
        }
        result(flag)
    })
}
async function retrieveJailed(server){
    return new Promise(result => {
        if(server.roundCounter>=1) {
            if (server.roundData[server.roundCounter-1]) {
                console.log(`Round ${server.roundCounter-1} Data - ${server.roundData[server.roundCounter-1]}`)
                if(server.roundData[server.roundCounter-1].roundData){
                    if(server.roundData[server.roundCounter-1].roundData.jailed.id){
                        result(server.roundData[server.roundCounter-1].roundData.jailed)
                    }
                }
            }
        }
    });
}
async function getRole(server, id){
    return new Promise(result => {
        let role = "Citizen"
        if(server.keyRoles.murderer.id == id){
            role = "Murderer"
        } else if(server.keyRoles.medic.id == id){
            role = "Nurse"
        } else if(server.keyRoles.sheriff.id == id){
            role = "Sheriff"
        }
        result(role)
    })
}
async function messageDetector(bot, server){
    bot.on('message', message => {
        if(server.channels.jail.jailorChannel){
            if(message.channel.id == server.channels.jail.jailorChannel.id){
                if (!message.author.bot) {
                    server.channels.jail.jailedChannel.send("**SHERIFF - **" + message.content)
                }
            }
        }
        if(server.channels.jail.jailedChannel){
            if(message.channel.id == server.channels.jail.jailedChannel.id){
                if (!message.author.bot) {
                    server.channels.jail.jailorChannel.send("**" + message.author.username + " - **" + message.content)
                }
            }
        }
    });
}


module.exports = {
    start: async function (bot, message, msg) {
        servers[message.guild.id] = {
            roundCounter: 0,
            roundData: [],
            playerIDs: [],
            unpickedIDs: [],
            playerNames: [],
            unpickedNames: [],
            citizen: [],
            dead: [],
            alive: [],
            keyRoles: {
                murderer: {id: null, username: null,},
                sheriff: {id: null, username: null,},
                medic: {id: null, username: null,},
            },
            roundEvents: {
                shot: {id: null, username: null,},
                healed: {id: null, username: null,},
                jailed: {id: null, username: null,},
                pastJailed: {id: null, username: null,},
                murdered: {id: null, username: null,},
            },
            channels: {
                murderChannel: null,
                sheriffChannel: null,
                medicChannel: null,
                jailChannel: null,
                dayChannel: null,
                jail: {
                    jailorChannel: null,
                    jailedChannel: null
                }
            },
        };
        shots = 2;
        let server = servers[message.guild.id]
        startupPrompt(msg, message, server, bot)
        messageDetector(bot, server)
    }
}
