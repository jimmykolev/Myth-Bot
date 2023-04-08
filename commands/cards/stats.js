const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const creatures = require('../../creatures.json');
const User = require('../../schemas/user.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('View the stats of a specific card.')
    .addStringOption((option) =>
        option
        .setName('card')
        .setDescription('The card you want to view the stats of.')
        .setRequired(true)
    ),
    async execute(interaction) {
        const userProfile = await User.findOne({ userId: interaction.user.id });
        if (!userProfile) {
            await interaction.reply('You are not set up to collect cards. Please run /getstarted to set up your profile.');
            return;
        }

        const cardName = interaction.options.getString('card');
        const card = creatures.mythology.find((card) => card.name.toLowerCase() === cardName.toLowerCase());

        if (!card) {
            await interaction.reply('That card does not exist.');
            return;
        }

        const cardEmbed = new EmbedBuilder()
            .setTitle(`${card.name}`)
            .setDescription(`${card.description}`)
            .addFields(
              {
                name: "Attack",
                value: `${card.attack}`,
                inline: true,
              },
              {
                name: "Defence",
                value: `${card.defence}`,
                inline: true,
              },
              { name: "Speed", value: `${card.speed}`, inline: true },
              { name: "Range", value: `${card.range}`, inline: true },
              {
                name: "Ability Points",
                value: `${card.abilitypoints}`,
                inline: true,
              },
              {
                name: "Rarity",
                value: `${card.rarity}`,
                inline: true,
              }
            )
            .setColor(`${card.colorhex}`);

        await interaction.reply({ content: `Here are the stats of **${card.name}**!`,embeds: [cardEmbed] });
    }
}