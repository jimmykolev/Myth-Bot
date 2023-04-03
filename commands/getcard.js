const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require("discord.js");
const { mythology } = require("../creatures.json");
const User = require("../schemas/user.js");
const mongoose = require("mongoose");

const rarityTiers = [
    { rarity: 100, probability: 1 / 100 },  // Legendary tier
    { rarity: 94, probability: 1 / 50 },   // Super rare tier
    { rarity: 87, probability: 1 / 20 },   // Rare tier
    { rarity: 80, probability: 1 / 5 }, // Common tier
    { rarity: 0, probability: 1 }        // Default tier
  ];
  

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
          let randomCreature = null;
          for (const creature of mythology) {
            const rarityTier = rarityTiers.find((tier) => creature.rarity >= tier.rarity);
            const probability = rarityTier.probability;
            if (probability >= randomValue) {
              randomCreature = creature;
              break;
            }
          }
      
          if (randomCreature) {
            const cardIndex = userProfile.cards.findIndex((card) => card.name === randomCreature.name);
            if (cardIndex !== -1) {
                var goldToAdd;
                if (randomCreature.rarity === 100) {
                goldToAdd = 1000;
                } else if (randomCreature.rarity > 94) {
                goldToAdd = 500;
                } else if (randomCreature.rarity > 87) {
                goldToAdd = 250;
                } else if (randomCreature.rarity > 80) {
                goldToAdd = 100;
                } else {
                goldToAdd = 50;
                }
               
              userProfile.gold += goldToAdd;
              await userProfile.save().catch((err) => console.log(err));
              await interaction.reply(`You already have **${randomCreature.name}**. You received **${goldToAdd}** :coin: instead.`);
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
                  { name: "Attack", value: `${randomCreature.attack}`, inline: true },
                  { name: "Defence", value: `${randomCreature.defence}`, inline: true },
                  { name: "Speed", value: `${randomCreature.speed}`, inline: true },
                  { name: "Range", value: `${randomCreature.range}`, inline: true },
                  { name: "Ability Points", value: `${randomCreature.abilitypoints}`, inline: true },
                  { name: "Rarity", value: `${randomCreature.rarity}`, inline: true }
                )
                .setColor(`${randomCreature.colorhex}`);
      
              await interaction.reply({ embeds: [card] });
            }
          } else {
            const goldToAdd = 10; // the amount of gold to add
            userProfile.gold += goldToAdd;
            await userProfile.save().catch((err) => console.log(err));
            await interaction.reply(`No creature was found. You received ${goldToAdd} gold instead.`);
          }
        }
      }
    };      