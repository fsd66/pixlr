const mongoose = require('mongoose');

const pixel = new mongoose.Schema({
    x: Number,
    y: Number,
    r: Number,
    g: Number,
    b: Number,
    user: String,
    modified: Date,
    pictureId: { type: mongoose.Schema.Types.ObjectId, ref: 'Picture' }
});

module.exports = mongoose.model('Pixel', pixel);
