var servers = {};
var nowplaying = {};
config = require('../config.json')
const {google} = require('googleapis');
var yt = google.youtube('v3');
const Discord = require('discord.js');
module.exports = {
    play: async function (bot, message, connection, url, callback) {
        const ytdl = require('ytdl-core');
        var server = servers[message.guild.id];
        var video = nowplaying[message.guild.id];
        const streamOptions = {seek: 0, volume: 1};
        const stream = ytdl(url, {filter: 'audioonly'});
        const dispatcher = connection.playStream(stream, streamOptions);
        dispatcher.on('end', () => {
            /* commented out untill i get google apis integrated
            if (server.queue.length > 0) {
                play(connection, message);
            } else {
                connection.disconnect();
            }
            */
            connection.disconnect();
        })
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
        if(memberVoiceChannel !== message.guild.voiceConnection.channel) return message.channel.send("You have to be in the same channel as me to use this command!")
        dispatcher.end();
        var stopEmbed = new Discord.RichEmbed()
            .setAuthor('Music')
            .setColor([255, 120, 120])
            .setDescription("Music has been stopped ⏹");
        message.channel.send(stopEmbed)
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