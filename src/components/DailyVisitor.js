import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const DailyVisitor = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [step, setStep] = useState('select'); // select, appointment, no-appointment, scan, input, confirm
  const [visitorType, setVisitorType] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [visitorInfo, setVisitorInfo] = useState({
    company: '',
    name: '',
    title: '',
    phone: '',
    email: '',
    visitCount: 1,
    purpose: ''
  });
  const [searchName, setSearchName] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // 模拟员工数据
  const staffMembers = [
    { id: 1, name: '田中太郎', department: '営業部', email: 'tanaka@company.com' },
    { id: 2, name: '佐藤花子', department: 'DX推進部', email: 'sato@company.com' },
    { id: 3, name: '鈴木一郎', department: '総務部', email: 'suzuki@company.com' },
    { id: 4, name: '高橋美咲', department: '財務部', email: 'takahashi@company.com' },
    { id: 5, name: '山田健太', department: '営業部', email: 'yamada@company.com' }
  ];

  const handleVisitorTypeSelect = (type) => {
    setVisitorType(type);
    if (type === 'appointment') {
      setStep('appointment');
    } else {
      setStep('no-appointment');
    }
  };

  const handleStaffSelect = (staff) => {
    setSelectedStaff(staff);
    setStep('scan');
  };

  const handleSearchStaff = () => {
    const results = staffMembers.filter(staff => 
      staff.name.includes(searchName) || staff.department.includes(searchName)
    );
    setSearchResults(results);
  };

  const handleBusinessCardScan = () => {
    // 模拟名刺扫描结果
    setVisitorInfo({
      company: '株式会社サンプル',
      name: '山田太郎',
      title: '営業部長',
      phone: '03-1234-5678',
      email: 'yamada@sample.co.jp',
      visitCount: 1,
      purpose: '商談'
    });
    setStep('input');
  };

  const handleManualInput = () => {
    setStep('input');
  };

  const handleInputChange = (field, value) => {
    setVisitorInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConfirm = () => {
    setStep('confirm');
  };

  const handleSubmit = () => {
    setStep('complete');
    // Teams通知を送信（模擬）
    sendTeamsNotification();
  };

  const sendTeamsNotification = () => {
    const message = {
      visitor: visitorInfo,
      staff: selectedStaff,
      timestamp: new Date().toLocaleString('ja-JP'),
      type: visitorType
    };
    console.log(t('dailyVisitor.teamsNotificationSent'), message);
    // 実際の実装では、Teams APIを使用
  };

  const handleReset = () => {
    setStep('select');
    setVisitorType('');
    setSelectedStaff('');
    setVisitorInfo({
      company: '',
      name: '',
      title: '',
      phone: '',
      email: '',
      visitCount: 1,
      purpose: ''
    });
    setSearchName('');
    setSearchResults([]);
  };

  const renderStepIndicator = () => {
    const steps = [t('dailyVisitor.steps.select'), t('dailyVisitor.steps.staff'), t('dailyVisitor.steps.scan'), t('dailyVisitor.steps.input'), t('dailyVisitor.steps.confirm')];
    const currentStepIndex = {
      'select': 0,
      'appointment': 1,
      'no-appointment': 1,
      'scan': 2,
      'input': 3,
      'confirm': 4
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
        ← {t('common.home')}
      </button>
      
      <div className="container">
        <h1 className="page-title">{t('dailyVisitor.title')}</h1>
        
        <div className="form-container">
          <div className="form-card">
            {renderStepIndicator()}
            
            {step === 'select' && (
              <div className="text-center">
                <h2 className="text-large mb-4">{t('dailyVisitor.selectVisitType')}</h2>
                <div className="grid grid-2">
                  <button
                    className="btn btn-large"
                    onClick={() => handleVisitorTypeSelect('appointment')}
                  >
                    📅 {t('dailyVisitor.withAppointment')}
                  </button>
                  <button
                    className="btn btn-large btn-secondary"
                    onClick={() => handleVisitorTypeSelect('no-appointment')}
                  >
                    🔍 {t('dailyVisitor.withoutAppointment')}
                  </button>
                </div>
              </div>
            )}
            
            {step === 'appointment' && (
              <div>
                <h2 className="text-large mb-4 text-center">{t('dailyVisitor.selectStaff')}</h2>
                <div className="grid grid-2">
                  {staffMembers.map((staff) => (
                    <div
                      key={staff.id}
                      className="card"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleStaffSelect(staff)}
                    >
                      <h3>{staff.name}</h3>
                      <p>{staff.department}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {step === 'no-appointment' && (
              <div>
                <h2 className="text-large mb-4 text-center">{t('dailyVisitor.searchStaff')}</h2>
                <div className="form-group">
                  <label className="form-label">{t('dailyVisitor.nameOrDepartment')}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    placeholder={t('dailyVisitor.searchPlaceholder')}
                  />
                </div>
                <button className="btn" onClick={handleSearchStaff}>
                  {t('dailyVisitor.search')}
                </button>
                
                {searchResults.length > 0 && (
                  <div className="mt-4">
                    <h3>{t('dailyVisitor.searchResults')}</h3>
                    <div className="grid grid-2">
                      {searchResults.map((staff) => (
                        <div
                          key={staff.id}
                          className="card"
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleStaffSelect(staff)}
                        >
                          <h4>{staff.name}</h4>
                          <p>{staff.department}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {step === 'scan' && (
              <div className="text-center">
                <h2 className="text-large mb-4">{t('dailyVisitor.getBusinessCardInfo')}</h2>
                <p className="mb-4">{t('dailyVisitor.staffMember')}: {selectedStaff.name} ({selectedStaff.department})</p>
                
                <div className="grid grid-2">
                  <button
                    className="btn btn-large"
                    onClick={handleBusinessCardScan}
                  >
                    📷 {t('dailyVisitor.scanBusinessCard')}
                  </button>
                  <button
                    className="btn btn-large btn-secondary"
                    onClick={handleManualInput}
                  >
                    ✏️ {t('dailyVisitor.manualInput')}
                  </button>
                </div>
              </div>
            )}
            
            {step === 'input' && (
              <div>
                <h2 className="text-large mb-4 text-center">{t('dailyVisitor.inputVisitorInfo')}</h2>
                
                <div className="form-group">
                  <label className="form-label">{t('dailyVisitor.form.company')} *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={visitorInfo.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder={t('dailyVisitor.form.companyPlaceholder')}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">{t('dailyVisitor.form.name')} *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={visitorInfo.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder={t('dailyVisitor.form.namePlaceholder')}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">{t('dailyVisitor.form.title')}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={visitorInfo.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder={t('dailyVisitor.form.titlePlaceholder')}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">{t('dailyVisitor.form.phone')}</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={visitorInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder={t('dailyVisitor.form.phonePlaceholder')}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">{t('dailyVisitor.form.email')}</label>
                  <input
                    type="email"
                    className="form-input"
                    value={visitorInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder={t('dailyVisitor.form.emailPlaceholder')}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">{t('dailyVisitor.form.visitorCount')} *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={visitorInfo.visitCount}
                    onChange={(e) => handleInputChange('visitCount', parseInt(e.target.value))}
                    min="1"
                    max="20"
                    placeholder={t('dailyVisitor.form.visitorCountPlaceholder')}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">{t('dailyVisitor.form.purpose')} *</label>
                  <textarea
                    className="form-input"
                    value={visitorInfo.purpose}
                    onChange={(e) => handleInputChange('purpose', e.target.value)}
                    placeholder={t('dailyVisitor.form.purposePlaceholder')}
                    rows="3"
                  />
                </div>
                
                <button
                  className="btn btn-large"
                  onClick={handleConfirm}
                  disabled={!visitorInfo.company || !visitorInfo.name}
                >
                  {t('dailyVisitor.toConfirmation')}
                </button>
              </div>
            )}
            
            {step === 'confirm' && (
              <div>
                <h2 className="text-large mb-4 text-center">{t('dailyVisitor.confirmationScreen')}</h2>
                
                <div className="visitor-info-card">
                  <h3>{t('dailyVisitor.visitorInfo')}</h3>
                  <div className="info-row">
                    <span className="info-label">{t('dailyVisitor.form.company')}:</span>
                    <span className="info-value">{visitorInfo.company}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">{t('dailyVisitor.form.name')}:</span>
                    <span className="info-value">{visitorInfo.name}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">{t('dailyVisitor.form.title')}:</span>
                    <span className="info-value">{visitorInfo.title || t('dailyVisitor.notEntered')}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">{t('dailyVisitor.form.visitorCount')}:</span>
                    <span className="info-value">{visitorInfo.count}{t('dailyVisitor.people')}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">{t('dailyVisitor.form.purpose')}:</span>
                    <span className="info-value">{visitorInfo.purpose}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">{t('dailyVisitor.staffMember')}:</span>
                    <span className="info-value">{selectedStaff.name} ({selectedStaff.department})</span>
                  </div>
                </div>
                
                <div className="grid grid-2 mt-4">
                  <button className="btn btn-secondary" onClick={() => setStep('input')}>
                    {t('dailyVisitor.back')}
                  </button>
                  <button className="btn" onClick={handleSubmit}>
                    {t('dailyVisitor.completeReception')}
                  </button>
                </div>
              </div>
            )}
            
            {step === 'complete' && (
              <div className="text-center">
                <h2 className="text-large mb-4">{t('dailyVisitor.receptionComplete')}</h2>
                
                <div className="alert alert-success mb-4">
                  {t('dailyVisitor.teamsNotificationSent')}
                </div>
                
                <div className="visitor-info-card">
                  <h3>{t('dailyVisitor.visitorInfo')}</h3>
                  <div className="info-row">
                    <span className="info-label">{t('dailyVisitor.form.company')}:</span>
                    <span className="info-value">{visitorInfo.company}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">{t('dailyVisitor.form.name')}:</span>
                    <span className="info-value">{visitorInfo.name}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">{t('dailyVisitor.form.title')}:</span>
                    <span className="info-value">{visitorInfo.title || t('dailyVisitor.notEntered')}</span>
                  </div>
                  <div className="info-row">
                     <span className="info-label">{t('dailyVisitor.form.visitorCount')}:</span>
                     <span className="info-value">{visitorInfo.count}{t('dailyVisitor.people')}</span>
                   </div>
                  <div className="info-row">
                    <span className="info-label">{t('dailyVisitor.form.purpose')}:</span>
                    <span className="info-value">{visitorInfo.purpose}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">{t('dailyVisitor.staffMember')}:</span>
                    <span className="info-value">{selectedStaff.name} ({selectedStaff.department})</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">{t('dailyVisitor.receptionTime')}:</span>
                    <span className="info-value">{new Date().toLocaleString('ja-JP')}</span>
                  </div>
                </div>
                
                <button className="btn btn-large mt-4" onClick={handleReset}>
                  {t('dailyVisitor.newReception')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyVisitor;