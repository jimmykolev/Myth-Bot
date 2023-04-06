const { Schema, model } = require('mongoose');
const userSchema = new Schema({
    _id: Schema.Types.ObjectId,
    userId: { type: String, required: true },
    cards: { type: Array, required: true, default: [] },
    gold: { type: Number, required: true, default: 0 },
    items: { type: Array, required: true, default: [] },
    profileColour: { type: String, required: true, default: '#FFFFFF' },
});

module.exports = model('User', userSchema, "users");