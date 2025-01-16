import React, { useEffect } from 'react';
import './Home.css';
import { LoginPageProps } from '../Login/Login';
import { useNavigate } from 'react-router-dom'; 

const Home: React.FC<LoginPageProps> = ({ setPermissions, setIsAdmin, setToken }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const resetLocalStorage = () => {
      localStorage.setItem('numApiCalls', '0');
      localStorage.setItem('accessToken', '');
      localStorage.setItem('permissions', JSON.stringify([]));
      localStorage.setItem('isAdmin', JSON.stringify([]));
    };

    resetLocalStorage();
    setIsAdmin([]);
    setPermissions([]);
    setToken('');
  }, [setIsAdmin, setPermissions, setToken]);

  return (
    <div className="home-container">
      <img src="../registry_logo.png" alt="Registry Logo" className="registry-logo" />
      <h1 className="home-title">Welcome to Group 15's Internal Package Registry</h1>
      <p className="home-text">
        Explore our features and enjoy a seamless experience with our platform.
      </p>
      <button className="nav-button" onClick={() => navigate('/login')} aria-label="Navigate to login page">
        Login
      </button>
    </div>
  );
};

export default Home;