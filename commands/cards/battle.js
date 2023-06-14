const { SlashCommandBuilder } = require("discord.js");
const User = require("../../schemas/user.js");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { mythology } = require("../../creatures.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("battle")
    .addStringOption((option) =>
      option
        .setName("card")
        .setDescription("The card you want to use.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("attribute")
        .setDescription("They attribute you want to use.")
        .setRequired(true)
    )
    .setDescription("Start a battle with the bot!"),

  async execute(interaction) {
    const userProfile = await User.findOne({ userId: interaction.user.id });
    
    if (!userProfile) {
      await interaction.reply(
        "You are not set up to collect cards. Please run /getstarted to set up your profile."
      );
      return;
    } 
    const isAdmin = userProfile.admin;
    if (!isAdmin) {
      const battleCooldownExpiration = userProfile.cooldowns.get("battle");
      if (battleCooldownExpiration && battleCooldownExpiration > new Date()) {
        const remainingCooldown = Math.ceil(
          (battleCooldownExpiration - new Date()) / 1000 / 60
        );
        interaction.reply(
          `You are still under cooldown for this command. Please wait ${remainingCooldown} minutes.`
        );
        return;
      }
    } 

    function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    }
    const cardName = capitalizeFirstLetter(
      interaction.options.getString("card")
    );
    const card = userProfile.cards.find(
      (card) => card.name.toLowerCase() === cardName.toLowerCase()
    );
    if (!card) {
      await interaction.reply(`You do not have a **${cardName}** card.`);
      return;
    }

    const validAttributes = ["attack", "defence", "speed", "range", "ap"];

    var attributeName = interaction.options
      .getString("attribute")
      .toLowerCase();
    if (!validAttributes.includes(attributeName)) {
      await interaction.reply(
        `Invalid attribute: **${capitalizeFirstLetter(
          attributeName
        )}**. Please choose a valid attribute (Attack, Defence, Speed, Range, AP).`
      );
      return;
    }

    const buttonRow = new ActionRowBuilder();

    const startButton = new ButtonBuilder()
      .setCustomId("start")
      .setLabel("Start Battle")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(false);

    buttonRow.addComponents(startButton);

    await interaction.reply({
      content: `Welcome to the battle, where you can battle against me for some :coin:!, press the button to start the battle!, if you want to understand how the battle system works, please type **/battlehelp**`,
      components: [buttonRow],
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
      if (interaction.customId === "start") {
        const selectedCard = card;
        const selectedName = selectedCard.name;
        if (attributeName === "defense") {
          attributeName = "defence";
        }
        if (attributeName === "ap") {
          attributeName = "abilitypoints";
        }

        const selectedAttribute = selectedCard[attributeName];

        const randomBotCard =
          mythology[Math.floor(Math.random() * mythology.length)];
        const botAttribute = randomBotCard[attributeName];
        const botName = randomBotCard.name;

        await interaction.deferReply({ ephemeral: true });

        setTimeout(async () => {
          await interaction.editReply(`I'm thinking...`);
        }, 1000);

        setTimeout(async () => {
          await interaction.editReply("Still thinking...");
        }, 2000);

        setTimeout(async () => {
          if (attributeName === "abilitypoints") {
            attributeName = "Ability Points";
          }

          if (botAttribute > selectedAttribute) {
            userProfile.gold -= 50;
            await userProfile.save().catch((err) => console.log(err));
            await interaction.editReply(
              `I used the **${botName}** card with **${capitalizeFirstLetter(
                attributeName
              )}: ${botAttribute}** and won the battle! Your **${selectedName}** card had **${capitalizeFirstLetter(
                attributeName
              )}: ${selectedAttribute}**. You lost 50 :coin:!`
            );
          } else if (botAttribute == selectedAttribute) {
            await interaction.editReply(
              `We both used the **${botName}** card with **${capitalizeFirstLetter(
                attributeName
              )}: ${botAttribute}** and tied!`
            );
          } else {
            userProfile.gold += 50;
            await userProfile.save().catch((err) => console.log(err));
            await interaction.editReply(
              `You won the battle! Your **${selectedName}** card with **${capitalizeFirstLetter(
                attributeName
              )}: ${selectedAttribute}** defeated my **${botName}** card with **${capitalizeFirstLetter(
                attributeName
              )}: ${botAttribute}**. You won 50 :coin:!`
            );
          }
          await interaction.message.edit({ components: [] });
        }, 3000);
      }
    });

    collector.on("end", async () => {
      await confirmPrompt.edit({ components: [] });
    });
  
    const cooldownDurationMinutes = 15; // Cooldown in minutes
    const newBattleCooldownExpiration = new Date(
      Date.now() + cooldownDurationMinutes * 60 * 1000
    );
    userProfile.cooldowns.set("battle", newBattleCooldownExpiration);

    await userProfile.save();
  }
  };
