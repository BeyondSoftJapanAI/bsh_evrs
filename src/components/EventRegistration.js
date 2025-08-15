import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import registrationService from '../services/registrationService';
import emailService from '../services/emailService';

const EventRegistration = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState('event-list'); // event-list, registration-form, confirmation
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventRegistrations, setEventRegistrations] = useState({});
  const [registrationData, setRegistrationData] = useState({
    lastName: '',
    firstName: '',
    lastNameKana: '',
    firstNameKana: '',
    email: '',
    phone: '',
    company: '',
    department: '',
    position: '',
    dietaryRestrictions: '',
    notes: ''
  });
  const [registrationId, setRegistrationId] = useState('');
  const [qrCode, setQrCode] = useState('');

  // ローカルストレージからイベントデータを読み込み
  const loadEvents = () => {
    try {
      const savedEvents = localStorage.getItem('eventData');
      if (savedEvents) {
        return JSON.parse(savedEvents);
      } else {
        // 初期データ（EventManagementと同じ）
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

  const [events, setEvents] = useState([]);
  useEffect(() => {
    setEvents(loadEvents());
  }, []);

  // イベントデータの変更を監視してローカルストレージを更新
  useEffect(() => {
    const handleStorageChange = () => {
      setEvents(loadEvents());
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // 登録数の読み込み
  useEffect(() => {
    loadRegistrationCounts();
  }, [events]);

  // URLパラメータからイベントIDを取得して選択
  useEffect(() => {
    if (eventId && events.length > 0) {
      const event = events.find(e => e.id === eventId);
      if (event) {
        setSelectedEvent(event);
        setStep('registration-form');
      }
    }
  }, [eventId, events]);

  useEffect(() => {
    loadRegistrationCounts();
  }, [events]);

  useEffect(() => {
    if (eventId) {
      const event = events.find(e => e.id === eventId);
      if (event) {
        setSelectedEvent(event);
        setStep('registration-form');
      }
    }
  }, [eventId, events]);

  const loadRegistrationCounts = () => {
    const counts = {};
    events.forEach(event => {
      const registrations = registrationService.getRegistrationsByEvent(event.id);
      const activeRegistrations = registrations.filter(reg => reg.status !== 'cancelled');
      counts[event.id] = {
        current: activeRegistrations.length,
        capacity: event.capacity || 0,
        available: Math.max(0, (event.capacity || 0) - activeRegistrations.length)
      };
    });
    setEventRegistrations(counts);
  };

  const canRegister = (event) => {
    const regCount = eventRegistrations[event.id];
    if (!regCount) {
      return true;
    }
    return regCount.available > 0 && !isRegistrationDeadlinePassed(event.registrationDeadline);
  };

  const handleEventSelect = (event) => {
    if (!canRegister(event)) {
      alert('このイベントは申込できません。');
      return;
    }
    setSelectedEvent(event);
    setStep('registration-form');
    navigate(`/event-registration/${event.id}`);
  };

  const handleInputChange = (field, value) => {
    setRegistrationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitRegistration = async () => {
    try {
      // 定員チェック
      if (!canRegister(selectedEvent)) {
        alert('申し訳ございません。定員に達したため申込を受け付けできません。');
        return;
      }

      // 申込データをregistrationServiceに保存
      const registration = registrationService.addRegistration({
        eventId: selectedEvent.id,
        eventName: selectedEvent.name,
        eventDate: selectedEvent.date,
        ...registrationData
      });

      setRegistrationId(registration.id);
      setQrCode(registration.qrCodeData);

      // 申込数を更新
      loadRegistrationCounts();

      console.log('イベント申込完了:', registration);

      // 確認メール送信
      await sendConfirmationEmail(registration);

      setStep('confirmation');
    } catch (error) {
      console.error('申込処理エラー:', error);
      alert('申込処理中にエラーが発生しました。');
    }
  };

  const sendConfirmationEmail = async (registration) => {
    try {
      const emailResult = await emailService.sendRegistrationConfirmation({
        ...registration,
        eventName: selectedEvent.name,
        eventDate: selectedEvent.date,
        eventTime: selectedEvent.time,
        eventLocation: selectedEvent.location,
        contactEmail: selectedEvent.contactEmail,
        qrCode: qrCode
      });
      
      if (emailResult.success) {
        console.log('申込確認メール送信成功:', emailResult.message);
      } else {
        console.error('申込確認メール送信失敗:', emailResult.error);
      }
    } catch (error) {
      console.error('メール送信エラー:', error);
    }
  };

  const handleReset = () => {
    setStep('event-list');
    setSelectedEvent(null);
    setRegistrationData({
      lastName: '',
      firstName: '',
      lastNameKana: '',
      firstNameKana: '',
      email: '',
      phone: '',
      company: '',
      department: '',
      position: '',
      dietaryRestrictions: '',
      notes: ''
    });
    setRegistrationId('');
    setQrCode('');
    navigate('/event-registration');
  };

  const isRegistrationDeadlinePassed = (deadline) => {
    return new Date() > new Date(deadline);
  };

  const isEventFull = (event) => {
    return event.registrations >= event.capacity;
  };

  const getAvailableSpots = (event) => {
    return event.capacity - event.registrations;
  };

  return (
    <div className="main-content">
      <button className="back-button" onClick={() => navigate('/')}>
        ← ホーム
      </button>
      
      <div className="container">
        <h1 className="page-title">イベント申し込み</h1>
        
        {step === 'event-list' && (
          <div className="events-container">
            <div className="alert alert-info mb-4">
              参加をご希望のイベントを選択してください。申し込み完了後、QRコードをお送りいたします。
            </div>
            
            <div className="events-grid">
              {events.filter(event => event.status === 'active').map((event) => (
                <div key={event.id} className="event-card">
                  <div className="event-header">
                    <h3 className="event-title">{event.name}</h3>
                    <div className="event-status">
                      {isEventFull(event) ? (
                        <span className="status-full">満員</span>
                      ) : isRegistrationDeadlinePassed(event.registrationDeadline) ? (
                        <span className="status-closed">受付終了</span>
                      ) : (
                        <span className="status-available">受付中</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="event-details">
                    <p><strong>日時:</strong> {event.date} {event.time}</p>
                    <p><strong>会場:</strong> {event.location}</p>
                    <p><strong>定員:</strong> {event.capacity}名</p>
                    {eventRegistrations[event.id] ? (
                      <>
                        <p><strong>申込状況:</strong> {eventRegistrations[event.id].current}/{event.capacity}名 
                          <span className="available-spots">
                            （残り{eventRegistrations[event.id].available}名）
                          </span>
                        </p>
                      </>
                    ) : (
                      <p><strong>申込状況:</strong> {event.registrations}/{event.capacity}名 
                        <span className="available-spots">
                          （残り{getAvailableSpots(event)}名）
                        </span>
                      </p>
                    )}
                    <p><strong>申込締切:</strong> {event.registrationDeadline}</p>
                  </div>
                  
                  <div className="event-description">
                    <p>{event.description}</p>
                  </div>
                  
                  {event.agenda && (
                    <div className="event-agenda">
                      <h4>プログラム</h4>
                      <ul>
                        {event.agenda.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="event-actions">
                    <button
                      className="btn btn-large"
                      onClick={() => handleEventSelect(event)}
                      disabled={!canRegister(event)}
                    >
                      {eventRegistrations[event.id] && eventRegistrations[event.id].available <= 0 ? '満員' : 
                       isRegistrationDeadlinePassed(event.registrationDeadline) ? '受付終了' : 
                       '申し込む'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {step === 'registration-form' && selectedEvent && (
          <div className="registration-container">
            <div className="event-summary">
              <h2>{selectedEvent.name}</h2>
              <p><strong>日時:</strong> {selectedEvent.date} {selectedEvent.time}</p>
              <p><strong>会場:</strong> {selectedEvent.location}</p>
              <p><strong>残席:</strong> {getAvailableSpots(selectedEvent)}名</p>
            </div>
            
            <div className="form-container">
              <div className="form-card">
                <h3 className="text-large mb-4 text-center">申込者情報入力</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">姓 *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={registrationData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="山田"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">名 *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={registrationData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="太郎"
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">姓（カナ） *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={registrationData.lastNameKana}
                      onChange={(e) => handleInputChange('lastNameKana', e.target.value)}
                      placeholder="ヤマダ"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">名（カナ） *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={registrationData.firstNameKana}
                      onChange={(e) => handleInputChange('firstNameKana', e.target.value)}
                      placeholder="タロウ"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">メールアドレス *</label>
                  <input
                    type="email"
                    className="form-input"
                    value={registrationData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="example@company.com"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">電話番号 *</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={registrationData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="03-1234-5678"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">会社名 *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={registrationData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="株式会社サンプル"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">部署</label>
                    <input
                      type="text"
                      className="form-input"
                      value={registrationData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      placeholder="営業部"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">役職</label>
                    <input
                      type="text"
                      className="form-input"
                      value={registrationData.position}
                      onChange={(e) => handleInputChange('position', e.target.value)}
                      placeholder="課長"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">食事制限・アレルギー</label>
                  <input
                    type="text"
                    className="form-input"
                    value={registrationData.dietaryRestrictions}
                    onChange={(e) => handleInputChange('dietaryRestrictions', e.target.value)}
                    placeholder="特になし"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">備考</label>
                  <textarea
                    className="form-input"
                    rows="3"
                    value={registrationData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="ご質問やご要望がございましたらご記入ください"
                  />
                </div>
                
                <div className="form-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setStep('event-list')}
                  >
                    戻る
                  </button>
                  <button
                    className="btn btn-large"
                    onClick={handleSubmitRegistration}
                    disabled={!registrationData.lastName || !registrationData.firstName || 
                             !registrationData.lastNameKana || !registrationData.firstNameKana ||
                             !registrationData.email || !registrationData.phone || !registrationData.company}
                  >
                    申し込み完了
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {step === 'confirmation' && (
          <div className="confirmation-container">
            <div className="form-card">
              <h2 className="text-large mb-4 text-center">申し込み完了</h2>
              
              <div className="alert alert-success">
                イベントの申し込みが完了しました。確認メールとQRコードをお送りしました。
              </div>
              
              <div className="registration-summary">
                <h3>申込内容</h3>
                <div className="summary-grid">
                  <div className="summary-item">
                    <strong>申込ID:</strong> {registrationId}
                  </div>
                  <div className="summary-item">
                    <strong>イベント名:</strong> {selectedEvent.name}
                  </div>
                  <div className="summary-item">
                    <strong>日時:</strong> {selectedEvent.date} {selectedEvent.time}
                  </div>
                  <div className="summary-item">
                    <strong>会場:</strong> {selectedEvent.location}
                  </div>
                  <div className="summary-item">
                    <strong>申込者:</strong> {registrationData.lastName} {registrationData.firstName}
                  </div>
                  <div className="summary-item">
                    <strong>会社名:</strong> {registrationData.company}
                  </div>
                  <div className="summary-item">
                    <strong>メール:</strong> {registrationData.email}
                  </div>
                </div>
              </div>
              
              <div className="qr-code-section">
                <h3>受付用QRコード</h3>
                <div className="qr-code-container">
                  <img src={qrCode} alt="受付用QRコード" className="qr-code-image" />
                  <p className="qr-code-note">
                    当日受付時にこのQRコードをご提示ください。<br/>
                    メールでも同じQRコードをお送りしています。
                  </p>
                </div>
              </div>
              
              <div className="alert alert-info">
                <strong>当日のご案内</strong><br/>
                ・開始時刻の15分前までにお越しください<br/>
                ・受付でQRコードをご提示ください<br/>
                ・ご不明な点は {selectedEvent.contactEmail} までお問い合わせください
              </div>
              
              <div className="text-center mt-4">
                <button className="btn btn-large" onClick={handleReset}>
                  他のイベントを見る
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventRegistration;