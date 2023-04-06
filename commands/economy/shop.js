const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require("discord.js");
const {
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ButtonInteraction,
} = require("discord.js");
const User = require("../../schemas/user.js");
const items = require("../../items.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shop")
    .setDescription("Check out the artifact shop!")
    .addStringOption((option) =>
      option
        .setName("artifact")
        .setDescription("The artifact you want to buy.")
        .setRequired(false)
    ),
  async execute(interaction) {
    const userProfile = await User.findOne({ userId: interaction.user.id });
    if (!userProfile) {
      await interaction.reply(
        "You are not set up to collect cards or shop. Please run /getstarted to set up your profile."
      );
      return;
    }

    const artifactName = interaction.options.getString("artifact");
    if (artifactName) {
      const artifact = items.items.find(
        (item) => item.name.toLowerCase() === artifactName.toLowerCase()
      );
      if (!artifact) {
        await interaction.reply(
          `There is no artifact named **${artifactName}**.`
        );
        return;
      }
      if (userProfile.gold < artifact.price) {
        await interaction.reply(
          `You do not have enough gold to buy **${artifactName}**.`
        );
        return;
      }
      if (userProfile.items.some(item => item.id === artifact.id)) {
        await interaction.reply(`You already have **${artifactName}**.`);
        return;
      }      

      const embed = new EmbedBuilder()
        .setTitle(`${artifact.name}`)
        .setDescription(`${artifact.description}`)
        .addFields({
          name: "Price",
          value: `${artifact.price} :coin:`,
          inline: true,
        })
        .setFooter({ text: "Are you sure you want to buy this artifact?" })
        .setColor("#FFD700");

      await interaction.reply({
        embeds: [embed],
        components: [this.getCheckRow()],
        fetchReply: true,
      });

      const confirmPrompt = await interaction.fetchReply();

      const filter = (interaction) =>
        interaction.isButton() && interaction.user.id === userProfile.userId;
      const collector = confirmPrompt.createMessageComponentCollector({
        filter,
        time: 15000,
      });

      collector.on("collect", async (interaction) => {
        if (interaction.customId === "yes") {
          userProfile.gold -= artifact.price;
          userProfile.items.push(artifact);
          await userProfile.save().catch((err) => console.log(err));
          await interaction.update({
            content: `You bought a **${artifactName}** for ${artifact.price} :coin:.`,
            components: [],
            embeds: [],
          });
        } else if (interaction.customId === "no") {
          await interaction.update({
            content: `You did not buy a **${artifactName}**.`,
            components: [],
            embeds: [],
          });
        }
      });

      collector.on("end", async () => {
        await confirmPrompt.edit({ components: [] });
      });

      return;
    } else {
      const itemsPerPage = 12;
      const pageCount = Math.ceil(items.items.length / itemsPerPage);

      const mapFields = items.items.map((item) => ({
        name: item.name,
        value: `Price: ${item.price} :coin:`,
        inline: true,
      }));

      const embeds = [];
      for (let i = 0; i < pageCount; i++) {
        const startIndex = i * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;

        const embed = {
          title: "Artifact Shop",
          description: `You have ${userProfile.gold} :coin:`,
          fields: mapFields.slice(startIndex, endIndex),
          footer: { text: `Page ${i + 1} of ${pageCount}` },
          color: 0x5eafff,
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

      collector.on("collect", async (interaction) => {
        if (interaction instanceof ButtonInteraction) {
          if (interaction.customId === "prev") {
            currentPage--;
          } else if (interaction.customId === "next") {
            currentPage++;
          }

          await interaction.update({
            embeds: [embeds[currentPage]],
            components: [this.getButtonRow(currentPage, pageCount)],
          });
        }
      });

      collector.on("end", async () => {
        await message.edit({
          components: [],
        });
      });
    }
  },

  getButtonRow(currentPage, pageCount) {
    const buttonRow = new ActionRowBuilder();

    const prevButton = new ButtonBuilder()
      .setCustomId("prev")
      .setLabel("Previous")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPage === 0);

    const nextButton = new ButtonBuilder()
      .setCustomId("next")
      .setLabel("Next")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPage === pageCount - 1);

    buttonRow.addComponents(prevButton, nextButton);

    return buttonRow;
  },
  getCheckRow() {
    const buttonCheckRow = new ActionRowBuilder();

    const yesButton = new ButtonBuilder()
      .setCustomId("yes")
      .setLabel("Yes")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(false);

    const noButton = new ButtonBuilder()
      .setCustomId("no")
      .setLabel("No")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(false);

    buttonCheckRow.addComponents(yesButton, noButton);

    return buttonCheckRow;
  },
};
