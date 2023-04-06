const { SlashCommandBuilder } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ButtonInteraction } = require('discord.js');
const User = require('../../schemas/user.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('View the items you have.'),

  async execute(interaction) {
    const userProfile = await User.findOne({ userId: interaction.user.id });
    if (!userProfile) {
      await interaction.reply(
        'You are not set up to collect cards or items. Please run /getstarted to set up your profile.'
      );
      return;
    }

    if (userProfile.items.length === 0) {
      await interaction.reply(
        'You currently have no items. Use the /shop command to buy some items.'
      );
      return;
    }

    const itemsPerPage = 12;
    const pageCount = Math.ceil(userProfile.items.length / itemsPerPage);

    const itemFields = userProfile.items.map((item) => ({
      name: item.name,
      value: `${item.description}`,
      inline: true,
    }));

    const embeds = [];
    for (let i = 0; i < pageCount; i++) {
      const startIndex = i * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;

      const embed = {
        title: `${interaction.user.username}'s Inventory`,
        description: `Page ${i + 1} of ${pageCount}`,
        fields: itemFields.slice(startIndex, endIndex),
        footer: { text: `You have ${userProfile.items.length} artifacts.`},
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