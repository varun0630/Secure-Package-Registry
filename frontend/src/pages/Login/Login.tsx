import React, { useEffect, useState } from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';

export interface LoginPageProps {
  setPermissions: (permissions: string[]) => void;
  setIsAdmin: (isAdmin: string[]) => void;
  setToken: (token: string) => void;
}

/**
 * LoginPage component for user authentication.
 * Handles user login, validates inputs, and redirects authenticated users to the platform's main page.
 *
 * @param {Function} setPermissions - Function to set the user's permissions after login.
 * @param {Function} setIsAdmin - Function to set the user's admin status.
 * @param {Function} setToken - Function to set the authentication token.
 * @returns {JSX.Element} - The rendered LoginPage component.
 */
const LoginPage: React.FC<LoginPageProps> = ({ setPermissions, setIsAdmin, setToken }) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [usernameError, setUsernameError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  useEffect(() => {
    localStorage.setItem('numApiCalls', '0');
    localStorage.setItem('accessToken', '');
    localStorage.setItem('permissions', JSON.stringify([]));
    localStorage.setItem('isAdmin', JSON.stringify([]));
    setIsAdmin([]);
    setPermissions([]);
    setToken('');
    

  }, []);

  const navigate = useNavigate();


  /**
   * Validates username and password inputs.
   * Ensures both fields have a minimum length of 4 characters.
   *
   * @returns {boolean} - True if inputs are valid, false otherwise.
   */
  const validateInputs = (): boolean => {
    let valid = true;

    if (username.length < 4) {
      setUsernameError('Username must be at least 4 characters long.');
      valid = false;
    } else {
      setUsernameError('');
    }

    if (password.length < 4) {
      setPasswordError('Password must be at least 4 characters long.');
      valid = false;
    } else {
      setPasswordError('');
    }

    return valid;
  };

  /**
   * Handles user login by sending a PUT request to the server.
   * Validates inputs, processes the response, and stores user data locally.
   */
  const handleLogin = async () => {
    if (!validateInputs()) {
      return;
    }

    setIsLoading(true);
    setMessage('');
    setIsLoggedIn(false);
    // console.log(password);

    try {
      const response = await fetch(`https://iyi2t3azi4.execute-api.us-east-1.amazonaws.com/login`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: encodeURIComponent(password),
        }),
      });

      const result = await response.json();

      if (response.status === 200) {
        if (result.isAdmin) {
          setIsAdmin(['Admin']);
          localStorage.setItem('isAdmin', JSON.stringify(['Admin']));
        }
        setPermissions(result.permissions);
        setToken(result.accessToken.split(' ')[1]);
        localStorage.setItem('numApiCalls', '0');
        localStorage.setItem('accessToken', result.accessToken.split(' ')[1]);
        localStorage.setItem('permissions', JSON.stringify(result.permissions));
        setIsLoggedIn(true);
        setMessage('Login successful! Redirecting...');
        console.log(password);

        // Wait for 2 seconds before navigating to /get-started
        setTimeout(() => {
          navigate('/get-started');
        }, 2000);
      } else {
        console.log(password);
        setMessage(result.message || 'Username or password is invalid.');
      }
    } catch (error) {
      console.log(password);
      setMessage('An error occurred. Please try again later.');
      console.error('Error logging in:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <img src="../registry_logo.png" alt="Registry Logo" className="registry-logo" />
      <h1 className="login-title">Welcome Back</h1>

      <input
        type="text"
        className="login-input"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        aria-label="Enter your Username"
      />
      {usernameError && <div className="error-message">{usernameError}</div>}

      <input
        type="password"
        className="login-input"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        aria-label="Enter your Password"
      />
      {passwordError && <div className="error-message">{passwordError}</div>}

      <button
        className="login-button"
        onClick={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? 'Logging in...' : 'Login'}
      </button>

      {message && <div className={`message ${isLoggedIn ? 'success-message' : 'error-message'}`}>{message}</div>}
    </div>
  );
};

export default LoginPage;
