# Exiuma

### What is Exiuma?

Exiuma is a Discord hackweek bot created by BenIkNiels#7641 and Soos Kitashi#5005.
### What does it do?
We made a bot core that can detect a multitude of command synonyms. It takes the input of the user and compares it with the commands. If someone made a typo it will still run the command if the input is similar to one of the command names.

We also have a setup command to quickly get your server set up and running using the above feature.
Of course that's not all and we have a lot of smaller miscellanious commands too!

## How to locally run the bot?
The bot is running on our server 24/7 but if you wish to run it locally you will need to follow some steps. Keep in mind that some unexperienced people might struggle with some steps.
Otherwise, you can invite our bot to your server [here](https://discordapp.com/oauth2/authorize?client_id=592462460766650368&scope=bot&permissions=8)

Prerequisites:
1. [The current Node lts version](https://nodejs.org/en/)
2. [MongoDB community edition](https://www.mongodb.com/download-center/community)
### Getting started
1. Install Node
2. Install MongoDB
    1. Make sure to install MongoDB compass during the install process to have a GUI program if you need one.
3. Clone the Github repo
4. Run npm install inside the cloned folder
5. Open the compass program and create a MongoDB database called exiuma
6. Create 3 collections inside the database called ("logging", "prefix", "welcome") - If you are an advanced user and know what you are doing you can change the database name and collections but you will have to change them in the code.
7. Edit the config file to include your discord token and wolfram token.
8. You can now run the bot by starting the index.js file.
