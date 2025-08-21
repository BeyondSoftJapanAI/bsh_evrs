import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Admin = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    todayVisitors: 23,
    todayEvents: 2,
    todayEmployees: 156,
    todayDeliveries: 8,
    todayInterviews: 3,
    totalVisitorsThisMonth: 456,
    totalEventsThisMonth: 12,
    systemUptime: '99.8%'
  });

  const [recentActivities] = useState([
    {
      id: 1,
      type: 'visitor',
      message: t('admin.recentActivities.visitorMeeting'),
      time: '14:30',
      status: 'completed'
    },
    {
      id: 2,
      type: 'event',
      message: t('admin.recentActivities.eventStarted'),
      time: '14:15',
      status: 'active'
    },
    {
      id: 3,
      type: 'delivery',
      message: t('admin.recentActivities.deliveryArrived'),
      time: '13:45',
      status: 'completed'
    },
    {
      id: 4,
      type: 'employee',
      message: t('admin.recentActivities.attendanceRequest'),
      time: '13:20',
      status: 'pending'
    },
    {
      id: 5,
      type: 'interview',
      message: t('admin.recentActivities.interviewCompleted'),
      time: '12:30',
      status: 'completed'
    }
  ]);

  const [systemSettings, setSystemSettings] = useState({
    companyName: '株式会社サンプル',
    companyLogo: '',
    teamsWebhookUrl: 'https://outlook.office.com/webhook/...',
    defaultLanguage: 'ja',
    autoBackup: true,
    notificationEnabled: true,
    faceRecognitionEnabled: true,
    qrCodeExpiry: 24, // hours
    showDailyVisitorMenu: true,
    showEventReceptionMenu: true,
    showEmployeeMenu: false,
    showDeliveryMenu: true,
    showInterviewerMenu: false
  });

  const handleExportData = (type) => {
    const exportData = {
      type: type,
      exportDate: new Date().toISOString(),
      data: [] // 実際の実装では対応するデータを含める
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}_export_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    alert(t('admin.alerts.dataExported', { type }));
  };

  const handleSystemBackup = () => {
    // システムバックアップの模擬
    const backupData = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      settings: systemSettings,
      stats: stats
    };
    
    const dataStr = JSON.stringify(backupData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `system_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    alert(t('admin.alerts.backupCompleted'));
  };

  const handleSettingChange = (key, value) => {
    setSystemSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = () => {
    // 設定をlocalStorageに保存
    localStorage.setItem('systemSettings', JSON.stringify(systemSettings));
    console.log('設定保存:', systemSettings);
    alert(t('admin.alerts.settingsSaved'));
  };

  // コンポーネントマウント時に設定を読み込み
  React.useEffect(() => {
    const savedSettings = localStorage.getItem('systemSettings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSystemSettings(prev => ({ ...prev, ...parsedSettings }));
    }
  }, []);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'visitor': return '👤';
      case 'event': return '📅';
      case 'delivery': return '📦';
      case 'employee': return '👔';
      case 'interview': return '💼';
      default: return '📋';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#28a745';
      case 'active': return '#007bff';
      case 'pending': return '#ffc107';
      default: return '#6c757d';
    }
  };

  return (
    <div className="main-content">
      <button className="back-button" onClick={() => navigate('/')}>
        ← {t('common.home')}
      </button>
      
      <div className="container">
        <h1 className="page-title">{t('admin.title')}</h1>
        
        {/* 統計情報 */}
        <div className="admin-stats">
          <h2>{t('admin.todayStats')}</h2>
          <div className="grid grid-4">
            <div className="stat-card">
              <h3>{stats.todayVisitors}</h3>
              <p>{t('admin.stats.visitors')}</p>
            </div>
            <div className="stat-card">
              <h3>{stats.todayEvents}</h3>
              <p>{t('admin.stats.events')}</p>
            </div>
            <div className="stat-card">
              <h3>{stats.todayEmployees}</h3>
              <p>{t('admin.stats.employees')}</p>
            </div>
            <div className="stat-card">
              <h3>{stats.todayDeliveries}</h3>
              <p>{t('admin.stats.deliveries')}</p>
            </div>
          </div>
        </div>
        
        {/* 管理機能 */}
        <div className="admin-functions">
          <h2>{t('admin.managementFunctions')}</h2>
          <div className="grid grid-3">
            <div className="card">
              <h3>📅 {t('admin.functions.eventManagement.title')}</h3>
              <p>{t('admin.functions.eventManagement.description')}</p>
              <button 
                className="btn btn-large" 
                onClick={() => navigate('/event-management')}
              >
                {t('admin.functions.eventManagement.button')}
              </button>
            </div>
            
            <div className="card">
              <h3>📝 {t('admin.functions.eventRegistration.title')}</h3>
              <p>{t('admin.functions.eventRegistration.description')}</p>
              <button 
                className="btn btn-large" 
                onClick={() => navigate('/event-registration')}
              >
                {t('admin.functions.eventRegistration.button')}
              </button>
            </div>
            
            <div className="card">
              <h3>📊 {t('admin.functions.registrationManagement.title')}</h3>
              <p>{t('admin.functions.registrationManagement.description')}</p>
              <button 
                className="btn btn-large" 
                onClick={() => navigate('/registration-management')}
              >
                {t('admin.functions.registrationManagement.button')}
              </button>
            </div>
            
            <div className="card">
              <h3>⚙️ {t('admin.functions.systemSettings.title')}</h3>
              <p>{t('admin.functions.systemSettings.description')}</p>
              <button 
                className="btn btn-large" 
                onClick={() => {
                  const settingsSection = document.getElementById('system-settings-section');
                  if (settingsSection) {
                    settingsSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                {t('admin.functions.systemSettings.button')}
              </button>
            </div>
          </div>
          
          <div className="grid grid-2" style={{ marginTop: '20px' }}>
            <div className="card">
              <h3>📊 {t('admin.functions.dataExport.title')}</h3>
              <p>{t('admin.functions.dataExport.description')}</p>
              <div className="mt-2">
                <button 
                  className="btn" 
                  onClick={() => handleExportData('visitors')}
                  style={{ marginRight: '5px', marginBottom: '5px' }}
                >
                  {t('admin.functions.dataExport.visitors')}
                </button>
                <button 
                  className="btn" 
                  onClick={() => handleExportData('events')}
                  style={{ marginRight: '5px', marginBottom: '5px' }}
                >
                  {t('admin.functions.dataExport.events')}
                </button>
                <button 
                  className="btn" 
                  onClick={() => handleExportData('attendance')}
                  style={{ marginRight: '5px', marginBottom: '5px' }}
                >
                  {t('admin.functions.dataExport.attendance')}
                </button>
              </div>
            </div>
            
            <div className="card">
              <h3>🔧 {t('admin.functions.systemManagement.title')}</h3>
              <p>{t('admin.functions.systemManagement.description')}</p>
              <button 
                className="btn btn-large" 
                onClick={handleSystemBackup}
              >
                {t('admin.functions.systemManagement.button')}
              </button>
            </div>
          </div>
        </div>
        
        {/* 最近のアクティビティ */}
        <div className="recent-activities">
          <h2>{t('admin.recentActivities.title')}</h2>
          <div className="activity-list">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="activity-content">
                  <p>{activity.message}</p>
                  <small>{activity.time}</small>
                </div>
                <div 
                  className="activity-status"
                  style={{ color: getStatusColor(activity.status) }}
                >
                  ●
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* システム設定 */}
        <div className="system-settings" id="system-settings-section">
          <h2>{t('admin.systemSettings.title')}</h2>
          <div className="form-card">
            <div className="form-group">
              <label className="form-label">{t('admin.systemSettings.companyName')}</label>
              <input
                type="text"
                className="form-input"
                value={systemSettings.companyName}
                onChange={(e) => handleSettingChange('companyName', e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Teams Webhook URL</label>
              <input
                type="url"
                className="form-input"
                value={systemSettings.teamsWebhookUrl}
                onChange={(e) => handleSettingChange('teamsWebhookUrl', e.target.value)}
                placeholder="https://outlook.office.com/webhook/..."
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">{t('admin.systemSettings.qrCodeExpiry')}</label>
              <input
                type="number"
                className="form-input"
                value={systemSettings.qrCodeExpiry}
                onChange={(e) => handleSettingChange('qrCodeExpiry', parseInt(e.target.value))}
                min="1"
                max="168"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <input
                  type="checkbox"
                  checked={systemSettings.autoBackup}
                  onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
                  style={{ marginRight: '8px' }}
                />
                {t('admin.systemSettings.enableAutoBackup')}
              </label>
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <input
                  type="checkbox"
                  checked={systemSettings.notificationEnabled}
                  onChange={(e) => handleSettingChange('notificationEnabled', e.target.checked)}
                  style={{ marginRight: '8px' }}
                />
                {t('admin.systemSettings.enableTeamsNotification')}
              </label>
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <input
                  type="checkbox"
                  checked={systemSettings.faceRecognitionEnabled}
                  onChange={(e) => handleSettingChange('faceRecognitionEnabled', e.target.checked)}
                  style={{ marginRight: '8px' }}
                />
                {t('admin.systemSettings.enableFaceRecognition')}
              </label>
            </div>
            
            <h4 style={{ marginTop: '20px', marginBottom: '15px', color: '#333' }}>{t('admin.systemSettings.menuDisplaySettings')}</h4>
            
            <div className="form-group">
              <label className="form-label">
                <input
                  type="checkbox"
                  checked={systemSettings.showDailyVisitorMenu}
                  onChange={(e) => handleSettingChange('showDailyVisitorMenu', e.target.checked)}
                  style={{ marginRight: '8px' }}
                />
                {t('admin.systemSettings.showDailyVisitorMenu')}
              </label>
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <input
                  type="checkbox"
                  checked={systemSettings.showEventReceptionMenu}
                  onChange={(e) => handleSettingChange('showEventReceptionMenu', e.target.checked)}
                  style={{ marginRight: '8px' }}
                />
                {t('admin.systemSettings.showEventReceptionMenu')}
              </label>
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <input
                  type="checkbox"
                  checked={systemSettings.showEmployeeMenu}
                  onChange={(e) => handleSettingChange('showEmployeeMenu', e.target.checked)}
                  style={{ marginRight: '8px' }}
                />
                {t('admin.systemSettings.showEmployeeMenu')}
              </label>
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <input
                  type="checkbox"
                  checked={systemSettings.showDeliveryMenu}
                  onChange={(e) => handleSettingChange('showDeliveryMenu', e.target.checked)}
                  style={{ marginRight: '8px' }}
                />
                {t('admin.systemSettings.showDeliveryMenu')}
              </label>
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <input
                  type="checkbox"
                  checked={systemSettings.showInterviewerMenu}
                  onChange={(e) => handleSettingChange('showInterviewerMenu', e.target.checked)}
                  style={{ marginRight: '8px' }}
                />
                {t('admin.systemSettings.showInterviewerMenu')}
              </label>
            </div>
            
            <div className="text-center">
              <button className="btn btn-large" onClick={saveSettings}>
                {t('admin.systemSettings.saveSettings')}
              </button>
            </div>
          </div>
        </div>
        
        {/* システム情報 */}
        <div className="system-info">
          <h2>{t('admin.systemInfo.title')}</h2>
          <div className="grid grid-2">
            <div className="info-card">
              <h4>{t('admin.systemInfo.monthlyStats')}</h4>
              <p>{t('admin.systemInfo.totalVisitors', { count: stats.totalVisitorsThisMonth })}</p>
              <p>{t('admin.systemInfo.totalEvents', { count: stats.totalEventsThisMonth })}</p>
            </div>
            <div className="info-card">
              <h4>{t('admin.systemInfo.systemStatus')}</h4>
              <p>{t('admin.systemInfo.uptime', { uptime: stats.systemUptime })}</p>
              <p>{t('admin.systemInfo.version')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;