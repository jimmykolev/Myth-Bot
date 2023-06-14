const { SlashCommandBuilder } = require('discord.js');
const User = require('../../schemas/user.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sell')
    .addStringOption((option) =>
      option.setName('item').setDescription('The card/item you want to sell.').setRequired(true)
    )
    .setDescription('Sell a card/item from your collection.'),

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
    const name = capitalizeFirstLetter(interaction.options.getString('item'));
    const ogName = interaction.options.getString('item');
    const card = userProfile.cards.find((card) => card.name.toLowerCase() === name.toLowerCase());
    const item = userProfile.items.find((item) => item.name.toLowerCase() === name.toLowerCase());
    if (card) {
   
    let goldToAdd;
        if (card.rarity === 100) {
          goldToAdd = 1000;
        } else if (card.rarity > 94) {
          goldToAdd = 500;
        } else if (card.rarity > 84) {
          goldToAdd = 250;
        } else if (card.rarity > 74) {
          goldToAdd = 100;
        } else {
          goldToAdd = 50;
        }

    const cardIndex = userProfile.cards.indexOf(card);
    await interaction.reply({
      content: `Are you sure you want to sell a **${name}** card for ${goldToAdd} :coin:?`,
      components: [this.getButtonRow()],
      fetchReply: true,
    });

    const confirmPrompt = await interaction.fetchReply();

    const filter = (interaction) => interaction.isButton() && interaction.user.id === userProfile.userId;
    const collector = confirmPrompt.createMessageComponentCollector({ filter, time: 15000 });

    collector.on('collect', async (interaction) => {
       

      if (interaction.customId === 'yes') {
        userProfile.cards.splice(cardIndex, 1);

        

        userProfile.gold += goldToAdd;
        await userProfile.save().catch((err) => console.log(err));
        await interaction.update({
            content: `You sold a **${name}** card for ${goldToAdd} :coin:.`,
            components: [],
          });
        } else if (interaction.customId === 'no') {
          await interaction.update({
            content: `You did not sell a **${name}** card.`,
            components: [],
          });
        }
      });

    collector.on('end', async () => {
      await confirmPrompt.edit({ components: [] });
    });
  }

  if (item) {
   
  let goldToAdd = item.price;

  const itemIndex = userProfile.items.indexOf(item);
  await interaction.reply({
    content: `Are you sure you want to sell **${ogName}** for ${goldToAdd} :coin:?`,
    components: [this.getButtonRow()],
    fetchReply: true,
  });

  const confirmPrompt = await interaction.fetchReply();

  const filter = (interaction) => interaction.isButton() && interaction.user.id === userProfile.userId;
  const collector = confirmPrompt.createMessageComponentCollector({ filter, time: 15000 });

  collector.on('collect', async (interaction) => {
     

    if (interaction.customId === 'yes') {
      userProfile.cards.splice(itemIndex, 1);

      

      userProfile.gold += goldToAdd;
      await userProfile.save().catch((err) => console.log(err));
      await interaction.update({
          content: `You sold **${ogName}** for ${goldToAdd} :coin:.`,
          components: [],
        });
      } else if (interaction.customId === 'no') {
        await interaction.update({
          content: `You did not sell **${ogName}**.`,
          components: [],
        });
      }
    });

  collector.on('end', async () => {
    await confirmPrompt.edit({ components: [] });
  });
}

if (!card && !item) {
  await interaction.reply('You do not have that card/item.');
  return;

}
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
