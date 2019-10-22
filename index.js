const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');
const lists = require('./lists.json');

function randomizer(items) {
    //Function that is called later to do the math for us in our lists.json file.
    return items[Math.floor(Math.random()*items.length)];
}

client.on('ready', () => {
    //Simple command to log as the node is run in the terminal to inform you its working, will also set the bot online and show it is running the auto script on discord.
    console.log(`Logged in as ${client.user.username}`);
    console.log(`With ${client.users.size} playing`);

    client.user.setPresence ({
        game: {
            name: "Autonomous JS Script",
            type: "PLAYING"
        }
    })
});

client.on('guildCreate', guild => {
    //Simply will display information when the bot joins a new server and will set its activity to show how many servers it is on
    console.log(`New Server Joined: ${guild.name} (id: ${guild.id}). This server has ${guild.memberCount} members!`);
    client.user.setActivity(`Serving ${client.guilds.size} servers proudly!`);
});

client.on('guildMemberAdd', member => {
    //On a new member join, it will display the given message below in the channel "the-chat", it uses a simple built in Randomizer to pick 1/5 welcome msgs.
    var welcomeMsgs = [
        `Clap, Clap, Clap yo hands, ${member} just popped in!`,
        `A round of applause for ${member}, come on down!`,
        `Welcome to the party, ${member}`,
        `Welcome ${member}, he brought pizza everyone!`,
        `Honestly, I am suprised you got here... Welcome ${member}`
    ]
    const channel = member.guild.channels.find(ch => ch.name === 'the-chat');
    if (!channel) return;
    channel.send(randomizer(welcomeMsgs));
});

client.on('guildDelete', guild => {
    //Will log into console a string if removed from a specific guild and ID.
    console.log(`I was removed from: ${guild.name} (id: ${guild.id})`);
});

client.on('message', async message => {
    //This is the client event that handles all of the commands for the bot. 
    if(message.author.bot) return; //This line prevents the bot and other bots from endleslly getting into a loop with itself.

    if(message.content.indexOf(config.prefix) !== 0) return; //This command ensures that "!" is before each command

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase(); //Turns all inputs into lowercase to be intrepeted.

    if(command === 'ping') {
        //Ping command that will respond with the server latency to the API.
        const p = await message.channel.send("Ping?");
        p.edit(`Pong! The Latency is ${p.createdTimestamp - message.createdTimestamp}ms. The API Latency is ${Math.round(client.ping)}ms`);
    }

    if(command === 'say') {
        //Command that will have the bot say something of your choice, and delete your comment so no one can see.
        const theMessage = args.join(' ');
        message.delete().catch(O_o=>{});
        message.channel.send(theMessage);
    }

    if (command ==='hello') {
        //Simple Hello command where the bot will respond to you. 
        message.reply('Hi there! I am becoming Autonomous, how about you?');
    }

    if (command === 'codingdojo') {
        //Simple CodingDojo command that will return the statements.
        if(!message.member.roles.some(r=>["Ninja"].includes(r.name)) )
            return message.reply('You need to give yourself the Ninja Role for the secret!');
        else {
            message.reply('CodingDojo is awesome!');
            message.reply('You found the secret, nice job!');
        }
    }

    if(command === 'encourage') {
        //Prints a random encouraging statement from the list.
        message.channel.send(randomizer(lists.encouragement));
    }

    if(command === 'purge') {
        //Checks if you are in the Ninja role, and then deletes msgs up to 100. 
        if(!message.member.roles.some(r=>["Ninja"].includes(r.name)) )
            return message.reply('You need to become a ninja in order to fight off bad messages!');
        else {
            var delCount = parseInt(args[0], 10);
            if(!delCount || delCount < 2 | delCount > 100)
                return message.reply("Give a message number for the amount to delete between 2 and 100.");
            
            var getIt = await message.channel.fetchMessages({limit: delCount});
            message.channel.bulkDelete(getIt)
                .catch(error => message.reply(`Can't delete messages because of ${error}`));
        }
    }

    if(command == 'help') {
        //Simple help command that displays all the commands.
        var helpCommands = [
            'Type Hello to talk to the bot, make sure you type ! before any commands!',
            'Make sure to give yourself the Ninja role for the secret commands, see if you can find them!',
            '!kick to kick a specific member',
            '!ban to ban specific member',
            '!karate for a congrats!',
            '!ping will check the current latency',
            '!purge will clear out the chat 2-100 messages',
            '!say will make the bot say something, then delete it!',
            'Try some other commands as well, to see what happens!',
            'There is also a secret hidden!',
            'Remember not to use bad words!',
            'Try !encourage for a inspiring quote!',
            'And use !rolldice to bet against other players!'
        ]
        message.reply(helpCommands);
    }

    if(command == 'kick') {
        //Kick command that checks if the user has the correct roles and will execute.
        if(!message.member.roles.some(r=>["Administrator", "Moderator"].includes(r.name)) )
            return message.reply("Nah, you ain't got no permission to do that!");

        let member = message.mentions.members.first() || message.guild.members.get(args[0]);
        if(!member)
            return message.reply("Please use a valid User in the current Server");
        if(!member.kickable)
            return message.reply("This person has a lot more power than you, you can't kick them?!");

        let reason = args.slice(1).join(' ');
        if(!reason) reason = "No Reason Provided";

        await member.kick(reason)
            .catch(error => message.reply(`Sorry ${message.author} I couldn't kick because of : ${error}`));
        message.reply(`${member.user.tag} has been kicked by ${message.author.tag} because: ${reason}`);
    }

    if(command == 'ban') {
        //Ban command that checks if the user meets the roles and executes.
        if(!message.member.roles.some(r=>["Administrator"].includes(r.name)) )
            return message.reply("Nah, you ain't go no permission to do that!");
        
        let member = message.mentions.members.first();
        if(!member)
            return message.reply("Please use a valid User in the current Server");
        if(!member.bannable)
            return message.reply("This person has a lot more power than you, you can't ban them!");
        
        let reason = args.slice(1).join(' ');
        if(!reason) reason = "No reason provided";

        await member.ban(reason)
            .catch(error => message.reply(`${message.author}, I couldn't ban them because ${error}`));
        message.reply(`${member.user.tag} was banned by ${message.author.tag} for ${reason}`);
    }

    if(command === 'karate') {
        if(!message.member.roles.some(r=>["Ninja"].includes(r.name)) )
            return message.reply('You need to give yourself the Ninja Role in order to do Karate!');
        else {
            message.reply('Congrats, you can do Programming Karate too!');
        }
    }

    if(command === 'rolldice') {
        //Generates a random number 1-6 on two die.
        message.channel.send(randomizer(lists.numbers));
        message.channel.send(randomizer(lists.numbers));
    }
});

client.login(config.token);