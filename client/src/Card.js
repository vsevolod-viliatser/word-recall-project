import React from "react";

const Card = ({ word, onClose }) => {
  return (
    <div className="word-card-overlay d-flex align-items-center justify-content-center">
      <div className="card word-card w-50 position-relative">
        <div className="close-button-container position-absolute top-0 end-0">
          <button className="close-button btn p-3" onClick={onClose}>
            <span className="fs-3">&times;</span>
          </button>
        </div>
        <div className="card-body">
          <h5 className="card-title">{word.word}</h5>
          {word.translation && (
            <p className="card-text">
              <strong>Translation:</strong> {word.translation}
            </p>
          )}
          {word.phonetics && word.phonetics.length > 0 && (
            <div>
              <p>
                <strong>Phonetics:</strong>
              </p>
              <div>
                <p>{word.phonetics[0].text}</p>
                {word.phonetics[0].audio && (
                  <audio src={word.phonetics[0].audio} controls />
                )}
              </div>
            </div>
          )}
          {word.meanings && word.meanings.length > 0 && (
            <div>
              <p>
                <strong>Meanings:</strong>
              </p>
              {word.meanings.map((meaning, index) => (
                <div key={index}>
                  <p>
                    <strong>{meaning.partOfSpeech}:</strong>{" "}
                    {meaning.definitions && meaning.definitions.length > 0 ? (
                      meaning.definitions[0].definition
                    ) : (
                      <em>No definition found.</em>
                    )}
                  </p>
                  {meaning.definitions &&
                    meaning.definitions.length > 0 &&
                    meaning.definitions[0].example && (
                      <p>
                        <strong>Example:</strong>{" "}
                        {meaning.definitions[0].example}
                      </p>
                    )}
                  {meaning.definitions &&
                    meaning.definitions.length > 0 &&
                    meaning.definitions[0].synonyms &&
                    meaning.definitions[0].synonyms.length > 0 && (
                      <p>
                        <strong>Synonyms:</strong>{" "}
                        {meaning.definitions[0].synonyms.join(", ")}
                      </p>
                    )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Card;
