const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require("discord.js");
const creatures = require("../../creatures.json");
const User = require("../../schemas/user.js");
const { ButtonBuilder, ButtonStyle, ActionRowBuilder, ButtonInteraction } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName('allcards')
    .setDescription('View all cards available.'),
    async execute(interaction) {
        const userProfile = await User.findOne({ userId: interaction.user.id });
        if (!userProfile) {
          await interaction.reply(
            'Please run the /getstarted command to set up and view all of the cards.'
          );
          return;
        }
    
    
        const cardsPerPage = 12;
        const pageCount = Math.ceil(creatures.mythology.length / cardsPerPage);
    
        const cardFields = creatures.mythology.map((card) => ({
          name: card.name,
          value: `Rarity: **${card.rarity}**`,
          inline: true,
        }));
    
        const embeds = [];
        for (let i = 0; i < pageCount; i++) {
          const startIndex = i * cardsPerPage;
          const endIndex = startIndex + cardsPerPage;
    
          const embed = {
            title: `Card Database`,
            description: `Page ${i + 1} of ${pageCount}`,
            fields: cardFields.slice(startIndex, endIndex),
            footer: { text: `There are ${creatures.mythology.length} cards available.`},
            color: 0x5eafff,
            thumbnail: { url: interaction.client.user.avatarURL() },
          };
    
          embeds.push(embed);
        }
    
        let currentPage = 0;
        const message = await interaction.reply({
          embeds: [embeds[0]],
          components: [this.getButtonRow(currentPage, pageCount)],
        });
    
        const filter = (interaction) =>
          interaction.isButton() && interaction.user.id === userProfile.userId;
    
        const collector = message.createMessageComponentCollector({
          filter,
          time: 60000,
        });
    
        collector.on('collect', async (interaction) => {
          if (interaction instanceof ButtonInteraction) {
            if (interaction.customId === 'prev') {
              currentPage--;
            } else if (interaction.customId === 'next') {
              currentPage++;
            }
    
            await interaction.update({
              embeds: [embeds[currentPage]],
              components: [this.getButtonRow(currentPage, pageCount)],
            });
          }
        });
    
        collector.on('end', async () => {
          await message.edit({
            components: [],
          });
        });
      },
    
      getButtonRow(currentPage, pageCount) {
        const buttonRow = new ActionRowBuilder();
      
        const prevButton = new ButtonBuilder()
          .setCustomId('prev')
          .setLabel('Previous')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(currentPage === 0);
      
        const nextButton = new ButtonBuilder()
          .setCustomId('next')
          .setLabel('Next')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(currentPage === pageCount - 1);
      
        buttonRow.addComponents(prevButton, nextButton);
      
        return buttonRow;
    
    }
}