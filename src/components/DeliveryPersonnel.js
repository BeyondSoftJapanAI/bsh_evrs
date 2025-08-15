import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DeliveryPersonnel = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('input'); // input, confirm
  const [selectedCompany, setSelectedCompany] = useState('');
  const [notificationSent, setNotificationSent] = useState(false);

  // 常用配送会社一覧
  const deliveryCompanies = [
    { id: 'yamato', name: 'ヤマト運輸', contact: '総務部' },
    { id: 'sagawa', name: '佐川急便', contact: '総務部' },
    { id: 'jppost', name: '日本郵便', contact: '総務部' },
    { id: 'seino', name: 'セイノー運輸', contact: '総務部' },
    { id: 'fukutsu', name: '福山通運', contact: '総務部' },
    { id: 'amazon', name: 'Amazon配送', contact: 'DX推進部' },
    { id: 'other', name: 'その他', contact: '総務部' }
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
        ← ホーム
      </button>
      
      <div className="container">
        <h1 className="page-title">配送業者受付</h1>
        
        <div className="form-container">
          <div className="form-card">
            {step === 'input' && (
              <div>
                <h2 className="text-large mb-4 text-center">配送会社選択</h2>
                
                <div className="alert alert-info mb-4">
                  配送業者が到着しました。該当する配送会社を選択して担当者に通知してください。
                </div>
                
                <div className="form-group">
                  <label className="form-label">配送会社を選択してください *</label>
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
                        <div className="company-contact">担当: {company.contact}</div>
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
                    担当者に通知
                  </button>
                </div>
              </div>
            )}
            
            {step === 'confirm' && (
              <div>
                <h2 className="text-large mb-4 text-center">通知完了</h2>
                
                <div className="alert alert-success">
                  担当者にTeams通知を送信しました。
                </div>
                
                <div className="visitor-info">
                  <h3>通知情報</h3>
                  <p><strong>配送会社:</strong> {deliveryCompanies.find(c => c.id === selectedCompany)?.name}</p>
                  <p><strong>通知先:</strong> {deliveryCompanies.find(c => c.id === selectedCompany)?.contact}</p>
                  <p><strong>通知時刻:</strong> {new Date().toLocaleString('ja-JP')}</p>
                </div>
                
                <div className="alert alert-info">
                  担当者が対応に向かいます。配送業者にはしばらくお待ちいただくようお伝えください。
                </div>
                
                <div className="text-center mt-4">
                  <button className="btn btn-large" onClick={handleReset}>
                    新しい通知
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