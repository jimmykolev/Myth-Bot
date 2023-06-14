const { SlashCommandBuilder } = require('discord.js');
const User = require('../../schemas/user.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('requests')
    .setDescription('Toggle trade requests on or off.'),
  async execute(interaction) {
    const userProfile = await User.findOne({ userId: interaction.user.id });
    if (!userProfile) {
      await interaction.reply('You are not set up to collect cards! Use **/getstarted** to get started.');
    } else {
      if (userProfile.trading) {
        userProfile.trading = false;
        await userProfile.save();
        await interaction.reply('Trade requests are now off!');
      } else {
        userProfile.trading = true;
        await userProfile.save();
        await interaction.reply('Trade requests are now on!');
      }
    }
  },
};
