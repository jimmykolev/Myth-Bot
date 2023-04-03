const { Schema, model } = require('mongoose');
const creatureSchema = new Schema({
    _id: Schema.Types.ObjectId,
    name: String,
    description: String,
    image: String,
    attack: Number,
    defense: Number,
    speed: Number,
    range: Number,
    abilitypoints: Number,
    rarity: String
});

module.exports = model('Creature', creatureSchema, "creatures");