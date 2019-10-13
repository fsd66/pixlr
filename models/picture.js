const mongoose = require('mongoose');

const picture = new mongoose.Schema({
    width: Number,
    height: Number
});

module.exports = mongoose.model('Picture', picture);
