import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './Navigation';
import WordDisplay from './WordDisplay';
import WordRepetition from './WordRepetition';
import RegistrationForm from './RegistrationForm';
import LoginForm from './LoginForm';
import LandingPage from './LandingPage';
import ExportLearnedWords from './ExportLearnedWords';
import WordRepetitionReverse from './WordRepetitionReverse';
import Display from './Display';
import Card from './Card';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [repeatedWords, setRepeatedWords] = useState([]);
  const [showCard, setShowCard] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);

  useEffect(() => {
    localStorage.setItem('token', token);
  }, [token]);

  useEffect(() => {
    console.log('Repeated Words:', repeatedWords);
  }, [repeatedWords]);

  const handleLogout = () => {
    setToken(null);
  };

  const handleWordsRepeated = (words) => {
    setRepeatedWords(words);
  };

  const handleWordClick = (word) => {
    setSelectedWord(word);
    setShowCard(true);
  };

  const handleCloseCard = () => {
    setShowCard(false);
    setSelectedWord(null);
  };

  return (
    <BrowserRouter>
      <Navigation token={token} onLogout={handleLogout} />
      <div className={`container ${showCard ? 'card-open' : ''}`}>
        <Routes>
          {token ? (
            <>
              <Route path="/" element={<LandingPage token={token} />} />
              <Route
                path="/learning"
                element={<WordDisplay token={token} onWordClick={handleWordClick} />}
              />
              <Route
                path="/repetition"
                element={
                  <WordRepetition
                    token={token}
                    onWordsRepeated={handleWordsRepeated}
                  />
                }
              />
              <Route
                path="/displays"
                element={<Display token={token} learnedWords={repeatedWords} />}
              />
              <Route
                path="/repetition-reverse"
                element={<WordRepetitionReverse token={token} onWordsRepeated={handleWordsRepeated}/>}
              />
              <Route
                path="/csv"
                element={<ExportLearnedWords token={token} />}
              />
            </>
          ) : (
            <>
              <Route path="/" element={<LoginForm setToken={setToken} />} />
              <Route path="/register" element={<RegistrationForm />} />
            </>
          )}
        </Routes>
        {showCard && (
          <Card word={selectedWord} onClose={handleCloseCard} />
        )}
      </div>
    </BrowserRouter>
  );
};

export default App;
