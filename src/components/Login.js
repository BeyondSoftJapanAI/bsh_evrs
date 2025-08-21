import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './Login.css';

const Login = ({ onLogin }) => {
  const { t } = useTranslation();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Basic validation
    if (!credentials.username || !credentials.password) {
      setError(t('login.invalidCredentials'));
      setIsLoading(false);
      return;
    }

    try {
      // Simulate API call - replace with actual authentication logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Demo credentials - replace with actual authentication
      if (credentials.username === 'admin' && credentials.password === 'password') {
        onLogin({
          username: credentials.username,
          role: 'admin',
          loginTime: new Date().toISOString()
        });
      } else {
        setError(t('login.invalidCredentials'));
      }
    } catch (err) {
      setError(t('login.invalidCredentials'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>{t('login.title')}</h1>
          <h2>{t('common.login')}</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">{t('login.username')}</label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleInputChange}
              placeholder={t('login.username')}
              disabled={isLoading}
              autoComplete="username"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">{t('login.password')}</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleInputChange}
              placeholder={t('login.password')}
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? t('common.loading') : t('login.loginButton')}
          </button>
        </form>
        
        <div className="login-footer">
          <p>デモ用認証情報:</p>
          <p>ユーザー名: admin</p>
          <p>パスワード: password</p>
        </div>
      </div>
    </div>
  );
};

export default Login;