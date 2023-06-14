const { SlashCommandBuilder } = require('discord.js');
const User = require('../../schemas/user.js');
const creatures = require('../../creatures.json');
const { EmbedBuilder } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('offer')
    .setDescription('Trade cards with other players.')
    .addUserOption(option => option.setName('user').setDescription('The user to trade with.').setRequired(true))
    .addStringOption(option => option.setName('card').setDescription('The card to trade.').setRequired(true))
    .addIntegerOption(option => option.setName('amount').setDescription('The amount of money to offer').setRequired(true)),
  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const cardName = interaction.options.getString('card');
    const amount = interaction.options.getInteger('amount');
    const userProfile = await User.findOne({ userId: interaction.user.id });
    const userToTrade = await User.findOne({ userId: user.id });
    const card = creatures.mythology.find((card) => card.name.toLowerCase() === cardName.toLowerCase());
    const interactionUser = interaction.user;
    
    if (!userProfile) {
      await interaction.reply('You are not set up to collect cards! Use **/getstarted** to get started.');
      return;
    }
    
    if (!userToTrade) {
      await interaction.reply('The user you are trying to trade with is not set up to collect cards!');
      return;
    }
    
    if (!card) {
      await interaction.reply('That card does not exist.');
      return;
    }
    
    if (userProfile.cards.some(c => c.name.toLowerCase() === cardName.toLowerCase())) {
      await interaction.reply(`You already have the ${cardName} card!`);
      return;
    }
    
    if (!userToTrade.cards.some(c => c.name.toLowerCase() === cardName.toLowerCase())) {
      await interaction.reply(`${user} does not have the ${cardName} card!`);
      return;
    }
    
    if (userProfile.gold < amount) {
      await interaction.reply(`You do not have enough :coin: to offer ${amount}!`);
      return;
    }
    
    // The rest of your code for sending the trade offer
    if (userToTrade.trading) {
       // DM the user to trade with the offer
         // You can use the following code to DM the user:
        const userToTradeDM = await interaction.client.users.fetch(userToTrade.userId);
        const embed = new EmbedBuilder()
            .setTitle(`Trade Offer from ${interaction.user.username}`)
            .setDescription(`You have received a trade offer from ${interaction.user}!`)
            .addFields(
                { name: "Card", value: `${cardName}`, inline: true },
                { name: "Amount", value: `${amount}`, inline: true },
            )
            .setColor('#FFFFFF');
        
        await interaction.reply(`You have sent a trade offer!`);

        const confirmPrompt = await userToTradeDM.send({ embeds: [embed], components: [this.getButtonRow()], fetchReply: true });
        const filter = (interaction) => interaction.isButton() && interaction.user.id === userToTrade.userId;
        const collector = confirmPrompt.createMessageComponentCollector({ filter, time: 300000 });
        
        collector.on('collect', async (interaction) => {
            if (interaction.customId === 'yes') {
                userToTrade.gold += amount;
                userProfile.gold -= amount;
                userToTrade.cards = userToTrade.cards.filter(c => c.name.toLowerCase() !== cardName.toLowerCase());
                userProfile.cards.push(card);
                await userToTrade.save();
                await userProfile.save();
                await interaction.reply(`You have accepted the trade offer from ${interactionUser} for ${cardName}, you have received ${amount} :coin:!`);
                await interactionUser.send(`${user} has accepted your trade offer for ${cardName}, ${amount} :coin: has been taken!`);
            } else if (interaction.customId === 'no') {
                await interaction.reply(`You have declined the trade offer from ${interactionUser}!`);
                await interactionUser.send(`${user} has declined your trade offer!`);

            }
            
        }); 
        collector.on('end', async () => {
            await confirmPrompt.edit({ components: [] });
        });
        
    } else {
        await interaction.reply(`${user} is not accepting trade offers at the moment!`);
    }
    
  },
  getButtonRow() {
    const buttonRow = new ActionRowBuilder();

    const yesButton = new ButtonBuilder()
      .setCustomId("yes")
      .setLabel("Accept")
      .setStyle(ButtonStyle.Success);
    const noButton = new ButtonBuilder()
      .setCustomId("no")
      .setLabel("Decline")
      .setStyle(ButtonStyle.Danger);

    buttonRow.addComponents(yesButton, noButton);

    return buttonRow;
}
};
