// データエクスポートサービス
class ExportService {
  constructor() {
    this.exportFormats = ['json', 'csv', 'excel'];
  }

  // 来訪者データエクスポート
  async exportVisitorData(startDate, endDate, format = 'csv') {
    try {
      // 実際の実装では、APIからデータを取得
      const visitorData = this.generateSampleVisitorData(startDate, endDate);
      
      switch (format.toLowerCase()) {
        case 'csv':
          return this.exportToCSV(visitorData, 'visitors', this.getVisitorHeaders());
        case 'json':
          return this.exportToJSON(visitorData, 'visitors');
        case 'excel':
          return this.exportToExcel(visitorData, 'visitors', this.getVisitorHeaders());
        default:
          throw new Error(`サポートされていない形式: ${format}`);
      }
    } catch (error) {
      console.error('来訪者データエクスポートエラー:', error);
      throw error;
    }
  }

  // イベントデータエクスポート
  async exportEventData(startDate, endDate, format = 'csv') {
    try {
      const eventData = this.generateSampleEventData(startDate, endDate);
      
      switch (format.toLowerCase()) {
        case 'csv':
          return this.exportToCSV(eventData, 'events', this.getEventHeaders());
        case 'json':
          return this.exportToJSON(eventData, 'events');
        case 'excel':
          return this.exportToExcel(eventData, 'events', this.getEventHeaders());
        default:
          throw new Error(`サポートされていない形式: ${format}`);
      }
    } catch (error) {
      console.error('イベントデータエクスポートエラー:', error);
      throw error;
    }
  }

  // 勤怠データエクスポート
  async exportAttendanceData(startDate, endDate, format = 'csv') {
    try {
      const attendanceData = this.generateSampleAttendanceData(startDate, endDate);
      
      switch (format.toLowerCase()) {
        case 'csv':
          return this.exportToCSV(attendanceData, 'attendance', this.getAttendanceHeaders());
        case 'json':
          return this.exportToJSON(attendanceData, 'attendance');
        case 'excel':
          return this.exportToExcel(attendanceData, 'attendance', this.getAttendanceHeaders());
        default:
          throw new Error(`サポートされていない形式: ${format}`);
      }
    } catch (error) {
      console.error('勤怠データエクスポートエラー:', error);
      throw error;
    }
  }

  // 配送データエクスポート
  async exportDeliveryData(startDate, endDate, format = 'csv') {
    try {
      const deliveryData = this.generateSampleDeliveryData(startDate, endDate);
      
      switch (format.toLowerCase()) {
        case 'csv':
          return this.exportToCSV(deliveryData, 'deliveries', this.getDeliveryHeaders());
        case 'json':
          return this.exportToJSON(deliveryData, 'deliveries');
        case 'excel':
          return this.exportToExcel(deliveryData, 'deliveries', this.getDeliveryHeaders());
        default:
          throw new Error(`サポートされていない形式: ${format}`);
      }
    } catch (error) {
      console.error('配送データエクスポートエラー:', error);
      throw error;
    }
  }

  // CSVエクスポート
  exportToCSV(data, filename, headers) {
    const csvContent = this.convertToCSV(data, headers);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${this.getDateString()}.csv`;
    link.click();
    
    URL.revokeObjectURL(url);
    return { success: true, message: 'CSVファイルをダウンロードしました' };
  }

  // JSONエクスポート
  exportToJSON(data, filename) {
    const jsonContent = JSON.stringify({
      exportDate: new Date().toISOString(),
      dataType: filename,
      count: data.length,
      data: data
    }, null, 2);
    
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${this.getDateString()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    return { success: true, message: 'JSONファイルをダウンロードしました' };
  }

  // Excelエクスポート（簡易版）
  exportToExcel(data, filename, headers) {
    // 実際の実装では、xlsx ライブラリを使用
    // ここでは CSV として出力
    const csvContent = this.convertToCSV(data, headers);
    const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${this.getDateString()}.xls`;
    link.click();
    
    URL.revokeObjectURL(url);
    return { success: true, message: 'Excelファイルをダウンロードしました' };
  }

