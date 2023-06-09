import React, { useState, useEffect } from 'react';

const WordDisplay = ({ token }) => {
  const [word, setWord] = useState(null);
  const [translation, setTranslation] = useState('');
  const [hasWordsAvailable, setHasWordsAvailable] = useState(true);
  const [isCorrectTranslation, setIsCorrectTranslation] = useState(null);

  const fetchRandomWord = async () => {
    try {
      const response = await fetch('api/words/random-unlearned-word', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWord(data.word);
        console.log('Word:', data.word);
        setTranslation('');
        setHasWordsAvailable(true);
        setIsCorrectTranslation(null);
      } else {
        // Handle error message
        const errorData = await response.json();
        console.error(`Error: ${errorData.message}`);
        setHasWordsAvailable(false);
        setIsCorrectTranslation(null);
      }
    } catch (error) {
      console.error(error);
      // Handle network error
      console.error('Network error occurred. Please try again.');
      setIsCorrectTranslation(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Word ID:', word._id); // Check the value of word._id

    try {
      const response = await fetch(`api/words/submit-translation/${word._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ translation }),
      });

      if (response.ok) {
        const data = await response.json();
        const isTranslationCorrect = data.isCorrect;
        console.log('Is Translation Correct:', isTranslationCorrect);
        setIsCorrectTranslation(isTranslationCorrect);
        setTimeout(() => {
          setIsCorrectTranslation(null);
        }, 1000); // Clear the message after 1 second
      } else {
        // Handle error message
        const errorData = await response.json();
        console.error(`Error: ${errorData.message}`);
        setIsCorrectTranslation(null);
      }
    } catch (error) {
      console.error(error);
      // Handle network error
      console.error('Network error occurred. Please try again.');
      setIsCorrectTranslation(null);
    }

    fetchRandomWord();
  };

  useEffect(() => {
    fetchRandomWord();
  }, []);

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      {hasWordsAvailable ? (
        word && (
          <div className="mb-4">
            <h3 className="text-center">Enter Ukrainian Translation</h3>
            <div className="text-center">
              <label htmlFor="englishWord" className="fs-2">
                {word.word}
              </label>
              {word.phonetics && word.phonetics.length > 0 && (
                <div>
                  <p>Phonetics:</p>
                  <div>
                    <p>{word.phonetics[0].text}</p>
                    {word.phonetics[0].audio && (
                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          const audio = new Audio(word.phonetics[0].audio);
                          audio.play();
                        }}
                      >
                        Play Audio
                      </button>
                    )}
                  </div>
                </div>
              )}
              {word.meanings && word.meanings.length > 0 && (
                <div>
                  <h4>Meanings:</h4>
                  {word.meanings.map((meaning, index) => (
                    <div key={index}>
                      {meaning.definitions && meaning.definitions.length > 0 ? (
                        <ul>
                          <li>
                            <div className="word-definition">
                              {meaning.definitions[0].definition}
                            </div>
                            {meaning.definitions[0].example && (
                              <span>
                                {' '}
                                Example: {meaning.definitions[0].example}
                              </span>
                            )}
                          </li>
                          {meaning.definitions[0].synonyms &&
                          meaning.definitions[0].synonyms.length > 0 ? (
                            <li>
                              Synonyms:{' '}
                              {meaning.definitions[0].synonyms
                                .slice(0, 3)
                                .join(', ')}
                              {meaning.definitions[0].synonyms.length > 3 &&
                                ' ...'}
                            </li>
                          ) : null}
                        </ul>
                      ) : (
                        <p>No definitions found.</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <form onSubmit={handleSubmit} className="text-center">
                <div className="mb-3">
                  <input
                    type="text"
                    id="translation"
                    className="form-control"
                    placeholder="Enter translation"
                    value={translation}
                    onChange={(e) => setTranslation(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Submit
                </button>
              </form>
              {isCorrectTranslation !== null && (
                <p className={`${isCorrectTranslation ? 'text-success' : 'text-danger'}`}>
                  {isCorrectTranslation ? 'Correct!' : 'Incorrect!'}
                </p>
              )}
            </div>
          </div>
        )
      ) : (
        <p className="text-center">No unlearned words available.</p>
      )}
    </div>
  );
};

export default WordDisplay;
