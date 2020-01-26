# Exiuma

### What is Exiuma?

Exiuma is a Discord hackweek bot created by Niels#7641 and Soos Kitashi#5005.
### What does it do?
This bot is designed to be super user friendly! Here are some of it's features:

-Command synonyms so you dont have to use the exact command name

-Prediction engine so the bot will know what you mean when you make a typo

-Intuitive server setup command where you basically just talk to the bot and tell it what you want

-Moderation logs

-Custom server greeting

-Google image searching

-Wolfram alpha support 

-Cleverbot 

-Crypto currency lookup

-Local weather lookup

-Dynamic Voice Channels

-Music commands

Of course that's not all and we have a lot of smaller miscellanious commands too!

## How to locally run the bot?
The bot is running on our server 24/7 but if you wish to run it locally you will need to follow some steps. Keep in mind that some unexperienced people might struggle with some steps.
Otherwise, you can [invite our bot to your server here](https://discordapp.com/oauth2/authorize?client_id=592462460766650368&scope=bot&permissions=8)

Prerequisites:
1. [The current Node lts version](https://nodejs.org/en/)
2. [MongoDB community edition](https://www.mongodb.com/download-center/community)
### Getting started
1. Install Node (MUST BE NODE 8.15.0 OR WOLFRAM WILL NOT WORK)
2. Install MongoDB
    1. Make sure to install MongoDB compass during the install process to have a GUI program if you need one.
3. Clone the Github repo
4. Run npm install inside the cloned folder
5. Open the compass program and create a MongoDB database called exiuma
6. Create 3 collections inside the database called ("logging", "prefix", "welcome", "dynamicVC") - If you are an advanced user and know what you are doing you can change the database name and collections but you will have to change them in the code.
7. Follow the links in the config file to generate the needed tokens and fill them in.
8. You can now run the bot by starting the index.js file.
### Command documentation
All of the commands can be found by using !help at any time
