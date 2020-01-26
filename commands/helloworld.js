module.exports = {
    name: ['helloworld', 'pozdravljensvet', 'bigmood'],
    description: 'This is a test command!',
    category: 'developer',
    main: function(bot, message) {
        message.channel.send("Hello world");
    },
}