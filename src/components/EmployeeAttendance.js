import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const EmployeeAttendance = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
    const steps = [t('employeeAttendance.stepSelect'), t('employeeAttendance.stepAuth'), t('employeeAttendance.stepConfirm')];
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
        {t('common.backToHome')}
      </button>
      
      <div className="container">
        <h1 className="page-title">{t('employeeAttendance.title')}</h1>
        
        <div className="form-container">
          <div className="form-card">
            {renderStepIndicator()}
            
            {step === 'select' && (
              <div className="text-center">
                <h2 className="text-large mb-4">{t('employeeAttendance.selectType')}</h2>
                
                <div className="attendance-grid">
                  <div
                    className="attendance-card"
                    onClick={() => handleAttendanceTypeSelect('check-in')}
                  >
                    <span className="attendance-icon">🏢</span>
                    <h3 className="attendance-title">{t('employeeAttendance.checkIn')}</h3>
                  </div>
                  
                  <div
                    className="attendance-card"
                    onClick={() => handleAttendanceTypeSelect('check-out')}
                  >
                    <span className="attendance-icon">🚪</span>
                    <h3 className="attendance-title">{t('employeeAttendance.checkOut')}</h3>
                  </div>
                  
                  <div
                    className="attendance-card"
                    onClick={() => handleAttendanceTypeSelect('correction')}
                  >
                    <span className="attendance-icon">✏️</span>
                    <h3 className="attendance-title">{t('employeeAttendance.correction')}</h3>
                  </div>
                </div>
                
                <div className="mt-4">
                  <button className="btn btn-secondary" onClick={exportAttendanceHistory}>
                    {t('employeeAttendance.exportHistory')}
                  </button>
                </div>
              </div>
            )}
            
            {step === 'face-recognition' && (
              <div className="text-center">
                <h2 className="text-large mb-4">
                  {attendanceType === 'check-in' ? t('employeeAttendance.checkIn') : t('employeeAttendance.checkOut')}{t('employeeAttendance.attendance')}
                </h2>
                <p className="mb-4">{t('employeeAttendance.faceRecognitionInstruction')}</p>
                
                <div className="face-recognition">
                  {isRecognizing ? (
                    <video
                      ref={videoRef}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                    />
                  ) : (
                    <div>
                      <p>{t('employeeAttendance.cameraStarting')}</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-4">
                  <button className="btn" onClick={simulateFaceRecognition}>
                    {t('employeeAttendance.faceRecognitionTest')}
                  </button>
                  <button className="btn btn-secondary" onClick={() => setStep('select')} style={{ marginLeft: '10px' }}>
                    {t('common.back')}
                  </button>
                </div>
              </div>
            )}
            
            {step === 'correction' && (
              <div>
                <h2 className="text-large mb-4 text-center">{t('employeeAttendance.correctionRequest')}</h2>
                
                <div className="form-group">
                  <label className="form-label">{t('employeeAttendance.correctionDate')} *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={correctionData.date}
                    onChange={(e) => handleCorrectionInputChange('date', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">{t('employeeAttendance.correctionTime')} *</label>
                  <input
                    type="time"
                    className="form-input"
                    value={correctionData.time}
                    onChange={(e) => handleCorrectionInputChange('time', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">{t('employeeAttendance.correctionType')} *</label>
                  <select
                    className="form-select"
                    value={correctionData.type}
                    onChange={(e) => handleCorrectionInputChange('type', e.target.value)}
                  >
                    <option value="">{t('common.pleaseSelect')}</option>
                    <option value="check-in">{t('employeeAttendance.checkIn')}</option>
                    <option value="check-out">{t('employeeAttendance.checkOut')}</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">{t('employeeAttendance.correctionReason')} *</label>
                  <textarea
                    className="form-input"
                    rows="4"
                    value={correctionData.reason}
                    onChange={(e) => handleCorrectionInputChange('reason', e.target.value)}
                    placeholder={t('employeeAttendance.correctionReasonPlaceholder')}
                  />
                </div>
                
                <div className="alert alert-info">
                  {t('employeeAttendance.correctionNotice')}
                </div>
                
                <button
                  className="btn btn-large"
                  onClick={handleCorrectionSubmit}
                  disabled={!correctionData.date || !correctionData.time || !correctionData.type || !correctionData.reason}
                >
                  {t('employeeAttendance.submitRequest')}
                </button>
                
                <button className="btn btn-secondary" onClick={() => setStep('select')} style={{ marginLeft: '10px' }}>
                  {t('common.back')}
                </button>
              </div>
            )}
            
            {step === 'confirm' && (
              <div>
                <h2 className="text-large mb-4 text-center">
                  {attendanceType === 'correction' ? t('employeeAttendance.requestCompleted') : t('employeeAttendance.attendanceCompleted')}
                </h2>
                
                {attendanceType === 'correction' ? (
                  <div>
                    <div className="alert alert-success">
                      {t('employeeAttendance.correctionSubmitted')}
                    </div>
                    
                    <div className="visitor-info">
                      <h3>{t('employeeAttendance.requestDetails')}</h3>
                      <p><strong>{t('employeeAttendance.correctionDate')}:</strong> {correctionData.date}</p>
                      <p><strong>{t('employeeAttendance.correctionTime')}:</strong> {correctionData.time}</p>
                      <p><strong>{t('employeeAttendance.correctionType')}:</strong> {correctionData.type === 'check-in' ? t('employeeAttendance.checkIn') : t('employeeAttendance.checkOut')}</p>
                      <p><strong>{t('employeeAttendance.correctionReason')}:</strong> {correctionData.reason}</p>
                      <p><strong>{t('employeeAttendance.requestDateTime')}:</strong> {new Date().toLocaleString('ja-JP')}</p>
                      <p><strong>{t('employeeAttendance.status')}:</strong> {t('employeeAttendance.pendingApproval')}</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="alert alert-success">
                      {attendanceType === 'check-in' ? t('employeeAttendance.checkIn') : t('employeeAttendance.checkOut')}{t('employeeAttendance.attendanceCompleted')}
                    </div>
                    
                    {employee && (
                      <div className="visitor-info">
                        <h3>{t('employeeAttendance.attendanceInfo')}</h3>
                        <p><strong>{t('employeeAttendance.employee')}:</strong> {employee.name}</p>
                        <p><strong>{t('employeeAttendance.department')}:</strong> {employee.department}</p>
                        <p><strong>{t('employeeAttendance.type')}:</strong> {attendanceType === 'check-in' ? t('employeeAttendance.checkIn') : t('employeeAttendance.checkOut')}</p>
                        <p><strong>{t('employeeAttendance.attendanceTime')}:</strong> {new Date().toLocaleString('ja-JP')}</p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* 今日の打刻履歴 */}
                <div className="visitor-info mt-4">
                  <h3>{t('employeeAttendance.todayHistory')}</h3>
                  {attendanceHistory.length > 0 ? (
                    <div>
                      {attendanceHistory
                        .filter(record => record.date === new Date().toLocaleDateString('ja-JP'))
                        .map((record, index) => (
                        <p key={index}>
                          <strong>{record.time}</strong> - {record.type === 'check-in' ? t('employeeAttendance.checkIn') : t('employeeAttendance.checkOut')}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p>{t('employeeAttendance.noHistoryToday')}</p>
                  )}
                </div>
                
                <div className="text-center mt-4">
                  <button className="btn btn-large" onClick={handleReset}>
                    {t('employeeAttendance.newAttendance')}
                  </button>
                  <button className="btn btn-secondary" onClick={exportAttendanceHistory} style={{ marginLeft: '10px' }}>
                    {t('employeeAttendance.exportHistory')}
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