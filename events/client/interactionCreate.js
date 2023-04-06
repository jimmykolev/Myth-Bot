const { Events } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isChatInputCommand()) return;

		// Load commands from subfolders
		const commandsPath = path.join(__dirname, '..', '..', 'commands');
		const commandFolders = fs.readdirSync(commandsPath);
		let command;

		for (const folder of commandFolders) {
			const folderPath = path.join(commandsPath, folder);
			if (fs.lstatSync(folderPath).isDirectory()) {
				const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
				for (const file of commandFiles) {
					const filePath = path.join(folderPath, file);
					const cmd = require(filePath);
					if (cmd.data.name === interaction.commandName) {
						command = cmd;
						break;
					}
				}
				if (command) break;
			}
		}

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(`Error executing ${interaction.commandName}`);
			console.error(error);
		}
	},
};
