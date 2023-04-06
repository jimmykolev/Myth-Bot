const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Check out the artifact shop!')
    .addStringOption((option) => option.setName('artifact').setDescription('The artifact you want to buy.').setRequired(false)),
    async execute(interaction) {
        const embed = new EmbedBuilder()
        .setTitle('Artifact Shop')
        .setDescription('Buy an artifact to showcase your wealth and power!')
    },
};