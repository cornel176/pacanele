import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.username, formData.email, formData.password);
      }
      navigate('/');
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.error || 'A apărut o eroare. Vă rugăm să încercați din nou.');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setFormData({
      username: '',
      email: '',
      password: ''
    });
    navigate(isLogin ? '/register' : '/login');
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-content">
          <div className="auth-header">
            
            <h1>{isLogin ? 'Bine ai revenit!' : 'Creează cont'}</h1>
            <p className="auth-subtitle">
              {isLogin 
                ? 'Autentifică-te pentru a continua' 
                : 'Completează formularul pentru a crea un cont nou'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="form-group">
                <input
                  id="username"
                  type="text"
                  name="username"
                  value={formData.username}
                  placeholder="Nume utilizator"
                  onChange={handleChange}
                  required
                  className="auth-input"
                />
              </div>
            )}

            <div className="form-group">
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                placeholder="Adresa de email"
                onChange={handleChange}
                required
                className="auth-input"
              />
            </div>

            <div className="form-group">
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                placeholder="Parola"
                onChange={handleChange}
                required
                className="auth-input"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            {isLogin && (
              <button type="button" className="forgot-password">
                Ai uitat parola?
              </button>
            )}

            <button type="submit" className="submit-button">
              {isLogin ? 'Autentificare' : 'Înregistrare'}
            </button>

            <div className="auth-divider">
              <span>sau</span>
            </div>

            <button type="button" onClick={toggleMode} className="toggle-button">
              {isLogin ? 'Creează un cont nou' : 'Ai deja un cont? Autentifică-te'}
            </button>
          </form>
        </div>

        <div className="auth-image">
          <div className="image-overlay">
            <h2>Hello</h2>
          </div>
        </div>
      </div>
    </div>
  );
} 