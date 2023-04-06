const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require("discord.js");
const { mythology } = require("../creatures.json");
const User = require("../schemas/user.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("getcard")
    .setDescription("Get a card from the database"),
  async execute(interaction) {
    const userProfile = await User.findOne({ userId: interaction.user.id });
    if (!userProfile) {
      await interaction.reply(
        "You are not set up to collect cards. Please run /getstarted to set up your profile."
      );
    } else {
      const randomValue = Math.random();

      const rarityTiers = [
        { minRarity: 95, maxRarity: 100, probability: 1 / 100 }, // Legendary tier
        { minRarity: 85, maxRarity: 94, probability: 1 / 50 }, // Super rare tier
        { minRarity: 75, maxRarity: 84, probability: 1 / 25 }, // Rare tier
        { minRarity: 0, maxRarity: 74, probability: 1 / 5 }, // Common tier
      ];

      // Calculate the cumulative probability for each tier
      let accumulatedProbability = 0;
      rarityTiers.forEach((tier, index) => {
        accumulatedProbability += tier.probability;
        tier.accumulatedProbability = accumulatedProbability;
      });

      // Find the rarity tier for the random value
      const tier =
        rarityTiers.find(
          (tier) => randomValue <= tier.accumulatedProbability
        ) || rarityTiers[rarityTiers.length - 1];

      // Filter creatures based on the rarity tier
      const creaturesInTier = mythology.filter(
        (creature) =>
          creature.rarity >= tier.minRarity && creature.rarity < tier.maxRarity
      );

      // If creaturesInTier is empty, use all creatures
      const finalCreaturePool =
        creaturesInTier.length > 0 ? creaturesInTier : mythology;

      // Randomly pick a creature from the filtered creatures
      const randomCreature =
        finalCreaturePool[Math.floor(Math.random() * finalCreaturePool.length)];

      // ...

      if (randomCreature) {
        const cardIndex = userProfile.cards.findIndex(
          (card) => card.name === randomCreature.name
        );
        if (cardIndex !== -1) {
          var goldToAdd;
          if (randomCreature.rarity === 100) {
            goldToAdd = 1000;
          } else if (randomCreature.rarity > 94) {
            goldToAdd = 500;
          } else if (randomCreature.rarity > 84) {
            goldToAdd = 250;
          } else if (randomCreature.rarity > 74) {
            goldToAdd = 100;
          } else {
            goldToAdd = 50;
          }

          userProfile.gold += goldToAdd;
          await userProfile.save().catch((err) => console.log(err));
          await interaction.reply(
            `You already have **${randomCreature.name}**. You received **${goldToAdd}** :coin: instead.`
          );
        } else {
          const newCard = {
            name: randomCreature.name,
            description: randomCreature.description,
            attack: randomCreature.attack,
            defence: randomCreature.defence,
            speed: randomCreature.speed,
            range: randomCreature.range,
            abilitypoints: randomCreature.abilitypoints,
            rarity: randomCreature.rarity,
            colorhex: randomCreature.colorhex,
          };
          userProfile.cards.push(newCard);
          await userProfile.save().catch((err) => console.log(err));
          const card = new EmbedBuilder()
            .setTitle(`${randomCreature.name}`)
            .setDescription(`${randomCreature.description}`)
            .addFields(
              {
                name: "Attack",
                value: `${randomCreature.attack}`,
                inline: true,
              },
              {
                name: "Defence",
                value: `${randomCreature.defence}`,
                inline: true,
              },
              { name: "Speed", value: `${randomCreature.speed}`, inline: true },
              { name: "Range", value: `${randomCreature.range}`, inline: true },
              {
                name: "Ability Points",
                value: `${randomCreature.abilitypoints}`,
                inline: true,
              },
              {
                name: "Rarity",
                value: `${randomCreature.rarity}`,
                inline: true,
              }
            )
            .setColor(`${randomCreature.colorhex}`);

          await interaction.reply({ content: `You got a ${randomCreature.name}!`,embeds: [card] });
        }
      }
    }
  },
};
