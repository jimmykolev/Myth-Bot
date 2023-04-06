const { SlashCommandBuilder } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ButtonInteraction } = require('discord.js');
const User = require('../../schemas/user.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('viewcards')
    .setDescription('View all the cards you have.'),

  async execute(interaction) {
    const userProfile = await User.findOne({ userId: interaction.user.id });
    if (!userProfile) {
      await interaction.reply(
        'You are not set up to collect cards. Please run /getstarted to set up your profile.'
      );
      return;
    }

    if (userProfile.cards.length === 0) {
      await interaction.reply(
        'You currently have no cards. Use the /getcard command to obtain your first card.'
      );
      return;
    }

    const cardsPerPage = 12;
    const pageCount = Math.ceil(userProfile.cards.length / cardsPerPage);

    const cardFields = userProfile.cards.map((card) => ({
      name: card.name,
      value: `Rarity: ${card.rarity}`,
      inline: true,
    }));

    const embeds = [];
    for (let i = 0; i < pageCount; i++) {
      const startIndex = i * cardsPerPage;
      const endIndex = startIndex + cardsPerPage;

      const embed = {
        title: `${interaction.user.username}'s Cards`,
        description: `Page ${i + 1} of ${pageCount}`,
        fields: cardFields.slice(startIndex, endIndex),
        footer: { text: `You have ${userProfile.cards.length} cards.`},
        color: 0x5eafff,
        thumbnail: { url: interaction.user.avatarURL() },
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
  },
};