// LandingPage.js
import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = ({token}) => {
  return (
    <div className="container">
      <h1>Welcome to the Word Learning Application!</h1>
      <p>This application helps you learn new words and reinforce your knowledge.</p>
      {!token &&(
      <><p>Get started by registering or logging in.</p><div className="d-flex justify-content-center mt-4">
          <Link to="/register" className="mr-3">
            <button className="btn btn-primary">Register</button>
          </Link>
          <Link to="/login">
            <button className="btn btn-primary">Login</button>
          </Link>
        </div></>
      )}
    </div>
  );
};

export default LandingPage;

