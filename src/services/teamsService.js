// Microsoft Teams通知服务
class TeamsService {
  constructor() {
    this.webhookUrl = process.env.REACT_APP_TEAMS_WEBHOOK_URL || '';
    this.defaultChannel = {
      generalAffairs: process.env.REACT_APP_TEAMS_GENERAL_AFFAIRS_WEBHOOK || '',
      sales: process.env.REACT_APP_TEAMS_SALES_WEBHOOK || '',
      dxPromotion: process.env.REACT_APP_TEAMS_DX_WEBHOOK || '',
      finance: process.env.REACT_APP_TEAMS_FINANCE_WEBHOOK || '',
      hr: process.env.REACT_APP_TEAMS_HR_WEBHOOK || ''
    };
  }

  // 基本的Teams通知送信
  async sendNotification(webhookUrl, message) {
    try {
      // 実際の実装では、fetch APIを使用してTeams Webhookに送信
      const payload = {
        "@type": "MessageCard",
        "@context": "http://schema.org/extensions",
        "themeColor": "0076D7",
        "summary": message.title,
        "sections": [{
          "activityTitle": message.title,
          "activitySubtitle": message.subtitle || '',
          "activityImage": message.image || '',
          "facts": message.facts || [],
          "markdown": true,
          "text": message.text || ''
        }],
        "potentialAction": message.actions || []
      };

      // 開発環境では模擬送信
      if (process.env.NODE_ENV === 'development') {
        console.log('Teams通知送信（模擬）:', {
          webhookUrl,
          payload
        });
        return { success: true, message: 'Teams通知を送信しました（開発環境）' };
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        return { success: true, message: 'Teams通知を送信しました' };
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Teams通知送信エラー:', error);
      return { success: false, error: error.message };
    }
  }

  // 来訪者通知
  async notifyVisitorArrival(visitorData, staffMember) {
    const message = {
      title: '🚶‍♂️ 来訪者到着通知',
      subtitle: `${visitorData.name}様が到着されました`,
      facts: [
        { name: '来訪者名', value: visitorData.name },
        { name: '会社名', value: visitorData.company || '個人' },
        { name: '訪問先', value: `${staffMember.department} ${staffMember.name}様` },
        { name: '来訪時刻', value: new Date().toLocaleString('ja-JP') },
        { name: '来訪目的', value: visitorData.purpose || '面談' },
        { name: '人数', value: `${visitorData.attendeeCount || 1}名` }
      ],
      text: `${staffMember.name}様への来訪者が到着しました。受付にてお迎えをお願いいたします。`,
      actions: [{
        "@type": "OpenUri",
        "name": "受付システムを開く",
        "targets": [{
          "os": "default",
          "uri": window.location.origin
        }]
      }]
    };

    // 担当者の部署に応じて適切なチャンネルに送信
    const webhookUrl = this.getWebhookByDepartment(staffMember.department);
    return await this.sendNotification(webhookUrl, message);
  }

  // イベント受付通知
  async notifyEventReception(eventData, attendeeData) {
    const message = {
      title: '📅 イベント受付通知',
      subtitle: `${eventData.name} - 受付完了`,
      facts: [
        { name: 'イベント名', value: eventData.name },
        { name: '参加者名', value: attendeeData.name },
        { name: '会社名', value: attendeeData.company || '個人' },
        { name: '受付時刻', value: new Date().toLocaleString('ja-JP') },
        { name: 'QRコード', value: attendeeData.hasQrCode ? '有り' : '無し（手動受付）' }
      ],
      text: `イベント「${eventData.name}」の受付が完了しました。`,
      themeColor: "28a745"
    };

    return await this.sendNotification(this.defaultChannel.generalAffairs, message);
  }

  // 配送業者通知
  async notifyDeliveryArrival(deliveryData) {
    const message = {
      title: '📦 配送業者到着通知',
      subtitle: `${deliveryData.company}からの配送物が到着`,
      facts: [
        { name: '配送会社', value: deliveryData.company },
        { name: 'ドライバー名', value: deliveryData.driverName },
        { name: '車両番号', value: deliveryData.vehicleNumber },
        { name: '配送種別', value: deliveryData.deliveryType },
        { name: '受取人', value: deliveryData.recipient },
        { name: '荷物数', value: `${deliveryData.packageCount}個` },
        { name: '到着時刻', value: new Date().toLocaleString('ja-JP') }
      ],
      text: deliveryData.notes ? `備考: ${deliveryData.notes}` : '',
      themeColor: "ff9500"
    };

    return await this.sendNotification(this.defaultChannel.generalAffairs, message);
  }

  // 面接者通知
  async notifyIntervieweeArrival(interviewData) {
    const message = {
      title: '💼 面接者到着通知',
      subtitle: `${interviewData.name}様が面接のため到着`,
      facts: [
        { name: '面接者名', value: interviewData.name },
        { name: '応募職種', value: interviewData.position },
        { name: '面接時刻', value: interviewData.interviewTime },
        { name: '面接官', value: interviewData.interviewer },
        { name: '担当部署', value: interviewData.department },
        { name: '連絡先', value: interviewData.phone },
        { name: '到着時刻', value: new Date().toLocaleString('ja-JP') }
      ],
      text: interviewData.notes ? `備考: ${interviewData.notes}` : '',
      themeColor: "6f42c1"
    };

    // 面接担当部署と人事部に通知
    const departmentWebhook = this.getWebhookByDepartment(interviewData.department);
    const hrWebhook = this.defaultChannel.hr;

    const results = await Promise.all([
      this.sendNotification(departmentWebhook, message),
      this.sendNotification(hrWebhook, message)
    ]);

    return results;
  }

  // 従業員打刻修正申請通知
  async notifyAttendanceCorrection(correctionData) {
    const message = {
      title: '⏰ 打刻修正申請',
      subtitle: `${correctionData.employeeName}様から打刻修正申請`,
      facts: [
        { name: '申請者', value: correctionData.employeeName },
        { name: '部署', value: correctionData.department },
        { name: '対象日', value: correctionData.targetDate },
        { name: '修正種別', value: correctionData.correctionType },
        { name: '修正前時刻', value: correctionData.originalTime },
        { name: '修正後時刻', value: correctionData.correctedTime },
        { name: '申請時刻', value: new Date().toLocaleString('ja-JP') }
      ],
      text: `理由: ${correctionData.reason}`,
      themeColor: "ffc107",
      actions: [{
        "@type": "OpenUri",
        "name": "承認・却下",
        "targets": [{
          "os": "default",
          "uri": `${window.location.origin}/admin`
        }]
      }]
    };

    return await this.sendNotification(this.defaultChannel.hr, message);
  }

  // 部署に応じたWebhook URLを取得
  getWebhookByDepartment(department) {
    const departmentMap = {
      '総務部': this.defaultChannel.generalAffairs,
      '営業部': this.defaultChannel.sales,
      'DX推進部': this.defaultChannel.dxPromotion,
      '経理部': this.defaultChannel.finance,
      '人事部': this.defaultChannel.hr
    };

    return departmentMap[department] || this.defaultChannel.generalAffairs;
  }

  // システム通知（エラー、メンテナンス等）
  async notifySystemEvent(eventType, details) {
    const eventMessages = {
      error: {
        title: '🚨 システムエラー通知',
        themeColor: 'dc3545'
      },
      maintenance: {
        title: '🔧 メンテナンス通知',
        themeColor: 'ffc107'
      },
      backup: {
        title: '💾 バックアップ完了通知',
        themeColor: '28a745'
      }
    };

    const baseMessage = eventMessages[eventType] || eventMessages.error;
    const message = {
      ...baseMessage,
      subtitle: details.subtitle || '',
      text: details.description || '',
      facts: details.facts || []
    };

    return await this.sendNotification(this.defaultChannel.generalAffairs, message);
  }

  // 設定テスト
  async testConnection(webhookUrl = null) {
    const testUrl = webhookUrl || this.defaultChannel.generalAffairs;
    const message = {
      title: '🧪 Teams通知テスト',
      subtitle: 'Event & Visitor Reception System',
      text: 'Teams通知機能が正常に動作しています。',
      facts: [
        { name: 'テスト時刻', value: new Date().toLocaleString('ja-JP') },
        { name: 'システム', value: 'Event & Visitor Reception System v1.0' }
      ],
      themeColor: '0078d4'
    };

    return await this.sendNotification(testUrl, message);
  }
}

// シングルトンインスタンス
const teamsService = new TeamsService();
export default teamsService;

// 名前付きエクスポート
export { TeamsService };