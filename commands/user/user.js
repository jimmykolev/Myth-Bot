const { SlashCommandBuilder } = require("discord.js");
const User = require("../../schemas/user.js");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('View your user profile or another user\'s profile.')
    .addUserOption((option) =>
        option
        .setName('user')
        .setDescription('The user profile you want to view.')
        .setRequired(false)
    ),
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const userProfile = await User.findOne({ userId: targetUser.id });

        if (!userProfile) {
            await interaction.reply(
                `${targetUser.id === interaction.user.id ? 'You are' : 'This user is'} not set up as a user. Please run **/getstarted** to set up the profile.`
            ); 
            return;
        }

        const rarestCard = userProfile.cards.length > 0 ? userProfile.cards.reduce((prev, current) => (prev.rarity > current.rarity) ? prev : current) : null;
        const rarestCardName = rarestCard ? rarestCard.name : 'None';

        const mostValuableArtifact = userProfile.items.length > 0 ? userProfile.items.reduce((prev, current) => (prev.price > current.price) ? prev : current) : null;
        const mostValuableArtifactName = mostValuableArtifact ? mostValuableArtifact.name : 'None';

        const embed = new EmbedBuilder()
        .setTitle(`${targetUser.username}'s Profile`)
        .setDescription(`This is ${targetUser.username}'s profile.`)
        .addFields({
            name: ":coin:",
            value: `${userProfile.gold}`,
            inline: false,
        },
        {
            name: "Cards",
            value: `${userProfile.cards.length}`,
            inline: true,
        },
        {
            name: "Artifacts",
            value: `${userProfile.items.length}`,
            inline: true,
        },
        {
            name: "Rarest Card",
            value: `${rarestCardName}`,
            inline: false,
        },
        {
            name: "Most Valuable Artifact",
            value: `${mostValuableArtifactName}`,
            inline: true,
        }
        )
        .setThumbnail(targetUser.avatarURL() || interaction.client.user.avatarURL())
        .setColor(`${userProfile.profileColour}`);

        await interaction.reply({ embeds: [embed] });
    }
}
