var servers = {};
var nowplaying = {};
config = require('../config.json')
const {google} = require('googleapis');
var yt = google.youtube('v3');
const Discord = require('discord.js');
const ytdl = require('ytdl-core');
let server;
module.exports = {
    play: async function (bot, message, connection, video, callback) {
        if (!servers[message.guild.id]) {
            servers[message.guild.id] = {
                queue: [],
            };
        }
        var server = servers[message.guild.id]
        async function dispatch(){
            dispatcher = connection.playStream(ytdl(server.queue[0].url, {filter: 'audioonly'}), {seek: 0, volume: 1});
            dispatcher.on('end', () => {
                server.queue.shift()
                if(server.queue.length > 0){
                    var playEmbed = new Discord.RichEmbed()
                        .setAuthor('Now Playing')
                        .addField('Song Name', "```"+server.queue[0].title+"```")
                        .addField('Channel Name', "```"+server.queue[0].channel+"```")
                        .setThumbnail(server.queue[0].thumbnail)
                        .setColor([204, 55, 95])
                    message.channel.send(playEmbed);
                    dispatcher[message.guild.id] = connection.playStream(ytdl(server.queue[0].url, {filter: 'audioonly'}), {seek: 0, volume: 1});
                } else {
                    connection.disconnect()
                    server.queue = [];
                }
            });
        }
        if(server.queue.length > 0){
            server.queue.push(video)
        } else {
            server.queue.push(video)
            dispatch()
        }
    },
    pause: async function (bot, message, memberVoiceChannel, callback) {
        let dispatcher = message.guild.voiceConnection.player.dispatcher
        if(memberVoiceChannel !== message.guild.voiceConnection.channel) return message.channel.send("You have to be in the same channel as me to use this command!")
        var pauseFailedEmbed = new Discord.RichEmbed()
            .setAuthor('Music')
            .setColor([255, 120, 120])
            .setDescription("Music is already paused!");
        if(dispatcher.paused) return message.channel.send(pauseFailedEmbed)
        else {
            var pauseEmbed = new Discord.RichEmbed()
                .setAuthor('Music')
                .setColor([204, 55, 95])
                .setDescription("Music has been paused ⏸");
            message.guild.voiceConnection.player.dispatcher.pause()
            message.channel.send(pauseEmbed)
        }
    },
    resume: async function (bot, message, memberVoiceChannel, callback) {
        if(memberVoiceChannel !== message.guild.voiceConnection.channel) return message.channel.send("You have to be in the same channel as me to use this command!")
        let dispatcher = message.guild.voiceConnection.player.dispatcher
        var resumeFailedEmbed = new Discord.RichEmbed()
            .setAuthor('Music')
            .setColor([255, 120, 120])
            .setDescription("Music is already playing!");
        if(!dispatcher.paused) return message.channel.send(resumeFailedEmbed)
        else {
            var resumeEmbed = new Discord.RichEmbed()
                .setAuthor('Music')
                .setColor([204, 55, 95])
                .setDescription("Music has been resumed ▶");
            message.guild.voiceConnection.player.dispatcher.resume()
            message.channel.send(resumeEmbed)
        }
    },
    stop: async function (bot, message, memberVoiceChannel) {
        let dispatcher = message.guild.voiceConnection.player.dispatcher
        var server = servers[message.guild.id]
        if(memberVoiceChannel !== message.guild.voiceConnection.channel) return message.channel.send("You have to be in the same channel as me to use this command!")
        server.queue = [];
        setTimeout(function() {
            dispatcher.end();
            var stopEmbed = new Discord.RichEmbed()
                .setAuthor('Music')
                .setColor([255, 120, 120])
                .setDescription("Music has been stopped ⏹");
            message.channel.send(stopEmbed)
        }, 1000)
    },
    skip: async function (bot, message, memberVoiceChannel) {
        let dispatcher = message.guild.voiceConnection.player.dispatcher
        var server = servers[message.guild.id]
        if(memberVoiceChannel !== message.guild.voiceConnection.channel) return message.channel.send("You have to be in the same channel as me to use this command!")
        dispatcher.end();
    },
    queue: async function (bot, message, memberVoiceChannel) {
        return new Promise(result => {
            var server = servers[message.guild.id]
            result(server.queue)
        })
    },
    queryData: async function(query) {
        return new Promise(result => {
            yt.search.list({
                auth: config.YTkey,
                part: 'id,snippet',
                type: `video`,
                q: query,
            }, (err, response) => {
                if (err) {
                    throw err;
                } else {
                    result(response.data.items)
                }
            })
        })
    },
    parseData: async function(videos, item) {
        if (videos.length === 0) return message.channel.send("No video found.")
        else {
            return new Promise(result => {
                var video = {
                    title: videos[item].snippet.title,
                    url: `https://www.youtube.com/watch?v=${videos[0].id.videoId}`,
                    thumbnail: videos[item].snippet.thumbnails.high.url,
                    description: videos[item].snippet.description,
                    publishedDate: videos[item].snippet.publishedAt,
                    channel: videos[item].snippet.channelTitle,
                }
                result(video);
            })
        }
    },
}