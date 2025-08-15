import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      id: 'daily-visitor',
      title: '日常来訪者',
      description: 'アポあり・アポなしの来訪者受付',
      icon: '👥',
      path: '/daily-visitor'
    },
    {
      id: 'event-reception',
      title: 'イベント受付',
      description: 'QRコード・名刺による受付',
      icon: '🎫',
      path: '/event-reception'
    },
    {
      id: 'event-registration',
      title: 'イベント申し込み',
      description: 'イベント公開・申し込み受付',
      icon: '📝',
      path: '/event-registration'
    },
    {
      id: 'registration-management',
      title: '申込者管理',
      description: '申込者情報・統計管理',
      icon: '📊',
      path: '/registration-management'
    },
    {
      id: 'employee-attendance',
      title: '社員用',
      description: '入退室・打刻管理',
      icon: '👤',
      path: '/employee-attendance'
    },
    {
      id: 'delivery',
      title: '配送業者',
      description: '配送業者受付・通知',
      icon: '📦',
      path: '/delivery'
    },
    {
      id: 'interview',
      title: '面接者',
      description: '面接者受付・通知',
      icon: '💼',
      path: '/interview'
    },
    {
      id: 'admin',
      title: '管理画面',
      description: '履歴確認・設定管理',
      icon: '⚙️',
      path: '/admin'
    }
  ];

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