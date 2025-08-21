import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const EventManagement = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [step, setStep] = useState('list'); // list, create, edit, qr-generate
  const [events, setEvents] = useState([]);

  // ローカルストレージからイベントデータを読み込み
  const loadEvents = () => {
    try {
      const savedEvents = localStorage.getItem('eventData');
      if (savedEvents) {
        return JSON.parse(savedEvents);
      } else {
        // 初期データ
        const defaultEvents = [
          {
            id: 'event001',
            name: '2025年度経営方針説明会',
            date: '2025-01-15',
            time: '14:00-16:00',
            location: '本社会議室A（東京都千代田区）',
            capacity: 100,
            registrations: 45,
            status: 'active',
            description: '2025年度の経営方針について詳しく説明いたします。今後の事業展開や新しい取り組みについてもご紹介予定です。',
            registrationDeadline: '2025-01-10',
            contactEmail: 'events@company.com',
            agenda: [
              '14:00-14:30 開会挨拶・会社概要',
              '14:30-15:30 2025年度経営方針発表',
              '15:30-15:45 休憩',
              '15:45-16:00 質疑応答・閉会'
            ]
          },
          {
            id: 'event002',
            name: 'DX推進セミナー',
            date: '2025-01-20',
            time: '10:00-12:00',
            location: '本社会議室B（東京都千代田区）',
            capacity: 50,
            registrations: 32,
            status: 'active',
            description: 'デジタルトランスフォーメーションの最新動向と実践事例について学べるセミナーです。',
            registrationDeadline: '2025-01-15',
            contactEmail: 'dx@company.com',
            agenda: [
              '10:00-10:15 開会挨拶',
              '10:15-11:00 DXの基礎知識',
              '11:00-11:45 実践事例紹介',
              '11:45-12:00 質疑応答'
            ]
          },
          {
            id: 'event003',
            name: '新商品発表会',
            date: '2025-02-01',
            time: '15:00-17:00',
            location: 'イベントホール（東京都港区）',
            capacity: 200,
            registrations: 156,
            status: 'active',
            description: '2025年春の新商品ラインナップを一挙公開！試食・体験コーナーもご用意しています。',
            registrationDeadline: '2025-01-25',
            contactEmail: 'product@company.com',
            agenda: [
              '15:00-15:30 受付・展示見学',
              '15:30-16:30 新商品発表',
              '16:30-17:00 試食・体験タイム'
            ]
          }
        ];
        localStorage.setItem('eventData', JSON.stringify(defaultEvents));
        return defaultEvents;
      }
    } catch (error) {
      console.error('イベントデータの読み込みエラー:', error);
      return [];
    }
  };

  // ローカルストレージにイベントデータを保存
  const saveEvents = (eventData) => {
    try {
      localStorage.setItem('eventData', JSON.stringify(eventData));
    } catch (error) {
      console.error('イベントデータの保存エラー:', error);
    }
  };

  useEffect(() => {
    setEvents(loadEvents());
  }, []);
  const [currentEvent, setCurrentEvent] = useState({
    name: '',
    date: '',
    time: '',
    location: '',
    capacity: 50,
    description: '',
    registrationDeadline: '',
    contactEmail: ''
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [qrCode, setQrCode] = useState('');

  const handleCreateEvent = () => {
    setCurrentEvent({
      name: '',
      date: '',
      time: '',
      location: '',
      capacity: 50,
      description: '',
      registrationDeadline: '',
      contactEmail: ''
    });
    setStep('create');
  };

  const handleEditEvent = (event) => {
    setCurrentEvent(event);
    setStep('edit');
  };

  const handleInputChange = (field, value) => {
    setCurrentEvent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveEvent = () => {
    let updatedEvents;
    if (step === 'create') {
      const newEvent = {
        ...currentEvent,
        id: `event${Date.now()}`,
        registrations: 0,
        status: 'active'
      };
      updatedEvents = [...events, newEvent];
    } else {
      updatedEvents = events.map(event => 
        event.id === currentEvent.id ? currentEvent : event
      );
    }
    setEvents(updatedEvents);
    saveEvents(updatedEvents);
    setStep('list');
    alert(step === 'create' ? t('eventManagement.eventCreated') : t('eventManagement.eventUpdated'));
  };

  const handleDeleteEvent = (eventId) => {
    if (window.confirm(t('eventManagement.confirmDelete'))) {
      const updatedEvents = events.filter(event => event.id !== eventId);
      setEvents(updatedEvents);
      saveEvents(updatedEvents);
      alert(t('eventManagement.eventDeleted'));
    }
  };

  const generateQRCode = (event) => {
    setSelectedEvent(event);
    
    // QRコード生成（模擬）
    const qrData = {
      eventId: event.id,
      eventName: event.name,
      registrationUrl: `https://company.com/events/${event.id}/register`
    };
    
    // 実際の実装では、QRコードライブラリを使用
    const qrCodeData = `data:image/svg+xml;base64,${btoa(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <rect x="20" y="20" width="160" height="160" fill="black"/>
        <rect x="40" y="40" width="120" height="120" fill="white"/>
        <text x="100" y="105" text-anchor="middle" font-size="12" fill="black">QR Code</text>
        <text x="100" y="125" text-anchor="middle" font-size="8" fill="black">${event.id}</text>
      </svg>
    `)}`;
    
    setQrCode(qrCodeData);
    setStep('qr-generate');
  };

  const sendRegistrationEmail = (event) => {
    const emailData = {
      subject: `イベント申込完了: ${event.name}`,
      body: `
        イベント申込が完了しました。
        
        イベント名: ${event.name}
        日時: ${event.date} ${event.time}
        場所: ${event.location}
        
        当日は添付のQRコードをご持参ください。
      `,
      qrCode: qrCode
    };
    
    console.log('申込完了メール送信:', emailData);
    alert(t('eventManagement.emailSent'));
  };

  const exportEventData = (event) => {
    const exportData = {
      event: event,
      registrations: [], // 実際の実装では参加者データを含める
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `event_${event.id}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  return (
    <div className="main-content">
      <button className="back-button" onClick={() => navigate('/admin')}>
        {t('common.backToAdmin')}
      </button>
      
      <div className="container">
        <h1 className="page-title">{t('eventManagement.title')}</h1>
        
        {step === 'list' && (
          <div>
            <div className="text-center mb-4">
              <button className="btn btn-large" onClick={handleCreateEvent}>
                {t('eventManagement.createNewEvent')}
              </button>
            </div>
            
            <div className="grid grid-2">
              {events.map((event) => (
                <div key={event.id} className="card">
                  <h3>{event.name}</h3>
                  <p><strong>{t('eventManagement.dateTime')}:</strong> {event.date} {event.time}</p>
                  <p><strong>{t('eventManagement.location')}:</strong> {event.location}</p>
                  <p><strong>{t('eventManagement.capacity')}:</strong> {event.capacity}{t('eventManagement.people')}</p>
                  <p><strong>{t('eventManagement.registrations')}:</strong> {event.registrations}{t('eventManagement.people')}</p>
                  <p><strong>{t('eventManagement.status')}:</strong> 
                    <span style={{ 
                      color: event.status === 'active' ? 'green' : 'red',
                      fontWeight: 'bold'
                    }}>
                      {event.status === 'active' ? t('eventManagement.recruiting') : t('eventManagement.ended')}
                    </span>
                  </p>
                  
                  <div className="mt-4">
                    <button 
                      className="btn" 
                      onClick={() => handleEditEvent(event)}
                      style={{ marginRight: '10px' }}
                    >
                      {t('common.edit')}
                    </button>
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => generateQRCode(event)}
                      style={{ marginRight: '10px' }}
                    >
                      {t('eventManagement.generateQR')}
                    </button>
                    <button 
                      className="btn btn-warning" 
                      onClick={() => exportEventData(event)}
                      style={{ marginRight: '10px' }}
                    >
                      {t('common.export')}
                    </button>
                    <button 
                      className="btn" 
                      onClick={() => handleDeleteEvent(event.id)}
                      style={{ background: '#dc3545' }}
                    >
                      {t('common.delete')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {(step === 'create' || step === 'edit') && (
          <div className="form-container">
            <div className="form-card">
              <h2 className="text-large mb-4 text-center">
                {step === 'create' ? t('eventManagement.createEvent') : t('eventManagement.editEvent')}
              </h2>
              
              <div className="form-group">
                <label className="form-label">{t('eventManagement.eventName')} *</label>
                <input
                  type="text"
                  className="form-input"
                  value={currentEvent.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder={t('eventManagement.eventNamePlaceholder')}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">{t('eventManagement.eventDate')} *</label>
                <input
                  type="date"
                  className="form-input"
                  value={currentEvent.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">{t('eventManagement.startTime')} *</label>
                <input
                  type="time"
                  className="form-input"
                  value={currentEvent.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">{t('eventManagement.venue')} *</label>
                <input
                  type="text"
                  className="form-input"
                  value={currentEvent.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder={t('eventManagement.venuePlaceholder')}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">{t('eventManagement.capacity')} *</label>
                <input
                  type="number"
                  className="form-input"
                  value={currentEvent.capacity}
                  onChange={(e) => handleInputChange('capacity', parseInt(e.target.value))}
                  min="1"
                  max="1000"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">{t('eventManagement.deadline')}</label>
                <input
                  type="date"
                  className="form-input"
                  value={currentEvent.registrationDeadline}
                  onChange={(e) => handleInputChange('registrationDeadline', e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">{t('eventManagement.contactEmail')}</label>
                <input
                  type="email"
                  className="form-input"
                  value={currentEvent.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  placeholder={t('eventManagement.contactEmailPlaceholder')}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">{t('eventManagement.description')}</label>
                <textarea
                  className="form-input"
                  rows="4"
                  value={currentEvent.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder={t('eventManagement.descriptionPlaceholder')}
                />
              </div>
              
              <div className="text-center">
                <button
                  className="btn btn-large"
                  onClick={handleSaveEvent}
                  disabled={!currentEvent.name || !currentEvent.date || !currentEvent.time || !currentEvent.location}
                >
                  {step === 'create' ? t('common.create') : t('common.update')}
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setStep('list')}
                  style={{ marginLeft: '10px' }}
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {step === 'qr-generate' && selectedEvent && (
          <div className="form-container">
            <div className="form-card">
              <h2 className="text-large mb-4 text-center">{t('eventManagement.generateQRCode')}</h2>
              
              <div className="visitor-info">
                <h3>{t('eventManagement.eventInfo')}</h3>
                <p><strong>{t('eventManagement.eventName')}:</strong> {selectedEvent.name}</p>
                <p><strong>{t('eventManagement.dateTime')}:</strong> {selectedEvent.date} {selectedEvent.time}</p>
                <p><strong>{t('eventManagement.location')}:</strong> {selectedEvent.location}</p>
                <p><strong>{t('eventManagement.capacity')}:</strong> {selectedEvent.capacity}{t('eventManagement.people')}</p>
              </div>
              
              <div className="text-center mt-4">
                <h3>{t('eventManagement.registrationQR')}</h3>
                <div style={{ margin: '20px 0' }}>
                  <img src={qrCode} alt="Event QR Code" style={{ maxWidth: '200px' }} />
                </div>
                
                <p style={{ fontSize: '14px', color: '#666' }}>
                  {t('eventManagement.qrInstructions')}
                </p>
              </div>
              
              <div className="alert alert-info">
                <strong>{t('eventManagement.registrationURL')}:</strong> https://company.com/events/{selectedEvent.id}/register
              </div>
              
              <div className="text-center mt-4">
                <button 
                  className="btn btn-large" 
                  onClick={() => sendRegistrationEmail(selectedEvent)}
                >
                  {t('eventManagement.testEmail')}
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setStep('list')}
                  style={{ marginLeft: '10px' }}
                >
                  {t('common.back')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventManagement;