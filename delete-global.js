const { REST, Routes } = require("discord.js");
const { clientId, token } = require("./config.json");

const commandNameToRemove = "ping"; // Replace with the name of the command you want to remove

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    // Fetch the list of global commands
    const globalCommands = await rest.get(Routes.applicationCommands(clientId));

    // Find the command you want to remove
    const commandToRemove = globalCommands.find(
      (command) => command.name === commandNameToRemove
    );

    if (commandToRemove) {
      // Remove the command
      await rest.delete(
        Routes.applicationCommand(clientId, commandToRemove.id)
      );
      console.log(`Successfully removed the "${commandNameToRemove}" global command.`);
    } else {
      console.log(`No global command found with the name "${commandNameToRemove}".`);
    }
  } catch (error) {
    console.error(error);
  }
})();
