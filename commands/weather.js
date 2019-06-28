module.exports = {
    name: ['weather', 'temperature'],
    description: 'Check your weather!',
    category: 'utility',
    main: function (bot, message) {
        var weather = require('weather-js');
        let trimmedContent = message.content.substring(message.content.indexOf(' ') + 1, message.content.length) || null;
        weather.find({ search: trimmedContent, degreeType: 'C' }, function (err, result) {
            const embed = {
                "title": "Weather for " + result[0].location.name,
                "color": 9491048,
                "timestamp": "2019-06-28T16:49:46.632Z",
                "footer": {
                    "icon_url": "https://cdn.discordapp.com/avatars/592462460766650368/915fb4edfb9f5c503dbaf14ef96d1ac0.png?size=2048",
                    "text": "Exiuma"
                },
                "thumbnail": {
                    "url": result[0].current.imageUrl
                },
                "fields": [
                    {
                        "name": "Currently",
                        "value": "temperature:  " + result[0].current.temperature + "°C \n  Feels like " + result[0].current.feelslike + "°C \n Humidity " + result[0].current.humidity
                    },
                    {
                        "name": result[0].forecast[2].day,
                        "value": "temperature low:  " + result[0].forecast[2].low + "°C \n  Temperature high: " + result[0].forecast[2].high + "°C \n Weather type" + result[2].forecast[2].skytextday,
                        "inline": true
                    },
                    {
                        "name": result[0].forecast[3].day,
                        "value": "temperature low:  " + result[0].forecast[3].low + "°C \n  Temperature high: " + result[0].forecast[3].high + "°C \n Weather type" + result[0].forecast[3].skytextday,
                        "inline": true
                    }
                ]
            };
            message.channel.send({ embed });
        })
    },
};