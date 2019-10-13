const mongoose = require('mongoose');

const status = new mongoose.Schema({
    currentPicture: { type: mongoose.Schema.Types.ObjectId, ref: 'Picture' }
});

module.exports = mongoose.model('Status', status);
