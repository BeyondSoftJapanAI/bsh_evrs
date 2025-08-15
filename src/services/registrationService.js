// 申込者情報管理サービス
class RegistrationService {
  constructor() {
    this.registrations = this.loadRegistrations();
  }

  // ローカルストレージから申込者データを読み込み
  loadRegistrations() {
    try {
      const data = localStorage.getItem('eventRegistrations');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('申込者データの読み込みエラー:', error);
      return [];
    }
  }

  // ローカルストレージに申込者データを保存
  saveRegistrations() {
    try {
      localStorage.setItem('eventRegistrations', JSON.stringify(this.registrations));
    } catch (error) {
      console.error('申込者データの保存エラー:', error);
    }
  }

  // 新規申込者を追加
  addRegistration(registrationData) {
    const registration = {
      id: this.generateId(),
      ...registrationData,
      registeredAt: new Date().toISOString(),
      status: 'registered', // registered, attended, cancelled
      qrCode: this.generateQRCode(registrationData),
      checkInTime: null,
      notes: ''
    };

    this.registrations.push(registration);
    this.saveRegistrations();
    return registration;
  }

  // 申込者情報を更新
  updateRegistration(id, updates) {
    const index = this.registrations.findIndex(reg => reg.id === id);
    if (index !== -1) {
      this.registrations[index] = { ...this.registrations[index], ...updates };
      this.saveRegistrations();
      return this.registrations[index];
    }
    return null;
  }

  // 申込者を削除
  deleteRegistration(id) {
    const index = this.registrations.findIndex(reg => reg.id === id);
    if (index !== -1) {
      const deleted = this.registrations.splice(index, 1)[0];
      this.saveRegistrations();
      return deleted;
    }
    return null;
  }

  // 特定のイベントの申込者一覧を取得
  getRegistrationsByEvent(eventId) {
    return this.registrations.filter(reg => reg.eventId === eventId);
  }

  // 申込者IDで検索
  getRegistrationById(id) {
    return this.registrations.find(reg => reg.id === id);
  }

  // QRコードで申込者を検索
  getRegistrationByQRCode(qrCode) {
    return this.registrations.find(reg => reg.qrCode === qrCode);
  }

  // メールアドレスで申込者を検索
  getRegistrationByEmail(email, eventId = null) {
    const registrations = this.registrations.filter(reg => reg.email === email);
    if (eventId) {
      return registrations.find(reg => reg.eventId === eventId);
    }
    return registrations;
  }

  // 申込者のチェックイン処理
  checkInRegistration(id) {
    const registration = this.getRegistrationById(id);
    if (registration && registration.status === 'registered') {
      return this.updateRegistration(id, {
        status: 'attended',
        checkInTime: new Date().toISOString()
      });
    }
    return null;
  }

  // 申込者のキャンセル処理
  cancelRegistration(id, reason = '') {
    return this.updateRegistration(id, {
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
      cancelReason: reason
    });
  }

  // イベントの申込状況統計を取得
  getEventStatistics(eventId) {
    const registrations = this.getRegistrationsByEvent(eventId);
    
    return {
      total: registrations.length,
      registered: registrations.filter(reg => reg.status === 'registered').length,
      attended: registrations.filter(reg => reg.status === 'attended').length,
      cancelled: registrations.filter(reg => reg.status === 'cancelled').length,
      checkInRate: registrations.length > 0 
        ? (registrations.filter(reg => reg.status === 'attended').length / registrations.length * 100).toFixed(1)
        : 0
    };
  }

  // 申込者データをCSV形式でエクスポート
  exportToCSV(eventId = null) {
    const registrations = eventId 
      ? this.getRegistrationsByEvent(eventId)
      : this.registrations;

    if (registrations.length === 0) {
      return null;
    }

    const headers = [
      'ID', 'イベントID', '氏名', 'フリガナ', 'メールアドレス', 
      '電話番号', '会社名', '部署', '役職', 'ステータス', 
      '申込日時', 'チェックイン日時', 'QRコード', '備考'
    ];

    const csvData = registrations.map(reg => [
      reg.id,
      reg.eventId,
      reg.name,
      reg.furigana || '',
      reg.email,
      reg.phone || '',
      reg.company || '',
      reg.department || '',
      reg.position || '',
      this.getStatusLabel(reg.status),
      new Date(reg.registeredAt).toLocaleString('ja-JP'),
      reg.checkInTime ? new Date(reg.checkInTime).toLocaleString('ja-JP') : '',
      reg.qrCode,
      reg.notes || ''
    ]);

    return [headers, ...csvData].map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
  }

  // ステータスラベルを取得
  getStatusLabel(status) {
    const labels = {
      'registered': '申込済',
      'attended': '参加済',
      'cancelled': 'キャンセル'
    };
    return labels[status] || status;
  }

  // 一意IDを生成
  generateId() {
    return 'reg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // QRコードデータを生成
  generateQRCode(registrationData) {
    const qrData = {
      type: 'event_registration',
      eventId: registrationData.eventId,
      name: registrationData.name,
      email: registrationData.email,
      timestamp: Date.now()
    };
    return JSON.stringify(qrData);
  }

  // 申込者データの検索・フィルタリング
  searchRegistrations(query, eventId = null) {
    let registrations = eventId 
      ? this.getRegistrationsByEvent(eventId)
      : this.registrations;

    if (!query) return registrations;

    const searchTerm = query.toLowerCase();
    return registrations.filter(reg => 
      reg.name.toLowerCase().includes(searchTerm) ||
      reg.email.toLowerCase().includes(searchTerm) ||
      (reg.company && reg.company.toLowerCase().includes(searchTerm)) ||
      (reg.furigana && reg.furigana.toLowerCase().includes(searchTerm))
    );
  }

  // 申込者データの一括インポート
  importRegistrations(csvData, eventId) {
    try {
      const lines = csvData.split('\n');
      const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
      const imported = [];

      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',').map(v => v.replace(/"/g, ''));
          const registration = {
            eventId: eventId,
            name: values[headers.indexOf('氏名')] || '',
            furigana: values[headers.indexOf('フリガナ')] || '',
            email: values[headers.indexOf('メールアドレス')] || '',
            phone: values[headers.indexOf('電話番号')] || '',
            company: values[headers.indexOf('会社名')] || '',
            department: values[headers.indexOf('部署')] || '',
            position: values[headers.indexOf('役職')] || ''
          };

          if (registration.name && registration.email) {
            const added = this.addRegistration(registration);
            imported.push(added);
          }
        }
      }

      return imported;
    } catch (error) {
      console.error('申込者データのインポートエラー:', error);
      return [];
    }
  }

  // 全申込者データを取得
  getAllRegistrations() {
    return this.registrations;
  }

  // 申込者データをクリア
  clearAllRegistrations() {
    this.registrations = [];
    this.saveRegistrations();
  }
}

// シングルトンインスタンスをエクスポート
const registrationService = new RegistrationService();
export default registrationService;