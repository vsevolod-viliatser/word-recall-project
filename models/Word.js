const mongoose = require('mongoose');

const wordSchema = new mongoose.Schema({
  ukrainian: {
    type: String,
    required: true,
  },
  english: {
    type: String,
    required: true,
  },
  initialInterval: {
    type: Number,
    default: 1
  }
});
const Word = mongoose.model('Word', wordSchema);
module.exports = Word
