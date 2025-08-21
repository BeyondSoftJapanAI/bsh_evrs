import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './App.css';
import './i18n';
import Login from './components/Login';
import Home from './components/Home';
import DailyVisitor from './components/DailyVisitor';
import EventReception from './components/EventReception';
import EventRegistration from './components/EventRegistration';
import RegistrationManagement from './components/RegistrationManagement';
import EmployeeAttendance from './components/EmployeeAttendance';
import DeliveryPersonnel from './components/DeliveryPersonnel';
import Interviewer from './components/Interviewer';
import Admin from './components/Admin';
import EventManagement from './components/EventManagement';
import LanguageSwitcher from './components/LanguageSwitcher';

// Admin Button Component
const AdminButton = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const handleAdminClick = () => {
    navigate('/admin');
  };
  
  return (
    <button onClick={handleAdminClick} className="admin-button" title={t('header.adminPanel')}>
      ⚙️
    </button>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

  // Check for existing session on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('bsh_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('bsh_user');
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('bsh_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('bsh_user');
  };

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="App">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '18px',
          color: '#666'
        }}>
          読み込み中...
        </div>
      </div>
    );
  }

  // If not logged in, show login page
  if (!user) {
    return (
      <div className="App">
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  // If logged in, show main application
  return (
    <Router>
      <div className="App">
        <div className="app-header">
          <div className="header-content">
            <div className="logo-section">
              <img src="/beyondsoft-logo.svg" alt="BEYONDSOFT" className="header-logo" />
            </div>
            <div className="user-info">
              <span>{t('header.welcome')}、{user.username}さん</span>
              <LanguageSwitcher />
              <AdminButton />
              <button onClick={handleLogout} className="logout-button">
                {t('common.logout')}
              </button>
            </div>
          </div>
        </div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/daily-visitor" element={<DailyVisitor />} />
          <Route path="/event-reception" element={<EventReception />} />
          <Route path="/event-registration" element={<EventRegistration />} />
          <Route path="/registration-management" element={<RegistrationManagement />} />
          <Route path="/employee-attendance" element={<EmployeeAttendance />} />
          <Route path="/delivery" element={<DeliveryPersonnel />} />
          <Route path="/interview" element={<Interviewer />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/event-management" element={<EventManagement />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;