const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('battlehelp')
    .setDescription('Shows information about the battle system.'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
        .setTitle('Battle Help')
        .setDescription('This is the help page for the battle system. Here you can find information about how to use the battle system.')
        .addFields({
            name: "How it works",
            value: "The battle system works by selecting a card you have in your collection followed by the attribute you want to use. The bot will then select a random card from its collection and compare the two cards' attributes. The card with the higher attribute will win the battle. If the attributes are equal, the battle will be a draw.",
            inline: true,
          },
          {
            name: "Rewards",
            value: "If you win a battle, you will receive a random amount of :coin:. If you lose a battle, you will lose a random amount of :coin:. If the battle is a draw, you will not receive or lose any :coin:.",
          },
          {
            name: "Strategy",
            value: "The battle system is based on luck. However, there are some strategies you can use to increase your chances of winning. For example, you can use the **/viewcards** command to view your collection and see which cards you have. You can also use the **/stats** command to view the stats of a specific card."
          }
          )
          .setColor('#00FF00');
        await interaction.reply({ embeds: [embed] });
    },
};