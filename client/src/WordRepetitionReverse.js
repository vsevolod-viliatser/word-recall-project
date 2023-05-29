import React, { useEffect, useState } from "react";
import ProgressBar from "react-bootstrap/ProgressBar";
import { Link } from "react-router-dom";
const WordRepetitionReverse = ({ token, onWordsRepeated }) => {
  const [word, setWord] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [hasWordsAvailable, setHasWordsAvailable] = useState(true);
  const [repetitionCount, setRepetitionCount] = useState(0);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const [repeatedWords, setRepeatedWords] = useState([]);

  const fetchNextRepetitionWordReversed = async () => {
    try {
      const response = await fetch(
        "/api/words/get-repetition-word-reversed",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (
          data.message &&
          data.message === "No words available for repetition"
        ) {
          setHasWordsAvailable(false);
        } else {
          setWord(data.word);
          if (Array.isArray(data.options)) {
            setOptions([...data.options]);
          } else {
            console.log("Invalid options data:", data.options);
            setOptions([]);
          }
          setSelectedOption("");
          setErrorMessage("");
          setHasWordsAvailable(true);
        }
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message);
        setHasWordsAvailable(false);
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Network error occurred. Please try again.");
      setHasWordsAvailable(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (word) {
        const response = await fetch(
          `/api/words/submit-repetition-reversed/${word._id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ translation: selectedOption }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const isTranslationCorrect = data.isCorrect;

          if (isTranslationCorrect) {
            console.log("Correct translation!");
            setSelectedOption("");
            setRepetitionCount((prevCount) => prevCount + 1);
            setProgress((prevProgress) => prevProgress + (1 / 10) * 100); // Increase progress by 1/15
            setErrorMessage(""); // Clear the error message
            setIncorrectCount(0); // Reset the incorrect count

            // Add the repeated word to the repeatedWords array
            setRepeatedWords((prevWords) => [...prevWords, word]);
          } else {
            console.log("Incorrect translation!");
            setErrorMessage("You're wrong, try again");
            setIncorrectCount((prevCount) => prevCount + 1);
          }
        } else {
          const errorData = await response.json();
          console.error(errorData.message);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (repetitionCount >= 10) {
      setSessionCompleted(true);
      onWordsRepeated(repeatedWords);
    } else {
      fetchNextRepetitionWordReversed();
    }
  }, [repetitionCount]);
  useEffect(() => {
    if (incorrectCount === 2) {
      fetchNextRepetitionWordReversed();
    }
  }, [incorrectCount]);

  useEffect(() => {
    const newProgress = (repetitionCount / 10) * 100;
    setProgress(newProgress);
  }, [repetitionCount]);
  return (
    <div className="container d-flex justify-content-center align-items-center">
      {hasWordsAvailable ? (
        <form onSubmit={handleSubmit} className="text-center">
          <h2 className="mb-4">Repetition</h2>
          <p className="fs-5">Translate the word:</p>
          {word && <h3 className="display-4 mb-4">{word.ukrainian}</h3>}
          {errorMessage && <p className="fs-5 text-danger">{errorMessage}</p>}
          <div>
            {sessionCompleted ? (
              <>
                <p className="fs-5">You're good enough for this session!</p>
                <Link to="/displays">
                  <button className="btn btn-primary m-2">
                    View Repeated Words
                  </button>
                </Link>
              </>
            ) : (
              options.map((option, index) => (
                <button
                  key={index}
                  className={`btn btn-lg ${
                    selectedOption === option
                      ? "btn-primary selected"
                      : "btn-light"
                  }`}
                  onClick={() => setSelectedOption(option)}
                >
                  {option}
                </button>
              ))
            )}
          </div>
          <ProgressBar now={progress} label={`${progress.toFixed(0)}%`} />
        </form>
      ) : (
        <p className="fs-5">No words available for repetition</p>
      )}
    </div>
  );
};

export default WordRepetitionReverse;
