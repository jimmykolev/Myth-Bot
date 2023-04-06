const { SlashCommandBuilder } = require("discord.js");
const User = require("../../schemas/user.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName('profilecolour')
    .setDescription('Change your profile colour.')
    .addStringOption((option) =>
        option
        .setName('colour')
        .setDescription('The colour you want to change your profile to.')
        .setRequired(true)
    ),
    async execute(interaction) {
    const userProfile = await User.findOne({ userId: interaction.user.id });
    if(!userProfile) {
        await interaction.reply("You are not set up as a user. Please run **/getstarted** to set up the profile.");
    }


    const colour = interaction.options.getString('colour');
    const colourRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/;
    if(!colourRegex.test(colour)) {
        await interaction.reply("Please enter a valid hex colour.");
        return;
    }

    userProfile.profileColour = colour;
    await userProfile.save().catch((err) => console.log(err));
    await interaction.reply(`Your profile colour has been changed to **${colour}**.`);
    }
}