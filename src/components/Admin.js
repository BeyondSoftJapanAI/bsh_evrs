import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const navigate = useNavigate();
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
      message: '田中様が来訪されました（営業部・佐藤様との面談）',
      time: '14:30',
      status: 'completed'
    },
    {
      id: 2,
      type: 'event',
      message: 'DX推進セミナーの受付が開始されました',
      time: '14:15',
      status: 'active'
    },
    {
      id: 3,
      type: 'delivery',
      message: 'ヤマト運輸からの配送物が到着しました',
      time: '13:45',
      status: 'completed'
    },
    {
      id: 4,
      type: 'employee',
      message: '山田太郎さんが出勤時刻修正を申請しました',
      time: '13:20',
      status: 'pending'
    },
    {
      id: 5,
      type: 'interview',
      message: '新卒採用面接（エンジニア職）が完了しました',
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
    
    alert(`${type}データをエクスポートしました。`);
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
    
    alert('システムバックアップが完了しました。');
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
    alert('設定が保存されました。');
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
        ← ホーム
      </button>
      
      <div className="container">
        <h1 className="page-title">管理画面</h1>
        
        {/* 統計情報 */}
        <div className="admin-stats">
          <h2>今日の統計</h2>
          <div className="grid grid-4">
            <div className="stat-card">
              <h3>{stats.todayVisitors}</h3>
              <p>来訪者</p>
            </div>
            <div className="stat-card">
              <h3>{stats.todayEvents}</h3>
              <p>イベント</p>
            </div>
            <div className="stat-card">
              <h3>{stats.todayEmployees}</h3>
              <p>出勤者</p>
            </div>
            <div className="stat-card">
              <h3>{stats.todayDeliveries}</h3>
              <p>配送</p>
            </div>
          </div>
        </div>
        
        {/* 管理機能 */}
        <div className="admin-functions">
          <h2>管理機能</h2>
          <div className="grid grid-3">
            <div className="card">
              <h3>📅 イベント管理</h3>
              <p>イベントの作成・編集・QRコード生成</p>
              <button 
                className="btn btn-large" 
                onClick={() => navigate('/event-management')}
              >
                イベント管理
              </button>
            </div>
            
            <div className="card">
              <h3>📝 イベント申し込み</h3>
              <p>イベントへの申し込み管理</p>
              <button 
                className="btn btn-large" 
                onClick={() => navigate('/event-registration')}
              >
                イベント申し込み
              </button>
            </div>
            
            <div className="card">
              <h3>📊 申込者管理</h3>
              <p>イベント申込者の管理・統計</p>
              <button 
                className="btn btn-large" 
                onClick={() => navigate('/registration-management')}
              >
                申込者管理
              </button>
            </div>
            
            <div className="card">
              <h3>⚙️ システム設定</h3>
              <p>システム全体の設定・メニュー表示制御</p>
              <button 
                className="btn btn-large" 
                onClick={() => {
                  const settingsSection = document.getElementById('system-settings-section');
                  if (settingsSection) {
                    settingsSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                システム設定
              </button>
            </div>
          </div>
          
          <div className="grid grid-2" style={{ marginTop: '20px' }}>
            <div className="card">
              <h3>📊 データエクスポート</h3>
              <p>各種データのエクスポート機能</p>
              <div className="mt-2">
                <button 
                  className="btn" 
                  onClick={() => handleExportData('visitors')}
                  style={{ marginRight: '5px', marginBottom: '5px' }}
                >
                  来訪者
                </button>
                <button 
                  className="btn" 
                  onClick={() => handleExportData('events')}
                  style={{ marginRight: '5px', marginBottom: '5px' }}
                >
                  イベント
                </button>
                <button 
                  className="btn" 
                  onClick={() => handleExportData('attendance')}
                  style={{ marginRight: '5px', marginBottom: '5px' }}
                >
                  勤怠
                </button>
              </div>
            </div>
            
            <div className="card">
              <h3>🔧 システム管理</h3>
              <p>バックアップ・設定管理</p>
              <button 
                className="btn btn-large" 
                onClick={handleSystemBackup}
              >
                システムバックアップ
              </button>
            </div>
          </div>
        </div>
        
        {/* 最近のアクティビティ */}
        <div className="recent-activities">
          <h2>最近のアクティビティ</h2>
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
          <h2>システム設定</h2>
          <div className="form-card">
            <div className="form-group">
              <label className="form-label">会社名</label>
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
              <label className="form-label">QRコード有効期限（時間）</label>
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
                自動バックアップを有効にする
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
                Teams通知を有効にする
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
                顔認証機能を有効にする
              </label>
            </div>
            
            <h4 style={{ marginTop: '20px', marginBottom: '15px', color: '#333' }}>メニュー表示設定</h4>
            
            <div className="form-group">
              <label className="form-label">
                <input
                  type="checkbox"
                  checked={systemSettings.showDailyVisitorMenu}
                  onChange={(e) => handleSettingChange('showDailyVisitorMenu', e.target.checked)}
                  style={{ marginRight: '8px' }}
                />
                日常来訪者メニューを表示する
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
                イベント受付メニューを表示する
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
                社員用メニューを表示する
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
                配送業者メニューを表示する
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
                面接者メニューを表示する
              </label>
            </div>
            
            <div className="text-center">
              <button className="btn btn-large" onClick={saveSettings}>
                設定を保存
              </button>
            </div>
          </div>
        </div>
        
        {/* システム情報 */}
        <div className="system-info">
          <h2>システム情報</h2>
          <div className="grid grid-2">
            <div className="info-card">
              <h4>今月の統計</h4>
              <p>総来訪者数: {stats.totalVisitorsThisMonth}名</p>
              <p>総イベント数: {stats.totalEventsThisMonth}件</p>
            </div>
            <div className="info-card">
              <h4>システム状態</h4>
              <p>稼働率: {stats.systemUptime}</p>
              <p>バージョン: 1.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;