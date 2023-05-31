const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Word = require('../models/Word');
const router = express.Router();
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || username.trim() === '') {
      return res.status(400).json({ message: 'Please provide a valid username' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
    });

    await newUser.save();

    // Add words for learning to the user's learnedWords
    const words = await Word.find({});
    const learnedWords = words.map((word) => ({
      word: word._id,
      repetitionDate: null,
      isLearned: false,
      retentionStrength: 1,
      consecutiveFailedAttempts: 0,
      interval: 0,
      translations: word.ukrainian, // Update to translations field
    }));

    newUser.learnedWords = learnedWords;
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign({ userId: user._id }, 'my-secret-key');

    res.status(200).json({ token });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
