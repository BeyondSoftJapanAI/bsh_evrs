import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import registrationService from '../services/registrationService';

const EventReception = () => {
  const navigate = useNavigate();
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
    const steps = ['選択', 'スキャン/入力', '確認'];
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
        ← ホーム
      </button>
      
      <div className="container">
        <h1 className="page-title">イベント受付</h1>
        
        <div className="form-container">
          <div className="form-card">
            {renderStepIndicator()}
            
            {step === 'select' && (
              <div className="text-center">
                <h2 className="text-large mb-4">受付方法を選択してください</h2>
                <div className="grid grid-2">
                  <button
                    className="btn btn-large"
                    onClick={() => handleReceptionTypeSelect('qr')}
                  >
                    📱 QRコードあり
                  </button>
                  <button
                    className="btn btn-large btn-secondary"
                    onClick={() => handleReceptionTypeSelect('no-qr')}
                  >
                    📄 QRコードなし
                  </button>
                </div>
              </div>
            )}
            
            {step === 'qr-scan' && (
              <div className="text-center">
                <h2 className="text-large mb-4">QRコードをスキャンしてください</h2>
                
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
                      <p>カメラを起動中...</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-4">
                  <button className="btn" onClick={simulateQRScan}>
                    QRコード読み取りテスト
                  </button>
                  <button className="btn btn-secondary" onClick={() => setStep('select')} style={{ marginLeft: '10px' }}>
                    戻る
                  </button>
                </div>
              </div>
            )}
            
            {step === 'no-qr' && (
              <div className="text-center">
                <h2 className="text-large mb-4">受付方法を選択してください</h2>
                <div className="grid grid-2">
                  <button
                    className="btn btn-large"
                    onClick={() => handleNoQRSelect('business-card')}
                  >
                    💳 名刺あり
                  </button>
                  <button
                    className="btn btn-large btn-secondary"
                    onClick={() => handleNoQRSelect('manual')}
                  >
                    ✏️ 名刺なし（手入力）
                  </button>
                </div>
                <button className="btn btn-warning mt-4" onClick={() => setStep('select')}>
                  戻る
                </button>
              </div>
            )}
            
            {step === 'business-card' && (
              <div className="text-center">
                <h2 className="text-large mb-4">名刺をスキャンしてください</h2>
                
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
                  <p>名刺をスキャナーに置いてください</p>
                </div>
                
                <div className="alert alert-info">
                  スキャン完了後、名刺をネームホルダーに入れてください。
                </div>
              </div>
            )}
            
            {step === 'manual' && (
              <div>
                <h2 className="text-large mb-4 text-center">参加者情報入力</h2>
                
                <div className="form-group">
                  <label className="form-label">会社名 *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={participantInfo.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="株式会社サンプル"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">お名前 *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={participantInfo.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="山田太郎"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">役職</label>
                  <input
                    type="text"
                    className="form-input"
                    value={participantInfo.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="営業部長"
                  />
                </div>
                
                <button
                  className="btn btn-large"
                  onClick={handleManualConfirm}
                  disabled={!participantInfo.company || !participantInfo.name}
                >
                  受付完了
                </button>
                
                <button className="btn btn-secondary" onClick={() => setStep('no-qr')} style={{ marginLeft: '10px' }}>
                  戻る
                </button>
              </div>
            )}
            
            {step === 'confirm' && (
              <div>
                <h2 className="text-large mb-4 text-center">受付完了</h2>
                
                <div className="alert alert-success">
                  受付が完了しました。ネームシールを発行しています。
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
                  <h3>受付情報</h3>
                  <p><strong>会社名:</strong> {participantInfo.company}</p>
                  <p><strong>お名前:</strong> {participantInfo.name}</p>
                  <p><strong>役職:</strong> {participantInfo.title}</p>
                  {participantInfo.eventName && (
                    <p><strong>イベント:</strong> {participantInfo.eventName}</p>
                  )}
                  {participantInfo.registrationId && (
                    <p><strong>登録ID:</strong> {participantInfo.registrationId}</p>
                  )}
                  <p><strong>受付時刻:</strong> {new Date().toLocaleString('ja-JP')}</p>
                </div>
                
                <div className="text-center mt-4">
                  <button className="btn btn-large" onClick={handleReset}>
                    新しい受付
                  </button>
                  <button className="btn btn-secondary" onClick={exportHistory} style={{ marginLeft: '10px' }}>
                    履歴エクスポート
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