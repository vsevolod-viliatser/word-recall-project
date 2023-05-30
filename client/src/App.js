import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navigation from "./Navigation";
import WordDisplay from "./WordDisplay";
import WordRepetition from "./WordRepetition";
import RegistrationForm from "./RegistrationForm";
import LoginForm from "./LoginForm";
import LandingPage from "./LandingPage";
import ExportLearnedWords from "./ExportLearnedWords";
import WordRepetitionReverse from "./WordRepetitionReverse";
import Display from "./Display";
import Card from "./Card";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [repeatedWords, setRepeatedWords] = useState([]);
  const [showCard, setShowCard] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);

  useEffect(() => {
    localStorage.setItem("token", token);
  }, [token]);

  useEffect(() => {
    console.log("Repeated Words:", repeatedWords);
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
  const ProtectedRoute = ({ token, children }) => {
    if (!token) {
      return <Navigate to="/login" replace />;
    }

    return children;
  };
  return (
    <BrowserRouter>
      <Navigation token={token} onLogout={handleLogout} />
      <div className={`container ${showCard ? "card-open" : ""}`}>
        <Routes>
          {token ? (
            <>
              <Route
                path="/"
                element={
                  <ProtectedRoute token={token}>
                    <LandingPage token={token} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/learning"
                element={
                  <ProtectedRoute token={token}>
                    <WordDisplay token={token} onWordClick={handleWordClick} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/repetition"
                element={
                  <ProtectedRoute token={token}>
                    <WordRepetition
                      token={token}
                      onWordsRepeated={handleWordsRepeated}
                    />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/displays"
                element={<Display token={token} learnedWords={repeatedWords} />}
              />
              <Route
                path="/repetition-reverse"
                element={
                  <ProtectedRoute token={token}>
                  <WordRepetitionReverse
                    token={token}
                    onWordsRepeated={handleWordsRepeated}
                  />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/csv"
                element={<ProtectedRoute token={token}>
                <ExportLearnedWords token={token} /></ProtectedRoute>}
              />
            </>
          ) : (
            <>
              <Route
                path="/login"
                element={<LoginForm setToken={setToken} />}
              />
              <Route path="/register" element={<RegistrationForm />} />
            </>
          )}
        </Routes>
        {showCard && <Card word={selectedWord} onClose={handleCloseCard} />}
      </div>
    </BrowserRouter>
  );
};

export default App;
