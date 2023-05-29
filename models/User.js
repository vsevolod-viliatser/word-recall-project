const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  learnedWords: [
    {
      word: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Word',
        required: true,
      },
      repetitionDate: {
        type: Date,
        default: null,
      },
      isLearned: {
        type: Boolean,
        default: false,
      },
      retentionStrength: {
        type: Number,
        default: 1, // Initial retention strength value
      },
      consecutiveFailedAttempts: {
        type: Number,
        default: 0,
      },
      interval:{
        type: Number,
        default: 0,
      }
    },
  ],
});

const User = mongoose.model('User', userSchema);

module.exports = User;
