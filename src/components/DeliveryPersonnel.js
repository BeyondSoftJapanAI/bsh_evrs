import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const DeliveryPersonnel = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [step, setStep] = useState('input'); // input, confirm
  const [selectedCompany, setSelectedCompany] = useState('');
  const [notificationSent, setNotificationSent] = useState(false);

  // 常用配送会社一覧
  const deliveryCompanies = [
    { id: 'yamato', name: t('deliveryPersonnel.companies.yamato'), contact: t('deliveryPersonnel.departments.general') },
    { id: 'sagawa', name: t('deliveryPersonnel.companies.sagawa'), contact: t('deliveryPersonnel.departments.general') },
    { id: 'jppost', name: t('deliveryPersonnel.companies.jppost'), contact: t('deliveryPersonnel.departments.general') },
    { id: 'seino', name: t('deliveryPersonnel.companies.seino'), contact: t('deliveryPersonnel.departments.general') },
    { id: 'fukutsu', name: t('deliveryPersonnel.companies.fukutsu'), contact: t('deliveryPersonnel.departments.general') },
    { id: 'amazon', name: t('deliveryPersonnel.companies.amazon'), contact: t('deliveryPersonnel.departments.dx') },
    { id: 'other', name: t('deliveryPersonnel.companies.other'), contact: t('deliveryPersonnel.departments.general') }
  ];

  const handleCompanySelect = (companyId) => {
    setSelectedCompany(companyId);
  };

  const handleNotify = () => {
    const company = deliveryCompanies.find(c => c.id === selectedCompany);
    if (company) {
      sendTeamsNotification(company);
      setStep('confirm');
      setNotificationSent(true);
    }
  };

  const sendTeamsNotification = (company) => {
    const message = {
      type: 'delivery_arrival',
      company: company.name,
      contact: company.contact,
      timestamp: new Date().toLocaleString('ja-JP'),
      location: '受付',
      message: `${company.name}の配送業者が到着しました。担当: ${company.contact}`
    };
    
    console.log('Teams通知送信 (配送業者到着):', message);
    // 実際の実装では、Teams APIを使用して担当部署に通知
  };

  const handleReset = () => {
    setStep('input');
    setSelectedCompany('');
    setNotificationSent(false);
  };

  return (
    <div className="main-content">
      <button className="back-button" onClick={() => navigate('/')}>
        {t('common.backToHome')}
      </button>
      
      <div className="container">
        <h1 className="page-title">{t('deliveryPersonnel.title')}</h1>
        
        <div className="form-container">
          <div className="form-card">
            {step === 'input' && (
              <div>
                <h2 className="text-large mb-4 text-center">{t('deliveryPersonnel.selectCompany')}</h2>
                
                <div className="alert alert-info mb-4">
                  {t('deliveryPersonnel.arrivalMessage')}
                </div>
                
                <div className="form-group">
                  <label className="form-label">{t('deliveryPersonnel.selectCompanyLabel')} *</label>
                  <div className="company-grid">
                    {deliveryCompanies.map((company) => (
                      <div
                        key={company.id}
                        className={`company-card ${
                          selectedCompany === company.id ? 'selected' : ''
                        }`}
                        onClick={() => handleCompanySelect(company.id)}
                      >
                        <div className="company-name">{company.name}</div>
                        <div className="company-contact">{t('deliveryPersonnel.responsible')}: {company.contact}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="text-center mt-4">
                  <button
                    className="btn btn-large"
                    onClick={handleNotify}
                    disabled={!selectedCompany}
                  >
                    {t('deliveryPersonnel.notifyResponsible')}
                  </button>
                </div>
              </div>
            )}
            
            {step === 'confirm' && (
              <div>
                <h2 className="text-large mb-4 text-center">{t('deliveryPersonnel.notificationComplete')}</h2>
                
                <div className="alert alert-success">
                  {t('deliveryPersonnel.teamsSent')}
                </div>
                
                <div className="visitor-info">
                  <h3>{t('deliveryPersonnel.notificationInfo')}</h3>
                  <p><strong>{t('deliveryPersonnel.deliveryCompany')}:</strong> {deliveryCompanies.find(c => c.id === selectedCompany)?.name}</p>
                  <p><strong>{t('deliveryPersonnel.notificationTarget')}:</strong> {deliveryCompanies.find(c => c.id === selectedCompany)?.contact}</p>
                  <p><strong>{t('deliveryPersonnel.notificationTime')}:</strong> {new Date().toLocaleString('ja-JP')}</p>
                </div>
                
                <div className="alert alert-info">
                  {t('deliveryPersonnel.waitingMessage')}
                </div>
                
                <div className="text-center mt-4">
                  <button className="btn btn-large" onClick={handleReset}>
                    {t('deliveryPersonnel.newNotification')}
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

export default DeliveryPersonnel;