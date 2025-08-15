import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Interviewer = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('input'); // input, confirm
  const [interviewInfo, setInterviewInfo] = useState({
    name: '',
    phone: '',
    email: '',
    position: '',
    interviewTime: '',
    interviewer: '',
    department: '',
    notes: ''
  });

  const positions = [
    '営業職',
    'エンジニア',
    'デザイナー',
    'マーケティング',
    '総務・人事',
    '財務・経理',
    'その他'
  ];

  const departments = [
    '営業部',
    'DX推進部',
    '総務部',
    '財務部',
    '人事部'
  ];

  const interviewers = [
    '田中太郎 (営業部長)',
    '佐藤花子 (DX推進部長)',
    '鈴木一郎 (総務部長)',
    '高橋美咲 (財務部長)',
    '山田健太 (人事部長)'
  ];

  const handleInputChange = (field, value) => {
    setInterviewInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    setStep('confirm');
    sendTeamsNotification();
  };

  const sendTeamsNotification = () => {
    const message = {
      type: 'interview',
      interview: interviewInfo,
      timestamp: new Date().toLocaleString('ja-JP'),
      location: '受付'
    };
    
    console.log('Teams通知送信 (面接者):', message);
    // 実際の実装では、Teams APIを使用
    // 総務・営業・DX部門長・財務に通知
  };

  const handleReset = () => {
    setStep('input');
    setInterviewInfo({
      name: '',
      phone: '',
      email: '',
      position: '',
      interviewTime: '',
      interviewer: '',
      department: '',
      notes: ''
    });
  };

  return (
    <div className="main-content">
      <button className="back-button" onClick={() => navigate('/')}>
        ← ホーム
      </button>
      
      <div className="container">
        <h1 className="page-title">面接者受付</h1>
        
        <div className="form-container">
          <div className="form-card">
            {step === 'input' && (
              <div>
                <h2 className="text-large mb-4 text-center">面接者情報入力</h2>
                
                <div className="form-group">
                  <label className="form-label">お名前 *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={interviewInfo.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="山田太郎"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">電話番号 *</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={interviewInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="090-1234-5678"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">メールアドレス</label>
                  <input
                    type="email"
                    className="form-input"
                    value={interviewInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="yamada@example.com"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">応募職種 *</label>
                  <select
                    className="form-select"
                    value={interviewInfo.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                  >
                    <option value="">選択してください</option>
                    {positions.map((position) => (
                      <option key={position} value={position}>{position}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">面接予定時刻 *</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={interviewInfo.interviewTime}
                    onChange={(e) => handleInputChange('interviewTime', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">面接官 *</label>
                  <select
                    className="form-select"
                    value={interviewInfo.interviewer}
                    onChange={(e) => handleInputChange('interviewer', e.target.value)}
                  >
                    <option value="">選択してください</option>
                    {interviewers.map((interviewer) => (
                      <option key={interviewer} value={interviewer}>{interviewer}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">面接部署 *</label>
                  <select
                    className="form-select"
                    value={interviewInfo.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                  >
                    <option value="">選択してください</option>
                    {departments.map((department) => (
                      <option key={department} value={department}>{department}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">備考</label>
                  <textarea
                    className="form-input"
                    rows="3"
                    value={interviewInfo.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="特記事項があれば入力してください"
                  />
                </div>
                
                <button
                  className="btn btn-large"
                  onClick={handleSubmit}
                  disabled={!interviewInfo.name || !interviewInfo.phone || !interviewInfo.position || !interviewInfo.interviewTime || !interviewInfo.interviewer || !interviewInfo.department}
                >
                  受付完了
                </button>
              </div>
            )}
            
            {step === 'confirm' && (
              <div>
                <h2 className="text-large mb-4 text-center">受付完了</h2>
                
                <div className="alert alert-success">
                  面接者の受付が完了しました。関係部署にTeams通知を送信しました。
                </div>
                
                <div className="visitor-info">
                  <h3>面接者情報</h3>
                  <p><strong>お名前:</strong> {interviewInfo.name}</p>
                  <p><strong>電話番号:</strong> {interviewInfo.phone}</p>
                  {interviewInfo.email && (
                    <p><strong>メールアドレス:</strong> {interviewInfo.email}</p>
                  )}
                  <p><strong>応募職種:</strong> {interviewInfo.position}</p>
                  <p><strong>面接予定時刻:</strong> {new Date(interviewInfo.interviewTime).toLocaleString('ja-JP')}</p>
                  <p><strong>面接官:</strong> {interviewInfo.interviewer}</p>
                  <p><strong>面接部署:</strong> {interviewInfo.department}</p>
                  {interviewInfo.notes && (
                    <p><strong>備考:</strong> {interviewInfo.notes}</p>
                  )}
                  <p><strong>受付時刻:</strong> {new Date().toLocaleString('ja-JP')}</p>
                </div>
                
                <div className="alert alert-info">
                  <strong>通知先:</strong> 総務部、営業部、DX推進部、財務部、人事部
                </div>
                
                <div className="name-tag">
                  <h2>{interviewInfo.name}</h2>
                  <p>面接者</p>
                  <p>{interviewInfo.position}</p>
                  <p style={{ fontSize: '14px', marginTop: '10px' }}>
                    {new Date(interviewInfo.interviewTime).toLocaleString('ja-JP')}
                  </p>
                </div>
                
                <div className="text-center mt-4">
                  <button className="btn btn-large" onClick={handleReset}>
                    新しい受付
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

export default Interviewer;