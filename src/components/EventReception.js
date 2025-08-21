import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import registrationService from '../services/registrationService';

const EventReception = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [step, setStep] = useState('select'); // select, qr-scan, no-qr, business-card, manual, confirm
  const [receptionType, setReceptionType] = useState('');
  const [qrData, setQrData] = useState(null);
  const [participantInfo, setParticipantInfo] = useState({
    company: '',
    name: '',
    title: '',
    eventId: '',
    eventName: '',
    registrationId: ''
  });
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // イベントデータと申込者データを読み込み
    const eventData = [
      { id: 'event001', name: '2025年度経営方針説明会', date: '2025-01-15' },
      { id: 'event002', name: 'DX推進セミナー', date: '2025-01-20' },
      { id: 'event003', name: '新製品発表会', date: '2025-01-25' }
    ];
    setEvents(eventData);
    
    const registrationData = registrationService.getAllRegistrations();
    setRegistrations(registrationData);
  };

  const handleReceptionTypeSelect = (type) => {
    setReceptionType(type);
    if (type === 'qr') {
      setStep('qr-scan');
      startQRScanning();
    } else {
      setStep('no-qr');
    }
  };

  const startQRScanning = async () => {
    setIsScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('カメラアクセスエラー:', error);
      alert('カメラにアクセスできません。');
    }
  };

  const stopQRScanning = () => {
    setIsScanning(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const simulateQRScan = () => {
    // QRコード読み取りシミュレーション - 実際の申込者データから取得
    const availableRegistrations = registrations.filter(reg => reg.status === 'confirmed');
    
    if (availableRegistrations.length === 0) {
      alert('申込者データが見つかりません。');
      return;
    }
    
    // ランダムに申込者を選択（実際の実装ではQRコードから取得）
    const randomRegistration = availableRegistrations[Math.floor(Math.random() * availableRegistrations.length)];
    
    const qrData = {
      eventId: randomRegistration.eventId,
      registrationId: randomRegistration.id,
      company: randomRegistration.company,
      name: randomRegistration.name,
      title: randomRegistration.title || '',
      email: randomRegistration.email
    };
    
    setQrData(qrData);
    setParticipantInfo({
      ...qrData,
      eventName: events.find(e => e.id === qrData.eventId)?.name || ''
    });
    
    // 受付状況を更新
    registrationService.checkIn(randomRegistration.id);
    
    stopQRScanning();
    setStep('confirm');
    
    // ネームシール印刷
    printNameTag(qrData);
  };

  const handleNoQRSelect = (type) => {
    if (type === 'business-card') {
      setStep('business-card');
      simulateBusinessCardScan();
    } else {
      setStep('manual');
    }
  };

  const simulateBusinessCardScan = () => {
    // 名刺スキャンシミュレーション
    const scannedData = {
      company: '株式会社テスト',
      name: '佐藤花子',
      title: 'マーケティング部長'
    };
    
    setParticipantInfo({
      ...scannedData,
      eventId: '',
      eventName: '',
      registrationId: ''
    });
    
    setStep('confirm');
  };

  const handleInputChange = (field, value) => {
    setParticipantInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleManualConfirm = () => {
    // 手動入力の場合は新規受付として記録
    const newRegistration = {
      id: `WALK_IN_${Date.now()}`,
      eventId: 'walk-in',
      name: participantInfo.name,
      company: participantInfo.company,
      title: participantInfo.title,
      email: '',
      phone: '',
      status: 'checked_in',
      registrationDate: new Date().toISOString(),
      checkInTime: new Date().toISOString()
    };
    
    // 当日受付として記録
    registrationService.addRegistration(newRegistration);
    
    setStep('confirm');
    // ネームシール印刷
    printNameTag(participantInfo);
  };

  const printNameTag = (info) => {
    console.log('ネームシール印刷:', info);
    // 実際の実装では、プリンターAPIを使用
  };

  const handleReset = () => {
    setStep('select');
    setReceptionType('');
    setQrData(null);
    setParticipantInfo({
      company: '',
      name: '',
      title: '',
      eventId: '',
      eventName: '',
      registrationId: ''
    });
    stopQRScanning();
  };

  const exportHistory = () => {
    // 履歴エクスポート機能
    const historyData = {
      participant: participantInfo,
      timestamp: new Date().toISOString(),
      receptionType: receptionType
    };
    
    const dataStr = JSON.stringify(historyData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `reception_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    return () => {
      stopQRScanning();
    };
  }, []);

  const renderStepIndicator = () => {
    const steps = [t('eventReception.stepSelect'), t('eventReception.stepScanInput'), t('eventReception.stepConfirm')];
    const currentStepIndex = {
      'select': 0,
      'qr-scan': 1,
      'no-qr': 1,
      'business-card': 1,
      'manual': 1,
      'confirm': 2
    }[step];

    return (
      <div className="step-indicator">
        {steps.map((stepName, index) => (
          <div
            key={index}
            className={`step ${
              index === currentStepIndex ? 'active' : 
              index < currentStepIndex ? 'completed' : ''
            }`}
          >
            {index + 1}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="main-content">
      <button className="back-button" onClick={() => navigate('/')}>
        {t('common.backToHome')}
      </button>
      
      <div className="container">
        <h1 className="page-title">{t('eventReception.title')}</h1>
        
        <div className="form-container">
          <div className="form-card">
            {renderStepIndicator()}
            
            {step === 'select' && (
              <div className="text-center">
                <h2 className="text-large mb-4">{t('eventReception.selectReceptionMethod')}</h2>
                <div className="grid grid-2">
                  <button
                    className="btn btn-large"
                    onClick={() => handleReceptionTypeSelect('qr')}
                  >
                    📱 {t('eventReception.withQR')}
                  </button>
                  <button
                    className="btn btn-large btn-secondary"
                    onClick={() => handleReceptionTypeSelect('no-qr')}
                  >
                    📄 {t('eventReception.withoutQR')}
                  </button>
                </div>
              </div>
            )}
            
            {step === 'qr-scan' && (
              <div className="text-center">
                <h2 className="text-large mb-4">{t('eventReception.scanQRCode')}</h2>
                
                <div className="qr-scanner">
                  {isScanning ? (
                    <video
                      ref={videoRef}
                      style={{ width: '100%', height: '300px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ 
                      width: '100%', 
                      height: '300px', 
                      background: '#f8f9fa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px dashed #dee2e6',
                      borderRadius: '8px'
                    }}>
                      <p>{t('eventReception.startingCamera')}</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-4">
                  <button className="btn" onClick={simulateQRScan}>
                    {t('eventReception.qrScanTest')}
                  </button>
                  <button className="btn btn-secondary" onClick={() => setStep('select')} style={{ marginLeft: '10px' }}>
                    {t('common.back')}
                  </button>
                </div>
              </div>
            )}
            
            {step === 'no-qr' && (
              <div className="text-center">
                <h2 className="text-large mb-4">{t('eventReception.selectReceptionMethod')}</h2>
                <div className="grid grid-2">
                  <button
                    className="btn btn-large"
                    onClick={() => handleNoQRSelect('business-card')}
                  >
                    💳 {t('eventReception.withBusinessCard')}
                  </button>
                  <button
                    className="btn btn-large btn-secondary"
                    onClick={() => handleNoQRSelect('manual')}
                  >
                    ✏️ {t('eventReception.withoutBusinessCard')}
                  </button>
                </div>
                <button className="btn btn-warning mt-4" onClick={() => setStep('select')}>
                  {t('common.back')}
                </button>
              </div>
            )}
            
            {step === 'business-card' && (
              <div className="text-center">
                <h2 className="text-large mb-4">{t('eventReception.scanBusinessCard')}</h2>
                
                <div style={{
                  width: '100%',
                  height: '200px',
                  background: '#f8f9fa',
                  border: '2px dashed #dee2e6',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '20px 0'
                }}>
                  <p>{t('eventReception.placeBusinessCard')}</p>
                </div>
                
                <div className="alert alert-info">
                  {t('eventReception.businessCardInstruction')}
                </div>
              </div>
            )}
            
            {step === 'manual' && (
              <div>
                <h2 className="text-large mb-4 text-center">{t('eventReception.participantInfoInput')}</h2>
                
                <div className="form-group">
                  <label className="form-label">{t('eventReception.companyName')} *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={participantInfo.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder={t('eventReception.companyPlaceholder')}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">{t('eventReception.name')} *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={participantInfo.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder={t('eventReception.namePlaceholder')}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">{t('eventReception.title')}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={participantInfo.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder={t('eventReception.titlePlaceholder')}
                  />
                </div>
                
                <button
                  className="btn btn-large"
                  onClick={handleManualConfirm}
                  disabled={!participantInfo.company || !participantInfo.name}
                >
                  {t('eventReception.receptionComplete')}
                </button>
                
                <button className="btn btn-secondary" onClick={() => setStep('no-qr')} style={{ marginLeft: '10px' }}>
                  {t('common.back')}
                </button>
              </div>
            )}
            
            {step === 'confirm' && (
              <div>
                <h2 className="text-large mb-4 text-center">{t('eventReception.receptionCompleted')}</h2>
                
                <div className="alert alert-success">
                  {t('eventReception.receptionCompletedMessage')}
                </div>
                
                <div className="name-tag">
                  <h2>{participantInfo.name}</h2>
                  <p>{participantInfo.company}</p>
                  <p>{participantInfo.title}</p>
                  {participantInfo.eventName && (
                    <p style={{ fontSize: '14px', marginTop: '10px' }}>
                      {participantInfo.eventName}
                    </p>
                  )}
                </div>
                
                <div className="visitor-info">
                  <h3>{t('eventReception.receptionInfo')}</h3>
                  <p><strong>{t('eventReception.companyName')}:</strong> {participantInfo.company}</p>
                  <p><strong>{t('eventReception.name')}:</strong> {participantInfo.name}</p>
                  <p><strong>{t('eventReception.title')}:</strong> {participantInfo.title}</p>
                  {participantInfo.eventName && (
                    <p><strong>{t('eventReception.event')}:</strong> {participantInfo.eventName}</p>
                  )}
                  {participantInfo.registrationId && (
                    <p><strong>{t('eventReception.registrationId')}:</strong> {participantInfo.registrationId}</p>
                  )}
                  <p><strong>{t('eventReception.receptionTime')}:</strong> {new Date().toLocaleString('ja-JP')}</p>
                </div>
                
                <div className="text-center mt-4">
                  <button className="btn btn-large" onClick={handleReset}>
                    {t('eventReception.newReception')}
                  </button>
                  <button className="btn btn-secondary" onClick={exportHistory} style={{ marginLeft: '10px' }}>
                    {t('eventReception.exportHistory')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventReception;