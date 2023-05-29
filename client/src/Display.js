import React, { useState } from "react";
import { Link } from "react-router-dom";
import Card from "./Card";

const Display = ({ token, learnedWords }) => {
  const [selectedWord, setSelectedWord] = useState(null);
  const [showWords, setShowWords] = useState(true);

  const fetchWordInfo = async (word) => {
    try {
      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
      );

      if (response.ok) {
        const data = await response.json();
        setSelectedWord(data[0]); // Assuming the API response is an array with a single object
        setShowWords(false); // Hide the word buttons
      } else {
        console.error("Failed to fetch word info");
      }
    } catch (error) {
      console.error(error);
      console.error("Network error occurred. Please try again.");
    }
  };

  const closeWordInfo = () => {
    setSelectedWord(null);
    setShowWords(true); // Show the word buttons again
  };

  const handleButtonClick = (word) => {
    if (selectedWord && selectedWord.word === word.english) {
      // If the card is already open for the clicked word, close it
      closeWordInfo();
    } else {
      // Otherwise, fetch word info for the clicked word
      fetchWordInfo(word.english);
    }
  };

  return (
    <div className="container">

      <h2>Repeated Words</h2>
      <div className="row justify-content-center">
        {showWords &&
          learnedWords &&
          learnedWords.length > 0 &&
          learnedWords.map((word) => (
            <div key={word._id} className="col-md-6">
              <button
                className="btn btn-primary m-2 btn-lg rounded-0"
                onClick={() => handleButtonClick(word)}
              >
                {word.english} - {word.ukrainian}
              </button>
            </div>
          ))}
        {selectedWord && (
          <Card word={selectedWord} onClose={closeWordInfo} />
        )}
      </div>
    </div>
  );
};

export default Display;
