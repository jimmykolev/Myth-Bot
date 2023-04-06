const { REST, Routes } = require("discord.js");
const { clientId, guildId, token } = require("./config.json");
const fs = require("node:fs");
const path = require("node:path");

const commands = [];
const commandsPath = path.join(__dirname, "commands");

function loadCommands(commandsFolderPath) {
  const commandFiles = fs.readdirSync(commandsFolderPath, { withFileTypes: true });

  for (const file of commandFiles) {
    const filePath = path.join(commandsFolderPath, file.name);

    if (file.isDirectory()) {
      loadCommands(filePath);
    } else if (file.isFile() && file.name.endsWith(".js")) {
      const command = require(filePath);
      commands.push(command.data.toJSON());
    }
  }
}

loadCommands(commandsPath);

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    const data = await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands,
    });

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    console.error(error);
  }
})();
