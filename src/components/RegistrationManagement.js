import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import registrationService from '../services/registrationService';
import emailService from '../services/emailService';

const RegistrationManagement = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
      alert(t('registrationManagement.checkInCompleted'));
    } else {
      alert(t('registrationManagement.checkInFailed'));
    }
  };

  const handleCancel = (registrationId) => {
    const reason = prompt(t('registrationManagement.enterCancelReason'));
    const updated = registrationService.cancelRegistration(registrationId, reason || '');
    if (updated) {
      loadRegistrations();
      alert(t('registrationManagement.registrationCancelled'));
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
        alert(t('registrationManagement.emailResent', { name: registration.name }));
      } else {
        alert(t('registrationManagement.emailSendFailed', { error: emailResult.error }));
      }
    } catch (error) {
      console.error('メール再送信エラー:', error);
      alert(t('registrationManagement.emailSendError'));
    }
  };

  const handleSendReminder = async (registration) => {
    try {
      const emailResult = await emailService.sendEventReminder({
        ...registration,
        eventName: getEventName(registration.eventId)
      });
      
      if (emailResult.success) {
        alert(t('registrationManagement.reminderSent', { name: registration.name }));
      } else {
        alert(t('registrationManagement.reminderSendFailed', { error: emailResult.error }));
      }
    } catch (error) {
      console.error('リマインダー送信エラー:', error);
      alert(t('registrationManagement.reminderSendError'));
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
      alert(t('registrationManagement.noDataToExport'));
    }
  };

  const handleViewDetails = (registration) => {
    setSelectedRegistration(registration);
    setShowDetails(true);
  };

  const getSelectedEventName = () => {
    const event = events.find(e => e.id === selectedEvent);
    return event ? event.title : t('registrationManagement.allEvents');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ja-JP');
  };

  const getStatusBadge = (status) => {
    const badges = {
      'registered': { class: 'status-registered', text: t('registrationManagement.registered') },
      'attended': { class: 'status-attended', text: t('registrationManagement.attended') },
      'cancelled': { class: 'status-cancelled', text: t('registrationManagement.cancelled') }
    };
    const badge = badges[status] || { class: 'status-unknown', text: status };
    return <span className={`status-badge ${badge.class}`}>{badge.text}</span>;
  };

  const filteredRegistrations = getFilteredRegistrations();

  return (
    <div className="main-content">
      <button className="back-button" onClick={() => navigate('/admin')}>
        {t('common.backToAdmin')}
      </button>
      
      <div className="container">
        <h1 className="page-title">{t('registrationManagement.title')}</h1>
        
        {/* 検索・フィルター */}
        <div className="registration-controls">
          <div className="control-row">
            <div className="form-group">
              <label>{t('registrationManagement.filterByEvent')}:</label>
              <select 
                value={selectedEvent} 
                onChange={(e) => handleEventChange(e.target.value)}
                className="form-control"
              >
                <option value="">{t('registrationManagement.allEvents')}</option>
                {events.map(event => (
                  <option key={event.id} value={event.id}>{event.title}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>{t('registrationManagement.search')}:</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder={t('registrationManagement.searchPlaceholder')}
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label>{t('registrationManagement.filterByStatus')}:</label>
              <select 
                value={filterStatus} 
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="form-control"
              >
                <option value="all">{t('registrationManagement.allStatuses')}</option>
                <option value="registered">{t('registrationManagement.registered')}</option>
                <option value="attended">{t('registrationManagement.attended')}</option>
                <option value="cancelled">{t('registrationManagement.cancelled')}</option>
              </select>
            </div>
          </div>
          
          <div className="control-actions">
            <button onClick={handleExportCSV} className="btn btn-secondary">
              📊 {t('registrationManagement.exportCSV')}
            </button>
          </div>
        </div>

        {/* 統計情報 */}
        {statistics && (
          <div className="statistics-panel">
            <h3>{t('registrationManagement.eventStatistics')} - {getSelectedEventName()}</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number">{statistics.total}</span>
                <span className="stat-label">{t('registrationManagement.totalRegistrations')}</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{statistics.registered}</span>
                <span className="stat-label">{t('registrationManagement.registered')}</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{statistics.attended}</span>
                <span className="stat-label">{t('registrationManagement.attended')}</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{statistics.cancelled}</span>
                <span className="stat-label">{t('registrationManagement.cancelled')}</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{statistics.checkInRate}%</span>
                <span className="stat-label">{t('registrationManagement.attendanceRate')}</span>
              </div>
            </div>
          </div>
        )}

        {/* 申込者一覧 */}
        <div className="registrations-list">
          <h3>{t('registrationManagement.registrationsList')} ({filteredRegistrations.length}{t('registrationManagement.items')})</h3>
          
          {filteredRegistrations.length === 0 ? (
            <div className="no-data">
              <p>{t('registrationManagement.noData')}</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="registrations-table">
                <thead>
                  <tr>
                    <th>{t('registrationManagement.name')}</th>
                    <th>{t('registrationManagement.email')}</th>
                    <th>{t('registrationManagement.company')}</th>
                    <th>{t('registrationManagement.registrationDate')}</th>
                    <th>{t('registrationManagement.status')}</th>
                    <th>{t('registrationManagement.actions')}</th>
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
                            title={t('registrationManagement.viewDetails')}
                          >
                            👁️
                          </button>
                          {registration.status === 'registered' && (
                            <button 
                              onClick={() => handleCheckIn(registration.id)}
                              className="btn btn-sm btn-success"
                              title={t('registrationManagement.checkIn')}
                            >
                              ✅
                            </button>
                          )}
                          {registration.status === 'registered' && (
                            <button 
                              onClick={() => handleCancel(registration.id)}
                              className="btn btn-sm btn-danger"
                              title={t('registrationManagement.cancel')}
                            >
                              ❌
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleResendEmail(registration)}
                            title={t('registrationManagement.resendEmail')}
                          >
                            📧
                          </button>
                          <button
                            className="btn btn-sm"
                            onClick={() => handleSendReminder(registration)}
                            title={t('registrationManagement.sendReminder')}
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
                <h3>{t('registrationManagement.registrationDetails')}</h3>
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
                    <label>{t('registrationManagement.registrationId')}:</label>
                    <span>{selectedRegistration.id}</span>
                  </div>
                  <div className="detail-item">
                    <label>{t('registrationManagement.name')}:</label>
                    <span>{selectedRegistration.name}</span>
                  </div>
                  <div className="detail-item">
                    <label>{t('registrationManagement.furigana')}:</label>
                    <span>{selectedRegistration.furigana || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <label>{t('registrationManagement.email')}:</label>
                    <span>{selectedRegistration.email}</span>
                  </div>
                  <div className="detail-item">
                    <label>{t('registrationManagement.phone')}:</label>
                    <span>{selectedRegistration.phone || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <label>{t('registrationManagement.company')}:</label>
                    <span>{selectedRegistration.company || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <label>{t('registrationManagement.department')}:</label>
                    <span>{selectedRegistration.department || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <label>{t('registrationManagement.position')}:</label>
                    <span>{selectedRegistration.position || '-'}</span>
                  </div>
                  <div className="detail-item">
                    <label>{t('registrationManagement.registrationDate')}:</label>
                    <span>{formatDate(selectedRegistration.registeredAt)}</span>
                  </div>
                  <div className="detail-item">
                    <label>{t('registrationManagement.status')}:</label>
                    <span>{getStatusBadge(selectedRegistration.status)}</span>
                  </div>
                  {selectedRegistration.checkInTime && (
                    <div className="detail-item">
                      <label>{t('registrationManagement.checkInTime')}:</label>
                      <span>{formatDate(selectedRegistration.checkInTime)}</span>
                    </div>
                  )}
                  {selectedRegistration.cancelledAt && (
                    <div className="detail-item">
                      <label>{t('registrationManagement.cancelledTime')}:</label>
                      <span>{formatDate(selectedRegistration.cancelledAt)}</span>
                    </div>
                  )}
                  {selectedRegistration.cancelReason && (
                    <div className="detail-item">
                      <label>{t('registrationManagement.cancelReason')}:</label>
                      <span>{selectedRegistration.cancelReason}</span>
                    </div>
                  )}
                  <div className="detail-item full-width">
                    <label>{t('registrationManagement.qrCode')}:</label>
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
                  {t('common.close')}
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