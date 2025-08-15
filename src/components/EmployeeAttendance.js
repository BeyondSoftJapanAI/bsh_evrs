import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const EmployeeAttendance = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('select'); // select, face-recognition, correction, confirm
  const [attendanceType, setAttendanceType] = useState('');
  const [employee, setEmployee] = useState(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [correctionData, setCorrectionData] = useState({
    date: '',
    time: '',
    type: '',
    reason: ''
  });
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const videoRef = useRef(null);

  // 模拟员工数据
  const employees = [
    { id: 'EMP001', name: '田中太郎', department: '営業部', email: 'tanaka@company.com' },
    { id: 'EMP002', name: '佐藤花子', department: 'DX推進部', email: 'sato@company.com' },
    { id: 'EMP003', name: '鈴木一郎', department: '総務部', email: 'suzuki@company.com' }
  ];

  // 模拟打刻履歴
  const mockAttendanceHistory = [
    { date: '2025-01-14', checkIn: '09:00', checkOut: '18:30', status: '正常' },
    { date: '2025-01-13', checkIn: '09:15', checkOut: '18:45', status: '遅刻' },
    { date: '2025-01-12', checkIn: '08:45', checkOut: '17:30', status: '正常' }
  ];

  const handleAttendanceTypeSelect = (type) => {
    setAttendanceType(type);
    if (type === 'correction') {
      setStep('correction');
    } else {
      setStep('face-recognition');
      startFaceRecognition();
    }
  };

  const startFaceRecognition = async () => {
    setIsRecognizing(true);
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

  const stopFaceRecognition = () => {
    setIsRecognizing(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const simulateFaceRecognition = () => {
    // 顔認識シミュレーション
    const recognizedEmployee = employees[0]; // 田中太郎として認識
    setEmployee(recognizedEmployee);
    
    // 打刻記録
    const attendanceRecord = {
      employeeId: recognizedEmployee.id,
      employeeName: recognizedEmployee.name,
      type: attendanceType,
      timestamp: new Date().toLocaleString('ja-JP'),
      date: new Date().toLocaleDateString('ja-JP'),
      time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
    };
    
    // 履歴に追加
    setAttendanceHistory(prev => [attendanceRecord, ...prev]);
    
    stopFaceRecognition();
    setStep('confirm');
  };

  const handleCorrectionInputChange = (field, value) => {
    setCorrectionData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCorrectionSubmit = () => {
    // 打刻修正申請
    const correctionRequest = {
      ...correctionData,
      employeeId: 'EMP001', // 仮の従業員ID
      employeeName: '田中太郎',
      submittedAt: new Date().toLocaleString('ja-JP'),
      status: '承認待ち'
    };
    
    console.log('打刻修正申請:', correctionRequest);
    
    // 上司にメール送信（模擬）
    sendApprovalEmail(correctionRequest);
    
    setStep('confirm');
  };

  const sendApprovalEmail = (request) => {
    const emailData = {
      to: 'supervisor@company.com',
      subject: '打刻修正申請',
      body: `
        従業員: ${request.employeeName}
        修正日: ${request.date}
        修正時刻: ${request.time}
        種別: ${request.type}
        理由: ${request.reason}
        申請日時: ${request.submittedAt}
      `
    };
    
    console.log('承認メール送信:', emailData);
    // 実際の実装では、メールAPIを使用
  };

  const exportAttendanceHistory = () => {
    // 履歴エクスポート機能
    const exportData = {
      employee: employee || { name: '全従業員' },
      history: attendanceHistory.length > 0 ? attendanceHistory : mockAttendanceHistory,
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setStep('select');
    setAttendanceType('');
    setEmployee(null);
    setCorrectionData({
      date: '',
      time: '',
      type: '',
      reason: ''
    });
    stopFaceRecognition();
  };

  useEffect(() => {
    return () => {
      stopFaceRecognition();
    };
  }, []);

  const renderStepIndicator = () => {
    const steps = ['選択', '認証/入力', '確認'];
    const currentStepIndex = {
      'select': 0,
      'face-recognition': 1,
      'correction': 1,
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
        <h1 className="page-title">社員用打刻システム</h1>
        
        <div className="form-container">
          <div className="form-card">
            {renderStepIndicator()}
            
            {step === 'select' && (
              <div className="text-center">
                <h2 className="text-large mb-4">打刻種別を選択してください</h2>
                
                <div className="attendance-grid">
                  <div
                    className="attendance-card"
                    onClick={() => handleAttendanceTypeSelect('check-in')}
                  >
                    <span className="attendance-icon">🏢</span>
                    <h3 className="attendance-title">入室</h3>
                  </div>
                  
                  <div
                    className="attendance-card"
                    onClick={() => handleAttendanceTypeSelect('check-out')}
                  >
                    <span className="attendance-icon">🚪</span>
                    <h3 className="attendance-title">退室</h3>
                  </div>
                  
                  <div
                    className="attendance-card"
                    onClick={() => handleAttendanceTypeSelect('correction')}
                  >
                    <span className="attendance-icon">✏️</span>
                    <h3 className="attendance-title">打刻修正</h3>
                  </div>
                </div>
                
                <div className="mt-4">
                  <button className="btn btn-secondary" onClick={exportAttendanceHistory}>
                    履歴エクスポート
                  </button>
                </div>
              </div>
            )}
            
            {step === 'face-recognition' && (
              <div className="text-center">
                <h2 className="text-large mb-4">
                  {attendanceType === 'check-in' ? '入室' : '退室'}打刻
                </h2>
                <p className="mb-4">顔認識を行います。カメラを見つめてください。</p>
                
                <div className="face-recognition">
                  {isRecognizing ? (
                    <video
                      ref={videoRef}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                    />
                  ) : (
                    <div>
                      <p>カメラを起動中...</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-4">
                  <button className="btn" onClick={simulateFaceRecognition}>
                    顔認識テスト
                  </button>
                  <button className="btn btn-secondary" onClick={() => setStep('select')} style={{ marginLeft: '10px' }}>
                    戻る
                  </button>
                </div>
              </div>
            )}
            
            {step === 'correction' && (
              <div>
                <h2 className="text-large mb-4 text-center">打刻修正申請</h2>
                
                <div className="form-group">
                  <label className="form-label">修正日 *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={correctionData.date}
                    onChange={(e) => handleCorrectionInputChange('date', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">修正時刻 *</label>
                  <input
                    type="time"
                    className="form-input"
                    value={correctionData.time}
                    onChange={(e) => handleCorrectionInputChange('time', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">種別 *</label>
                  <select
                    className="form-select"
                    value={correctionData.type}
                    onChange={(e) => handleCorrectionInputChange('type', e.target.value)}
                  >
                    <option value="">選択してください</option>
                    <option value="check-in">入室</option>
                    <option value="check-out">退室</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">修正理由 *</label>
                  <textarea
                    className="form-input"
                    rows="4"
                    value={correctionData.reason}
                    onChange={(e) => handleCorrectionInputChange('reason', e.target.value)}
                    placeholder="打刻修正が必要な理由を入力してください"
                  />
                </div>
                
                <div className="alert alert-info">
                  申請後、上司に承認メールが送信されます。承認されるまでお待ちください。
                </div>
                
                <button
                  className="btn btn-large"
                  onClick={handleCorrectionSubmit}
                  disabled={!correctionData.date || !correctionData.time || !correctionData.type || !correctionData.reason}
                >
                  申請提出
                </button>
                
                <button className="btn btn-secondary" onClick={() => setStep('select')} style={{ marginLeft: '10px' }}>
                  戻る
                </button>
              </div>
            )}
            
            {step === 'confirm' && (
              <div>
                <h2 className="text-large mb-4 text-center">
                  {attendanceType === 'correction' ? '申請完了' : '打刻完了'}
                </h2>
                
                {attendanceType === 'correction' ? (
                  <div>
                    <div className="alert alert-success">
                      打刻修正申請を提出しました。上司に承認メールを送信しました。
                    </div>
                    
                    <div className="visitor-info">
                      <h3>申請内容</h3>
                      <p><strong>修正日:</strong> {correctionData.date}</p>
                      <p><strong>修正時刻:</strong> {correctionData.time}</p>
                      <p><strong>種別:</strong> {correctionData.type === 'check-in' ? '入室' : '退室'}</p>
                      <p><strong>理由:</strong> {correctionData.reason}</p>
                      <p><strong>申請日時:</strong> {new Date().toLocaleString('ja-JP')}</p>
                      <p><strong>ステータス:</strong> 承認待ち</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="alert alert-success">
                      {attendanceType === 'check-in' ? '入室' : '退室'}打刻が完了しました。
                    </div>
                    
                    {employee && (
                      <div className="visitor-info">
                        <h3>打刻情報</h3>
                        <p><strong>従業員:</strong> {employee.name}</p>
                        <p><strong>部署:</strong> {employee.department}</p>
                        <p><strong>種別:</strong> {attendanceType === 'check-in' ? '入室' : '退室'}</p>
                        <p><strong>打刻時刻:</strong> {new Date().toLocaleString('ja-JP')}</p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* 今日の打刻履歴 */}
                <div className="visitor-info mt-4">
                  <h3>今日の打刻履歴</h3>
                  {attendanceHistory.length > 0 ? (
                    <div>
                      {attendanceHistory
                        .filter(record => record.date === new Date().toLocaleDateString('ja-JP'))
                        .map((record, index) => (
                        <p key={index}>
                          <strong>{record.time}</strong> - {record.type === 'check-in' ? '入室' : '退室'}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p>本日の打刻履歴はありません。</p>
                  )}
                </div>
                
                <div className="text-center mt-4">
                  <button className="btn btn-large" onClick={handleReset}>
                    新しい打刻
                  </button>
                  <button className="btn btn-secondary" onClick={exportAttendanceHistory} style={{ marginLeft: '10px' }}>
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

export default EmployeeAttendance;