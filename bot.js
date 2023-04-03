const fs = require('node:fs');
const path = require('node:path');
const { connect, connection } = require('mongoose');
const { Client, Collection, Events, GatewayIntentBits} = require('discord.js');
const { token, database } = require('./config.json');


const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const eventFolders = fs.readdirSync('./events');
for (const folder of eventFolders) {
    const eventFiles = fs
    .readdirSync(`./events/${folder}`)
    .filter(file => file.endsWith('.js'));
    switch (folder) {
        case 'client':
            for (const file of eventFiles) {
                const event = require(`./events/${folder}/${file}`);
                if (event.once) {
                    client.once(event.name, (...args) => 
                    event.execute(...args, client));
                } else {
                    client.on(event.name, (...args) => 
                    event.execute(...args, client));
                }
            }
            break;
            case 'mongo':
                for (const file of eventFiles) {
                    const event = require(`./events/${folder}/${file}`);

                    if (event.once) {
                        connection.once(event.name, (...args) => 
                        event.execute(...args, client));
                    } else {
                        connection.on(event.name, (...args) => 
                        event.execute(...args, client));
                    }
                }
                break;

            default:
                break;
        }
    }







client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}



client.login(token);
(async () => {
    await connect(database).catch(console.error);
})();