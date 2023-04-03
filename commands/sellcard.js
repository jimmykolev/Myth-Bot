const { SlashCommandBuilder } = require('discord.js');
const User = require('../schemas/user.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sellcard')
    .addStringOption((option) =>
      option.setName('card').setDescription('The card you want to sell.').setRequired(true)
    )
    .setDescription('Sell a card from your collection.'),

  async execute(interaction) {
    const userProfile = await User.findOne({ userId: interaction.user.id });
    if (!userProfile) {
      await interaction.reply(
        'You are not set up to collect cards. Please run /getstarted to set up your profile.'
      );
      return;
    }
 

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
      }
    const cardName = capitalizeFirstLetter(interaction.options.getString('card'));
    const card = userProfile.cards.find((card) => card.name.toLowerCase() === cardName.toLowerCase());
    if (!card) {
      await interaction.reply(`You do not have a **${cardName}** card.`);
      return;
    }

    const cardIndex = userProfile.cards.indexOf(card);
    const confirmPrompt = await interaction.reply({
      content: `Are you sure you want to sell a **${cardName}** card?`,
      components: [this.getButtonRow()],
    });

    const filter = (interaction) => interaction.isButton() && interaction.user.id === userProfile.userId;
    const collector = confirmPrompt.createMessageComponentCollector({ filter, time: 15000 });

    collector.on('collect', async (interaction) => {
       

      if (interaction.customId === 'yes') {
        userProfile.cards.splice(cardIndex, 1);

        let goldToAdd;
        if (card.rarity === 100) {
          goldToAdd = 1000;
        } else if (card.rarity > 94) {
          goldToAdd = 500;
        } else if (card.rarity > 87) {
          goldToAdd = 250;
        } else if (card.rarity > 80) {
          goldToAdd = 100;
        } else {
          goldToAdd = 50;
        }

        userProfile.gold += goldToAdd;
        await userProfile.save().catch((err) => console.log(err));
        await interaction.update({
            content: `You sold a **${cardName}** card for ${goldToAdd} :coin:.`,
            components: [],
          });
        } else if (interaction.customId === 'no') {
          await interaction.update({
            content: `You did not sell a **${cardName}** card.`,
            components: [],
          });
        }
      });

    collector.on('end', async () => {
      await confirmPrompt.edit({ components: [] });
    });
  },

  getButtonRow() {
    const buttonRow = new ActionRowBuilder();

    const yesButton = new ButtonBuilder()
      .setCustomId('yes')
      .setLabel('Yes')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(false);

    const noButton = new ButtonBuilder()
      .setCustomId('no')
      .setLabel('No')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(false);

    buttonRow.addComponents(yesButton, noButton);

    return buttonRow;
  },
};
