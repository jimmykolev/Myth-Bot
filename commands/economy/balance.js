const { SlashCommandBuilder } = require('discord.js');
const User = require('../../schemas/user.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('View your balance.'),
    async execute(interaction) {
        const userProfile = await User.findOne({ userId: interaction.user.id });
        if (!userProfile) {
            await interaction.reply(
                'You are not set up to collect cards. Please run /getstarted to set up your profile.'
            );
            return;
        }
        await interaction.reply(`You have **${userProfile.gold}** :coin:.`);
        
    },
};