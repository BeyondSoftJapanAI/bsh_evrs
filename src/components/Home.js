import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
      title: t('home.dailyVisitor'),
      description: t('dailyVisitor.title'),
      icon: '👥',
      path: '/daily-visitor',
      condition: 'showDailyVisitorMenu'
    },
    {
      id: 'event-reception',
      title: t('home.eventReception'),
      description: t('eventReception.title'),
      icon: '🎪',
      path: '/event-reception',
      condition: 'showEventReceptionMenu'
    },
    {
      id: 'employee-attendance',
      title: t('home.employeeAttendance'),
      description: t('employeeAttendance.title'),
      icon: '👔',
      path: '/employee-attendance',
      condition: 'showEmployeeMenu'
    },
    {
      id: 'delivery',
      title: t('home.deliveryPersonnel'),
      description: t('deliveryPersonnel.title'),
      icon: '🚚',
      path: '/delivery',
      condition: 'showDeliveryMenu'
    },
    {
      id: 'interviewer',
      title: t('home.interviewer'),
      description: t('interviewer.title'),
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
        <h1 className="page-title">{t('home.title')}</h1>
        <p className="text-center" style={{ color: 'white', fontSize: '18px', marginBottom: '50px' }}>
          {t('home.subtitle')}
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