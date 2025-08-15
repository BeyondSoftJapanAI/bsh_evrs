import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DailyVisitor = () => {
  const navigate = useNavigate();
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
    console.log('Teams通知送信:', message);
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
    const steps = ['選択', 'スタッフ', 'スキャン', '入力', '確認'];
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
        ← ホーム
      </button>
      
      <div className="container">
        <h1 className="page-title">日常来訪者受付</h1>
        
        <div className="form-container">
          <div className="form-card">
            {renderStepIndicator()}
            
            {step === 'select' && (
              <div className="text-center">
                <h2 className="text-large mb-4">来訪タイプを選択してください</h2>
                <div className="grid grid-2">
                  <button
                    className="btn btn-large"
                    onClick={() => handleVisitorTypeSelect('appointment')}
                  >
                    📅 アポあり
                  </button>
                  <button
                    className="btn btn-large btn-secondary"
                    onClick={() => handleVisitorTypeSelect('no-appointment')}
                  >
                    🔍 アポなし（担当者探し）
                  </button>
                </div>
              </div>
            )}
            
            {step === 'appointment' && (
              <div>
                <h2 className="text-large mb-4 text-center">担当者を選択してください</h2>
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
                <h2 className="text-large mb-4 text-center">担当者を検索してください</h2>
                <div className="form-group">
                  <label className="form-label">名前または部署名</label>
                  <input
                    type="text"
                    className="form-input"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    placeholder="例：田中、営業部"
                  />
                </div>
                <button className="btn" onClick={handleSearchStaff}>
                  検索
                </button>
                
                {searchResults.length > 0 && (
                  <div className="mt-4">
                    <h3>検索結果</h3>
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
                <h2 className="text-large mb-4">名刺情報の取得</h2>
                <p className="mb-4">担当者: {selectedStaff.name} ({selectedStaff.department})</p>
                
                <div className="grid grid-2">
                  <button
                    className="btn btn-large"
                    onClick={handleBusinessCardScan}
                  >
                    📷 名刺スキャン
                  </button>
                  <button
                    className="btn btn-large btn-secondary"
                    onClick={handleManualInput}
                  >
                    ✏️ 手入力
                  </button>
                </div>
              </div>
            )}
            
            {step === 'input' && (
              <div>
                <h2 className="text-large mb-4 text-center">来訪者情報入力</h2>
                
                <div className="form-group">
                  <label className="form-label">会社名 *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={visitorInfo.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="株式会社サンプル"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">お名前 *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={visitorInfo.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="山田太郎"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">役職</label>
                  <input
                    type="text"
                    className="form-input"
                    value={visitorInfo.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="営業部長"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">電話番号</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={visitorInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="03-1234-5678"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">メールアドレス</label>
                  <input
                    type="email"
                    className="form-input"
                    value={visitorInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="yamada@sample.co.jp"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">来訪人数 *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={visitorInfo.visitCount}
                    onChange={(e) => handleInputChange('visitCount', parseInt(e.target.value))}
                    min="1"
                    max="20"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">来訪目的</label>
                  <input
                    type="text"
                    className="form-input"
                    value={visitorInfo.purpose}
                    onChange={(e) => handleInputChange('purpose', e.target.value)}
                    placeholder="商談、打ち合わせ等"
                  />
                </div>
                
                <button
                  className="btn btn-large"
                  onClick={handleConfirm}
                  disabled={!visitorInfo.company || !visitorInfo.name}
                >
                  確認画面へ
                </button>
              </div>
            )}
            
            {step === 'confirm' && (
              <div>
                <h2 className="text-large mb-4 text-center">受付完了</h2>
                
                <div className="alert alert-success">
                  Teams通知を送信しました。担当者がお迎えに参ります。
                </div>
                
                <div className="visitor-info">
                  <h3>来訪者情報</h3>
                  <p><strong>会社名:</strong> {visitorInfo.company}</p>
                  <p><strong>お名前:</strong> {visitorInfo.name}</p>
                  <p><strong>役職:</strong> {visitorInfo.title}</p>
                  <p><strong>来訪人数:</strong> {visitorInfo.visitCount}名</p>
                  <p><strong>来訪目的:</strong> {visitorInfo.purpose}</p>
                  <p><strong>担当者:</strong> {selectedStaff.name} ({selectedStaff.department})</p>
                  <p><strong>受付時刻:</strong> {new Date().toLocaleString('ja-JP')}</p>
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

export default DailyVisitor;