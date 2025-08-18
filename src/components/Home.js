import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [menuSettings, setMenuSettings] = useState({
    showDailyVisitorMenu: true,
    showEventReceptionMenu: true,
    showEmployeeMenu: false,
    showDeliveryMenu: true,
    showInterviewerMenu: false
  });

  // 設定を読み込み
  useEffect(() => {
    const savedSettings = localStorage.getItem('systemSettings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setMenuSettings({
        showDailyVisitorMenu: parsedSettings.showDailyVisitorMenu !== undefined ? parsedSettings.showDailyVisitorMenu : true,
        showEventReceptionMenu: parsedSettings.showEventReceptionMenu !== undefined ? parsedSettings.showEventReceptionMenu : true,
        showEmployeeMenu: parsedSettings.showEmployeeMenu || false,
        showDeliveryMenu: parsedSettings.showDeliveryMenu !== undefined ? parsedSettings.showDeliveryMenu : true,
        showInterviewerMenu: parsedSettings.showInterviewerMenu || false
      });
    }
  }, []);

  const allMenuItems = [
    {
      id: 'daily-visitor',
      title: '日常来訪者',
      description: '日常の来訪者受付',
      icon: '👥',
      path: '/daily-visitor',
      condition: 'showDailyVisitorMenu'
    },
    {
      id: 'event-reception',
      title: 'イベント受付',
      description: 'イベント参加者の受付',
      icon: '🎪',
      path: '/event-reception',
      condition: 'showEventReceptionMenu'
    },
    {
      id: 'employee-attendance',
      title: '社員用',
      description: '社員の出退勤管理',
      icon: '👔',
      path: '/employee-attendance',
      condition: 'showEmployeeMenu'
    },
    {
      id: 'delivery',
      title: '配送業者',
      description: '配送業者の受付',
      icon: '🚚',
      path: '/delivery',
      condition: 'showDeliveryMenu'
    },
    {
      id: 'interviewer',
      title: '面接者',
      description: '面接者の受付',
      icon: '💼',
      path: '/interviewer',
      condition: 'showInterviewerMenu'
    },

  ];

  // 設定に基づいてメニュー項目をフィルタリング
  const menuItems = allMenuItems.filter(item => {
    if (item.condition) {
      return menuSettings[item.condition];
    }
    return true;
  });

  const handleCardClick = (path) => {
    navigate(path);
  };

  return (
    <div className="main-content">
      <div className="container">
        <h1 className="page-title">BSH EVRS</h1>
        <p className="text-center" style={{ color: 'white', fontSize: '18px', marginBottom: '50px' }}>
          Event & Visitor Reception System - 受付システム
        </p>
        
        <div className="home-grid">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className="home-card"
              onClick={() => handleCardClick(item.path)}
            >
              <span className="home-card-icon">{item.icon}</span>
              <h3 className="home-card-title">{item.title}</h3>
              <p className="home-card-description">{item.description}</p>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-4">
          <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
            © 2025 DX推進部 - BSH Event & Visitor Reception System
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;