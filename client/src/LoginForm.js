import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';


const LoginForm = ({ setToken }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form inputs (add your own validation logic here)

    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const { token } = await response.json();
        setToken(token);
        navigate('/');
      } else {
        setError('Login failed');
      }
    } catch (error) {
      console.error(error);
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Login Form</h2>
      {error && <p>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            className="form-control"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            className="form-control"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p>
        Not registered yet? <Link to="/register">Register</Link>
      </p>
    </div>
  );
  
};

export default LoginForm;