  // データをCSV形式に変換
  convertToCSV(data, headers) {
    if (!data || data.length === 0) {
      return headers.map(h => h.label).join(',');
    }

    const headerRow = headers.map(h => h.label).join(',');
    const dataRows = data.map(row => {
      return headers.map(header => {
        const value = this.getNestedValue(row, header.key);
        // CSV用にエスケープ
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',');
    });

    return [headerRow, ...dataRows].join('\n');
  }

  // ネストされたオブジェクトから値を取得
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current && current[key], obj);
  }

  // 日付文字列を生成
  getDateString() {
    return new Date().toISOString().split('T')[0];
  }

  // 来訪者データのヘッダー定義
  getVisitorHeaders() {
    return [
      { key: 'visitDate', label: '来訪日' },
      { key: 'visitTime', label: '来訪時刻' },
      { key: 'name', label: '来訪者名' },
      { key: 'company', label: '会社名' },
      { key: 'attendeeCount', label: '人数' },
      { key: 'staff.name', label: '訪問先担当者' },
      { key: 'staff.department', label: '訪問先部署' },
      { key: 'purpose', label: '来訪目的' },
      { key: 'type', label: '来訪種別' },
      { key: 'exitTime', label: '退館時刻' }
    ];
  }

  // イベントデータのヘッダー定義
  getEventHeaders() {
    return [
      { key: 'eventDate', label: 'イベント日' },
      { key: 'eventName', label: 'イベント名' },
      { key: 'attendeeName', label: '参加者名' },
      { key: 'attendeeCompany', label: '参加者会社名' },
      { key: 'receptionTime', label: '受付時刻' },
      { key: 'hasQrCode', label: 'QRコード使用' },
      { key: 'nameStickerPrinted', label: '名札印刷' },
      { key: 'location', label: '開催場所' }
    ];
  }

  // 勤怠データのヘッダー定義
  getAttendanceHeaders() {
    return [
      { key: 'date', label: '日付' },
      { key: 'employeeName', label: '従業員名' },
      { key: 'department', label: '部署' },
      { key: 'checkInTime', label: '出勤時刻' },
      { key: 'checkOutTime', label: '退勤時刻' },
      { key: 'workingHours', label: '勤務時間' },
      { key: 'correctionRequested', label: '修正申請' },
      { key: 'correctionApproved', label: '修正承認' }
    ];
  }

  // 配送データのヘッダー定義
  getDeliveryHeaders() {
    return [
      { key: 'arrivalDate', label: '到着日' },
      { key: 'arrivalTime', label: '到着時刻' },
      { key: 'company', label: '配送会社' },
      { key: 'driverName', label: 'ドライバー名' },
      { key: 'vehicleNumber', label: '車両番号' },
      { key: 'deliveryType', label: '配送種別' },
      { key: 'recipient', label: '受取人' },
      { key: 'packageCount', label: '荷物数' },
      { key: 'notes', label: '備考' }
    ];
  }

  // サンプル来訪者データ生成
  generateSampleVisitorData(startDate, endDate) {
    const sampleData = [];
    const companies = ['株式会社A', '株式会社B', 'C商事', 'D工業', '個人'];
    const purposes = ['商談', '面談', '打ち合わせ', '営業', '技術相談'];
    const departments = ['営業部', '総務部', 'DX推進部', '経理部'];
    
    for (let i = 0; i < 50; i++) {
      const visitDate = this.getRandomDate(startDate, endDate);
      sampleData.push({
        visitDate: visitDate.toISOString().split('T')[0],
        visitTime: this.getRandomTime(),
        name: `来訪者${i + 1}`,
        company: companies[Math.floor(Math.random() * companies.length)],
        attendeeCount: Math.floor(Math.random() * 5) + 1,
        staff: {
          name: `担当者${Math.floor(Math.random() * 10) + 1}`,
          department: departments[Math.floor(Math.random() * departments.length)]
        },
        purpose: purposes[Math.floor(Math.random() * purposes.length)],
        type: Math.random() > 0.3 ? '予約' : '飛び込み',
        exitTime: this.getRandomTime()
      });
    }
    
    return sampleData;
  }

  // サンプルイベントデータ生成
  generateSampleEventData(startDate, endDate) {
    const sampleData = [];
    const events = ['経営方針説明会', 'DX推進セミナー', '新商品発表会', '技術勉強会'];
    const companies = ['株式会社A', '株式会社B', 'C商事', 'D工業', '個人'];
    
    for (let i = 0; i < 30; i++) {
      const eventDate = this.getRandomDate(startDate, endDate);
      sampleData.push({
        eventDate: eventDate.toISOString().split('T')[0],
        eventName: events[Math.floor(Math.random() * events.length)],
        attendeeName: `参加者${i + 1}`,
        attendeeCompany: companies[Math.floor(Math.random() * companies.length)],
        receptionTime: this.getRandomTime(),
        hasQrCode: Math.random() > 0.2 ? 'あり' : 'なし',
        nameStickerPrinted: Math.random() > 0.1 ? 'あり' : 'なし',
        location: '本社会議室A'
      });
    }
    
    return sampleData;
  }

  // サンプル勤怠データ生成
  generateSampleAttendanceData(startDate, endDate) {
    const sampleData = [];
    const employees = ['山田太郎', '佐藤花子', '田中一郎', '鈴木美咲', '高橋健太'];
    const departments = ['営業部', '総務部', 'DX推進部', '経理部', '人事部'];
    
    for (let i = 0; i < 100; i++) {
      const date = this.getRandomDate(startDate, endDate);
      const checkIn = this.getRandomTime('09:00', '10:00');
      const checkOut = this.getRandomTime('17:00', '19:00');
      
      sampleData.push({
        date: date.toISOString().split('T')[0],
        employeeName: employees[Math.floor(Math.random() * employees.length)],
        department: departments[Math.floor(Math.random() * departments.length)],
        checkInTime: checkIn,
        checkOutTime: checkOut,
        workingHours: this.calculateWorkingHours(checkIn, checkOut),
        correctionRequested: Math.random() > 0.9 ? 'あり' : 'なし',
        correctionApproved: Math.random() > 0.5 ? '承認' : '未承認'
      });
    }
    
    return sampleData;
  }

  // サンプル配送データ生成
  generateSampleDeliveryData(startDate, endDate) {
    const sampleData = [];
    const companies = ['ヤマト運輸', '佐川急便', '日本郵便', 'Amazon', 'DHL'];
    const types = ['通常配送', '冷蔵配送', '精密機器', '書類', '大型荷物'];
    const recipients = ['総務部', '営業部', 'DX推進部', '経理部', '人事部'];
    
    for (let i = 0; i < 25; i++) {
      const arrivalDate = this.getRandomDate(startDate, endDate);
      sampleData.push({
        arrivalDate: arrivalDate.toISOString().split('T')[0],
        arrivalTime: this.getRandomTime(),
        company: companies[Math.floor(Math.random() * companies.length)],
        driverName: `ドライバー${i + 1}`,
        vehicleNumber: `品川${Math.floor(Math.random() * 9000) + 1000}`,
        deliveryType: types[Math.floor(Math.random() * types.length)],
        recipient: recipients[Math.floor(Math.random() * recipients.length)],
        packageCount: Math.floor(Math.random() * 10) + 1,
        notes: Math.random() > 0.7 ? '要冷蔵' : ''
      });
    }
    
    return sampleData;
  }

  // ランダムな日付を生成
  getRandomDate(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
  }

  // ランダムな時刻を生成
  getRandomTime(startTime = '08:00', endTime = '18:00') {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    const randomMinutes = Math.floor(Math.random() * (endMinutes - startMinutes)) + startMinutes;
    const hours = Math.floor(randomMinutes / 60);
    const minutes = randomMinutes % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  // 勤務時間を計算
  calculateWorkingHours(checkIn, checkOut) {
    const [inHour, inMin] = checkIn.split(':').map(Number);
    const [outHour, outMin] = checkOut.split(':').map(Number);
    
    const inMinutes = inHour * 60 + inMin;
    const outMinutes = outHour * 60 + outMin;
    
    const workMinutes = outMinutes - inMinutes - 60; // 1時間休憩を差し引く
    const hours = Math.floor(workMinutes / 60);
    const minutes = workMinutes % 60;
    
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  }
}

// シングルトンインスタンス
const exportService = new ExportService();
export default exportService;

// 名前付きエクスポート
export { ExportService };