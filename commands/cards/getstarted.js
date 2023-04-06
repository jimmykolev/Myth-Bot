const { SlashCommandBuilder } = require('discord.js');
const User = require('../../schemas/user.js');
const mongoose = require('mongoose');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('getstarted')
    .setDescription('Sets you up to be able to collect cards.'),
    async execute(interaction) {
        let userProfile = await User.findOne({ userId: interaction.user.id });
        if (!userProfile) { 
            userProfile = await new User({
             _id: new mongoose.Types.ObjectId(),
             userId: interaction.user.id,
             cards: [],
             gold: 0
            });
            await userProfile.save().catch(err => console.log(err));
            await interaction.reply(`You have been set up to collect cards!`);
            console.log(userProfile);
    } else {
            await interaction.reply('You are already set up to collect cards! Use **/getcard** to get a card or **/balance** to view your balance.');
            console.log('User profile created for ' + interaction.user.username);

    }
},
};