const mongoose = require('mongoose');

const color = new mongoose.Schema({
    number: Number,
    r: Number,
    g: Number,
    b: Number
});

module.exports = mongoose.model('Color', color);
