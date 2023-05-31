const express = require("express");
const Word = require("../models/Word");
const User = require("../models/User");
const router = express.Router();
const authenticateUser = require("../middleware/authenticateUser");
const path = require("path");

const { createObjectCsvWriter } = require("csv-writer");
// Define the CSV header based on your data structure
const csvHeader = [
  { id: "english", title: "English" },
  { id: "ukrainian", title: "Ukrainian" },
];

router.get("/random-unlearned-word", authenticateUser, async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate("learnedWords.word");

    const unlearnedWords = user.learnedWords.filter(
      (wordObj) => !wordObj.isLearned
    );

    if (unlearnedWords.length === 0) {
      return res.status(404).json({ message: "No unlearned words available" });
    }

    const randomIndex = Math.floor(Math.random() * unlearnedWords.length);
    const word = unlearnedWords[randomIndex].word;

    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word.english}`
    );
    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      const wordData = data[0];
      const phonetics = wordData.phonetics.map((phonetic) => ({
        text: phonetic.text,
        audio: phonetic.audio,
      }));

      const meanings = wordData.meanings
        //.filter((meaning) => meaning.partOfSpeech === 'noun')
        .map((meaning) => ({
          partOfSpeech: meaning.partOfSpeech,
          definitions: meaning.definitions.map((definition) => ({
            definition: definition.definition,
            example: definition.example,
            synonyms: definition.synonyms,
          })),
        }));

      const updatedWordData = {
        ...wordData,
        _id: word._id,
        ukrainian: word.ukrainian, // Update to ukrainian field
        phonetics,
        meanings,
      };

      res.json({ word: updatedWordData });
    } else {
      res.status(404).json({ message: "Word data not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post(
  "/submit-translation/:wordId",
  authenticateUser,
  async (req, res) => {
    try {
      const { wordId } = req.params;
      const { translation } = req.body;
      const userId = req.user._id;

      const word = await Word.findById(wordId);
      if (!word) {
        return res.status(404).json({ message: "Word not found" });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const wordObj = user.learnedWords.find(
        (wordObj) => wordObj.word.toString() === wordId
      );
      if (!wordObj) {
        return res
          .status(404)
          .json({ message: "Word not found in user's learned words" });
      }

      const isTranslationCorrect = word.ukrainian.some(
        (translationWord) =>
          translationWord.toLowerCase().trim() ===
          translation.toLowerCase().trim()
      );
      wordObj.isLearned = isTranslationCorrect;
      wordObj.repetitionDate = new Date();

      await user.save();

      if (isTranslationCorrect) {
        return res.json({
          message: "Correct translation submitted",
          isCorrect: true,
        });
      } else {
        return res.json({
          message: "Incorrect translation submitted",
          isCorrect: false,
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.get("/get-repetition-word", authenticateUser, async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate("learnedWords.word");

    const currentDate = new Date();
    const nextRepetitionWord = user.learnedWords.find((wordObj) => {
      return currentDate >= wordObj.repetitionDate && wordObj.isLearned;
    });

    if (!nextRepetitionWord) {
      return res
        .status(404)
        .json({ message: "No words available for repetition" });
    }

    const word = nextRepetitionWord.word;
    const options = await generateTranslationOptions(word);
    res.json({ word, options });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.post(
  "/submit-repetition/:wordId",
  authenticateUser,
  async (req, res) => {
    try {
      const { wordId } = req.params;
      const { translation } = req.body;
      const userId = req.user._id;

      const word = await Word.findById(wordId);
      if (!word) {
        return res.status(404).json({ message: "Word not found" });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const wordObjIndex = user.learnedWords.findIndex(
        (wordObj) => wordObj.word._id.toString() === wordId
      );
      if (wordObjIndex === -1) {
        return res
          .status(404)
          .json({ message: "Word not found in user's learned words" });
      }

      const wordObj = user.learnedWords[wordObjIndex];
      const isCorrect =
        translation.toLowerCase() === word.ukrainian[0].toLowerCase();

      if (isCorrect) {
        const retentionStrength = wordObj.retentionStrength;
        const initialInterval = 10 * 60 * 1000;
        const interval = calculateInterval(initialInterval, retentionStrength);
        wordObj.repetitionDate = new Date(new Date().getTime() + interval);
        wordObj.interval = interval;
        wordObj.retentionStrength += 1;
        wordObj.consecutiveFailedAttempts = 0;
      } else {
        wordObj.consecutiveFailedAttempts += 1;
        if (wordObj.consecutiveFailedAttempts > 1) {
          wordObj.isLearned = false;
          wordObj.consecutiveFailedAttempts = 0;
        }
        wordObj.repetitionDate = new Date();
      }

      await user.save();

      if (isCorrect) {
        return res.json({
          isCorrect: true,
          message: "Correct repetition submitted",
        });
      } else {
        return res.json({
          isCorrect: false,
          message: "Incorrect repetition submitted",
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.get(
  "/get-repetition-word-reversed",
  authenticateUser,
  async (req, res) => {
    try {
      const userId = req.user._id;

      const user = await User.findById(userId).populate("learnedWords.word");

      const currentDate = new Date();
      const nextRepetitionWord = user.learnedWords.find((wordObj) => {
        return currentDate >= wordObj.repetitionDate && wordObj.isLearned;
      });

      if (!nextRepetitionWord) {
        return res
          .status(404)
          .json({ message: "No words available for repetition" });
      }
      console.log(nextRepetitionWord);
      console.log(nextRepetitionWord.word);
      const word = nextRepetitionWord.word;
      const options = await generateTranslationOptionsReversed(word);
      res.json({ word, options });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);
router.post(
  "/submit-repetition-reversed/:wordId",
  authenticateUser,
  async (req, res) => {
    try {
      const { wordId } = req.params;
      const { translation } = req.body;
      const userId = req.user._id;

      const word = await Word.findById(wordId);
      if (!word) {
        return res.status(404).json({ message: "Word not found" });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const wordObjIndex = user.learnedWords.findIndex(
        (wordObj) => wordObj.word._id.toString() === wordId
      );
      if (wordObjIndex === -1) {
        return res
          .status(404)
          .json({ message: "Word not found in user's learned words" });
      }

      const wordObj = user.learnedWords[wordObjIndex];
      const isCorrect =
        translation.toLowerCase() === word.english.toLowerCase();

      if (isCorrect) {
        const retentionStrength = wordObj.retentionStrength;
        const initialInterval = 10 * 60 * 1000;
        const interval = calculateInterval(initialInterval, retentionStrength);
        wordObj.repetitionDate = new Date(new Date().getTime() + interval);
        wordObj.interval = interval;
        wordObj.retentionStrength += 1;
        wordObj.consecutiveFailedAttempts = 0;
      } else {
        wordObj.consecutiveFailedAttempts += 1;
        if (wordObj.consecutiveFailedAttempts > 1) {
          wordObj.isLearned = false;
          wordObj.consecutiveFailedAttempts = 0;
        }
        wordObj.repetitionDate = new Date();
      }

      await user.save();

      if (isCorrect) {
        return res.json({
          isCorrect: true,
          message: "Correct repetition submitted",
        });
      } else {
        return res.json({
          isCorrect: false,
          message: "Incorrect repetition submitted",
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.get("/export-learned-words", authenticateUser, async (req, res) => {
  try {
    const userId = req.user._id; // Assuming you have user authentication middleware that sets req.user

    // Retrieve the user's learned words from the database and populate the word objects
    const user = await User.findById(userId).populate("learnedWords.word");

    // Filter the learned words with isLearned=true
    const learnedWords = user.learnedWords.filter(
      (wordObj) => wordObj.isLearned
    );

    // Extract the relevant data for the CSV file
    const csvData = learnedWords.map((wordObj) => {
      const { english, ukrainian } = wordObj.word;
      return { english, ukrainian };
    });

    // Define the CSV header based on your data structure
    const csvHeader = [
      { id: "english", title: "English" },
      { id: "ukrainian", title: "Ukrainian" },
    ];

    // Create a CSV writer instance
    const csvWriter = createObjectCsvWriter({
      path: path.join(__dirname, "../learned_words.csv"), // Use the correct file path
      header: csvHeader,
    });

    // Write the learned words to the CSV file
    await csvWriter.writeRecords(csvData);

    // Set the response headers for file download
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=learned_words.csv"
    );

    console.log("Sending the CSV file as the response"); // Add this line

    // Send the CSV file as the response
    res.sendFile(path.join(__dirname, "../learned_words.csv"));
  } catch (error) {
    console.error("Error exporting learned words:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const calculateInterval = (initialInterval, retentionStrength) => {
  const intervalMultiplier = 2;
  const interval =
    initialInterval * Math.pow(intervalMultiplier, retentionStrength);
  return interval;
};

const generateTranslationOptions = async (word) => {
  const options = [];
  options.push(word.ukrainian[0]); // Add the correct translation option

  const incorrectTranslations = await getIncorrectTranslations(word);
  options.push(...incorrectTranslations);

  shuffleArray(options);
  return options;
};
const generateTranslationOptionsReversed = async (word) => {
  const options = [];
  options.push(word.english); // Add the correct translation option

  const incorrectTranslations = await getIncorrectTranslationsReversed(word);
  options.push(...incorrectTranslations);

  shuffleArray(options);
  return options;
};

const getIncorrectTranslations = async (word) => {
  try {
    const randomTranslations = await Word.aggregate([
      { $match: { _id: { $ne: word._id } } },
      { $sample: { size: 4 } },
      { $project: { _id: 0, ukrainian: { $slice: ["$ukrainian", 1] } } },
    ]);

    if (!randomTranslations || randomTranslations.length !== 4) {
      throw new Error("Failed to fetch random translations");
    }

    const incorrectTranslations = randomTranslations.map(
      (word) => word.ukrainian[0]
    );

    return incorrectTranslations;
  } catch (error) {
    console.error(error);
    return ["Машина", "Воля", "Клавіатура", "Всесвіт"];
  }
};

const getIncorrectTranslationsReversed = async (word) => {
  try {
    const randomTranslations = await Word.aggregate([
      { $match: { _id: { $ne: word._id } } },
      { $sample: { size: 4 } },
      { $project: { _id: 0, english: 1 } },
    ]);

    if (!randomTranslations || randomTranslations.length !== 4) {
      throw new Error("Failed to fetch random translations");
    }

    const incorrectTranslations = randomTranslations.map(
      (word) => word.english
    );

    return incorrectTranslations;
  } catch (error) {
    console.error(error);
    return ["Car", "Hope", "Key", "Mouse"];
  }
};

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};
router.post("/addMore", async (req, res) => {
  try {
    const words = req.body;

    // Create an array to store the newly created word documents
    const createdWords = [];

    // Iterate through the words array and create a new word document for each word
    for (const { english, ukrainian } of words) {
      const word = await Word.create({ english, ukrainian });
      createdWords.push(word);
    }

    // Add the newly created words to the "learnedWords" array of all users with "isLearned" set to false
    await User.updateMany(
      {},
      {
        $push: {
          learnedWords: {
            $each: createdWords.map((word) => ({ word: word._id })),
          },
        },
      }
    );

    res.status(200).json({ message: "Words added successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error." });
  }
});

module.exports = router;

//tree feature
/*TODO: произношение слов, пример использования, транслитерация, картинка к слову
таблицы со словами для отдельных юзеров,CRUD
 Кривая забывания: Выбор из правильного и 4 не правильных переводов слов,
 при неправильном вводе давать еще раз слово в конце

*/

/*
router.post('/update-learned-words', async (req, res) => {
  try {
    await User.updateMany(
      {
        $or: [
          { 'learnedWords.consecutiveFailedAttempts': { $exists: false } },
          { 'learnedWords.interval': { $exists: false } }
        ]
      },
      {
        $set: {
          'learnedWords.$[failedAttempts].consecutiveFailedAttempts': 0,
          'learnedWords.$[interval].interval': 0
        }
      },
      {
        arrayFilters: [
          { 'elem.learnedWords.isLearned': false },
          { 'failedAttempts.consecutiveFailedAttempts': { $exists: false } },
          { 'interval.interval': { $exists: false } }
        ],
        multi: true
      }
    );

    res.json({ message: 'Learned words updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:userId/learned-words/:learnedWordId', async (req, res) => {
  try {
    const { userId, learnedWordId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const learnedWord = user.learnedWords.id(learnedWordId);
    if (!learnedWord) {
      return res.status(404).json({ message: 'Learned word not found' });
    }

    const dateString = "2023-05-15T00:00:00.000Z";
    const repetitionDate = new Date(dateString); // Set your desired repetition date here

    learnedWord.repetitionDate = repetitionDate;

    await user.save();

    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/addMore', async (req, res) => {
  try {
    const words = req.body;

    // Create an array to store the newly created word documents
    const createdWords = [];

    // Iterate through the words array and create a new word document for each word
    for (const { ukrainian, english } of words) {
      const word = await Word.create({ ukrainian, english });
      createdWords.push(word);
    }

    // Add the newly created words to the "learnedWords" array of all users with "isLearned" set to false
    await User.updateMany({}, { $push: { learnedWords: { $each: createdWords.map(word => ({ word: word._id })) } } });

    res.status(200).json({ message: 'Words added successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error.' });
  }

});


// Get all words
router.get("/",authenticateUser, async (req, res) => {
  try {
    const words = await Word.find();
    res.json(words);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});*/
