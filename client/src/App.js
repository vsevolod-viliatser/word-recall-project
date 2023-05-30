import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import PrivateRoute from './PrivateRoute';

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
    <Router>
      {token && <Navigation token={token} onLogout={handleLogout} />}
      <div className={`container ${showCard ? 'card-open' : ''}`}>
        <Routes>
          <Route path="/" element={!token ? <LoginForm setToken={setToken} /> : <LandingPage token={token} />} />
          <Route path="/register" element={<RegistrationForm />} />
          <PrivateRoute
            path="/learning"
            element={<WordDisplay token={token} onWordClick={handleWordClick} />}
            isAuthenticated={!!token}
          />
          <PrivateRoute
            path="/repetition"
            element={<WordRepetition token={token} onWordsRepeated={handleWordsRepeated} />}
            isAuthenticated={!!token}
          />
          <PrivateRoute
            path="/displays"
            element={<Display token={token} learnedWords={repeatedWords} />}
            isAuthenticated={!!token}
          />
          <PrivateRoute
            path="/repetition-reverse"
            element={<WordRepetitionReverse token={token} onWordsRepeated={handleWordsRepeated} />}
            isAuthenticated={!!token}
          />
          <PrivateRoute
            path="/csv"
            element={<ExportLearnedWords token={token} />}
            isAuthenticated={!!token}
          />
        </Routes>
        {showCard && <Card word={selectedWord} onClose={handleCloseCard} />}
      </div>
    </Router>
  );
};

export default App;
