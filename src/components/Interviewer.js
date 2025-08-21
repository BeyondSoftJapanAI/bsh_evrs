import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Interviewer = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
        {t('common.backToHome')}
      </button>
      
      <div className="container">
        <h1 className="page-title">{t('interviewer.title')}</h1>
        
        <div className="form-container">
          <div className="form-card">
            {step === 'input' && (
              <div>
                <h2 className="text-large mb-4 text-center">{t('interviewer.inputInfo')}</h2>
                
                <div className="form-group">
                  <label className="form-label">{t('interviewer.form.name')} *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={interviewInfo.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder={t('interviewer.form.namePlaceholder')}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">{t('interviewer.form.phone')} *</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={interviewInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder={t('interviewer.form.phonePlaceholder')}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">{t('interviewer.form.email')}</label>
                  <input
                    type="email"
                    className="form-input"
                    value={interviewInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder={t('interviewer.form.emailPlaceholder')}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">{t('interviewer.form.position')} *</label>
                  <select
                    className="form-select"
                    value={interviewInfo.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                  >
                    <option value="">{t('interviewer.form.pleaseSelect')}</option>
                    {positions.map((position) => (
                      <option key={position} value={position}>{position}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">{t('interviewer.form.interviewTime')} *</label>
                  <input
                    type="datetime-local"
                    className="form-input"
                    value={interviewInfo.interviewTime}
                    onChange={(e) => handleInputChange('interviewTime', e.target.value)}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">{t('interviewer.form.interviewer')} *</label>
                  <select
                    className="form-select"
                    value={interviewInfo.interviewer}
                    onChange={(e) => handleInputChange('interviewer', e.target.value)}
                  >
                    <option value="">{t('interviewer.form.pleaseSelect')}</option>
                    {interviewers.map((interviewer) => (
                      <option key={interviewer} value={interviewer}>{interviewer}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">{t('interviewer.form.department')} *</label>
                  <select
                    className="form-select"
                    value={interviewInfo.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                  >
                    <option value="">{t('interviewer.form.pleaseSelect')}</option>
                    {departments.map((department) => (
                      <option key={department} value={department}>{department}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">{t('interviewer.form.notes')}</label>
                  <textarea
                    className="form-input"
                    rows="3"
                    value={interviewInfo.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder={t('interviewer.form.notesPlaceholder')}
                  />
                </div>
                
                <button
                  className="btn btn-large"
                  onClick={handleSubmit}
                  disabled={!interviewInfo.name || !interviewInfo.phone || !interviewInfo.position || !interviewInfo.interviewTime || !interviewInfo.interviewer || !interviewInfo.department}
                >
                  {t('interviewer.completeReception')}
                </button>
              </div>
            )}
            
            {step === 'confirm' && (
              <div>
                <h2 className="text-large mb-4 text-center">{t('interviewer.receptionComplete')}</h2>
                
                <div className="alert alert-success">
                  {t('interviewer.receptionCompleteMessage')}
                </div>
                
                <div className="visitor-info">
                  <h3>{t('interviewer.interviewerInfo')}</h3>
                  <p><strong>{t('interviewer.form.name')}:</strong> {interviewInfo.name}</p>
                  <p><strong>{t('interviewer.form.phone')}:</strong> {interviewInfo.phone}</p>
                  {interviewInfo.email && (
                    <p><strong>{t('interviewer.form.email')}:</strong> {interviewInfo.email}</p>
                  )}
                  <p><strong>{t('interviewer.form.position')}:</strong> {interviewInfo.position}</p>
                  <p><strong>{t('interviewer.form.interviewTime')}:</strong> {new Date(interviewInfo.interviewTime).toLocaleString('ja-JP')}</p>
                  <p><strong>{t('interviewer.form.interviewer')}:</strong> {interviewInfo.interviewer}</p>
                  <p><strong>{t('interviewer.form.department')}:</strong> {interviewInfo.department}</p>
                  {interviewInfo.notes && (
                    <p><strong>{t('interviewer.form.notes')}:</strong> {interviewInfo.notes}</p>
                  )}
                  <p><strong>{t('interviewer.receptionTime')}:</strong> {new Date().toLocaleString('ja-JP')}</p>
                </div>
                
                <div className="alert alert-info">
                  <strong>{t('interviewer.notificationTarget')}:</strong> {t('interviewer.notificationDepartments')}
                </div>
                
                <div className="name-tag">
                  <h2>{interviewInfo.name}</h2>
                  <p>{t('interviewer.interviewerLabel')}</p>
                  <p>{interviewInfo.position}</p>
                  <p style={{ fontSize: '14px', marginTop: '10px' }}>
                    {new Date(interviewInfo.interviewTime).toLocaleString('ja-JP')}
                  </p>
                </div>
                
                <div className="text-center mt-4">
                  <button className="btn btn-large" onClick={handleReset}>
                    {t('interviewer.newReception')}
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