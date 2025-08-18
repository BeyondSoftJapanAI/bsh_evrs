import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import registrationService from '../services/registrationService';
import emailService from '../services/emailService';

const RegistrationManagement = () => {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadEvents();
    loadRegistrations();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      loadEventStatistics();
    }
  }, [selectedEvent, registrations]);

  const loadEvents = () => {
    try {
      const eventData = localStorage.getItem('events');
      if (eventData) {
        setEvents(JSON.parse(eventData));
      }
    } catch (error) {
      console.error('イベントデータの読み込みエラー:', error);
    }
  };

  const loadRegistrations = () => {
    const allRegistrations = registrationService.getAllRegistrations();
    setRegistrations(allRegistrations);
  };

  const loadEventStatistics = () => {
    if (selectedEvent) {
      const stats = registrationService.getEventStatistics(selectedEvent);
      setStatistics(stats);
    }
  };

  const handleEventChange = (eventId) => {
    setSelectedEvent(eventId);
    setSearchQuery('');
    setFilterStatus('all');
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleStatusFilter = (status) => {
    setFilterStatus(status);
  };

  const getFilteredRegistrations = () => {
    let filtered = selectedEvent 
      ? registrationService.getRegistrationsByEvent(selectedEvent)
      : registrations;

    if (searchQuery) {
      filtered = registrationService.searchRegistrations(searchQuery, selectedEvent);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(reg => reg.status === filterStatus);
    }

    return filtered;
  };

  const handleCheckIn = (registrationId) => {
    const updated = registrationService.checkInRegistration(registrationId);
    if (updated) {
      loadRegistrations();
      alert('チェックインが完了しました。');
    } else {
      alert('チェックインに失敗しました。');
    }
  };

  const handleCancel = (registrationId) => {
    const reason = prompt('キャンセル理由を入力してください（任意）:');
    const updated = registrationService.cancelRegistration(registrationId, reason || '');
    if (updated) {
      loadRegistrations();
      alert('申込がキャンセルされました。');
    }
  };

  const handleResendEmail = async (registration) => {
    try {
      const emailResult = await emailService.sendRegistrationConfirmation({
        ...registration,
        eventName: getEventName(registration.eventId),
        qrCode: registration.qrCode || generateQRCode(registration)
      });
      
      if (emailResult.success) {
        alert(`${registration.name}様にメールを再送信しました。`);
      } else {
        alert(`メール送信に失敗しました: ${emailResult.error}`);
      }
    } catch (error) {
      console.error('メール再送信エラー:', error);
      alert('メール送信中にエラーが発生しました。');
    }
  };

  const handleSendReminder = async (registration) => {
    try {
      const emailResult = await emailService.sendEventReminder({
        ...registration,
        eventName: getEventName(registration.eventId)
      });
      
      if (emailResult.success) {
        alert(`${registration.name}様にリマインダーメールを送信しました。`);
      } else {
        alert(`リマインダー送信に失敗しました: ${emailResult.error}`);
      }
    } catch (error) {
      console.error('リマインダー送信エラー:', error);
      alert('リマインダー送信中にエラーが発生しました。');
    }
  };

  const generateQRCode = (registration) => {
    return `EVENT:${registration.eventId}|REG:${registration.id}|NAME:${registration.name}|COMPANY:${registration.company}`;
  };

  const getEventName = (eventId) => {
    const eventNames = {
      'event001': '2025年度経営方針説明会',
      'event002': 'DX推進セミナー',
      'event003': '新製品発表会'
    };
    return eventNames[eventId] || 'イベント';
  };

  const handleExportCSV = () => {
    const csvData = registrationService.exportToCSV(selectedEvent);
    if (csvData) {
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `申込者一覧_${selectedEvent || 'all'}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert('エクスポートするデータがありません。');
    }
  };

  const handleViewDetails = (registration) => {
    setSelectedRegistration(registration);
    setShowDetails(true);
  };

  const getSelectedEventName = () => {
    const event = events.find(e => e.id === selectedEvent);
    return event ? event.title : '全イベント';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ja-JP');
  };

  const getStatusBadge = (status) => {
    const badges = {
      'registered': { class: 'status-registered', text: '申込済' },
      'attended': { class: 'status-attended', text: '参加済' },
      'cancelled': { class: 'status-cancelled', text: 'キャンセル' }
    };
    const badge = badges[status] || { class: 'status-unknown', text: status };
    return <span className={`status-badge ${badge.class}`}>{badge.text}</span>;
  };

  const filteredRegistrations = getFilteredRegistrations();

  return (
    <div className="main-content">
      <button className="back-button" onClick={() => navigate('/admin')}>
        ← 管理画面
      </button>
      
      <div className="container">
        <h1 className="page-title">申込者情報管理</h1>
        
        {/* 検索・フィルター */}
        <div className="registration-controls">
          <div className="control-row">
            <div className="form-group">
              <label>イベント選択:</label>
              <select 
                value={selectedEvent} 
                onChange={(e) => handleEventChange(e.target.value)}
                className="form-control"
              >
                <option value="">全イベント</option>
                {events.map(event => (
                  <option key={event.id} value={event.id}>{event.title}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>検索:</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="氏名、メール、会社名で検索"
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label>ステータス:</label>
              <select 
                value={filterStatus} 
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="form-control"
              >
                <option value="all">全て</option>
                <option value="registered">申込済</option>
                <option value="attended">参加済</option>
                <option value="cancelled">キャンセル</option>
              </select>
            </div>
          </div>
          
          <div className="control-actions">
            <button onClick={handleExportCSV} className="btn btn-secondary">
              📊 CSV出力
            </button>
          </div>
        </div>

        {/* 統計情報 */}
        {statistics && (
          <div className="statistics-panel">
            <h3>申込状況 - {getSelectedEventName()}</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number">{statistics.total}</span>
                <span className="stat-label">総申込数</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{statistics.registered}</span>
                <span className="stat-label">申込済</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{statistics.attended}</span>
                <span className="stat-label">参加済</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{statistics.cancelled}</span>
                <span className="stat-label">キャンセル</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{statistics.checkInRate}%</span>
                <span className="stat-label">参加率</span>
              </div>
            </div>
          </div>
        )}

        {/* 申込者一覧 */}
        <div className="registrations-list">
          <h3>申込者一覧 ({filteredRegistrations.length}件)</h3>
          
          {filteredRegistrations.length === 0 ? (
            <div className="no-data">
              <p>申込者データがありません。</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="registrations-table">
                <thead>
                  <tr>
                    <th>氏名</th>
                    <th>メールアドレス</th>
                    <th>会社名</th>
                    <th>申込日時</th>
                    <th>ステータス</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegistrations.map(registration => (
                    <tr key={registration.id}>
                      <td>
                        <div className="name-cell">
                          <strong>{registration.name}</strong>
                          {registration.furigana && (
                            <small>({registration.furigana})</small>
                          )}
                        </div>
                      </td>
                      <td>{registration.email}</td>
                      <td>{registration.company || '-'}</td>
                      <td>{formatDate(registration.registeredAt)}</td>
                      <td>{getStatusBadge(registration.status)}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            onClick={() => handleViewDetails(registration)}
                            className="btn btn-sm btn-info"
                            title="詳細表示"
                          >
                            👁️
                          </button>
                          {registration.status === 'registered' && (
                            <button 
                              onClick={() => handleCheckIn(registration.id)}
                              className="btn btn-sm btn-success"
                              title="チェックイン"
                            >
                              ✅
                            </button>
                          )}
                          {registration.status === 'registered' && (
                            <button 
                              onClick={() => handleCancel(registration.id)}
                              className="btn btn-sm btn-danger"
                              title="キャンセル"
                            >
                              ❌
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleResendEmail(registration)}
                            title="メール再送信"
                          >
                            📧
                          </button>
                          <button
                            className="btn btn-sm"
                            onClick={() => handleSendReminder(registration)}
                            title="リマインダー"
                          >
                            🔔
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 詳細モーダル */}
        {showDetails && selectedRegistration && (
          <div className="modal-overlay" onClick={() => setShowDetails(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>申込者詳細情報</h3>
                <button 
                  onClick={() => setShowDetails(false)}
                  className="modal-close"
                >
                  ×
                </button>
              </div>
              
              <div className="modal-body">
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>申込ID:</label>
                    <span>{selectedRegistration.id}</span>
                  </div>
                  <div className="detail-item">
                    <label>氏名:</label>
                    <span>{selectedRegistration.name}</span>
                  </div>
                  <div className="detail-item">
                    <label>フリガナ:</label>
                    <span>{selectedRegistration.furigana || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <label>メールアドレス:</label>
                    <span>{selectedRegistration.email}</span>
                  </div>
                  <div className="detail-item">
                    <label>電話番号:</label>
                    <span>{selectedRegistration.phone || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <label>会社名:</label>
                    <span>{selectedRegistration.company || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <label>部署:</label>
                    <span>{selectedRegistration.department || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <label>役職:</label>
                    <span>{selectedRegistration.position || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <label>申込日時:</label>
                    <span>{formatDate(selectedRegistration.registeredAt)}</span>
                  </div>
                  <div className="detail-item">
                    <label>ステータス:</label>
                    <span>{getStatusBadge(selectedRegistration.status)}</span>
                  </div>
                  {selectedRegistration.checkInTime && (
                    <div className="detail-item">
                      <label>チェックイン日時:</label>
                      <span>{formatDate(selectedRegistration.checkInTime)}</span>
                    </div>
                  )}
                  {selectedRegistration.cancelledAt && (
                    <div className="detail-item">
                      <label>キャンセル日時:</label>
                      <span>{formatDate(selectedRegistration.cancelledAt)}</span>
                    </div>
                  )}
                  {selectedRegistration.cancelReason && (
                    <div className="detail-item">
                      <label>キャンセル理由:</label>
                      <span>{selectedRegistration.cancelReason}</span>
                    </div>
                  )}
                  <div className="detail-item full-width">
                    <label>QRコード:</label>
                    <textarea 
                      value={selectedRegistration.qrCode} 
                      readOnly 
                      className="qr-code-text"
                    />
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  onClick={() => setShowDetails(false)}
                  className="btn btn-secondary"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationManagement;