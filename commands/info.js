module.exports = {
    name: ['info', 'lookup', 'find'],
    description: 'look things up on the dnd5e wiki!',
    category: 'fun',
    main: function(bot, message) {
        let ss = require('string-similarity');
        const Discord = require('discord.js');
        const $ = require( "get-json" );
        const url = {
            ability_scores: "https://www.dnd5eapi.co/api/ability-scores/",
            skills: "https://www.dnd5eapi.co/api/skills/",
            proficiencies: "https://www.dnd5eapi.co/api/proficiencies/",
            languages: "https://www.dnd5eapi.co/api/languages/",
            classes: "https://www.dnd5eapi.co/api/classes/",
            races: "https://www.dnd5eapi.co/api/races/",
            equipment: "https://www.dnd5eapi.co/api/equipment/",
            spells: "https://www.dnd5eapi.co/api/spells/",
            monsters: "https://www.dnd5eapi.co/api/monsters/",
            conditions: "https://www.dnd5eapi.co/api/conditions/",
            damage_types: "https://www.dnd5eapi.co/api/damage-types/",
            magic_schools: "https://www.dnd5eapi.co/api/magic-schools/"
        };
        async function parseIntent(){
            return new Promise(result => {
                let msg = message.content.substring(message.content.indexOf(' ') + 1, message.content.length) || null;
                let prediction = {
                    score: 0,
                    result: null
                };
                for (const i in url) {
                    $(url[i], function (error, j) {
                        for( const k in j.results){
                            //console.log(j.results[k]);
                            let predictionScore = ss.compareTwoStrings(msg, j.results[k].name) * 100;
                            if(predictionScore > prediction.score){
                                prediction.score = predictionScore;
                                prediction.result = j.results[k];
                            }
                        }
                    });
                }
                setTimeout(function(){
                    if(prediction.result){
                        prediction.result.url = "https://www.dnd5eapi.co"+prediction.result.url;
                    }
                    result(prediction.result);
                },2500)
            })
        }
        async function fetchData(query){
            return new Promise(result => {
                $(query.url, function (error, response) {
                    result(response);
                })
            });
        }
        async function parseData(){
            let query = await parseIntent();
            if(query == null)return message.channel.send("Sorry I could not find anything on that!");
            let result = await fetchData(query);
            if(result){
                console.log(result);
                let desc = "";
                for (const i in result) {
                    if(result[i]){
                        //console.log(result[i] + " - " + result[i].length)
                        if(result[i].length < 1) continue;
                    }
                    if(typeof result[i] === "string"){
                        if(i !== "url" && i !== "_id" && i !== "index" && i !== "trait_options"){
                            //console.log(i + " - " + result[i] + " - " + result[i].length)
                            if(result[i].length < 1) continue;
                            desc+=i.replace(/_/g, ' ') + ":\n```"+result[i]+"```";
                        }
                    }
                    if(typeof result[i] === "boolean" || typeof  result[i] === "number"){
                        if(i !== "url" && i !== "_id" && i !== "index") {
                            desc+=i.replace(/_/g, ' ') + ":\n```" + result[i].toString() + "```";
                        }
                    }
                    if(typeof result[i] === "object"){
                        if(result[i]){
                            if(Object.keys(result[i]).length === 0) continue;
                        } else continue;
                        if(i !== "url" && i !== "trait_options"){
                            desc+=i.replace(/_/g, ' ') + ":\n```";
                        }
                        for(const j in result[i]){
                            if(typeof result[i][j] === "boolean" || typeof  result[i][j] === "number"){
                                if(j !== "url" && i !== "trait_options"){
                                    desc+=result[i][j].toString();
                                }
                            }
                            if(typeof result[i][j] === "string"){
                                //console.log(j + " - " + result[i][j] + " - " + result[i][j].length)
                                if(result[i][j].length < 1) continue;
                                if(j !== "url" && i !== "trait_options"){
                                    desc+=result[i][j];
                                }
                                //console.log(result[i][j]);
                            }
                            if(typeof result[i][j] === "object"){
                                for(const k in result[i][j]){
                                    if(k !== "url" && k !== "from" && i !== "trait_options"){
                                        desc+=k.replace(/_/g, ' ')+": "
                                    }
                                    if(typeof result[i][j][k] === "object") continue;
                                    if(typeof result[i][j][k] === "boolean" || typeof  result[i][j][k] === "number"){
                                        if(k !== "url" && k !== "from" && i !== "trait_options"){
                                            desc+=result[i][j][k].toString();
                                        }
                                    }
                                    if(typeof result[i][j][k] === "string"){
                                        if(result[i][j][k].length < 1) continue;
                                        //console.log(k + " - " + result[i][j][k] + " - " + result[i][j][k].length)
                                        if(k !== "url" && k !== "from" && i !== "trait_options"){
                                            desc+=result[i][j][k];
                                        }
                                    }
                                    if(k !== "url" && i !== "trait_options"){
                                        desc+="\n"
                                    }
                                }
                            }
                        }
                        if(i !== "url" && i !== "trait_options") {
                            desc += "```";
                        }
                    }
                }
                if(desc.length > 2047){
                    desc = "Sorry this was too big for me to cram into a discord message! Maybe this wiki link will help?\n";
                    let wikiLink = result.name.replace(/\s+/g, '%20');
                    desc+= `http://dnd5e.wikidot.com/search:site/q/${wikiLink}`;
                }
                let embed = new Discord.RichEmbed()
                    .setAuthor(result.name)
                    .setFooter(`DND lad 2020 - Soos Kitashi`)
                    .setTimestamp()
                    .setThumbnail(bot.user.avatarURL)
                    .setColor([0, 255, 255])
                    .setDescription(desc);
                message.channel.send(embed);
            }
        }
        return parseData();
    },
};