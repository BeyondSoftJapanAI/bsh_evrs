// メール送信サービス
class EmailService {
  constructor() {
    this.emailHistory = JSON.parse(localStorage.getItem('emailHistory') || '[]');
  }

  // 申込確認メール送信
  async sendRegistrationConfirmation(registration) {
    try {
      const emailData = {
        to: registration.email,
        subject: `【申込確認】${registration.eventName} - 申込完了のお知らせ`,
        body: this.generateRegistrationConfirmationEmail(registration),
        timestamp: new Date().toISOString(),
        type: 'registration_confirmation',
        registrationId: registration.id
      };

      // 実際の実装では、メール送信APIを呼び出し
      console.log('申込確認メール送信:', emailData);
      
      // メール履歴に保存
      this.emailHistory.push(emailData);
      this.saveEmailHistory();
      
      return {
        success: true,
        messageId: `msg_${Date.now()}`,
        message: '申込確認メールを送信しました'
      };
    } catch (error) {
      console.error('メール送信エラー:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // リマインダーメール送信
  async sendEventReminder(registration, daysBeforeEvent = 1) {
    try {
      const emailData = {
        to: registration.email,
        subject: `【リマインダー】${registration.eventName} - 開催のお知らせ`,
        body: this.generateReminderEmail(registration, daysBeforeEvent),
        timestamp: new Date().toISOString(),
        type: 'event_reminder',
        registrationId: registration.id
      };

      console.log('リマインダーメール送信:', emailData);
      
      this.emailHistory.push(emailData);
      this.saveEmailHistory();
      
      return {
        success: true,
        messageId: `msg_${Date.now()}`,
        message: 'リマインダーメールを送信しました'
      };
    } catch (error) {
      console.error('リマインダーメール送信エラー:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // キャンセル確認メール送信
  async sendCancellationConfirmation(registration) {
    try {
      const emailData = {
        to: registration.email,
        subject: `【キャンセル確認】${registration.eventName} - キャンセル完了のお知らせ`,
        body: this.generateCancellationEmail(registration),
        timestamp: new Date().toISOString(),
        type: 'cancellation_confirmation',
        registrationId: registration.id
      };

      console.log('キャンセル確認メール送信:', emailData);
      
      this.emailHistory.push(emailData);
      this.saveEmailHistory();
      
      return {
        success: true,
        messageId: `msg_${Date.now()}`,
        message: 'キャンセル確認メールを送信しました'
      };
    } catch (error) {
      console.error('キャンセル確認メール送信エラー:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 申込確認メール本文生成
  generateRegistrationConfirmationEmail(registration) {
    return `
${registration.name} 様

この度は「${registration.eventName}」にお申込みいただき、誠にありがとうございます。

■ 申込情報
・お名前: ${registration.name}
・会社名: ${registration.company}
・メールアドレス: ${registration.email}
・電話番号: ${registration.phone}
・申込日時: ${new Date(registration.registrationDate).toLocaleString('ja-JP')}
・申込ID: ${registration.id}

■ イベント詳細
・イベント名: ${registration.eventName}
・開催日時: ${registration.eventDate}
・会場: ${registration.eventLocation || '詳細は別途ご案内いたします'}

■ 受付について
当日は下記のQRコードをご提示いただくか、申込IDをお伝えください。
スムーズな受付のため、事前にQRコードを保存いただくことをお勧めします。

申込ID: ${registration.id}
QRコード: ${registration.qrCode || 'QRコードは別途添付されます'}

■ 注意事項
・イベント開始時刻の15分前までに受付をお済ませください
・やむを得ずキャンセルされる場合は、事前にご連絡ください
・当日の緊急連絡先: [連絡先電話番号]

ご不明な点がございましたら、お気軽にお問い合わせください。

皆様のご参加を心よりお待ちしております。

---
[主催者名]
[連絡先]
[ウェブサイト]
`;
  }

  // リマインダーメール本文生成
  generateReminderEmail(registration, daysBeforeEvent) {
    return `
${registration.name} 様

「${registration.eventName}」の開催が${daysBeforeEvent}日後に迫りました。

■ イベント詳細（再確認）
・イベント名: ${registration.eventName}
・開催日時: ${registration.eventDate}
・会場: ${registration.eventLocation || '詳細は別途ご案内済み'}
・申込ID: ${registration.id}

■ 当日の受付について
・受付開始: イベント開始30分前
・QRコードまたは申込IDをご提示ください
・受付場所: [受付場所の詳細]

■ 持参物
・身分証明書（必要に応じて）
・名刺（交流会がある場合）

■ アクセス情報
[会場へのアクセス情報]

当日お会いできることを楽しみにしております。

---
[主催者名]
[連絡先]
`;
  }

  // キャンセル確認メール本文生成
  generateCancellationEmail(registration) {
    return `
${registration.name} 様

「${registration.eventName}」のキャンセルを承りました。

■ キャンセル情報
・イベント名: ${registration.eventName}
・申込ID: ${registration.id}
・キャンセル日時: ${new Date().toLocaleString('ja-JP')}

キャンセル手続きが完了いたしました。

今後とも弊社イベントをご愛顧いただけますよう、よろしくお願いいたします。

---
[主催者名]
[連絡先]
`;
  }

  // メール履歴取得
  getEmailHistory(registrationId = null) {
    if (registrationId) {
      return this.emailHistory.filter(email => email.registrationId === registrationId);
    }
    return this.emailHistory;
  }

  // メール履歴保存
  saveEmailHistory() {
    localStorage.setItem('emailHistory', JSON.stringify(this.emailHistory));
  }

  // メール履歴クリア
  clearEmailHistory() {
    this.emailHistory = [];
    this.saveEmailHistory();
  }

  // 一括リマインダー送信
  async sendBulkReminders(registrations, daysBeforeEvent = 1) {
    const results = [];
    
    for (const registration of registrations) {
      if (registration.status === 'confirmed') {
        const result = await this.sendEventReminder(registration, daysBeforeEvent);
        results.push({
          registrationId: registration.id,
          email: registration.email,
          ...result
        });
      }
    }
    
    return results;
  }

  // メール送信統計
  getEmailStats() {
    const stats = {
      total: this.emailHistory.length,
      byType: {},
      byDate: {},
      recent: this.emailHistory.slice(-10)
    };

    this.emailHistory.forEach(email => {
      // タイプ別統計
      stats.byType[email.type] = (stats.byType[email.type] || 0) + 1;
      
      // 日付別統計
      const date = email.timestamp.split('T')[0];
      stats.byDate[date] = (stats.byDate[date] || 0) + 1;
    });

    return stats;
  }
}

export default new EmailService();